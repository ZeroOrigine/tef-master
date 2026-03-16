// Look up Stripe checkout session to get customer email for thank-you page
exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const sessionId = event.queryStringParameters?.session_id;
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!sessionId || !stripeSecretKey) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing session_id' }) };
  }

  // Validate session_id format to prevent injection
  if (!sessionId.startsWith('cs_')) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid session format' }) };
  }

  try {
    const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`
      }
    });

    if (!res.ok) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'Session not found' }) };
    }

    const session = await res.json();

    if (session.payment_status !== 'paid') {
      return { statusCode: 402, headers, body: JSON.stringify({ error: 'Payment not completed' }) };
    }

    const email = session.customer_details?.email || session.customer_email || '';

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
        paid: true
      })
    };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to retrieve session' }) };
  }
};
