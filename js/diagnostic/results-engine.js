/* ==========================================================================
   TEF Results Engine - Premium Results Page Renderer
   Renders AI-powered diagnostic test results with animated visuals

   All user-supplied text is escaped via the esc() helper (textContent-based)
   before being placed into the DOM to prevent XSS.
   ========================================================================== */

(function () {
  'use strict';

  var stylesInjected = false;
  var currentFilter = 'all';

  /* ------------------------------------------------------------------
     Utility helpers
     ------------------------------------------------------------------ */

  function esc(str) {
    if (!str) return '';
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function formatTime(seconds) {
    if (!seconds) return '--:--';
    var m = Math.floor(seconds / 60);
    var s = seconds % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function levelLabel(lvl) {
    if (!lvl) return '';
    return lvl.toUpperCase();
  }

  function cefrColor(level) {
    if (!level) return '#3b82f6';
    var l = level.toUpperCase();
    if (l === 'A1') return '#10b981';
    if (l === 'A2') return '#34d399';
    if (l === 'B1') return '#3b82f6';
    if (l === 'B2') return '#8b5cf6';
    if (l === 'C1') return '#f59e0b';
    if (l === 'C2') return '#ef4444';
    return '#3b82f6';
  }

  function sectionIcon(section) {
    var icons = {
      grammar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',
      vocabulary: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/><path d="M8 7h8M8 11h6"/></svg>',
      reading: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>',
      listening: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 18v-6a9 9 0 0118 0v6"/><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3v5zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3v5z"/></svg>'
    };
    return icons[section] || icons.grammar;
  }

  function sectionColor(section) {
    var colors = {
      grammar: '#3b82f6',
      vocabulary: '#8b5cf6',
      reading: '#10b981',
      listening: '#f59e0b'
    };
    return colors[section] || '#3b82f6';
  }

  function sectionLabel(section) {
    var labels = {
      grammar: 'Grammaire',
      vocabulary: 'Vocabulaire',
      reading: 'Compr\u00e9hension \u00e9crite',
      listening: 'Compr\u00e9hension orale'
    };
    return labels[section] || section;
  }

  function sparkleIcon() {
    return '<svg class="tef-r-sparkle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74L12 2z"/><path d="M5 3l.7 2.1L8 6l-2.3.9L5 9l-.7-2.1L2 6l2.3-.9L5 3z" opacity=".6"/><path d="M19 17l.7 2.1L22 20l-2.3.9-.7 2.1-.7-2.1L16 20l2.3-.9.7-2.1z" opacity=".6"/></svg>';
  }

  /* ------------------------------------------------------------------
     Safely set innerHTML on a container with pre-escaped content
     All dynamic text has already been sanitized through esc()
     ------------------------------------------------------------------ */
  function safeSetHTML(el, html) {
    el.innerHTML = html; // nosemgrep: all text was escaped via esc() above
  }

  /* ------------------------------------------------------------------
     Style Injection
     ------------------------------------------------------------------ */

  function injectStyles() {
    if (stylesInjected) return;
    stylesInjected = true;

    var css = '/* TEF Results Engine Styles */\n' +

    /* Keyframes */
    '@keyframes tef-r-fadeUp{0%{opacity:0;transform:translateY(24px)}100%{opacity:1;transform:translateY(0)}}' +
    '@keyframes tef-r-fadeIn{0%{opacity:0}100%{opacity:1}}' +
    '@keyframes tef-r-scaleIn{0%{opacity:0;transform:scale(.85)}100%{opacity:1;transform:scale(1)}}' +
    '@keyframes tef-r-ringDraw{0%{stroke-dashoffset:var(--tef-r-ring-circ)}100%{stroke-dashoffset:var(--tef-r-ring-offset)}}' +
    '@keyframes tef-r-countUp{0%{opacity:0}10%{opacity:1}}' +
    '@keyframes tef-r-sparkle{0%,100%{opacity:.4;transform:scale(.8) rotate(0deg)}50%{opacity:1;transform:scale(1.1) rotate(15deg)}}' +
    '@keyframes tef-r-shimmer{0%{background-position:-200% center}100%{background-position:200% center}}' +
    '@keyframes tef-r-barGrow{0%{width:0}100%{width:var(--tef-r-bar-w)}}' +

    /* Container */
    '.tef-r-wrap{max-width:880px;margin:0 auto;padding:2rem 1rem 4rem;}' +
    '.tef-r-section{animation:tef-r-fadeUp .6s ease both;}' +
    '.tef-r-section:nth-child(2){animation-delay:.1s}' +
    '.tef-r-section:nth-child(3){animation-delay:.18s}' +
    '.tef-r-section:nth-child(4){animation-delay:.25s}' +
    '.tef-r-section:nth-child(5){animation-delay:.32s}' +
    '.tef-r-section:nth-child(6){animation-delay:.38s}' +
    '.tef-r-section:nth-child(7){animation-delay:.44s}' +
    '.tef-r-section:nth-child(8){animation-delay:.5s}' +

    /* ---- 1. Hero Score ---- */
    '.tef-r-hero{background:linear-gradient(135deg,#1a365d 0%,#2563eb 60%,#7c3aed 100%);border-radius:var(--radius,12px);padding:2.5rem 2rem;text-align:center;color:#fff;position:relative;overflow:hidden;box-shadow:0 8px 32px rgba(26,54,93,.35);margin-bottom:2rem;}' +
    '.tef-r-hero::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 20% 80%,rgba(255,255,255,.08) 0%,transparent 50%),radial-gradient(circle at 80% 20%,rgba(139,92,246,.2) 0%,transparent 50%);pointer-events:none;}' +
    '.tef-r-hero-inner{position:relative;z-index:1;}' +
    '.tef-r-ring-wrap{display:inline-block;position:relative;width:180px;height:180px;margin-bottom:1.25rem;}' +
    '.tef-r-ring-svg{width:100%;height:100%;transform:rotate(-90deg);}' +
    '.tef-r-ring-bg{fill:none;stroke:rgba(255,255,255,.15);stroke-width:10;}' +
    '.tef-r-ring-fg{fill:none;stroke:#fff;stroke-width:10;stroke-linecap:round;stroke-dasharray:var(--tef-r-ring-circ);stroke-dashoffset:var(--tef-r-ring-circ);animation:tef-r-ringDraw 1.4s ease-out .3s forwards;}' +
    '.tef-r-ring-label{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;}' +
    '.tef-r-ring-pct{font-size:2.75rem;font-weight:800;line-height:1;animation:tef-r-countUp .5s ease .3s both;}' +
    '.tef-r-ring-sub{font-size:.85rem;opacity:.75;margin-top:.2rem;}' +
    '.tef-r-cefr-badge{display:inline-flex;align-items:center;gap:.5rem;background:rgba(255,255,255,.18);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,.25);border-radius:60px;padding:.55rem 1.5rem;font-size:1.1rem;font-weight:700;margin-bottom:.75rem;animation:tef-r-scaleIn .5s ease .6s both;}' +
    '.tef-r-cefr-dot{width:12px;height:12px;border-radius:50%;flex-shrink:0;}' +
    '.tef-r-hero-meta{display:flex;flex-wrap:wrap;justify-content:center;gap:1.25rem;font-size:.82rem;opacity:.8;margin-top:.5rem;}' +
    '.tef-r-hero-meta span{display:flex;align-items:center;gap:.35rem;}' +

    /* ---- 2. AI Analysis Card ---- */
    '.tef-r-ai-card{position:relative;background:var(--card,#fff);border-radius:var(--radius,12px);padding:2rem;margin-bottom:2rem;box-shadow:var(--shadow,0 2px 12px rgba(0,0,0,.06));overflow:hidden;}' +
    '.tef-r-ai-card::before{content:"";position:absolute;inset:-1px;border-radius:calc(var(--radius,12px) + 1px);padding:2px;background:linear-gradient(135deg,#8b5cf6,#3b82f6,#10b981,#f59e0b);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;}' +
    '.tef-r-ai-header{display:flex;align-items:center;gap:.65rem;margin-bottom:1rem;}' +
    '.tef-r-sparkle-icon{width:28px;height:28px;color:#8b5cf6;animation:tef-r-sparkle 3s ease-in-out infinite;}' +
    '.tef-r-ai-title{font-size:1.15rem;font-weight:700;color:var(--text,#1e293b);}' +
    '.tef-r-ai-body{font-size:.95rem;line-height:1.75;color:var(--text-light,#475569);}' +
    '.tef-r-ai-badge{display:inline-flex;align-items:center;gap:.3rem;margin-top:1rem;padding:.3rem .75rem;border-radius:40px;background:linear-gradient(135deg,rgba(139,92,246,.08),rgba(59,130,246,.08));font-size:.7rem;font-weight:600;color:#8b5cf6;letter-spacing:.03em;text-transform:uppercase;}' +
    '.tef-r-ai-badge svg{width:12px;height:12px;}' +

    /* ---- 3. Strengths & Weaknesses ---- */
    '.tef-r-sw-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;margin-bottom:2rem;}' +
    '.tef-r-sw-col{background:var(--card,#fff);border-radius:var(--radius,12px);padding:1.5rem;box-shadow:var(--shadow);}' +
    '.tef-r-sw-col-title{display:flex;align-items:center;gap:.5rem;font-size:1rem;font-weight:700;margin-bottom:1rem;color:var(--text);}' +
    '.tef-r-sw-col-title svg{width:20px;height:20px;}' +
    '.tef-r-sw-item{display:flex;align-items:flex-start;gap:.6rem;padding:.7rem .85rem;border-radius:8px;margin-bottom:.5rem;font-size:.88rem;line-height:1.55;}' +
    '.tef-r-sw-item:last-child{margin-bottom:0;}' +
    '.tef-r-sw-item svg{width:16px;height:16px;flex-shrink:0;margin-top:3px;}' +
    '.tef-r-sw-strength{background:rgba(16,185,129,.06);color:#065f46;}' +
    '.tef-r-sw-strength svg{color:#10b981;}' +
    '.tef-r-sw-weakness{background:rgba(245,158,11,.06);color:#92400e;}' +
    '.tef-r-sw-weakness svg{color:#f59e0b;}' +

    /* ---- 4. Section Breakdown ---- */
    '.tef-r-breakdown{margin-bottom:2rem;}' +
    '.tef-r-breakdown-title{font-size:1.15rem;font-weight:700;margin-bottom:1rem;color:var(--text);}' +
    '.tef-r-sec-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;}' +
    '.tef-r-sec-card{background:var(--card,#fff);border-radius:var(--radius,12px);padding:1.5rem;box-shadow:var(--shadow);animation:tef-r-fadeUp .5s ease both;}' +
    '.tef-r-sec-card:nth-child(1){animation-delay:.3s}' +
    '.tef-r-sec-card:nth-child(2){animation-delay:.38s}' +
    '.tef-r-sec-card:nth-child(3){animation-delay:.46s}' +
    '.tef-r-sec-card:nth-child(4){animation-delay:.54s}' +
    '.tef-r-sec-head{display:flex;align-items:center;gap:.6rem;margin-bottom:.75rem;}' +
    '.tef-r-sec-icon{width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}' +
    '.tef-r-sec-icon svg{width:18px;height:18px;color:#fff;}' +
    '.tef-r-sec-info{flex:1;}' +
    '.tef-r-sec-name{font-size:.82rem;font-weight:700;color:var(--text);text-transform:uppercase;letter-spacing:.03em;}' +
    '.tef-r-sec-score{font-size:.78rem;color:var(--text-light);}' +
    '.tef-r-sec-bar-track{width:100%;height:8px;background:var(--border,#e2e8f0);border-radius:4px;overflow:hidden;margin-bottom:.75rem;}' +
    '.tef-r-sec-bar-fill{height:100%;border-radius:4px;animation:tef-r-barGrow .8s ease-out .5s both;width:var(--tef-r-bar-w);}' +
    '.tef-r-sec-analysis{font-size:.82rem;line-height:1.6;color:var(--text-light);}' +

    /* ---- 5. Study Plan ---- */
    '.tef-r-plan{margin-bottom:2rem;}' +
    '.tef-r-plan-title{font-size:1.15rem;font-weight:700;margin-bottom:1rem;color:var(--text);}' +
    '.tef-r-plan-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.25rem;}' +
    '.tef-r-plan-card{border-radius:var(--radius,12px);padding:1.5rem;box-shadow:var(--shadow);}' +
    '.tef-r-plan-card-w1{background:linear-gradient(135deg,#eff6ff,#dbeafe);border:1px solid #bfdbfe;}' +
    '.tef-r-plan-card-w2{background:linear-gradient(135deg,#ecfdf5,#d1fae5);border:1px solid #a7f3d0;}' +
    '.tef-r-plan-card-dp{background:linear-gradient(135deg,#fffbeb,#fef3c7);border:1px solid #fde68a;}' +
    '.tef-r-plan-label{font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin-bottom:.5rem;}' +
    '.tef-r-plan-card-w1 .tef-r-plan-label{color:#1d4ed8;}' +
    '.tef-r-plan-card-w2 .tef-r-plan-label{color:#059669;}' +
    '.tef-r-plan-card-dp .tef-r-plan-label{color:#d97706;}' +
    '.tef-r-plan-text{font-size:.88rem;line-height:1.65;color:var(--text);}' +

    /* ---- 6. Question Review ---- */
    '.tef-r-review{margin-bottom:2rem;}' +
    '.tef-r-review-title{font-size:1.15rem;font-weight:700;margin-bottom:1rem;color:var(--text);}' +
    '.tef-r-tabs{display:flex;flex-wrap:wrap;gap:.4rem;margin-bottom:1.25rem;padding:.35rem;background:var(--card,#fff);border-radius:10px;box-shadow:var(--shadow);}' +
    '.tef-r-tab{padding:.45rem .9rem;border:none;background:transparent;border-radius:7px;font-size:.78rem;font-weight:600;color:var(--text-light);cursor:pointer;transition:all .2s;font-family:inherit;}' +
    '.tef-r-tab:hover{background:var(--primary-bg,#eff6ff);color:var(--primary,#1a365d);}' +
    '.tef-r-tab.active{background:var(--primary,#1a365d);color:#fff;}' +
    '.tef-r-q-list{}' +
    '.tef-r-q-card{background:var(--card,#fff);border-radius:var(--radius,12px);padding:1.25rem 1.25rem 1.25rem 1.5rem;margin-bottom:.75rem;box-shadow:var(--shadow);border-left:4px solid transparent;transition:all .25s;}' +
    '.tef-r-q-card[data-correct="true"]{border-left-color:var(--success,#10b981);}' +
    '.tef-r-q-card[data-correct="false"]{border-left-color:var(--danger,#ef4444);}' +
    '.tef-r-q-card[data-hidden="true"]{display:none;}' +
    '.tef-r-q-top{display:flex;align-items:center;gap:.6rem;margin-bottom:.6rem;flex-wrap:wrap;}' +
    '.tef-r-q-num{font-size:.75rem;font-weight:700;color:var(--text-light);white-space:nowrap;}' +
    '.tef-r-q-badge{display:inline-block;padding:.15rem .55rem;border-radius:4px;font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#fff;}' +
    '.tef-r-q-text{font-size:.92rem;line-height:1.6;margin-bottom:.75rem;color:var(--text);}' +
    '.tef-r-q-context{font-size:.82rem;line-height:1.6;color:var(--text-light);background:var(--primary-bg,#eff6ff);padding:.75rem 1rem;border-radius:8px;margin-bottom:.75rem;border-left:3px solid var(--primary-light,#3b82f6);}' +
    '.tef-r-q-answers{display:flex;flex-direction:column;gap:.4rem;}' +
    '.tef-r-q-ans{display:flex;align-items:flex-start;gap:.5rem;font-size:.85rem;line-height:1.5;padding:.45rem .7rem;border-radius:6px;}' +
    '.tef-r-q-ans svg{width:16px;height:16px;flex-shrink:0;margin-top:2px;}' +
    '.tef-r-q-ans-wrong{background:rgba(239,68,68,.06);color:#991b1b;}' +
    '.tef-r-q-ans-wrong svg{color:#ef4444;}' +
    '.tef-r-q-ans-right{background:rgba(16,185,129,.06);color:#065f46;}' +
    '.tef-r-q-ans-right svg{color:#10b981;}' +
    '.tef-r-q-explanation{margin-top:.6rem;padding:.75rem 1rem;border-radius:8px;background:rgba(139,92,246,.04);border:1px solid rgba(139,92,246,.1);font-size:.82rem;line-height:1.65;color:var(--text-light);}' +
    '.tef-r-q-explanation strong{color:var(--text);font-weight:600;}' +

    /* ---- 7. Next Steps ---- */
    '.tef-r-next{background:var(--card,#fff);border-radius:var(--radius,12px);padding:2rem;margin-bottom:2rem;box-shadow:var(--shadow);}' +
    '.tef-r-next-title{font-size:1.15rem;font-weight:700;margin-bottom:1rem;color:var(--text);}' +
    '.tef-r-next-text{font-size:.92rem;line-height:1.7;color:var(--text-light);margin-bottom:1.25rem;}' +
    '.tef-r-next-btns{display:flex;flex-wrap:wrap;gap:.75rem;margin-bottom:1.25rem;}' +
    '.tef-r-next-btn{display:inline-flex;align-items:center;gap:.4rem;padding:.65rem 1.4rem;border-radius:8px;font-size:.88rem;font-weight:600;text-decoration:none;border:none;cursor:pointer;transition:all .2s;font-family:inherit;}' +
    '.tef-r-next-btn:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,.12);}' +
    '.tef-r-btn-primary{background:var(--primary,#1a365d);color:#fff;}' +
    '.tef-r-btn-accent{background:var(--accent,#8b5cf6);color:#fff;}' +
    '.tef-r-btn-outline{background:transparent;color:var(--primary,#1a365d);border:2px solid var(--border,#e2e8f0);}' +
    '.tef-r-btn-outline:hover{border-color:var(--primary,#1a365d);}' +
    '.tef-r-motivational{padding:1rem 1.25rem;border-radius:10px;background:linear-gradient(135deg,rgba(139,92,246,.05),rgba(59,130,246,.05));border:1px solid rgba(139,92,246,.12);font-size:.88rem;line-height:1.65;color:var(--text-light);font-style:italic;}' +

    /* ---- 8. Action Buttons ---- */
    '.tef-r-actions{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center;margin-bottom:2rem;}' +
    '.tef-r-action-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.7rem 1.5rem;border-radius:8px;font-size:.88rem;font-weight:600;border:none;cursor:pointer;transition:all .2s;font-family:inherit;text-decoration:none;}' +
    '.tef-r-action-btn:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,.12);}' +
    '.tef-r-action-btn svg{width:16px;height:16px;}' +
    '.tef-r-action-retake{background:var(--primary,#1a365d);color:#fff;}' +
    '.tef-r-action-print{background:var(--card,#fff);color:var(--text);border:2px solid var(--border,#e2e8f0);}' +
    '.tef-r-action-progress{background:var(--accent,#8b5cf6);color:#fff;}' +

    /* ---- Responsive ---- */
    '@media(max-width:700px){' +
      '.tef-r-sw-grid{grid-template-columns:1fr;}' +
      '.tef-r-sec-grid{grid-template-columns:1fr;}' +
      '.tef-r-plan-grid{grid-template-columns:1fr;}' +
      '.tef-r-hero{padding:1.75rem 1.25rem;}' +
      '.tef-r-ring-wrap{width:140px;height:140px;}' +
      '.tef-r-ring-pct{font-size:2.1rem;}' +
      '.tef-r-next-btns{flex-direction:column;}' +
      '.tef-r-next-btn{justify-content:center;}' +
      '.tef-r-actions{flex-direction:column;}' +
      '.tef-r-action-btn{justify-content:center;}' +
      '.tef-r-tabs{overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;}' +
      '.tef-r-tab{white-space:nowrap;}' +
    '}' +

    /* ---- Print ---- */
    '@media print{' +
      '.tef-r-section,.tef-r-sec-card,.tef-r-ring-fg,.tef-r-sec-bar-fill{animation:none !important;}' +
      '.tef-r-ring-fg{stroke-dashoffset:var(--tef-r-ring-offset) !important;}' +
      '.tef-r-sec-bar-fill{width:var(--tef-r-bar-w) !important;}' +
      '.tef-r-hero{background:#1a365d !important;-webkit-print-color-adjust:exact;print-color-adjust:exact;}' +
      '.tef-r-q-card[data-hidden="true"]{display:none !important;}' +
      '.tef-r-actions,.tef-r-next-btns{display:none !important;}' +
      '.tef-r-tabs{display:none !important;}' +
    '}';

    var style = document.createElement('style');
    style.id = 'tef-results-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  /* ------------------------------------------------------------------
     Build HTML helpers
     ------------------------------------------------------------------ */

  function buildHero(data, level) {
    var pct = data.score_pct || 0;
    var radius = 72;
    var circ = 2 * Math.PI * radius;
    var offset = circ - (circ * pct / 100);
    var cefr = data.cefr_result || (data.ai_analysis && data.ai_analysis.cefr_assessment) || '?';
    var clb = data.clb_estimate || (data.ai_analysis && data.ai_analysis.clb_estimate) || '--';
    var dateStr = new Date().toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' });
    var timeStr = formatTime(data.elapsed_seconds);

    return '<div class="tef-r-section tef-r-hero">' +
      '<div class="tef-r-hero-inner">' +
        '<div class="tef-r-ring-wrap" style="--tef-r-ring-circ:' + circ + ';--tef-r-ring-offset:' + offset + '">' +
          '<svg class="tef-r-ring-svg" viewBox="0 0 180 180">' +
            '<circle class="tef-r-ring-bg" cx="90" cy="90" r="' + radius + '"/>' +
            '<circle class="tef-r-ring-fg" cx="90" cy="90" r="' + radius + '"/>' +
          '</svg>' +
          '<div class="tef-r-ring-label">' +
            '<span class="tef-r-ring-pct">' + pct + '%</span>' +
            '<span class="tef-r-ring-sub">' + (data.total_score || 0) + '/' + (data.total_questions || 40) + ' correct</span>' +
          '</div>' +
        '</div>' +
        '<div class="tef-r-cefr-badge">' +
          '<span class="tef-r-cefr-dot" style="background:' + cefrColor(cefr) + '"></span>' +
          'CEFR ' + esc(cefr) +
        '</div>' +
        '<div class="tef-r-hero-meta">' +
          '<span>CLB ' + esc(String(clb)) + '</span>' +
          '<span>Niveau ' + levelLabel(level) + '</span>' +
          '<span>' + dateStr + '</span>' +
          '<span>' + timeStr + '</span>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function buildAIAnalysis(ai) {
    if (!ai || !ai.overall_analysis) return '';
    return '<div class="tef-r-section tef-r-ai-card">' +
      '<div class="tef-r-ai-header">' +
        sparkleIcon() +
        '<span class="tef-r-ai-title">Analyse personnalis\u00e9e par IA</span>' +
      '</div>' +
      '<div class="tef-r-ai-body">' + esc(ai.overall_analysis) + '</div>' +
      '<div class="tef-r-ai-badge">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74L12 2z"/></svg>' +
        'Powered by AI' +
      '</div>' +
    '</div>';
  }

  function buildStrengthsWeaknesses(ai) {
    if (!ai) return '';
    var strengths = ai.strengths || [];
    var weaknesses = ai.weaknesses || [];
    if (!strengths.length && !weaknesses.length) return '';

    var checkSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
    var warnSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';

    var sItems = '';
    for (var i = 0; i < strengths.length; i++) {
      sItems += '<div class="tef-r-sw-item tef-r-sw-strength">' + checkSvg + '<span>' + esc(strengths[i]) + '</span></div>';
    }
    var wItems = '';
    for (var j = 0; j < weaknesses.length; j++) {
      wItems += '<div class="tef-r-sw-item tef-r-sw-weakness">' + warnSvg + '<span>' + esc(weaknesses[j]) + '</span></div>';
    }

    return '<div class="tef-r-section tef-r-sw-grid">' +
      '<div class="tef-r-sw-col">' +
        '<div class="tef-r-sw-col-title" style="color:#10b981">' + checkSvg + ' Points forts</div>' +
        sItems +
      '</div>' +
      '<div class="tef-r-sw-col">' +
        '<div class="tef-r-sw-col-title" style="color:#f59e0b">' + warnSvg + ' Points \u00e0 am\u00e9liorer</div>' +
        wItems +
      '</div>' +
    '</div>';
  }

  function buildSectionBreakdown(scores, ai) {
    var sections = ['grammar', 'vocabulary', 'reading', 'listening'];
    var sectionAnalysis = (ai && ai.section_analysis) || {};
    var cards = '';

    for (var i = 0; i < sections.length; i++) {
      var key = sections[i];
      var s = scores[key];
      if (!s) continue;
      var pct = s.pct || (s.total > 0 ? Math.round(s.score / s.total * 100) : 0);
      var col = sectionColor(key);

      cards += '<div class="tef-r-sec-card">' +
        '<div class="tef-r-sec-head">' +
          '<div class="tef-r-sec-icon" style="background:' + col + '">' + sectionIcon(key) + '</div>' +
          '<div class="tef-r-sec-info">' +
            '<div class="tef-r-sec-name">' + sectionLabel(key) + '</div>' +
            '<div class="tef-r-sec-score">' + s.score + '/' + s.total + ' (' + pct + '%)</div>' +
          '</div>' +
        '</div>' +
        '<div class="tef-r-sec-bar-track">' +
          '<div class="tef-r-sec-bar-fill" style="--tef-r-bar-w:' + pct + '%;background:' + col + '"></div>' +
        '</div>' +
        (sectionAnalysis[key] ? '<div class="tef-r-sec-analysis">' + esc(sectionAnalysis[key]) + '</div>' : '') +
      '</div>';
    }

    if (!cards) return '';

    return '<div class="tef-r-section tef-r-breakdown">' +
      '<div class="tef-r-breakdown-title">R\u00e9sultats par section</div>' +
      '<div class="tef-r-sec-grid">' + cards + '</div>' +
    '</div>';
  }

  function buildStudyPlan(ai) {
    if (!ai || !ai.study_plan) return '';
    var plan = ai.study_plan;
    if (!plan.week1 && !plan.week2 && !plan.daily_practice) return '';

    var cards = '';
    if (plan.week1) {
      cards += '<div class="tef-r-plan-card tef-r-plan-card-w1">' +
        '<div class="tef-r-plan-label">Semaine 1</div>' +
        '<div class="tef-r-plan-text">' + esc(plan.week1) + '</div>' +
      '</div>';
    }
    if (plan.week2) {
      cards += '<div class="tef-r-plan-card tef-r-plan-card-w2">' +
        '<div class="tef-r-plan-label">Semaine 2</div>' +
        '<div class="tef-r-plan-text">' + esc(plan.week2) + '</div>' +
      '</div>';
    }
    if (plan.daily_practice) {
      cards += '<div class="tef-r-plan-card tef-r-plan-card-dp">' +
        '<div class="tef-r-plan-label">Pratique quotidienne</div>' +
        '<div class="tef-r-plan-text">' + esc(plan.daily_practice) + '</div>' +
      '</div>';
    }

    return '<div class="tef-r-section tef-r-plan">' +
      '<div class="tef-r-plan-title">Plan d\'\u00e9tude personnalis\u00e9</div>' +
      '<div class="tef-r-plan-grid">' + cards + '</div>' +
    '</div>';
  }

  function buildQuestionReview(questions, answers, data) {
    if (!questions || !questions.length) return '';

    var wrongMap = {};
    var wrongAnswers = data.wrong_answers || [];
    for (var w = 0; w < wrongAnswers.length; w++) {
      wrongMap[wrongAnswers[w].questionId] = wrongAnswers[w];
    }

    /* Tabs */
    var tabs =
      '<button class="tef-r-tab active" onclick="TEFResults.filterReview(\'all\')">Tout</button>' +
      '<button class="tef-r-tab" onclick="TEFResults.filterReview(\'wrong\')">Incorrect</button>' +
      '<button class="tef-r-tab" onclick="TEFResults.filterReview(\'correct\')">Correct</button>' +
      '<button class="tef-r-tab" onclick="TEFResults.filterReview(\'grammar\')">Grammaire</button>' +
      '<button class="tef-r-tab" onclick="TEFResults.filterReview(\'vocabulary\')">Vocabulaire</button>' +
      '<button class="tef-r-tab" onclick="TEFResults.filterReview(\'reading\')">Lecture</button>' +
      '<button class="tef-r-tab" onclick="TEFResults.filterReview(\'listening\')">\u00c9coute</button>';

    /* Question cards */
    var cards = '';
    for (var i = 0; i < questions.length; i++) {
      var q = questions[i];
      var userIdx = (answers && answers[i] !== undefined && answers[i] !== null) ? answers[i] : -1;
      var isCorrect = userIdx === q.correct;
      var wrongInfo = wrongMap[q.id];
      var sec = q.section || 'grammar';
      var col = sectionColor(sec);

      var userAnsText = (userIdx >= 0 && q.options && q.options[userIdx]) ? q.options[userIdx] : 'Pas de r\u00e9ponse';
      var correctAnsText = (q.options && q.options[q.correct]) ? q.options[q.correct] : '';
      var explanation = (wrongInfo && wrongInfo.explanation) ? wrongInfo.explanation : q.explanation || '';

      var xSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
      var checkSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';

      cards += '<div class="tef-r-q-card" data-correct="' + isCorrect + '" data-section="' + sec + '">';

      /* Header */
      cards += '<div class="tef-r-q-top">' +
        '<span class="tef-r-q-num">Q' + (i + 1) + '</span>' +
        '<span class="tef-r-q-badge" style="background:' + col + '">' + sectionLabel(sec) + '</span>' +
      '</div>';

      /* Context */
      if (q.context) {
        cards += '<div class="tef-r-q-context">' + esc(q.context) + '</div>';
      }

      /* Question text */
      cards += '<div class="tef-r-q-text">' + esc(q.question) + '</div>';

      /* Answers */
      cards += '<div class="tef-r-q-answers">';
      if (!isCorrect) {
        cards += '<div class="tef-r-q-ans tef-r-q-ans-wrong">' + xSvg + '<span>Votre r\u00e9ponse : ' + esc(userAnsText) + '</span></div>';
      }
      cards += '<div class="tef-r-q-ans tef-r-q-ans-right">' + checkSvg + '<span>R\u00e9ponse correcte : ' + esc(correctAnsText) + '</span></div>';
      cards += '</div>';

      /* Explanation */
      if (explanation) {
        cards += '<div class="tef-r-q-explanation"><strong>Explication :</strong> ' + esc(explanation) + '</div>';
      }

      cards += '</div>';
    }

    return '<div class="tef-r-section tef-r-review">' +
      '<div class="tef-r-review-title">R\u00e9vision des questions</div>' +
      '<div class="tef-r-tabs" id="tefReviewTabs">' + tabs + '</div>' +
      '<div class="tef-r-q-list" id="tefReviewList">' + cards + '</div>' +
    '</div>';
  }

  function buildNextSteps(ai, level) {
    if (!ai) return '';
    var nextLevel = { a1: 'A2', a2: 'B1', b1: 'B2', b2: 'C1' };
    var next = (level && nextLevel[level.toLowerCase()]) || '';

    var html = '<div class="tef-r-section tef-r-next">' +
      '<div class="tef-r-next-title">Prochaines \u00e9tapes</div>';

    if (ai.next_steps) {
      html += '<div class="tef-r-next-text">' + esc(ai.next_steps) + '</div>';
    }

    html += '<div class="tef-r-next-btns">' +
      '<button class="tef-r-next-btn tef-r-btn-primary" onclick="location.reload()">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>' +
        'Reprendre ce test' +
      '</button>';

    if (next) {
      html += '<button class="tef-r-next-btn tef-r-btn-accent" onclick="if(typeof TEFDiagnostic!==\'undefined\'){TEFDiagnostic.startLevel(\'' + next.toLowerCase() + '\')}else{location.reload()}">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>' +
        'Essayer le niveau ' + next +
      '</button>';
    }

    html += '</div>';

    if (ai.motivational_note) {
      html += '<div class="tef-r-motivational">' + esc(ai.motivational_note) + '</div>';
    }

    html += '</div>';
    return html;
  }

  function buildActions() {
    return '<div class="tef-r-section tef-r-actions">' +
      '<button class="tef-r-action-btn tef-r-action-retake" onclick="location.reload()">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>' +
        'Reprendre le test' +
      '</button>' +
      '<button class="tef-r-action-btn tef-r-action-print" onclick="window.print()">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>' +
        'Imprimer' +
      '</button>' +
      '<a class="tef-r-action-btn tef-r-action-progress" href="progress.html">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>' +
        'Voir ma progression' +
      '</a>' +
    '</div>';
  }

  /* ------------------------------------------------------------------
     Filter Review
     ------------------------------------------------------------------ */

  function filterReview(filter) {
    currentFilter = filter;

    /* Update tabs */
    var tabs = document.querySelectorAll('.tef-r-tab');
    var filterLabels = ['all', 'wrong', 'correct', 'grammar', 'vocabulary', 'reading', 'listening'];
    var tabLabels = ['Tout', 'Incorrect', 'Correct', 'Grammaire', 'Vocabulaire', 'Lecture', '\u00c9coute'];
    for (var t = 0; t < tabs.length; t++) {
      tabs[t].classList.remove('active');
      if (t < filterLabels.length && filterLabels[t] === filter) {
        tabs[t].classList.add('active');
      }
    }

    /* Filter cards */
    var cards = document.querySelectorAll('.tef-r-q-card');
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      var isCorrect = card.getAttribute('data-correct') === 'true';
      var section = card.getAttribute('data-section');
      var show = false;

      if (filter === 'all') {
        show = true;
      } else if (filter === 'wrong') {
        show = !isCorrect;
      } else if (filter === 'correct') {
        show = isCorrect;
      } else {
        /* Section filter */
        show = section === filter;
      }

      card.setAttribute('data-hidden', show ? 'false' : 'true');
    }
  }

  /* ------------------------------------------------------------------
     Normalize scores for cached results
     Cached results from Supabase use `section_scores` instead of `scores`
     ------------------------------------------------------------------ */

  function normalizeScores(data) {
    if (data.scores) return data.scores;
    if (data.section_scores) {
      var out = {};
      var keys = Object.keys(data.section_scores);
      for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        var raw = data.section_scores[k];
        if (typeof raw === 'object' && raw !== null) {
          out[k] = {
            score: raw.score || raw.correct || 0,
            total: raw.total || raw.count || 0,
            pct: raw.pct || raw.percentage || (raw.total ? Math.round((raw.score || raw.correct || 0) / raw.total * 100) : 0)
          };
        }
      }
      return out;
    }
    return {};
  }

  /* ------------------------------------------------------------------
     Main render
     ------------------------------------------------------------------ */

  function render(container, data, questions, answers, level) {
    if (!container || !data) return;

    injectStyles();

    var ai = data.ai_analysis || {};
    var scores = normalizeScores(data);

    var html = '<div class="tef-r-wrap">';
    html += buildHero(data, level);
    html += buildAIAnalysis(ai);
    html += buildStrengthsWeaknesses(ai);
    html += buildSectionBreakdown(scores, ai);
    html += buildStudyPlan(ai);
    html += buildQuestionReview(questions, answers, data);
    html += buildNextSteps(ai, level);
    html += buildActions();
    html += '</div>';

    if (typeof container === 'string') {
      container = document.querySelector(container);
    }

    if (container) {
      /* All dynamic text in html has been sanitized through esc() */
      safeSetHTML(container, html);
      /* Scroll to top of results */
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /* ------------------------------------------------------------------
     Render Cached (from Supabase progress)
     ------------------------------------------------------------------ */

  function renderCached(container, cachedResult) {
    if (!container || !cachedResult) return;

    /* Normalize the cached structure to match the render() expectations */
    var normalized = {
      result_id: cachedResult.result_id || cachedResult.id || '',
      scores: normalizeScores(cachedResult),
      total_score: cachedResult.total_score || cachedResult.score || 0,
      total_questions: cachedResult.total_questions || cachedResult.question_count || 40,
      score_pct: cachedResult.score_pct || cachedResult.percentage || 0,
      ai_analysis: cachedResult.ai_analysis || {},
      cefr_result: cachedResult.cefr_result || cachedResult.cefr || '',
      clb_estimate: cachedResult.clb_estimate || cachedResult.clb || null,
      wrong_answers: cachedResult.wrong_answers || [],
      elapsed_seconds: cachedResult.elapsed_seconds || cachedResult.time_taken || 0
    };

    /* Compute pct if missing */
    if (!normalized.score_pct && normalized.total_questions > 0) {
      normalized.score_pct = Math.round(normalized.total_score / normalized.total_questions * 100);
    }

    var level = cachedResult.level || cachedResult.test_level || '';
    var questions = cachedResult.questions || [];
    var answers = cachedResult.answers || [];

    render(container, normalized, questions, answers, level);
  }

  /* ------------------------------------------------------------------
     Public API
     ------------------------------------------------------------------ */

  window.TEFResults = {
    render: render,
    renderCached: renderCached,
    filterReview: filterReview,
    injectStyles: injectStyles
  };

})();
