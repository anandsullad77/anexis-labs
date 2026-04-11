/**
 * Anexis Labs — Page Analytics Tracker v2
 * Tracks: page views, CTA clicks, scroll depth, time on page,
 *         form interactions, service selection, click positions (heatmap),
 *         return visitor detection, A/B test variants, device type,
 *         referrer/traffic source, country (via IP geolocation)
 */

(function () {
  const SUPABASE_URL  = 'https://saywqwlgamcltgbsmudk.supabase.co';
  const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNheXdxd2xnYW1jbHRnYnNtdWRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MDg0NzYsImV4cCI6MjA5MDk4NDQ3Nn0.kkyTj4mKV7yAXoEQK2r9PIQTwOhClQPoA-TXW2deUVk';

  const page      = location.pathname.replace(/\/$/, '') || '/';
  const referrer  = document.referrer || 'direct';

  const sessionId = (function () {
    let s = sessionStorage.getItem('_ax_sid');
    if (!s) { s = Math.random().toString(36).slice(2) + Date.now().toString(36); sessionStorage.setItem('_ax_sid', s); }
    return s;
  })();

  const visitorId = (function () {
    let v = localStorage.getItem('_ax_vid');
    if (!v) { v = 'v_' + Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem('_ax_vid', v); }
    return v;
  })();

  const visitCount = (function () {
    let c = parseInt(localStorage.getItem('_ax_vc') || '0', 10) + 1;
    localStorage.setItem('_ax_vc', c);
    return c;
  })();

  const isReturn  = visitCount > 1;
  const startTime = Date.now();

  function getDeviceType() {
    const ua = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
    if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile';
    return 'desktop';
  }

  function getTrafficSource() {
    if (!document.referrer) return 'direct';
    try {
      const host = new URL(document.referrer).hostname.toLowerCase();
      if (/google|bing|yahoo|duckduckgo|baidu|yandex/.test(host)) return 'organic_search';
      if (/facebook|instagram|twitter|x\.com|linkedin|tiktok|pinterest|youtube/.test(host)) return 'social';
      if (/t\.co|bit\.ly|buff\.ly|lnkd\.in/.test(host)) return 'social';
      return 'referral:' + host;
    } catch (_) { return 'direct'; }
  }

  function getABVariant() {
    const params = new URLSearchParams(location.search);
    if (params.get('variant')) return params.get('variant');
    let v = localStorage.getItem('_ax_ab');
    if (!v) { v = Math.random() < 0.5 ? 'A' : 'B'; localStorage.setItem('_ax_ab', v); }
    return v;
  }

  const deviceType    = getDeviceType();
  const trafficSource = getTrafficSource();
  const abVariant     = getABVariant();

  let country = null;
  let city    = null;
  let ip      = null;
  fetch('https://ipapi.co/json/')
    .then(r => r.json())
    .then(d => { country = d.country_name || null; city = d.city || null; ip = d.ip || null; })
    .catch(() => {});

  async function track(event_type, properties) {
    try {
      await fetch(SUPABASE_URL + '/rest/v1/page_events', {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'apikey':        SUPABASE_ANON,
          'Authorization': 'Bearer ' + SUPABASE_ANON,
          'Prefer':        'return=minimal'
        },
        body: JSON.stringify({
          page,
          session_id:  sessionId,
          event_type,
          properties:  Object.assign({
            visitor_id:     visitorId,
            is_return:      isReturn,
            visit_count:    visitCount,
            device:         deviceType,
            traffic_source: trafficSource,
            ab_variant:     abVariant,
            country,
            city,
            ip
          }, properties || {}),
          referrer,
          user_agent: navigator.userAgent,
          screen_w:   screen.width,
          screen_h:   screen.height
        })
      });
    } catch (_) {}
  }

  track('page_view', { title: document.title });

  const CTA_SELECTORS = [
    { sel: '.nav-cta',              label: "Let's Talk (nav)" },
    { sel: '.mobile-cta',           label: "Let's Talk (mobile)" },
    { sel: '.btn-primary',          label: 'Primary CTA' },
    { sel: '.btn-secondary',        label: 'Secondary CTA' },
    { sel: '.cta-btn',              label: 'Book Free Audit' },
    { sel: '.b2b-know-more-mobile', label: 'Know More B2B' },
    { sel: '.btn-submit',           label: 'Submit Form' },
  ];

  document.addEventListener('click', function (e) {
    const xPct   = Math.round((e.clientX / window.innerWidth)  * 100);
    const yPct   = Math.round((e.clientY / window.innerHeight) * 100);
    const scrollY = Math.round(window.scrollY);

    const target = e.target.closest('a, button');
    if (!target) {
      track('heatmap_click', { x_pct: xPct, y_pct: yPct, scroll_y: scrollY });
      return;
    }

    for (const { sel, label } of CTA_SELECTORS) {
      if (target.matches(sel) || target.closest(sel)) {
        track('cta_click', { label, href: target.href || null, text: target.innerText.trim().slice(0, 80), x_pct: xPct, y_pct: yPct, scroll_y: scrollY });
        return;
      }
    }

    const text = target.innerText.trim().slice(0, 80);
    if (text) track('click', { text, href: target.href || null, tag: target.tagName.toLowerCase(), x_pct: xPct, y_pct: yPct, scroll_y: scrollY });
  }, true);

  const scrollMilestones = [25, 50, 75, 100];
  const reached = new Set();
  function checkScroll() {
    const pct = Math.round(((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight) * 100);
    for (const m of scrollMilestones) {
      if (pct >= m && !reached.has(m)) { reached.add(m); track('scroll_depth', { percent: m }); }
    }
  }
  window.addEventListener('scroll', checkScroll, { passive: true });

  function sendTimeOnPage() {
    const seconds = Math.round((Date.now() - startTime) / 1000);
    if (seconds < 2) return;
    track('time_on_page', { seconds, scroll_max: Math.max(...reached, 0) });
  }
  window.addEventListener('beforeunload', sendTimeOnPage);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') sendTimeOnPage();
  });

  const form = document.getElementById('contactForm');
  if (form) {
    let formStarted   = false;
    let fieldsVisited = new Set();

    form.addEventListener('focusin', function (e) {
      const name = e.target.name;
      if (!name) return;
      if (!formStarted) { formStarted = true; track('form_start', { form: 'contactForm' }); }
      fieldsVisited.add(name);
    });

    form.addEventListener('focusout', function (e) {
      const name = e.target.name, value = e.target.value;
      if (!name) return;
      track('form_field_exit', { field: name, filled: value.trim().length > 0, fields_visited: Array.from(fieldsVisited) });
    });

    const serviceSelect = form.querySelector('select[name="service"]');
    if (serviceSelect) {
      serviceSelect.addEventListener('change', function () { track('service_selected', { service: this.value }); });
    }

    form.addEventListener('submit', function () {
      const serviceVal = form.querySelector('select[name="service"]');
      track('form_submit', { fields_filled: Array.from(fieldsVisited), field_count: fieldsVisited.size, service: serviceVal ? serviceVal.value : null });
    });
  }
})();