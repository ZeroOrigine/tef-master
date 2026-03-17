# User Progress Sync — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Sync user progress from localStorage to Supabase so admins can see user activity, and users can resume progress across devices.

**Architecture:** localStorage remains the primary data store (instant, offline). Every save triggers a background POST to a Netlify function that upserts Supabase. On login, cloud data is fetched and merged with local using a "keep the best" strategy. A retry queue handles failures.

**Tech Stack:** Vanilla JS (browser), Netlify Functions (Node.js), Supabase REST API (PostgreSQL + JSONB)

---

### Task 1: Create Supabase Tables

**Files:**
- Execute SQL in Supabase dashboard (or via REST API)

**Step 1: Create `user_progress` table**

Run this SQL against Supabase project `stntjppzeuplngyfhgtp`:

```sql
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  progress_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  total_xp INT NOT NULL DEFAULT 0,
  current_streak INT NOT NULL DEFAULT 0,
  best_streak INT NOT NULL DEFAULT 0,
  diagnostic_level TEXT,
  badges_count INT NOT NULL DEFAULT 0,
  last_active_page TEXT,
  last_synced TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_progress_updated_at
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_progress_email ON public.user_progress(email);
CREATE INDEX IF NOT EXISTS idx_user_progress_last_synced ON public.user_progress(last_synced DESC);
```

**Step 2: Create `user_activity_log` table**

```sql
CREATE TABLE IF NOT EXISTS public.user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  action TEXT NOT NULL,
  page TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_email_date ON public.user_activity_log(email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_action_date ON public.user_activity_log(action, created_at DESC);
```

**Step 3: Enable RLS (deny anon, allow service_role)**

```sql
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS automatically, no policy needed for service_role
-- Block anon access (no policies = deny all for anon)
```

**Step 4: Verify tables exist**

```bash
curl -s "https://stntjppzeuplngyfhgtp.supabase.co/rest/v1/user_progress?select=id&limit=1" \
  -H "apikey: $SUPABASE_SERVICE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY"
# Expected: [] (empty array, no error)

curl -s "https://stntjppzeuplngyfhgtp.supabase.co/rest/v1/user_activity_log?select=id&limit=1" \
  -H "apikey: $SUPABASE_SERVICE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY"
# Expected: [] (empty array, no error)
```

**Step 5: Commit**

```bash
git add docs/plans/
git commit -m "docs: add user progress sync design and plan"
```

---

### Task 2: Create `sync-progress` Netlify Function

**Files:**
- Create: `netlify/functions/sync-progress.js`

**Step 1: Create the function file**

```javascript
// Sync user progress to/from Supabase
const SUPABASE_URL = 'https://stntjppzeuplngyfhgtp.supabase.co';

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseKey) {
    console.error('[sync] Missing SUPABASE_SERVICE_KEY');
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server misconfigured' }) };
  }

  // --- GET: Load progress from cloud ---
  if (event.httpMethod === 'GET') {
    const email = (event.queryStringParameters?.email || '').toLowerCase().trim();
    if (!email || !email.includes('@')) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Valid email required' }) };
    }

    // Verify purchase exists
    const purchaseCheck = await fetch(
      `${SUPABASE_URL}/rest/v1/purchases?email=eq.${encodeURIComponent(email)}&is_active=eq.true&select=email&limit=1`,
      { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
    );
    if (!purchaseCheck.ok || (await purchaseCheck.json()).length === 0) {
      // Also allow VIP emails
      const VIP = ['cajagdishlade@gmail.com'];
      if (!VIP.includes(email)) {
        return { statusCode: 403, headers, body: JSON.stringify({ error: 'No active purchase' }) };
      }
    }

    // Fetch progress
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/user_progress?email=eq.${encodeURIComponent(email)}&select=progress_data,last_synced&limit=1`,
      { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
    );

    if (!res.ok) {
      console.error('[sync] GET failed:', res.status, await res.text());
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to load progress' }) };
    }

    const rows = await res.json();
    if (rows.length === 0) {
      return { statusCode: 200, headers, body: JSON.stringify({ progress_data: null, last_synced: null }) };
    }

    console.log('[sync] Loaded progress for:', email);
    return {
      statusCode: 200, headers,
      body: JSON.stringify({ progress_data: rows[0].progress_data, last_synced: rows[0].last_synced })
    };
  }

  // --- POST: Save progress to cloud ---
  if (event.httpMethod === 'POST') {
    let body;
    try {
      body = JSON.parse(event.body);
    } catch {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
    }

    const email = (body.email || '').toLowerCase().trim();
    if (!email || !email.includes('@')) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Valid email required' }) };
    }

    const progressData = body.progress_data;
    if (!progressData || typeof progressData !== 'object') {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'progress_data required' }) };
    }

    // Extract denormalized fields for admin queries
    const totalXp = progressData.xp || 0;
    const currentStreak = progressData.streak?.current || 0;
    const bestStreak = progressData.streak?.best || 0;
    const diagnosticLevel = progressData.diagnostic?.level || null;
    const badgesCount = (progressData.badges || []).length;
    const lastActivePage = body.page || null;

    // Upsert user_progress
    const upsertBody = {
      email,
      progress_data: progressData,
      total_xp: totalXp,
      current_streak: currentStreak,
      best_streak: bestStreak,
      diagnostic_level: diagnosticLevel,
      badges_count: badgesCount,
      last_active_page: lastActivePage,
      last_synced: new Date().toISOString()
    };

    const upsertRes = await fetch(
      `${SUPABASE_URL}/rest/v1/user_progress?on_conflict=email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'resolution=merge-duplicates,return=minimal'
        },
        body: JSON.stringify(upsertBody)
      }
    );

    if (!upsertRes.ok) {
      const err = await upsertRes.text();
      console.error('[sync] Upsert failed:', upsertRes.status, err);
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to save progress' }) };
    }

    // Log activity if action provided
    if (body.action) {
      const logBody = {
        email,
        action: body.action,
        page: body.page || null,
        details: body.details || {}
      };

      const logRes = await fetch(
        `${SUPABASE_URL}/rest/v1/user_activity_log`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(logBody)
        }
      );

      if (!logRes.ok) {
        // Activity log failure is non-critical — don't fail the whole request
        console.error('[sync] Activity log insert failed:', logRes.status, await logRes.text());
      }
    }

    console.log('[sync] Saved progress for:', email, '| XP:', totalXp, '| Streak:', currentStreak);
    return {
      statusCode: 200, headers,
      body: JSON.stringify({ success: true, synced_at: upsertBody.last_synced })
    };
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
};
```

**Step 2: Test locally with curl (after deploy)**

```bash
# Test POST (save)
curl -s -X POST https://tef-master.com/.netlify/functions/sync-progress \
  -H "Content-Type: application/json" \
  -d '{"email":"cajagdishlade@gmail.com","progress_data":{"xp":100,"streak":{"current":3,"best":5,"lastDate":"Mon Mar 16 2026"},"diagnostic":{"scores":[],"level":"B1"},"badges":["first_diagnostic"]},"action":"test_sync","page":"/test"}'
# Expected: {"success":true,"synced_at":"..."}

# Test GET (load)
curl -s "https://tef-master.com/.netlify/functions/sync-progress?email=cajagdishlade@gmail.com"
# Expected: {"progress_data":{...},"last_synced":"..."}
```

**Step 3: Commit**

```bash
git add netlify/functions/sync-progress.js
git commit -m "feat: add sync-progress Netlify function for cloud progress sync"
```

---

### Task 3: Add Cloud Sync to `progress-tracker.js`

**Files:**
- Modify: `js/progress-tracker.js` (all 143 lines)

**Step 1: Replace the entire file with cloud-sync-enabled version**

The new version adds these methods to TEFProgress:
- `getEmail()` — reads verified email from localStorage
- `syncToCloud(action, details)` — background POST, retry queue on failure
- `loadFromCloud(email)` — GET cloud data, merge with local
- `mergeProgress(local, cloud)` — "keep the best" merge strategy
- `flushRetryQueue()` — retry failed syncs
- Modified `save()` — triggers `syncToCloud()` after localStorage write

```javascript
/* ========== Global Progress Tracker (with Cloud Sync) ========== */
const TEFProgress = {
  KEY: 'tef_master_progress',
  SYNC_URL: '/.netlify/functions/sync-progress',
  QUEUE_KEY: 'tef_sync_queue',
  _syncing: false,
  _lastSyncAction: null,

  getEmail() {
    return localStorage.getItem('tef_verified_email') || null;
  },

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

  save(data, action, details) {
    localStorage.setItem(this.KEY, JSON.stringify(data));
    // Trigger cloud sync in background (non-blocking)
    this.syncToCloud(action || null, details || null);
  },

  /* ---- Cloud Sync (background, fire-and-forget) ---- */
  syncToCloud(action, details) {
    const email = this.getEmail();
    if (!email) return; // Not logged in, skip

    const data = this.getAll();
    const payload = {
      email,
      progress_data: data,
      action: action || undefined,
      page: window.location.pathname,
      details: details || undefined
    };

    // Debounce: don't fire multiple syncs within 2 seconds
    if (this._syncTimer) clearTimeout(this._syncTimer);
    this._syncTimer = setTimeout(() => {
      this._doSync(payload);
    }, 1500);
  },

  async _doSync(payload) {
    if (this._syncing) {
      this._queueSync(payload);
      return;
    }
    this._syncing = true;

    try {
      const res = await fetch(this.SYNC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        // Success — flush any queued retries
        this.flushRetryQueue();
      } else {
        console.warn('[TEFProgress] Cloud sync failed:', res.status);
        this._queueSync(payload);
      }
    } catch (err) {
      // Network error — queue for retry
      console.warn('[TEFProgress] Cloud sync network error');
      this._queueSync(payload);
    } finally {
      this._syncing = false;
    }
  },

  _queueSync(payload) {
    try {
      const queue = JSON.parse(localStorage.getItem(this.QUEUE_KEY) || '[]');
      // Keep only last 10 queued syncs to avoid localStorage bloat
      if (queue.length >= 10) queue.shift();
      queue.push({ payload, timestamp: Date.now() });
      localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
    } catch { /* localStorage full — silently drop */ }
  },

  async flushRetryQueue() {
    try {
      const queue = JSON.parse(localStorage.getItem(this.QUEUE_KEY) || '[]');
      if (queue.length === 0) return;

      // Clear queue first to prevent re-entry
      localStorage.removeItem(this.QUEUE_KEY);

      // Only retry the latest one (it has the most current data)
      const latest = queue[queue.length - 1];
      // Update with current progress data (may be newer than queued)
      latest.payload.progress_data = this.getAll();

      await fetch(this.SYNC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(latest.payload)
      });
    } catch { /* Silent fail on retry flush */ }
  },

  /* ---- Load & Merge from Cloud ---- */
  async loadFromCloud(email) {
    try {
      const res = await fetch(`${this.SYNC_URL}?email=${encodeURIComponent(email)}`);
      if (!res.ok) return false;

      const cloud = await res.json();
      if (!cloud.progress_data) return false; // No cloud data yet

      const local = this.getAll();
      const merged = this.mergeProgress(local, cloud.progress_data);
      localStorage.setItem(this.KEY, JSON.stringify(merged));

      // Push merged result back to cloud
      this.syncToCloud('login', { source: 'merge' });
      return true;
    } catch (err) {
      console.warn('[TEFProgress] Failed to load from cloud:', err.message);
      return false;
    }
  },

  mergeProgress(local, cloud) {
    const merged = this.defaults();

    // XP: take max
    merged.xp = Math.max(local.xp || 0, cloud.xp || 0);

    // Streak: take best values
    merged.streak.current = Math.max(local.streak?.current || 0, cloud.streak?.current || 0);
    merged.streak.best = Math.max(local.streak?.best || 0, cloud.streak?.best || 0);
    // lastDate: take most recent
    merged.streak.lastDate = [local.streak?.lastDate, cloud.streak?.lastDate]
      .filter(Boolean)
      .sort((a, b) => new Date(b) - new Date(a))[0] || null;

    // Diagnostic: keep most recent score, merge all scores
    const allScores = [...(local.diagnostic?.scores || []), ...(cloud.diagnostic?.scores || [])];
    // Deduplicate by date
    const seenDates = new Set();
    merged.diagnostic.scores = allScores.filter(s => {
      if (seenDates.has(s.date)) return false;
      seenDates.add(s.date);
      return true;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
    merged.diagnostic.lastDate = merged.diagnostic.scores[0]?.date || null;
    // Level: take from most recent diagnostic
    if (merged.diagnostic.scores.length > 0) {
      // Find the score entry with the most recent date and extract level
      merged.diagnostic.level = local.diagnostic?.level || cloud.diagnostic?.level || null;
      // Prefer the one with a more recent lastDate
      const localDate = local.diagnostic?.lastDate ? new Date(local.diagnostic.lastDate) : new Date(0);
      const cloudDate = cloud.diagnostic?.lastDate ? new Date(cloud.diagnostic.lastDate) : new Date(0);
      merged.diagnostic.level = localDate >= cloudDate
        ? (local.diagnostic?.level || cloud.diagnostic?.level)
        : (cloud.diagnostic?.level || local.diagnostic?.level);
    }

    // Arrays (completed, learned, practiced): union (deduplicated)
    merged.grammar.completed = [...new Set([...(local.grammar?.completed || []), ...(cloud.grammar?.completed || [])])];
    merged.vocabulary.learned = [...new Set([...(local.vocabulary?.learned || []), ...(cloud.vocabulary?.learned || [])])];
    merged.reading.completed = [...new Set([...(local.reading?.completed || []), ...(cloud.reading?.completed || [])])];
    merged.listening.completed = [...new Set([...(local.listening?.completed || []), ...(cloud.listening?.completed || [])])];
    merged.conversations.practiced = [...new Set([...(local.conversations?.practiced || []), ...(cloud.conversations?.practiced || [])])];

    // Quiz scores: keep highest score per test
    merged.grammar.quizScores = this._mergeScores(local.grammar?.quizScores, cloud.grammar?.quizScores);
    merged.reading.scores = this._mergeScores(local.reading?.scores, cloud.reading?.scores);
    merged.listening.scores = this._mergeScores(local.listening?.scores, cloud.listening?.scores);

    // Vocabulary quiz history: merge and deduplicate by date
    const allQuizHist = [...(local.vocabulary?.quizHistory || []), ...(cloud.vocabulary?.quizHistory || [])];
    const seenQuizDates = new Set();
    merged.vocabulary.quizHistory = allQuizHist.filter(q => {
      const key = q.date || JSON.stringify(q);
      if (seenQuizDates.has(key)) return false;
      seenQuizDates.add(key);
      return true;
    });

    // Study time: sum if different, max if same session
    merged.studyTime.total = Math.max(local.studyTime?.total || 0, cloud.studyTime?.total || 0);
    const allSessions = [...(local.studyTime?.sessions || []), ...(cloud.studyTime?.sessions || [])];
    const seenSessions = new Set();
    merged.studyTime.sessions = allSessions.filter(s => {
      const key = JSON.stringify(s);
      if (seenSessions.has(key)) return false;
      seenSessions.add(key);
      return true;
    });

    // Badges: union
    merged.badges = [...new Set([...(local.badges || []), ...(cloud.badges || [])])];

    return merged;
  },

  _mergeScores(localScores, cloudScores) {
    const merged = { ...(cloudScores || {}) };
    for (const [key, val] of Object.entries(localScores || {})) {
      if (!merged[key] || (val.score > merged[key].score)) {
        merged[key] = val;
      }
    }
    return merged;
  },

  /* ---- Streak management ---- */
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
    this.save(d, 'streak_updated', { current: d.streak.current, best: d.streak.best });
    return d.streak;
  },

  /* ---- XP System ---- */
  addXP(amount, reason) {
    const d = this.getAll();
    d.xp = (d.xp || 0) + amount;
    this.save(d, 'xp_earned', { amount, reason });
    this.checkBadges(d);
    return d.xp;
  },

  /* ---- Badge System ---- */
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
    const newBadges = [];
    checks.forEach(b => {
      if (!badges.includes(b.id) && b.check()) {
        badges.push(b.id);
        newBadges.push(b.id);
      }
    });
    d.badges = badges;
    if (newBadges.length > 0) {
      this.save(d, 'badge_earned', { badges: newBadges });
    } else {
      this.save(d);
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
      { id: 'xp_2000', name: 'French Scholar', icon: '👑', desc: 'Earn 2000 XP' },
    ];
  },

  /* ---- Save diagnostic result ---- */
  saveDiagnostic(scores, level) {
    const d = this.getAll();
    d.diagnostic.scores.push({ date: new Date().toISOString(), ...scores });
    d.diagnostic.lastDate = new Date().toISOString();
    d.diagnostic.level = level;
    d.xp = (d.xp || 0) + 50;
    this.save(d, 'diagnostic_completed', { level, xpEarned: 50 });
    this.checkBadges(d);
    this.updateStreak();
  },

  /* ---- Save reading/listening score ---- */
  saveTestScore(type, testId, score, total) {
    const d = this.getAll();
    if (!d[type].completed.includes(testId)) d[type].completed.push(testId);
    d[type].scores[testId] = { score, total, date: new Date().toISOString() };
    const xpEarned = Math.round(score / total * 30);
    d.xp = (d.xp || 0) + xpEarned;
    this.save(d, 'quiz_completed', { type, testId, score, total, xpEarned });
    this.checkBadges(d);
    this.updateStreak();
  },

  /* ---- Get CLB estimate ---- */
  estimateCLB() {
    const d = this.getAll();
    if (!d.diagnostic.level) return null;
    const map = { 'A1': 1, 'A2-': 2, 'A2': 3, 'A2+': 3, 'B1-': 4, 'B1': 5, 'B1+': 6, 'B2-': 7, 'B2': 8, 'B2+': 9 };
    return map[d.diagnostic.level] || null;
  },

  /* ---- Get overall completion percentage ---- */
  getOverallProgress() {
    const d = this.getAll();
    let points = 0, max = 0;
    max += 10; if (d.diagnostic.scores.length > 0) points += 10;
    max += 30; points += Math.min(30, Math.round(d.vocabulary.learned.length / 300 * 30));
    max += 20; points += Math.min(20, Math.round((d.grammar.completed || []).length / 17 * 20));
    max += 20; points += Math.min(20, Math.round((d.reading.completed || []).length / 10 * 20));
    max += 20; points += Math.min(20, Math.round((d.listening.completed || []).length / 10 * 20));
    return Math.round(points / max * 100);
  }
};
```

**Step 2: Verify no syntax errors**

```bash
node -c js/progress-tracker.js
# Expected: no output (valid syntax)
```

**Step 3: Commit**

```bash
git add js/progress-tracker.js
git commit -m "feat: add cloud sync to TEFProgress (Supabase backup + retry queue)"
```

---

### Task 4: Update Access Gate to Load Cloud Progress on Login

**Files:**
- Modify: `js/access-gate.js:180-185` (the verification success handler)

**Step 1: Modify the verifyEmail success handler**

Replace lines 180-185 (the `if (data.verified)` block) with a version that loads cloud progress before reloading:

```javascript
      if (data.verified) {
        localStorage.setItem(ACCESS_KEY, email);
        success.textContent = 'Verified! Syncing your progress...';
        success.style.display = 'block';
        input.style.borderColor = '#16a34a';

        // Load cloud progress and merge with local before reload
        if (typeof TEFProgress !== 'undefined' && TEFProgress.loadFromCloud) {
          try {
            await TEFProgress.loadFromCloud(email);
          } catch (e) {
            // Cloud load failed — proceed anyway, local data still works
            console.warn('[gate] Cloud progress load failed:', e.message);
          }
        }

        setTimeout(() => window.location.reload(), 600);
      }
```

**Step 2: Verify no syntax errors**

```bash
node -c js/access-gate.js
# Expected: no output (valid syntax)
```

**Step 3: Commit**

```bash
git add js/access-gate.js
git commit -m "feat: load cloud progress on access gate verification"
```

---

### Task 5: Deploy and Test End-to-End

**Step 1: Push all commits**

```bash
git push origin main
```

**Step 2: Deploy to Netlify**

```bash
npx netlify deploy --prod --dir=.
```

**Step 3: Create tables in Supabase**

Run the SQL from Task 1 via Supabase REST API:

```bash
# Use the execute_sql approach or run in Supabase SQL Editor
curl -s -X POST "https://stntjppzeuplngyfhgtp.supabase.co/rest/v1/rpc/exec_sql" \
  -H "apikey: $SUPABASE_SERVICE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "CREATE TABLE IF NOT EXISTS ..."}'
```

If RPC not available, use the Supabase MCP tool or guide user to run SQL in dashboard.

**Step 4: Test POST (save progress)**

```bash
curl -s -X POST https://tef-master.com/.netlify/functions/sync-progress \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cajagdishlade@gmail.com",
    "progress_data": {
      "xp": 150,
      "streak": {"current": 3, "best": 5, "lastDate": "Mon Mar 16 2026"},
      "diagnostic": {"scores": [{"date":"2026-03-16","total":35}], "lastDate": "2026-03-16", "level": "B1"},
      "grammar": {"completed": ["articles","verbs"], "quizScores": {}},
      "vocabulary": {"learned": ["bonjour","merci"], "quizHistory": []},
      "reading": {"completed": [], "scores": {}},
      "listening": {"completed": [], "scores": {}},
      "conversations": {"practiced": []},
      "studyTime": {"total": 0, "sessions": []},
      "badges": ["first_diagnostic"]
    },
    "action": "test_sync",
    "page": "/test"
  }'
# Expected: {"success":true,"synced_at":"2026-03-16T..."}
```

**Step 5: Test GET (load progress)**

```bash
curl -s "https://tef-master.com/.netlify/functions/sync-progress?email=cajagdishlade@gmail.com"
# Expected: {"progress_data":{...},"last_synced":"..."}
```

**Step 6: Verify user_progress table in Supabase**

```bash
curl -s "https://stntjppzeuplngyfhgtp.supabase.co/rest/v1/user_progress?select=email,total_xp,current_streak,diagnostic_level,badges_count,last_synced" \
  -H "apikey: $SUPABASE_SERVICE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY"
# Expected: row with cajagdishlade@gmail.com, xp=150, streak=3, level=B1, badges=1
```

**Step 7: Verify user_activity_log**

```bash
curl -s "https://stntjppzeuplngyfhgtp.supabase.co/rest/v1/user_activity_log?select=email,action,page,details,created_at&order=created_at.desc&limit=5" \
  -H "apikey: $SUPABASE_SERVICE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY"
# Expected: row with action=test_sync, page=/test
```

**Step 8: Test access gate flow in browser**

1. Open https://tef-master.com/pages/grammar.html in incognito
2. Enter cajagdishlade@gmail.com
3. Should see "Syncing your progress..." then reload with content visible
4. Check Supabase for a new activity log entry with action=login

**Step 9: Commit final state**

```bash
git add -A
git commit -m "chore: verify end-to-end cloud sync deployment"
git push origin main
```
