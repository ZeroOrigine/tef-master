/* ========== Content Access Gate (Email-based via Supabase) ========== */
const ACCESS_KEY = 'tef_verified_email';
const VERIFY_URL = '/.netlify/functions/verify-access';

function checkAccess() {
  const stored = localStorage.getItem(ACCESS_KEY);
  return !!stored;
}

function buildGateUI() {
  const overlay = document.createElement('div');
  overlay.className = 'gate-overlay';

  const style = document.createElement('style');
  style.textContent = `
    .gate-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      padding: 1rem; z-index: 9999;
    }
    .gate-box {
      background: #fff; border-radius: 16px; padding: 2.5rem;
      max-width: 440px; width: 100%; text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,.3);
      position: relative;
    }
    .gate-close {
      position: absolute; top: 12px; right: 16px;
      background: none; border: none; font-size: 1.5rem; color: #999;
      cursor: pointer; padding: 4px 8px; line-height: 1;
      border-radius: 6px; transition: all 0.2s;
    }
    .gate-close:hover { color: #333; background: #f3f4f6; }
    .gate-box h2 { color: #1a1a2e; margin: 0 0 0.5rem; font-size: 1.5rem; }
    .gate-box p { color: #666; margin: 0 0 1.5rem; font-size: 0.95rem; line-height: 1.5; }
    .gate-input {
      width: 100%; padding: 0.8rem 1rem; border: 2px solid #e0e0e0;
      border-radius: 8px; font-size: 1rem; text-align: center;
      box-sizing: border-box; margin-bottom: 1rem;
    }
    .gate-input:focus { outline: none; border-color: #2563eb; }
    .gate-btn {
      width: 100%; padding: 0.8rem; background: #2563eb; color: #fff;
      border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer;
    }
    .gate-btn:hover { background: #1d4ed8; }
    .gate-btn:disabled { background: #93c5fd; cursor: not-allowed; }
    .gate-error { color: #dc2626; font-size: 0.85rem; margin-top: 0.5rem; display: none; }
    .gate-success { color: #16a34a; font-size: 0.85rem; margin-top: 0.5rem; display: none; }
    .gate-divider { margin: 1.5rem 0; color: #999; font-size: 0.85rem; }
    .gate-buy {
      display: inline-block; padding: 0.7rem 2rem; background: #16a34a; color: #fff;
      text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 0.95rem;
    }
    .gate-buy:hover { background: #15803d; }
    .gate-nav {
      display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap;
      margin-top: 1.2rem; padding-top: 1rem; border-top: 1px solid #e5e7eb;
    }
    .gate-nav a {
      color: #6b7280; text-decoration: none; font-size: 0.8rem;
      padding: 0.3rem 0.6rem; border-radius: 6px; transition: all 0.2s;
    }
    .gate-nav a:hover { color: #2563eb; background: #eff6ff; }
    .gate-free { margin-top: 1rem; font-size: 0.85rem; }
    .gate-free a { color: #2563eb; text-decoration: none; }
    .gate-free a:hover { text-decoration: underline; }
    .gate-spinner {
      display: inline-block; width: 16px; height: 16px;
      border: 2px solid #fff; border-top-color: transparent;
      border-radius: 50%; animation: gate-spin 0.6s linear infinite;
      vertical-align: middle; margin-right: 6px;
    }
    @keyframes gate-spin { to { transform: rotate(360deg); } }
  `;
  document.head.appendChild(style);

  const box = document.createElement('div');
  box.className = 'gate-box';

  // Close button — lets user go back to previous page
  const closeBtn = document.createElement('button');
  closeBtn.className = 'gate-close';
  closeBtn.innerHTML = '&times;';
  closeBtn.title = 'Go back';
  closeBtn.addEventListener('click', function() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  });

  const icon = document.createElement('div');
  icon.style.cssText = 'font-size: 2.5rem; margin-bottom: 0.5rem;';
  icon.textContent = '\uD83D\uDD12';

  const h2 = document.createElement('h2');
  h2.textContent = 'Premium Content';

  const p = document.createElement('p');
  p.textContent = 'Enter the email you used to purchase TEF Master to access this content.';

  const input = document.createElement('input');
  input.type = 'email';
  input.className = 'gate-input';
  input.id = 'accessInput';
  input.placeholder = 'your@email.com';
  input.autocomplete = 'email';

  const btn = document.createElement('button');
  btn.className = 'gate-btn';
  btn.textContent = 'Verify & Unlock';

  const error = document.createElement('div');
  error.className = 'gate-error';
  error.id = 'gateError';

  const success = document.createElement('div');
  success.className = 'gate-success';
  success.id = 'gateSuccess';

  const divider = document.createElement('div');
  divider.className = 'gate-divider';
  divider.textContent = '\u2014 or \u2014';

  const buyLink = document.createElement('a');
  buyLink.href = 'https://buy.stripe.com/cNi14o6WQ2vO3AxbDg6sw01';
  buyLink.className = 'gate-buy';
  buyLink.textContent = 'Get TEF Master \u2014 $9.90';

  const freeDiv = document.createElement('div');
  freeDiv.className = 'gate-free';
  freeDiv.textContent = 'Try free: ';
  const diagLink = document.createElement('a');
  diagLink.href = '/pages/diagnostic.html';
  diagLink.textContent = 'Diagnostic Test';
  const sep = document.createTextNode(' \u00B7 ');
  const tipsLink = document.createElement('a');
  tipsLink.href = '/pages/tips.html';
  tipsLink.textContent = 'Study Tips';
  freeDiv.appendChild(diagLink);
  freeDiv.appendChild(sep);
  freeDiv.appendChild(tipsLink);

  // Navigation links so user is never trapped
  const navDiv = document.createElement('div');
  navDiv.className = 'gate-nav';
  navDiv.innerHTML = '<a href="/">🏠 Home</a><a href="/pages/diagnostic.html">🎯 Diagnostic</a><a href="/pages/tips.html">💡 Tips</a><a href="/pages/tricks.html">🎪 Tricks</a>';

  async function verifyEmail() {
    const email = input.value.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      error.textContent = 'Please enter a valid email address.';
      error.style.display = 'block';
      success.style.display = 'none';
      input.style.borderColor = '#dc2626';
      return;
    }

    btn.disabled = true;
    const spinEl = document.createElement('span');
    spinEl.className = 'gate-spinner';
    btn.textContent = '';
    btn.appendChild(spinEl);
    btn.appendChild(document.createTextNode('Verifying...'));
    error.style.display = 'none';

    try {
      const res = await fetch(VERIFY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (data.verified) {
        localStorage.setItem(ACCESS_KEY, email);
        success.textContent = 'Verified! Unlocking content...';
        success.style.display = 'block';
        input.style.borderColor = '#16a34a';
        setTimeout(() => window.location.reload(), 500);
      } else {
        error.textContent = data.error || 'No purchase found for this email. Please use the email from your Stripe receipt.';
        error.style.display = 'block';
        input.style.borderColor = '#dc2626';
        btn.disabled = false;
        btn.textContent = 'Verify & Unlock';
      }
    } catch {
      error.textContent = 'Connection error. Please check your internet and try again.';
      error.style.display = 'block';
      btn.disabled = false;
      btn.textContent = 'Verify & Unlock';
    }
  }

  btn.addEventListener('click', verifyEmail);
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') verifyEmail();
  });

  box.appendChild(closeBtn);
  box.appendChild(icon);
  box.appendChild(h2);
  box.appendChild(p);
  box.appendChild(input);
  box.appendChild(btn);
  box.appendChild(error);
  box.appendChild(success);
  box.appendChild(divider);
  box.appendChild(buyLink);
  box.appendChild(freeDiv);
  box.appendChild(navDiv);
  overlay.appendChild(box);

  // Click outside the box to go back
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = '/';
      }
    }
  });

  return overlay;
}

function showAccessGate() {
  document.body.style.overflow = 'hidden';
  document.body.appendChild(buildGateUI());
}

// Auto-check on load — call this at top of protected pages
function requireAccess() {
  if (!checkAccess()) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', showAccessGate);
    } else {
      showAccessGate();
    }
    return false;
  }
  return true;
}
