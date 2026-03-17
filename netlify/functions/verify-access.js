// Verify if an email has a valid purchase
const SUPABASE_URL = 'https://stntjppzeuplngyfhgtp.supabase.co';

// VIP emails (owner + testers — always have access)
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

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseServiceKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server misconfigured' }) };
  }

  let email;
  try {
    const body = JSON.parse(event.body);
    email = (body.email || '').toLowerCase().trim();
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid request' }) };
  }

  if (!email || !email.includes('@')) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Valid email required' }) };
  }

  // Check VIP testers first
  if (VIP_EMAILS.includes(email)) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ verified: true, email })
    };
  }

  // Check Supabase for purchase
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/purchases?email=eq.${encodeURIComponent(email)}&is_active=eq.true&select=email,created_at&limit=1`,
    {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      }
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    console.error('Supabase query failed:', res.status, errText);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Verification failed' }) };
  }

  const data = await res.json();

  if (data.length > 0) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ verified: true, email: data[0].email })
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ verified: false, error: 'No purchase found for this email' })
  };
};
