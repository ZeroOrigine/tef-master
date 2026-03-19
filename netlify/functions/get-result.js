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

  const id = event.queryStringParameters?.id;
  const email = (event.queryStringParameters?.email || '').toLowerCase().trim();

  if (!id || !email) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'id and email required' }) };
  }

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/diagnostic_results?id=eq.${id}&email=eq.${encodeURIComponent(email)}&select=*&limit=1`,
      { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
    );

    if (!res.ok) {
      console.error('[get-result] Query failed:', res.status);
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Database error' }) };
    }

    const rows = await res.json();
    if (rows.length === 0) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'Result not found' }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify(rows[0]) };
  } catch (err) {
    console.error('[get-result] Error:', err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal error' }) };
  }
};
