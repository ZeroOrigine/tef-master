// Stripe Webhook → Creates purchase record in Supabase + sends welcome email
const crypto = require('crypto');
const { Resend } = require('resend');

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

  // Send welcome email via Resend
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey && email) {
    try {
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: 'TEF Master <results@tef-master.com>',
        to: email,
        subject: 'Welcome to TEF Master — Your CLB 7 Journey Starts Now!',
        html: buildWelcomeEmail(email)
      });
      console.log('[webhook] Welcome email sent to:', email);
    } catch (emailErr) {
      console.error('[webhook] Welcome email failed:', emailErr.message);
    }
  }

  return { statusCode: 200, body: 'Purchase recorded' };
};

function buildWelcomeEmail(email) {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;">

  <div style="background:linear-gradient(135deg,#1a1a2e,#16213e,#0f3460);padding:40px 24px;text-align:center;">
    <div style="font-size:48px;margin-bottom:12px;">🎉</div>
    <div style="font-size:28px;color:#ffffff;font-weight:800;margin-bottom:8px;">Welcome to TEF Master!</div>
    <div style="color:rgba(255,255,255,0.7);font-size:15px;">Your premium access is now active</div>
  </div>

  <div style="padding:32px 24px;">
    <p style="font-size:16px;color:#1f2937;line-height:1.7;margin:0 0 20px;">
      Congratulations on investing in your TEF Canada success! You now have <strong>lifetime access</strong> to everything TEF Master offers.
    </p>

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin-bottom:24px;">
      <div style="font-weight:700;color:#166534;font-size:15px;margin-bottom:12px;">🚀 Here's your game plan:</div>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px 0;font-size:14px;color:#374151;"><strong>Step 1:</strong></td><td style="padding:8px 0;font-size:14px;color:#374151;">Take a Diagnostic Test to know your CEFR level</td></tr>
        <tr><td style="padding:8px 0;font-size:14px;color:#374151;"><strong>Step 2:</strong></td><td style="padding:8px 0;font-size:14px;color:#374151;">Follow your AI-powered study plan</td></tr>
        <tr><td style="padding:8px 0;font-size:14px;color:#374151;"><strong>Step 3:</strong></td><td style="padding:8px 0;font-size:14px;color:#374151;">Study Grammar → Vocabulary → Reading → Listening</td></tr>
        <tr><td style="padding:8px 0;font-size:14px;color:#374151;"><strong>Step 4:</strong></td><td style="padding:8px 0;font-size:14px;color:#374151;">Learn the 70+ exam tricks that most students miss</td></tr>
        <tr><td style="padding:8px 0;font-size:14px;color:#374151;"><strong>Step 5:</strong></td><td style="padding:8px 0;font-size:14px;color:#374151;">Retake diagnostics to track your progress</td></tr>
      </table>
    </div>

    <div style="font-weight:700;color:#1f2937;font-size:15px;margin-bottom:12px;">📦 What you just unlocked:</div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      <tr style="border-bottom:1px solid #e5e7eb;">
        <td style="padding:10px 0;font-size:14px;color:#374151;">🎯 4 AI-Powered Diagnostic Tests (A1-B2)</td>
        <td style="padding:10px 0;text-align:right;color:#22c55e;font-weight:600;font-size:14px;">✓</td>
      </tr>
      <tr style="border-bottom:1px solid #e5e7eb;">
        <td style="padding:10px 0;font-size:14px;color:#374151;">📘 17 Grammar Topics with Exercises</td>
        <td style="padding:10px 0;text-align:right;color:#22c55e;font-weight:600;font-size:14px;">✓</td>
      </tr>
      <tr style="border-bottom:1px solid #e5e7eb;">
        <td style="padding:10px 0;font-size:14px;color:#374151;">📗 811 Vocabulary Words across 34 Themes</td>
        <td style="padding:10px 0;text-align:right;color:#22c55e;font-weight:600;font-size:14px;">✓</td>
      </tr>
      <tr style="border-bottom:1px solid #e5e7eb;">
        <td style="padding:10px 0;font-size:14px;color:#374151;">📖 25 Reading Passages + 79 Questions</td>
        <td style="padding:10px 0;text-align:right;color:#22c55e;font-weight:600;font-size:14px;">✓</td>
      </tr>
      <tr style="border-bottom:1px solid #e5e7eb;">
        <td style="padding:10px 0;font-size:14px;color:#374151;">🎧 20 Listening Exercises</td>
        <td style="padding:10px 0;text-align:right;color:#22c55e;font-weight:600;font-size:14px;">✓</td>
      </tr>
      <tr style="border-bottom:1px solid #e5e7eb;">
        <td style="padding:10px 0;font-size:14px;color:#374151;">💬 Conversation Practice Modules</td>
        <td style="padding:10px 0;text-align:right;color:#22c55e;font-weight:600;font-size:14px;">✓</td>
      </tr>
      <tr style="border-bottom:1px solid #e5e7eb;">
        <td style="padding:10px 0;font-size:14px;color:#374151;">🎪 70+ Exam Tricks & Strategies</td>
        <td style="padding:10px 0;text-align:right;color:#22c55e;font-weight:600;font-size:14px;">✓</td>
      </tr>
      <tr>
        <td style="padding:10px 0;font-size:14px;color:#374151;">📊 Cloud Progress Tracking + AI Study Plans</td>
        <td style="padding:10px 0;text-align:right;color:#22c55e;font-weight:600;font-size:14px;">✓</td>
      </tr>
    </table>

    <div style="text-align:center;margin:32px 0;">
      <a href="https://tef-master.com/pages/diagnostic.html" style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg,#22c55e,#16a34a);color:#ffffff;text-decoration:none;border-radius:10px;font-weight:700;font-size:17px;">Start Your Diagnostic Test →</a>
    </div>

    <div style="background:#eff6ff;border-radius:12px;padding:20px;margin-bottom:24px;">
      <div style="font-weight:700;color:#1e40af;font-size:14px;margin-bottom:8px;">💡 Pro Tip</div>
      <p style="font-size:13px;color:#374151;line-height:1.6;margin:0;">
        Start with the <strong>A2 Elementary</strong> diagnostic if you're unsure of your level. The AI will analyze your results and tell you exactly where to focus. Most students reach CLB 7 within 60-90 days of consistent study.
      </p>
    </div>

    <div style="text-align:center;padding:16px 0;">
      <p style="font-size:14px;color:#6b7280;margin:0;">Your login email: <strong>${email}</strong></p>
      <p style="font-size:13px;color:#9ca3af;margin:4px 0 0;">Use this email to access premium content on any device.</p>
    </div>
  </div>

  <div style="background:#f9fafb;padding:20px 24px;text-align:center;border-top:1px solid #e5e7eb;">
    <div style="font-size:12px;color:#9ca3af;">© 2026 TEF Master · <a href="https://tef-master.com" style="color:#6b7280;">tef-master.com</a></div>
  </div>

</div>
</body></html>`;
}
