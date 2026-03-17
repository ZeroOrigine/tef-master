/* ========== Global Progress Tracker (with Cloud Sync) ========== */
const TEFProgress = {
  KEY: 'tef_master_progress',
  SYNC_URL: '/.netlify/functions/sync-progress',
  QUEUE_KEY: 'tef_sync_queue',
  _syncing: false,
  _syncTimer: null,

  /* ---- Email from access gate ---- */
  getEmail() {
    return localStorage.getItem('tef_verified_email') || null;
  },

  /* ---- Local data access ---- */
  getAll() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || this.defaults(); }
    catch { return this.defaults(); }
  },

  defaults() {
    return {
      streak: { current: 0, lastDate: null, best: 0 },
      diagnostic: { scores: [], lastDate: null, level: null },
      grammar: { completed: [], quizScores: {} },
      vocabulary: { learned: [], quizHistory: [] },
      reading: { completed: [], scores: {} },
      listening: { completed: [], scores: {} },
      conversations: { practiced: [] },
      studyTime: { total: 0, sessions: [] },
      xp: 0,
      badges: []
    };
  },

  /* ---- Save (localStorage + cloud sync) ---- */
  save(data, action, details) {
    localStorage.setItem(this.KEY, JSON.stringify(data));
    // Background cloud sync (non-blocking, fire-and-forget)
    this.syncToCloud(action || null, details || null);
  },

  /* ---- Cloud Sync: background push ---- */
  syncToCloud(action, details) {
    var email = this.getEmail();
    if (!email) return; // Not logged in — skip

    var self = this;
    var data = this.getAll();
    var payload = {
      email: email,
      progress_data: data,
      page: window.location.pathname
    };
    if (action) payload.action = action;
    if (details) payload.details = details;

    // Debounce: batch rapid saves into one sync (1.5s window)
    if (this._syncTimer) clearTimeout(this._syncTimer);
    this._syncTimer = setTimeout(function() {
      // Re-read latest data at sync time (may have changed during debounce)
      payload.progress_data = self.getAll();
      self._doSync(payload);
    }, 1500);
  },

  _doSync: async function(payload) {
    if (this._syncing) {
      this._queueSync(payload);
      return;
    }
    this._syncing = true;

    try {
      var res = await fetch(this.SYNC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        // Success — also flush any queued retries
        this._flushRetryQueue();
      } else {
        this._queueSync(payload);
      }
    } catch (err) {
      // Network error — queue for retry
      this._queueSync(payload);
    } finally {
      this._syncing = false;
    }
  },

  _queueSync: function(payload) {
    try {
      var queue = JSON.parse(localStorage.getItem(this.QUEUE_KEY) || '[]');
      // Keep only last 5 to prevent localStorage bloat
      if (queue.length >= 5) queue.shift();
      queue.push({ payload: payload, timestamp: Date.now() });
      localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
    } catch (e) { /* localStorage full — silently drop */ }
  },

  _flushRetryQueue: async function() {
    try {
      var raw = localStorage.getItem(this.QUEUE_KEY);
      if (!raw) return;
      var queue = JSON.parse(raw);
      if (queue.length === 0) return;

      // Clear queue immediately to prevent re-entry
      localStorage.removeItem(this.QUEUE_KEY);

      // Retry only the latest entry with fresh data
      var latest = queue[queue.length - 1];
      latest.payload.progress_data = this.getAll();

      await fetch(this.SYNC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(latest.payload)
      });
    } catch (e) { /* Silent fail on retry flush */ }
  },

  /* ---- Cloud Sync: load & merge on login ---- */
  loadFromCloud: async function(email) {
    try {
      var res = await fetch(this.SYNC_URL + '?email=' + encodeURIComponent(email));
      if (!res.ok) return false;

      var cloud = await res.json();
      if (!cloud.progress_data) return false; // No cloud data yet

      var local = this.getAll();
      var merged = this.mergeProgress(local, cloud.progress_data);
      localStorage.setItem(this.KEY, JSON.stringify(merged));

      // Push merged result back to cloud
      this.syncToCloud('login', { source: 'merge' });
      return true;
    } catch (err) {
      return false;
    }
  },

  /* ---- Merge Strategy: keep the best of local & cloud ---- */
  mergeProgress: function(local, cloud) {
    var merged = this.defaults();

    // XP: take max
    merged.xp = Math.max(local.xp || 0, cloud.xp || 0);

    // Streak: take best values
    merged.streak.current = Math.max(local.streak?.current || 0, cloud.streak?.current || 0);
    merged.streak.best = Math.max(local.streak?.best || 0, cloud.streak?.best || 0);
    // lastDate: take most recent
    var dates = [local.streak?.lastDate, cloud.streak?.lastDate].filter(Boolean);
    merged.streak.lastDate = dates.length > 0
      ? dates.sort(function(a, b) { return new Date(b) - new Date(a); })[0]
      : null;

    // Diagnostic: merge scores, keep most recent level
    var allScores = [].concat(local.diagnostic?.scores || [], cloud.diagnostic?.scores || []);
    var seenDates = {};
    merged.diagnostic.scores = allScores.filter(function(s) {
      if (!s.date || seenDates[s.date]) return false;
      seenDates[s.date] = true;
      return true;
    }).sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
    merged.diagnostic.lastDate = merged.diagnostic.scores.length > 0
      ? merged.diagnostic.scores[0].date : null;
    // Level: prefer the one from the most recent diagnostic
    var localDate = local.diagnostic?.lastDate ? new Date(local.diagnostic.lastDate) : new Date(0);
    var cloudDate = cloud.diagnostic?.lastDate ? new Date(cloud.diagnostic.lastDate) : new Date(0);
    merged.diagnostic.level = localDate >= cloudDate
      ? (local.diagnostic?.level || cloud.diagnostic?.level || null)
      : (cloud.diagnostic?.level || local.diagnostic?.level || null);

    // Arrays: union (deduplicated)
    merged.grammar.completed = this._union(local.grammar?.completed, cloud.grammar?.completed);
    merged.vocabulary.learned = this._union(local.vocabulary?.learned, cloud.vocabulary?.learned);
    merged.reading.completed = this._union(local.reading?.completed, cloud.reading?.completed);
    merged.listening.completed = this._union(local.listening?.completed, cloud.listening?.completed);
    merged.conversations.practiced = this._union(local.conversations?.practiced, cloud.conversations?.practiced);
    merged.badges = this._union(local.badges, cloud.badges);

    // Scores objects: keep highest score per test
    merged.grammar.quizScores = this._mergeScores(local.grammar?.quizScores, cloud.grammar?.quizScores);
    merged.reading.scores = this._mergeScores(local.reading?.scores, cloud.reading?.scores);
    merged.listening.scores = this._mergeScores(local.listening?.scores, cloud.listening?.scores);

    // Vocabulary quiz history: merge and deduplicate
    var allQuizHist = [].concat(local.vocabulary?.quizHistory || [], cloud.vocabulary?.quizHistory || []);
    var seenQuiz = {};
    merged.vocabulary.quizHistory = allQuizHist.filter(function(q) {
      var key = q.date || JSON.stringify(q);
      if (seenQuiz[key]) return false;
      seenQuiz[key] = true;
      return true;
    });

    // Study time: max total, merge sessions
    merged.studyTime.total = Math.max(local.studyTime?.total || 0, cloud.studyTime?.total || 0);
    var allSessions = [].concat(local.studyTime?.sessions || [], cloud.studyTime?.sessions || []);
    var seenSess = {};
    merged.studyTime.sessions = allSessions.filter(function(s) {
      var key = JSON.stringify(s);
      if (seenSess[key]) return false;
      seenSess[key] = true;
      return true;
    });

    return merged;
  },

  _union: function(arr1, arr2) {
    var set = {};
    (arr1 || []).forEach(function(v) { set[v] = true; });
    (arr2 || []).forEach(function(v) { set[v] = true; });
    return Object.keys(set);
  },

  _mergeScores: function(localScores, cloudScores) {
    var merged = {};
    var cs = cloudScores || {};
    var ls = localScores || {};
    // Start with cloud
    for (var key in cs) {
      if (cs.hasOwnProperty(key)) merged[key] = cs[key];
    }
    // Override with local if score is higher
    for (var key2 in ls) {
      if (ls.hasOwnProperty(key2)) {
        if (!merged[key2] || (ls[key2].score > merged[key2].score)) {
          merged[key2] = ls[key2];
        }
      }
    }
    return merged;
  },

  /* ---- Streak management ---- */
  updateStreak() {
    var d = this.getAll();
    var today = new Date().toDateString();
    if (d.streak.lastDate === today) return d.streak;

    var yesterday = new Date(Date.now() - 86400000).toDateString();
    if (d.streak.lastDate === yesterday) {
      d.streak.current++;
    } else if (d.streak.lastDate !== today) {
      d.streak.current = 1;
    }
    d.streak.lastDate = today;
    if (d.streak.current > d.streak.best) d.streak.best = d.streak.current;
    this.save(d, 'streak_updated', { current: d.streak.current, best: d.streak.best });
    return d.streak;
  },

  /* ---- XP System ---- */
  addXP(amount, reason) {
    var d = this.getAll();
    d.xp = (d.xp || 0) + amount;
    this.save(d, 'xp_earned', { amount: amount, reason: reason });
    this.checkBadges(d);
    return d.xp;
  },

  /* ---- Badge System ---- */
  checkBadges(d) {
    var badges = d.badges || [];
    var checks = [
      { id: 'first_diagnostic', check: function() { return d.diagnostic.scores.length > 0; } },
      { id: 'vocab_50', check: function() { return d.vocabulary.learned.length >= 50; } },
      { id: 'vocab_100', check: function() { return d.vocabulary.learned.length >= 100; } },
      { id: 'vocab_200', check: function() { return d.vocabulary.learned.length >= 200; } },
      { id: 'streak_7', check: function() { return d.streak.best >= 7; } },
      { id: 'streak_30', check: function() { return d.streak.best >= 30; } },
      { id: 'reading_5', check: function() { return (d.reading.completed || []).length >= 5; } },
      { id: 'listening_5', check: function() { return (d.listening.completed || []).length >= 5; } },
      { id: 'xp_500', check: function() { return d.xp >= 500; } },
      { id: 'xp_2000', check: function() { return d.xp >= 2000; } }
    ];
    var newBadges = [];
    checks.forEach(function(b) {
      if (!badges.includes(b.id) && b.check()) {
        badges.push(b.id);
        newBadges.push(b.id);
      }
    });
    d.badges = badges;
    if (newBadges.length > 0) {
      this.save(d, 'badge_earned', { badges: newBadges });
    } else {
      // Save without triggering another activity log
      localStorage.setItem(this.KEY, JSON.stringify(d));
    }
  },

  getBadgeInfo() {
    return [
      { id: 'first_diagnostic', name: 'First Step', icon: '🎯', desc: 'Complete your first diagnostic' },
      { id: 'vocab_50', name: 'Word Collector', icon: '📝', desc: 'Learn 50 vocabulary words' },
      { id: 'vocab_100', name: 'Lexicon Builder', icon: '📚', desc: 'Learn 100 vocabulary words' },
      { id: 'vocab_200', name: 'Word Master', icon: '🏆', desc: 'Learn 200 vocabulary words' },
      { id: 'streak_7', name: 'Week Warrior', icon: '🔥', desc: '7-day study streak' },
      { id: 'streak_30', name: 'Monthly Master', icon: '💎', desc: '30-day study streak' },
      { id: 'reading_5', name: 'Avid Reader', icon: '📖', desc: 'Complete 5 reading exercises' },
      { id: 'listening_5', name: 'Keen Listener', icon: '🎧', desc: 'Complete 5 listening exercises' },
      { id: 'xp_500', name: 'Dedicated Learner', icon: '⭐', desc: 'Earn 500 XP' },
      { id: 'xp_2000', name: 'French Scholar', icon: '👑', desc: 'Earn 2000 XP' }
    ];
  },

  /* ---- Save diagnostic result ---- */
  saveDiagnostic(scores, level) {
    var d = this.getAll();
    d.diagnostic.scores.push({ date: new Date().toISOString(), ...scores });
    d.diagnostic.lastDate = new Date().toISOString();
    d.diagnostic.level = level;
    d.xp = (d.xp || 0) + 50;
    this.save(d, 'diagnostic_completed', { level: level, xpEarned: 50 });
    this.checkBadges(d);
    this.updateStreak();
  },

  /* ---- Save reading/listening score ---- */
  saveTestScore(type, testId, score, total) {
    var d = this.getAll();
    if (!d[type].completed.includes(testId)) d[type].completed.push(testId);
    d[type].scores[testId] = { score: score, total: total, date: new Date().toISOString() };
    var xpEarned = Math.round(score / total * 30);
    d.xp = (d.xp || 0) + xpEarned;
    this.save(d, 'quiz_completed', { type: type, testId: testId, score: score, total: total, xpEarned: xpEarned });
    this.checkBadges(d);
    this.updateStreak();
  },

  /* ---- Get CLB estimate ---- */
  estimateCLB() {
    var d = this.getAll();
    if (!d.diagnostic.level) return null;
    var map = { 'A1': 1, 'A2-': 2, 'A2': 3, 'A2+': 3, 'B1-': 4, 'B1': 5, 'B1+': 6, 'B2-': 7, 'B2': 8, 'B2+': 9 };
    return map[d.diagnostic.level] || null;
  },

  /* ---- Get overall completion percentage ---- */
  getOverallProgress() {
    var d = this.getAll();
    var points = 0, max = 0;
    max += 10; if (d.diagnostic.scores.length > 0) points += 10;
    max += 30; points += Math.min(30, Math.round(d.vocabulary.learned.length / 300 * 30));
    max += 20; points += Math.min(20, Math.round((d.grammar.completed || []).length / 17 * 20));
    max += 20; points += Math.min(20, Math.round((d.reading.completed || []).length / 10 * 20));
    max += 20; points += Math.min(20, Math.round((d.listening.completed || []).length / 10 * 20));
    return Math.round(points / max * 100);
  }
};
