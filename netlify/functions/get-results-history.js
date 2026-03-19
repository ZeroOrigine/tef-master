const SUPABASE_URL = 'https://stntjppzeuplngyfhgtp.supabase.co';

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'GET') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseKey) return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server misconfigured' }) };

  const email = (event.queryStringParameters?.email || '').toLowerCase().trim();
  if (!email) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Email required' }) };

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/diagnostic_results?email=eq.${encodeURIComponent(email)}&select=id,test_level,total_score,total_questions,score_pct,cefr_result,clb_estimate,elapsed_seconds,created_at&order=created_at.desc&limit=50`,
      { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
    );

    if (!res.ok) {
      console.error('[get-history] Query failed:', res.status);
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Database error' }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify(await res.json()) };
  } catch (err) {
    console.error('[get-history] Error:', err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal error' }) };
  }
};
