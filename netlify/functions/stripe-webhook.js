// Stripe Webhook → Creates purchase record in Supabase
const crypto = require('crypto');

const SUPABASE_URL = 'https://stntjppzeuplngyfhgtp.supabase.co';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const sig = event.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!sig || !endpointSecret || !stripeSecretKey || !supabaseServiceKey) {
    return { statusCode: 500, body: 'Missing configuration' };
  }

  // Verify Stripe signature
  try {
    const payload = event.body;
    const signedPayload = `${sig.split(',').find(s => s.startsWith('t=')).split('=')[1]}.${payload}`;
    const expectedSig = sig.split(',').find(s => s.startsWith('v1=')).split('=')[1];
    const computedSig = crypto.createHmac('sha256', endpointSecret).update(signedPayload).digest('hex');

    if (computedSig !== expectedSig) {
      return { statusCode: 400, body: 'Invalid signature' };
    }
  } catch (err) {
    return { statusCode: 400, body: 'Signature verification failed' };
  }

  const stripeEvent = JSON.parse(event.body);

  // Only process successful checkout sessions
  if (stripeEvent.type !== 'checkout.session.completed') {
    return { statusCode: 200, body: 'Event ignored' };
  }

  const session = stripeEvent.data.object;
  const email = (session.customer_details?.email || session.customer_email || '').toLowerCase().trim();
  const sessionId = session.id;
  const customerId = session.customer || null;
  const amountPaid = session.amount_total || 990;
  const currency = session.currency || 'usd';

  if (!email) {
    return { statusCode: 400, body: 'No email in session' };
  }

  // Generate unique access token
  const accessToken = crypto.randomBytes(16).toString('hex').toUpperCase().slice(0, 12);

  // Store in Supabase
  const res = await fetch(`${SUPABASE_URL}/rest/v1/purchases`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({
      email,
      stripe_session_id: sessionId,
      stripe_customer_id: customerId,
      amount_paid: amountPaid,
      currency,
      access_token: accessToken,
      is_active: true
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    // Duplicate session_id means already processed — that's OK
    if (errText.includes('duplicate')) {
      return { statusCode: 200, body: 'Already processed' };
    }
    console.error('Supabase insert error:', errText);
    return { statusCode: 500, body: 'Database error' };
  }

  return { statusCode: 200, body: 'Purchase recorded' };
};
