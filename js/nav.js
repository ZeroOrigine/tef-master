/* Shared Navigation Component */

function signOut() {
  localStorage.removeItem('tef_verified_email');
  localStorage.removeItem('tef_lead_email');
  // Keep tef_master_progress in localStorage — cloud sync will restore on re-login
  window.location.href = '/';
}

function toggleProfileMenu() {
  var menu = document.getElementById('profileMenu');
  if (menu) menu.classList.toggle('open');
}

function renderNav(activePage) {
  // Load analytics if not already loaded
  if (!document.getElementById('tef-analytics')) {
    var path2 = window.location.pathname;
    var analyticsRoot = path2.indexOf('/pages/') !== -1 ? path2.substring(0, path2.indexOf('/pages/')) + '/' : path2.substring(0, path2.lastIndexOf('/') + 1);
    var analyticsScript = document.createElement('script');
    analyticsScript.id = 'tef-analytics';
    analyticsScript.src = analyticsRoot + 'js/analytics.js';
    document.head.appendChild(analyticsScript);
  }

  // Compute site root from URL - works with Netlify pretty URLs, trailing slashes, and local file://
  const path = window.location.pathname;
  let siteRoot;
  const pagesIdx = path.indexOf('/pages/');
  if (pagesIdx !== -1) {
    // We're inside /pages/ — root is everything before /pages/
    siteRoot = path.substring(0, pagesIdx) + '/';
  } else {
    // At root level — extract directory path
    siteRoot = path.substring(0, path.lastIndexOf('/') + 1);
  }

  const pages = [
    { id: 'home', label: 'Home', href: siteRoot + 'index.html', icon: '🏠' },
    { id: 'diagnostic', label: 'Diagnostic', href: siteRoot + 'pages/diagnostic.html', icon: '🎯' },
    { id: 'grammar', label: 'Grammar', href: siteRoot + 'pages/grammar.html', icon: '📘' },
    { id: 'vocabulary', label: 'Vocabulary', href: siteRoot + 'pages/vocabulary.html', icon: '📗' },
    { id: 'reading', label: 'Reading', href: siteRoot + 'pages/reading.html', icon: '📖' },
    { id: 'listening', label: 'Listening', href: siteRoot + 'pages/listening.html', icon: '🎧' },
    { id: 'conversations', label: 'Conversations', href: siteRoot + 'pages/conversations.html', icon: '💬' },
    { id: 'progress', label: 'Progress', href: siteRoot + 'pages/progress.html', icon: '📊' },
    { id: 'tricks', label: 'Tricks', href: siteRoot + 'pages/tricks.html', icon: '🎪' },
    { id: 'tips', label: 'Tips', href: siteRoot + 'pages/tips.html', icon: '💡' }
  ];

  // Inject profile CSS if not already present
  if (!document.getElementById('nav-profile-styles')) {
    var styleEl = document.createElement('style');
    styleEl.id = 'nav-profile-styles';
    styleEl.textContent = '.nav-profile{position:relative;flex-shrink:0;margin-left:8px;z-index:101}' +
      '.profile-btn{width:36px;height:36px;border-radius:50%;border:2px solid rgba(255,255,255,0.3);background:#2563eb;color:#fff;font-weight:700;font-size:0.875rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s}' +
      '.profile-btn:hover{border-color:rgba(255,255,255,0.6);transform:scale(1.05)}' +
      '.profile-btn.premium{background:linear-gradient(135deg,#f59e0b,#d97706)}' +
      '.profile-menu{position:absolute;top:calc(100% + 8px);right:0;background:#fff;border-radius:12px;padding:0.75rem 0;min-width:240px;box-shadow:0 10px 40px rgba(0,0,0,0.15);border:1px solid #e5e7eb;opacity:0;visibility:hidden;transform:translateY(-8px);transition:all 0.2s;z-index:100}' +
      '.profile-menu.open{opacity:1;visibility:visible;transform:translateY(0)}' +
      '.pm-email{padding:0.5rem 1rem;font-size:0.8125rem;color:#374151;font-weight:500;word-break:break-all}' +
      '.pm-type{padding:0 1rem 0.5rem;font-size:0.75rem}' +
      '.pm-type .pm-badge{display:inline-block;padding:2px 8px;border-radius:10px;font-weight:600;font-size:0.6875rem}' +
      '.pm-badge.premium{background:#fef3c7;color:#92400e}' +
      '.pm-badge.free{background:#f3f4f6;color:#6b7280}' +
      '.pm-divider{height:1px;background:#e5e7eb;margin:0.375rem 0}' +
      '.pm-link{display:block;padding:0.5rem 1rem;font-size:0.8125rem;color:#374151;text-decoration:none;cursor:pointer;transition:background 0.15s;border:none;background:none;width:100%;text-align:left;font-family:inherit}' +
      '.pm-link:hover{background:#f3f4f6}' +
      '.pm-upgrade{color:#d97706;font-weight:600}' +
      '.pm-signout{color:#6b7280}' +
      '.nav-signin{color:rgba(255,255,255,0.8);text-decoration:none;font-size:0.875rem;padding:0.4rem 1rem;border:1px solid rgba(255,255,255,0.3);border-radius:8px;transition:all 0.2s;flex-shrink:0;margin-left:8px;white-space:nowrap}' +
      '.nav-signin:hover{background:rgba(255,255,255,0.1);color:#fff}';
    document.head.appendChild(styleEl);
  }

  // Determine user state for profile section
  var premiumEmail = localStorage.getItem('tef_verified_email');
  var leadEmail = localStorage.getItem('tef_lead_email');
  var userEmail = premiumEmail || leadEmail || null;
  var isPremium = !!premiumEmail;

  // Build profile section markup
  var profileHTML = '';
  if (userEmail) {
    var initial = userEmail.charAt(0).toUpperCase();
    var truncatedEmail = userEmail.length > 28 ? userEmail.substring(0, 25) + '...' : userEmail;
    var btnClass = isPremium ? 'profile-btn premium' : 'profile-btn';
    var badgeClass = isPremium ? 'pm-badge premium' : 'pm-badge free';
    var badgeText = isPremium ? 'Premium Member' : 'Free Account';
    var actionLink = isPremium
      ? '<a href="' + siteRoot + 'pages/progress.html" class="pm-link">📊 My Progress</a>'
      : '<a href="https://buy.stripe.com/cNi6oI3KEgmEc73fTw6sw02" class="pm-link pm-upgrade">⭐ Upgrade to Premium — $39</a>';
    profileHTML = '<div class="nav-profile">' +
      '<button class="' + btnClass + '" onclick="toggleProfileMenu()" aria-label="Profile menu">' + initial + '</button>' +
      '<div class="profile-menu" id="profileMenu">' +
        '<div class="pm-email">' + truncatedEmail + '</div>' +
        '<div class="pm-type"><span class="' + badgeClass + '">' + badgeText + '</span></div>' +
        '<div class="pm-divider"></div>' +
        actionLink +
        '<button class="pm-link pm-signout" onclick="signOut()">Sign Out</button>' +
      '</div>' +
    '</div>';
  } else {
    profileHTML = '<a href="' + siteRoot + 'index.html#access" class="nav-signin">Sign In</a>';
  }

  const nav = document.createElement('nav');
  nav.className = 'nav';
  nav.innerHTML = `
    <div class="nav-inner">
      <a href="${siteRoot}index.html" class="nav-brand">🇫🇷 TEF Master <span>CLB 7</span></a>
      <button class="nav-toggle" aria-label="Menu">☰</button>
      <div class="nav-links">
        ${pages.map(p => `<a href="${p.href}" class="${p.id === activePage ? 'active' : ''}">${p.icon} ${p.label}</a>`).join('')}
      </div>
      ${profileHTML}
    </div>
  `;

  // Insert nav - replace existing <nav id="navbar"> if present, otherwise prepend
  const existingNav = document.getElementById('navbar');
  if (existingNav) {
    existingNav.replaceWith(nav);
  } else {
    document.body.prepend(nav);
  }

  const toggle = nav.querySelector('.nav-toggle');
  const links = nav.querySelector('.nav-links');
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    links.classList.toggle('open');
  });
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) {
      links.classList.remove('open');
    }
    // Close profile menu when clicking outside it
    var profileMenu = document.getElementById('profileMenu');
    var profileBtn = nav.querySelector('.profile-btn');
    if (profileMenu && profileBtn && !profileMenu.contains(e.target) && !profileBtn.contains(e.target)) {
      profileMenu.classList.remove('open');
    }
  });
}

function renderFooter() {
  const footer = document.createElement('footer');
  footer.className = 'footer';
  const isSubPage = window.location.pathname.includes('/pages/');
  const prefix = isSubPage ? '' : 'pages/';
  footer.innerHTML = `
    <p>TEF Master — Your Path to CLB 7</p>
    <p style="margin-top:.5rem;font-size:.78rem;">
      <a href="${prefix}terms.html" style="color:inherit;text-decoration:underline;opacity:0.8;">Terms of Service</a>
      &nbsp;·&nbsp;
      <a href="${prefix}privacy.html" style="color:inherit;text-decoration:underline;opacity:0.8;">Privacy Policy</a>
    </p>
    <p style="margin-top:.3rem;font-size:.78rem;">© 2026 TEF Master. All rights reserved.</p>
  `;
  document.body.appendChild(footer);
}
