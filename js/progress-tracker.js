/* ========== Global Progress Tracker ========== */
const TEFProgress = {
  KEY: 'tef_master_progress',

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

  save(data) {
    localStorage.setItem(this.KEY, JSON.stringify(data));
  },

  /* Streak management */
  updateStreak() {
    const d = this.getAll();
    const today = new Date().toDateString();
    if (d.streak.lastDate === today) return d.streak;

    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (d.streak.lastDate === yesterday) {
      d.streak.current++;
    } else if (d.streak.lastDate !== today) {
      d.streak.current = 1;
    }
    d.streak.lastDate = today;
    if (d.streak.current > d.streak.best) d.streak.best = d.streak.current;
    this.save(d);
    return d.streak;
  },

  /* XP System */
  addXP(amount, reason) {
    const d = this.getAll();
    d.xp = (d.xp || 0) + amount;
    this.save(d);
    this.checkBadges(d);
    return d.xp;
  },

  /* Badge System */
  checkBadges(d) {
    const badges = d.badges || [];
    const checks = [
      { id: 'first_diagnostic', name: 'First Step', desc: 'Complete your first diagnostic', check: () => d.diagnostic.scores.length > 0 },
      { id: 'vocab_50', name: 'Word Collector', desc: 'Learn 50 vocabulary words', check: () => d.vocabulary.learned.length >= 50 },
      { id: 'vocab_100', name: 'Lexicon Builder', desc: 'Learn 100 vocabulary words', check: () => d.vocabulary.learned.length >= 100 },
      { id: 'vocab_200', name: 'Word Master', desc: 'Learn 200 vocabulary words', check: () => d.vocabulary.learned.length >= 200 },
      { id: 'streak_7', name: 'Week Warrior', desc: '7-day study streak', check: () => d.streak.best >= 7 },
      { id: 'streak_30', name: 'Monthly Master', desc: '30-day study streak', check: () => d.streak.best >= 30 },
      { id: 'reading_5', name: 'Avid Reader', desc: 'Complete 5 reading exercises', check: () => (d.reading.completed || []).length >= 5 },
      { id: 'listening_5', name: 'Keen Listener', desc: 'Complete 5 listening exercises', check: () => (d.listening.completed || []).length >= 5 },
      { id: 'xp_500', name: 'Dedicated Learner', desc: 'Earn 500 XP', check: () => d.xp >= 500 },
      { id: 'xp_2000', name: 'French Scholar', desc: 'Earn 2000 XP', check: () => d.xp >= 2000 },
    ];
    checks.forEach(b => {
      if (!badges.includes(b.id) && b.check()) {
        badges.push(b.id);
      }
    });
    d.badges = badges;
    this.save(d);
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
      { id: 'xp_2000', name: 'French Scholar', icon: '👑', desc: 'Earn 2000 XP' },
    ];
  },

  /* Save diagnostic result */
  saveDiagnostic(scores, level) {
    const d = this.getAll();
    d.diagnostic.scores.push({ date: new Date().toISOString(), ...scores });
    d.diagnostic.lastDate = new Date().toISOString();
    d.diagnostic.level = level;
    this.addXP(50, 'diagnostic');
    this.save(d);
    this.updateStreak();
  },

  /* Save reading/listening score */
  saveTestScore(type, testId, score, total) {
    const d = this.getAll();
    if (!d[type].completed.includes(testId)) d[type].completed.push(testId);
    d[type].scores[testId] = { score, total, date: new Date().toISOString() };
    this.addXP(Math.round(score / total * 30), type);
    this.save(d);
    this.updateStreak();
  },

  /* Get CLB estimate */
  estimateCLB() {
    const d = this.getAll();
    if (!d.diagnostic.level) return null;
    const map = { 'A1': 1, 'A2-': 2, 'A2': 3, 'A2+': 3, 'B1-': 4, 'B1': 5, 'B1+': 6, 'B2-': 7, 'B2': 8, 'B2+': 9 };
    return map[d.diagnostic.level] || null;
  },

  /* Get overall completion percentage */
  getOverallProgress() {
    const d = this.getAll();
    let points = 0, max = 0;
    // Diagnostic taken
    max += 10; if (d.diagnostic.scores.length > 0) points += 10;
    // Vocab learned (target 300)
    max += 30; points += Math.min(30, Math.round(d.vocabulary.learned.length / 300 * 30));
    // Grammar sections (16 topics)
    max += 20; points += Math.min(20, Math.round((d.grammar.completed || []).length / 16 * 20));
    // Reading tests (target 10)
    max += 20; points += Math.min(20, Math.round((d.reading.completed || []).length / 10 * 20));
    // Listening tests (target 10)
    max += 20; points += Math.min(20, Math.round((d.listening.completed || []).length / 10 * 20));
    return Math.round(points / max * 100);
  }
};
