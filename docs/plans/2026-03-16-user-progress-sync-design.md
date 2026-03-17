# User Progress Sync — Design Document

**Date:** 2026-03-16
**Status:** Approved
**Approach:** Sync-on-Save (localStorage primary, Supabase cloud backup + admin visibility)

## Problem

Progress tracking uses localStorage only. Users lose progress on device switch. Admin has no visibility into who uses the product or how they perform.

## Solution

Every `TEFProgress.save()` call triggers a background cloud sync to Supabase. On login (access gate verification), cloud data is fetched and merged with local data using a "keep the best" strategy. A retry queue handles network failures.

## Database Schema

### Table: `user_progress`

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PK, default gen_random_uuid() | Row ID |
| email | TEXT | UNIQUE, NOT NULL | User identifier (from access gate) |
| display_name | TEXT | nullable | Optional user name |
| progress_data | JSONB | NOT NULL, default '{}' | Full TEFProgress object |
| total_xp | INT | NOT NULL, default 0 | Denormalized for admin queries |
| current_streak | INT | NOT NULL, default 0 | Denormalized for admin queries |
| best_streak | INT | NOT NULL, default 0 | Denormalized for admin queries |
| diagnostic_level | TEXT | nullable | Latest CEFR level (A1–B2+) |
| badges_count | INT | NOT NULL, default 0 | Number of badges earned |
| last_active_page | TEXT | nullable | Most recent page visited |
| last_synced | TIMESTAMPTZ | NOT NULL, default now() | Last successful sync |
| created_at | TIMESTAMPTZ | NOT NULL, default now() | First seen |
| updated_at | TIMESTAMPTZ | NOT NULL, default now() | Auto-updated via trigger |

### Table: `user_activity_log`

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | UUID | PK, default gen_random_uuid() | Row ID |
| email | TEXT | NOT NULL | Who |
| action | TEXT | NOT NULL | Event type (see below) |
| page | TEXT | nullable | URL path |
| details | JSONB | default '{}' | Score, test ID, etc. |
| created_at | TIMESTAMPTZ | NOT NULL, default now() | When |

**Action types:** `login`, `diagnostic_completed`, `quiz_completed`, `vocab_learned`, `badge_earned`, `streak_updated`, `page_visited`

### Indexes

- `user_progress(email)` — unique, primary lookup
- `user_activity_log(email, created_at DESC)` — activity feed per user
- `user_activity_log(action, created_at DESC)` — filter by action type

### RLS Policy

Service role key bypasses RLS. No anon access to these tables.

## New Netlify Function: `sync-progress.js`

### POST /sync-progress (save to cloud)

Request: `{ email, progress_data, action, page, details }`

1. Validate email matches a verified purchase (query `purchases` table)
2. Upsert `user_progress`: extract denormalized fields (xp, streak, level, badges) from progress_data
3. Insert into `user_activity_log` if action is provided
4. Return `{ success: true, synced_at }`

### GET /sync-progress?email=... (load from cloud)

1. Validate email matches a verified purchase
2. Return `{ progress_data, last_synced }` or `{ progress_data: null }` if no cloud data

## Modified: `js/progress-tracker.js`

### New method: `getEmail()`

Returns `localStorage.getItem('tef_verified_email')` — the email stored by the access gate.

### New method: `syncToCloud(action, details)`

Called after every `save()`. Background fetch POST to `/sync-progress`. Failures go to retry queue in `localStorage['tef_sync_queue']`. Retried on next successful sync.

### New method: `loadFromCloud(email)`

Called once after access gate verification. Fetches cloud data, merges with local using "keep the best" strategy:
- XP: max(local, cloud)
- Streak current: max(local, cloud)
- Streak best: max(local, cloud)
- Completed arrays: union(local, cloud)
- Scores: keep highest score per test
- Badges: union(local, cloud)
- Diagnostic: keep most recent

### New method: `flushRetryQueue()`

On each successful sync, check queue and retry pending syncs.

### Modified method: `save(data)`

After localStorage write, call `syncToCloud()` if email is available.

## Modified: `js/access-gate.js`

After `data.verified === true` and before page reload:
1. Call `TEFProgress.loadFromCloud(email)`
2. Merge result with localStorage
3. Then reload

## Data Flow

```
Quiz completed → saveTestScore() → save(data) → localStorage.setItem()
                                              → syncToCloud('quiz_completed', {testId, score})
                                                → POST /sync-progress (background, non-blocking)
                                                  → Supabase upsert user_progress
                                                  → Supabase insert user_activity_log

New device login → access gate → verify-access → verified
                                              → loadFromCloud(email)
                                                → GET /sync-progress?email=x
                                                → merge(local, cloud) → save merged
```

## Error Handling

- Cloud sync is fire-and-forget — never blocks UI
- Network failures: queued in localStorage, retried on next save
- Merge conflicts: always take maximum/union (no data loss)
- Invalid email: sync silently skipped
- Supabase errors: logged server-side, silent client-side

## Admin Queries (Supabase Dashboard)

```sql
-- All premium users with their progress
SELECT email, total_xp, current_streak, diagnostic_level, badges_count, last_synced
FROM user_progress ORDER BY last_synced DESC;

-- Active users in last 24 hours
SELECT DISTINCT email FROM user_activity_log
WHERE created_at > now() - interval '1 day';

-- Quiz scores breakdown
SELECT email, details->>'testId' as test, details->>'score' as score,
       details->>'total' as total, created_at
FROM user_activity_log WHERE action = 'quiz_completed'
ORDER BY created_at DESC;

-- User journey (single user)
SELECT action, page, details, created_at
FROM user_activity_log WHERE email = 'user@example.com'
ORDER BY created_at;
```
