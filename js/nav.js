/* Shared Navigation Component */
function renderNav(activePage) {
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

  const nav = document.createElement('nav');
  nav.className = 'nav';
  nav.innerHTML = `
    <div class="nav-inner">
      <a href="${siteRoot}index.html" class="nav-brand">🇫🇷 TEF Master <span>CLB 7</span></a>
      <button class="nav-toggle" aria-label="Menu">☰</button>
      <div class="nav-links">
        ${pages.map(p => `<a href="${p.href}" class="${p.id === activePage ? 'active' : ''}">${p.icon} ${p.label}</a>`).join('')}
      </div>
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
    if (!nav.contains(e.target)) links.classList.remove('open');
  });
}

function renderFooter() {
  const footer = document.createElement('footer');
  footer.className = 'footer';
  footer.innerHTML = `
    <p>TEF Master — Your Path to CLB 7</p>
    <p style="margin-top:.3rem;font-size:.78rem;">Built with ❤️ by ispeedbiz.com • <a href="mailto:cajagdishlade@gmail.com" style="color:inherit;text-decoration:underline;">Contact Support</a> • <a href="https://buy.stripe.com/cNi14o6WQ2vO3AxbDg6sw01" style="color:inherit;text-decoration:underline;">Get Full Access — $9.90</a></p>
  `;
  document.body.appendChild(footer);
}
