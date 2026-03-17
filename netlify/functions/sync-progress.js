// Sync user progress to/from Supabase (cloud backup + admin visibility)
const SUPABASE_URL = 'https://stntjppzeuplngyfhgtp.supabase.co';

// VIP emails that bypass purchase check
const VIP_EMAILS = [
  'cajagdishlade@gmail.com',
  'vip-tester-1@tef-master.com',
  'vip-tester-2@tef-master.com',
  'vip-tester-3@tef-master.com',
  'vip-tester-4@tef-master.com',
  'vip-tester-5@tef-master.com'
];

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

  // Helper: check if email has active purchase or is VIP
  async function isAuthorized(email) {
    if (VIP_EMAILS.includes(email)) return true;

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/purchases?email=eq.${encodeURIComponent(email)}&is_active=eq.true&select=email&limit=1`,
      { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
    );
    if (!res.ok) return false;
    const rows = await res.json();
    return rows.length > 0;
  }

  // --- GET: Load progress from cloud ---
  if (event.httpMethod === 'GET') {
    const email = (event.queryStringParameters?.email || '').toLowerCase().trim();
    if (!email || !email.includes('@')) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Valid email required' }) };
    }

    if (!(await isAuthorized(email))) {
      return { statusCode: 403, headers, body: JSON.stringify({ error: 'No active purchase' }) };
    }

    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/user_progress?email=eq.${encodeURIComponent(email)}&select=progress_data,last_synced&limit=1`,
        { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
      );

      if (!res.ok) {
        const errText = await res.text();
        console.error('[sync] GET query failed:', res.status, errText);
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to load progress' }) };
      }

      const rows = await res.json();
      if (rows.length === 0) {
        console.log('[sync] No cloud data for:', email);
        return { statusCode: 200, headers, body: JSON.stringify({ progress_data: null, last_synced: null }) };
      }

      console.log('[sync] Loaded progress for:', email);
      return {
        statusCode: 200, headers,
        body: JSON.stringify({ progress_data: rows[0].progress_data, last_synced: rows[0].last_synced })
      };
    } catch (err) {
      console.error('[sync] GET error:', err.message);
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal error' }) };
    }
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

    // Extract denormalized fields for easy admin queries
    const totalXp = typeof progressData.xp === 'number' ? progressData.xp : 0;
    const currentStreak = typeof progressData.streak?.current === 'number' ? progressData.streak.current : 0;
    const bestStreak = typeof progressData.streak?.best === 'number' ? progressData.streak.best : 0;
    const diagnosticLevel = progressData.diagnostic?.level || null;
    const badgesCount = Array.isArray(progressData.badges) ? progressData.badges.length : 0;
    const lastActivePage = typeof body.page === 'string' ? body.page : null;
    const syncedAt = new Date().toISOString();

    // Upsert user_progress (insert or update on email conflict)
    const upsertBody = {
      email,
      progress_data: progressData,
      total_xp: totalXp,
      current_streak: currentStreak,
      best_streak: bestStreak,
      diagnostic_level: diagnosticLevel,
      badges_count: badgesCount,
      last_active_page: lastActivePage,
      last_synced: syncedAt
    };

    try {
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
    } catch (err) {
      console.error('[sync] Upsert error:', err.message);
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Database error' }) };
    }

    // Log activity if action provided (non-critical — don't fail on error)
    if (body.action && typeof body.action === 'string') {
      const logBody = {
        email,
        action: body.action,
        page: lastActivePage,
        details: (body.details && typeof body.details === 'object') ? body.details : {}
      };

      try {
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
          console.error('[sync] Activity log failed:', logRes.status, await logRes.text());
        }
      } catch (err) {
        console.error('[sync] Activity log error:', err.message);
      }
    }

    console.log('[sync] Saved progress for:', email, '| XP:', totalXp, '| Streak:', currentStreak, '| Level:', diagnosticLevel);
    return {
      statusCode: 200, headers,
      body: JSON.stringify({ success: true, synced_at: syncedAt })
    };
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
};
