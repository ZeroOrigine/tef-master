/* Shared Navigation Component */
function renderNav(activePage) {
  const pages = [
    { id: 'home', label: 'Home', href: '/index.html', icon: '🏠' },
    { id: 'diagnostic', label: 'Diagnostic', href: '/pages/diagnostic.html', icon: '🎯' },
    { id: 'grammar', label: 'Grammar', href: '/pages/grammar.html', icon: '📘' },
    { id: 'vocabulary', label: 'Vocabulary', href: '/pages/vocabulary.html', icon: '📗' },
    { id: 'reading', label: 'Reading', href: '/pages/reading.html', icon: '📖' },
    { id: 'listening', label: 'Listening', href: '/pages/listening.html', icon: '🎧' },
    { id: 'conversations', label: 'Conversations', href: '/pages/conversations.html', icon: '💬' },
    { id: 'progress', label: 'Progress', href: '/pages/progress.html', icon: '📊' }
  ];

  const nav = document.createElement('nav');
  nav.className = 'nav';
  nav.innerHTML = `
    <div class="nav-inner">
      <a href="/index.html" class="nav-brand">🇫🇷 TEF Master <span>CLB 7</span></a>
      <button class="nav-toggle" aria-label="Menu">☰</button>
      <div class="nav-links">
        ${pages.map(p => `<a href="${p.href}" class="${p.id === activePage ? 'active' : ''}">${p.icon} ${p.label}</a>`).join('')}
      </div>
    </div>
  `;

  document.body.prepend(nav);

  const toggle = nav.querySelector('.nav-toggle');
  const links = nav.querySelector('.nav-links');
  toggle.addEventListener('click', () => links.classList.toggle('open'));
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) links.classList.remove('open');
  });
}

function renderFooter() {
  const footer = document.createElement('footer');
  footer.className = 'footer';
  footer.innerHTML = `
    <p>TEF Master — Free French Learning Platform for TEF Canada CLB 7</p>
    <p style="margin-top:.3rem;font-size:.78rem;">Built with ❤️ for learners everywhere • No account needed • 100% Free</p>
  `;
  document.body.appendChild(footer);
}
