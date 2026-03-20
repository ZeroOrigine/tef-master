/* ========== Analytics & Conversion Tracking ========== */
/* Google Analytics 4 + Facebook Pixel + Custom Events   */
/* Cookie consent required before any tracking fires     */

(function() {
  var GA_ID = 'G-QPJM300PZK';
  var FB_PIXEL_ID = '2313815159111295';
  var CONSENT_KEY = 'tef_cookie_consent';

  // ---- Cookie Consent Check ----
  function hasConsent() {
    return localStorage.getItem(CONSENT_KEY) === 'accepted';
  }

  function setConsent(accepted) {
    localStorage.setItem(CONSENT_KEY, accepted ? 'accepted' : 'declined');
  }

  // ---- Initialize Tracking (only after consent) ----
  var trackingInitialized = false;

  function initTracking() {
    if (trackingInitialized) return;
    trackingInitialized = true;

    // Google Analytics 4
    var gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(gaScript);

    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_ID);

    // Facebook Pixel
    !function(f,b,e,v,n,t,s) {
      if(f.fbq) return;
      n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq) f._fbq=n;
      n.push=n; n.loaded=!0; n.version='2.0';
      n.queue=[];
      t=b.createElement(e); t.async=!0; t.src=v;
      s=b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t,s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    fbq('init', FB_PIXEL_ID);
    fbq('track', 'PageView');

    // Auto-track page sections
    var page = window.location.pathname;
    if (page.includes('grammar')) TEFAnalytics.contentViewed('grammar');
    else if (page.includes('vocabulary')) TEFAnalytics.contentViewed('vocabulary');
    else if (page.includes('reading')) TEFAnalytics.contentViewed('reading');
    else if (page.includes('listening')) TEFAnalytics.contentViewed('listening');
    else if (page.includes('conversations')) TEFAnalytics.contentViewed('conversations');
    else if (page.includes('diagnostic')) TEFAnalytics.contentViewed('diagnostic');
    else if (page.includes('progress')) TEFAnalytics.contentViewed('progress');
    else if (page.includes('thank-you')) TEFAnalytics.purchaseCompleted(39);
  }

  // ---- Safe tracking wrapper (no-op if no consent) ----
  function safeGtag() {
    if (!hasConsent() || !window.gtag) return;
    window.gtag.apply(null, arguments);
  }

  function safeFbq() {
    if (!hasConsent() || !window.fbq) return;
    window.fbq.apply(null, arguments);
  }

  // ---- TEF Analytics Helper ----
  window.TEFAnalytics = {
    diagnosticStarted: function(level) {
      safeGtag('event', 'diagnostic_started', {
        event_category: 'diagnostic',
        event_label: level,
        test_level: level
      });
      safeFbq('trackCustom', 'DiagnosticStarted', { level: level });
    },

    diagnosticCompleted: function(level, score, cefr) {
      safeGtag('event', 'diagnostic_completed', {
        event_category: 'diagnostic',
        event_label: level,
        test_level: level,
        score: score,
        cefr_level: cefr
      });
      safeFbq('trackCustom', 'DiagnosticCompleted', {
        level: level,
        score: score,
        cefr: cefr
      });
    },

    emailCaptured: function(source) {
      safeGtag('event', 'generate_lead', {
        event_category: 'lead',
        event_label: source || 'diagnostic',
        currency: 'USD',
        value: 5.00
      });
      safeFbq('track', 'Lead', {
        content_name: 'TEF Master Lead',
        content_category: source || 'diagnostic'
      });
    },

    purchaseCompleted: function(value) {
      safeGtag('event', 'purchase', {
        transaction_id: 'tef_' + Date.now(),
        value: value || 39,
        currency: 'USD',
        items: [{
          item_id: 'tef_master_lifetime',
          item_name: 'TEF Master Lifetime Access',
          price: value || 39,
          quantity: 1
        }]
      });
      safeFbq('track', 'Purchase', {
        content_name: 'TEF Master Lifetime Access',
        content_type: 'product',
        value: value || 39,
        currency: 'USD'
      });
    },

    contentViewed: function(section) {
      safeGtag('event', 'view_item', {
        event_category: 'content',
        event_label: section
      });
      safeFbq('track', 'ViewContent', {
        content_name: section,
        content_type: 'module'
      });
    },

    signUp: function(method) {
      safeGtag('event', 'sign_up', {
        method: method || 'email'
      });
      safeFbq('track', 'CompleteRegistration', {
        content_name: 'TEF Master',
        status: true
      });
    },

    ctaClicked: function(location, label) {
      safeGtag('event', 'select_content', {
        event_category: 'cta',
        event_label: label,
        content_type: location
      });
      safeFbq('trackCustom', 'CTAClicked', {
        location: location,
        label: label
      });
    }
  };

  // ---- Cookie Consent Banner ----
  function createConsentBanner() {
    var banner = document.createElement('div');
    banner.id = 'cookie-consent-banner';
    banner.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:#1e293b;padding:16px 20px;z-index:10000;box-shadow:0 -2px 10px rgba(0,0,0,0.3);border-top:1px solid #334155';

    var container = document.createElement('div');
    container.style.cssText = 'max-width:960px;margin:0 auto;display:flex;align-items:center;gap:16px;flex-wrap:wrap';

    var text = document.createElement('p');
    text.style.cssText = 'flex:1;min-width:200px;margin:0;font-size:14px;line-height:1.5;color:#e2e8f0';
    text.textContent = 'We use cookies for analytics (Google Analytics & Facebook Pixel) to improve your experience.';

    var btnWrap = document.createElement('div');
    btnWrap.style.cssText = 'display:flex;gap:8px;flex-shrink:0';

    var acceptBtn = document.createElement('button');
    acceptBtn.textContent = 'Accept';
    acceptBtn.style.cssText = 'padding:8px 20px;background:#22c55e;color:#fff;border:none;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer';

    var declineBtn = document.createElement('button');
    declineBtn.textContent = 'Decline';
    declineBtn.style.cssText = 'padding:8px 20px;background:transparent;color:#94a3b8;border:1px solid #475569;border-radius:6px;font-size:14px;cursor:pointer';

    acceptBtn.addEventListener('click', function() {
      setConsent(true);
      banner.remove();
      initTracking();
    });

    declineBtn.addEventListener('click', function() {
      setConsent(false);
      banner.remove();
    });

    btnWrap.appendChild(acceptBtn);
    btnWrap.appendChild(declineBtn);
    container.appendChild(text);
    container.appendChild(btnWrap);
    banner.appendChild(container);
    document.body.appendChild(banner);
  }

  function showConsentBanner() {
    if (hasConsent() || localStorage.getItem(CONSENT_KEY) === 'declined') return;
    createConsentBanner();
  }

  // ---- Boot ----
  if (hasConsent()) {
    initTracking();
  } else {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', showConsentBanner);
    } else {
      showConsentBanner();
    }
  }

})();
