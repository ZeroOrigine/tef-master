/* ========== Analytics & Conversion Tracking ========== */
/* Google Analytics 4 + Facebook Pixel + Custom Events   */

(function() {
  var GA_ID = 'G-QPJM300PZK';
  var FB_PIXEL_ID = '2205060693596160';

  // ---- Google Analytics 4 ----
  var gaScript = document.createElement('script');
  gaScript.async = true;
  gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(gaScript);

  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA_ID);

  // ---- Facebook Pixel ----
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

  // ---- TEF Analytics Helper ----
  window.TEFAnalytics = {

    // Track diagnostic test started
    diagnosticStarted: function(level) {
      gtag('event', 'diagnostic_started', {
        event_category: 'diagnostic',
        event_label: level,
        test_level: level
      });
      fbq('trackCustom', 'DiagnosticStarted', { level: level });
    },

    // Track diagnostic test completed
    diagnosticCompleted: function(level, score, cefr) {
      gtag('event', 'diagnostic_completed', {
        event_category: 'diagnostic',
        event_label: level,
        test_level: level,
        score: score,
        cefr_level: cefr
      });
      fbq('trackCustom', 'DiagnosticCompleted', {
        level: level,
        score: score,
        cefr: cefr
      });
    },

    // Track email captured (lead)
    emailCaptured: function(source) {
      gtag('event', 'generate_lead', {
        event_category: 'lead',
        event_label: source || 'diagnostic',
        currency: 'USD',
        value: 5.00
      });
      fbq('track', 'Lead', {
        content_name: 'TEF Master Lead',
        content_category: source || 'diagnostic'
      });
    },

    // Track purchase completed
    purchaseCompleted: function(value) {
      gtag('event', 'purchase', {
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
      fbq('track', 'Purchase', {
        content_name: 'TEF Master Lifetime Access',
        content_type: 'product',
        value: value || 39,
        currency: 'USD'
      });
    },

    // Track content viewed (premium page access)
    contentViewed: function(section) {
      gtag('event', 'view_item', {
        event_category: 'content',
        event_label: section
      });
      fbq('track', 'ViewContent', {
        content_name: section,
        content_type: 'module'
      });
    },

    // Track sign up / verification
    signUp: function(method) {
      gtag('event', 'sign_up', {
        method: method || 'email'
      });
      fbq('track', 'CompleteRegistration', {
        content_name: 'TEF Master',
        status: true
      });
    },

    // Track CTA button clicks
    ctaClicked: function(location, label) {
      gtag('event', 'select_content', {
        event_category: 'cta',
        event_label: label,
        content_type: location
      });
      fbq('trackCustom', 'CTAClicked', {
        location: location,
        label: label
      });
    }
  };

  // ---- Auto-track page sections ----
  var page = window.location.pathname;
  if (page.includes('grammar')) TEFAnalytics.contentViewed('grammar');
  else if (page.includes('vocabulary')) TEFAnalytics.contentViewed('vocabulary');
  else if (page.includes('reading')) TEFAnalytics.contentViewed('reading');
  else if (page.includes('listening')) TEFAnalytics.contentViewed('listening');
  else if (page.includes('conversations')) TEFAnalytics.contentViewed('conversations');
  else if (page.includes('diagnostic')) TEFAnalytics.contentViewed('diagnostic');
  else if (page.includes('progress')) TEFAnalytics.contentViewed('progress');
  else if (page.includes('thank-you')) TEFAnalytics.purchaseCompleted(39);

})();
