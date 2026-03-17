// Stripe Webhook → Creates purchase record in Supabase
const crypto = require('crypto');

const SUPABASE_URL = 'https://stntjppzeuplngyfhgtp.supabase.co';

exports.handler = async (event) => {
  console.log('[webhook] Received request:', event.httpMethod);

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const sig = event.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!sig || !endpointSecret || !stripeSecretKey || !supabaseServiceKey) {
    console.error('[webhook] Missing config:', {
      hasSig: !!sig,
      hasEndpointSecret: !!endpointSecret,
      hasStripeKey: !!stripeSecretKey,
      hasSupabaseKey: !!supabaseServiceKey
    });
    return { statusCode: 500, body: 'Missing configuration' };
  }

  // Verify Stripe signature
  try {
    const payload = event.body;
    const tsPart = sig.split(',').find(s => s.startsWith('t='));
    const v1Part = sig.split(',').find(s => s.startsWith('v1='));

    if (!tsPart || !v1Part) {
      console.error('[webhook] Malformed signature:', sig);
      return { statusCode: 400, body: 'Malformed signature' };
    }

    const timestamp = tsPart.split('=')[1];
    const expectedSig = v1Part.split('=')[1];
    const signedPayload = `${timestamp}.${payload}`;
    const computedSig = crypto.createHmac('sha256', endpointSecret).update(signedPayload).digest('hex');

    if (computedSig !== expectedSig) {
      console.error('[webhook] Signature mismatch');
      return { statusCode: 400, body: 'Invalid signature' };
    }

    console.log('[webhook] Signature verified ✓');
  } catch (err) {
    console.error('[webhook] Signature error:', err.message);
    return { statusCode: 400, body: 'Signature verification failed' };
  }

  const stripeEvent = JSON.parse(event.body);
  console.log('[webhook] Event type:', stripeEvent.type);

  // Only process successful checkout sessions
  if (stripeEvent.type !== 'checkout.session.completed') {
    return { statusCode: 200, body: 'Event ignored' };
  }

  const session = stripeEvent.data.object;
  const email = (session.customer_details?.email || session.customer_email || '').toLowerCase().trim();
  const sessionId = session.id;
  const customerId = session.customer || null;
  const amountPaid = session.amount_total || 0;
  const currency = session.currency || 'usd';

  console.log('[webhook] Processing checkout:', { email, sessionId, amountPaid, currency });

  if (!email) {
    console.error('[webhook] No email found in session');
    return { statusCode: 400, body: 'No email in session' };
  }

  // Generate unique access token
  const accessToken = crypto.randomBytes(16).toString('hex').toUpperCase().slice(0, 12);

  // Store in Supabase
  const insertBody = {
    email,
    stripe_session_id: sessionId,
    stripe_customer_id: customerId,
    amount_paid: amountPaid,
    currency,
    access_token: accessToken,
    is_active: true
  };

  console.log('[webhook] Inserting into Supabase:', JSON.stringify(insertBody));

  const res = await fetch(`${SUPABASE_URL}/rest/v1/purchases`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(insertBody)
  });

  if (!res.ok) {
    const errText = await res.text();
    // Duplicate session_id means already processed — that's OK
    if (errText.includes('duplicate')) {
      console.log('[webhook] Already processed (duplicate session)');
      return { statusCode: 200, body: 'Already processed' };
    }
    console.error('[webhook] Supabase insert error:', res.status, errText);
    return { statusCode: 500, body: 'Database error' };
  }

  console.log('[webhook] ✅ Purchase recorded for:', email);
  return { statusCode: 200, body: 'Purchase recorded' };
};
