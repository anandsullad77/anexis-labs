/**
 * Anexis Labs — Page Analytics Tracker
 * Drop this script at the bottom of index.html and contact.html (before </body>)
 * It tracks: page views, CTA clicks, scroll depth, time on page, form interactions
 *
 * Usage:
 *   <script src="analytics.js"></script>
 *   OR paste the contents inline inside a <script> tag
 */

(function () {
  // ── CONFIG — same Supabase project as admin ──
  const SUPABASE_URL  = 'https://saywqwlgamcltgbsmudk.supabase.co';
  const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNheXdxd2xnYW1jbHRnYnNtdWRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MDg0NzYsImV4cCI6MjA5MDk4NDQ3Nn0.kkyTj4mKV7yAXoEQK2r9PIQTwOhClQPoA-TXW2deUVk';

  // ── HELPERS ──
  const page       = location.pathname.replace(/\/$/, '') || '/';
  const sessionId  = (function () {
    let s = sessionStorage.getItem('_ax_sid');
    if (!s) { s = Math.random().toString(36).slice(2) + Date.now().toString(36); sessionStorage.setItem('_ax_sid', s); }
    return s;
  })();
  const startTime  = Date.now();
  const referrer   = document.referrer || 'direct';

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
          properties:  properties || {},
          referrer,
          user_agent:  navigator.userAgent,
          screen_w:    screen.width,
          screen_h:    screen.height
        })
      });
    } catch (_) { /* silently fail — never break the user's experience */ }
  }

  // ── 1. PAGE VIEW ──
  track('page_view', { title: document.title });

  // ── 2. CTA / BUTTON CLICKS ──
  const CTA_SELECTORS = [
    // index.html
    { sel: '.nav-cta',             label: "Let's Talk (nav)" },
    { sel: '.mobile-cta',          label: "Let's Talk (mobile)" },
    { sel: '.btn-primary',         label: 'Primary CTA' },
    { sel: '.btn-secondary',       label: 'Secondary CTA' },
    { sel: '.cta-btn',             label: 'Book Free Audit' },
    { sel: '.b2b-know-more-mobile',label: 'Know More B2B' },
    // contact.html
    { sel: '.btn-submit',          label: 'Submit Form' },
  ];

  document.addEventListener('click', function (e) {
    const target = e.target.closest('a, button');
    if (!target) return;

    // Check named CTAs first
    for (const { sel, label } of CTA_SELECTORS) {
      if (target.matches(sel) || target.closest(sel)) {
        track('cta_click', {
          label,
          href:  target.href  || null,
          text:  target.innerText.trim().slice(0, 80)
        });
        return;
      }
    }

    // Generic link / button click (capture all others with text)
    const text = target.innerText.trim().slice(0, 80);
    if (text) {
      track('click', {
        text,
        href: target.href || null,
        tag:  target.tagName.toLowerCase()
      });
    }
  }, true);

  // ── 3. SCROLL DEPTH ──
  const scrollMilestones = [25, 50, 75, 100];
  const reached = new Set();

  function checkScroll() {
    const scrolled   = window.scrollY + window.innerHeight;
    const total      = document.documentElement.scrollHeight;
    const pct        = Math.round((scrolled / total) * 100);
    for (const m of scrollMilestones) {
      if (pct >= m && !reached.has(m)) {
        reached.add(m);
        track('scroll_depth', { percent: m });
      }
    }
  }

  window.addEventListener('scroll', checkScroll, { passive: true });

  // ── 4. TIME ON PAGE ──
  function sendTimeOnPage() {
    const seconds = Math.round((Date.now() - startTime) / 1000);
    if (seconds < 2) return;
    track('time_on_page', { seconds, scroll_max: Math.max(...reached, 0) });
  }

  window.addEventListener('beforeunload', sendTimeOnPage);
  // Also send on visibility change (mobile / tab switch)
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') sendTimeOnPage();
  });

  // ── 5. FORM INTERACTIONS (contact.html only) ──
  const form = document.getElementById('contactForm');
  if (form) {
    let formStarted   = false;
    let fieldsVisited = new Set();

    // Track first interaction
    form.addEventListener('focusin', function (e) {
      const name = e.target.name;
      if (!name) return;
      if (!formStarted) {
        formStarted = true;
        track('form_start', { form: 'contactForm' });
      }
      fieldsVisited.add(name);
    });

    // Track field blur (drop-off detection: user focused but left without submitting)
    form.addEventListener('focusout', function (e) {
      const name  = e.target.name;
      const value = e.target.value;
      if (!name) return;
      track('form_field_exit', {
        field:    name,
        filled:   value.trim().length > 0,
        fields_visited: Array.from(fieldsVisited)
      });
    });

    // Track successful submission
    form.addEventListener('submit', function () {
      track('form_submit', {
        fields_filled: Array.from(fieldsVisited),
        field_count:   fieldsVisited.size
      });
    });
  }
})();
