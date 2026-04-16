(function () {
  // ── READING PROGRESS BAR ──
  var progressBar = document.getElementById('reading-progress');
  function updateProgress() {
    if (!progressBar) return;
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = Math.min(pct, 100) + '%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });

  // ── BACK TO TOP ──
  var backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', function () {
      backToTop.classList.toggle('visible', window.scrollY > window.innerHeight * 0.35);
    }, { passive: true });
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── HEADING ANCHOR LINKS ──
  document.querySelectorAll('.article-body h2[id]').forEach(function (h2) {
    var a = document.createElement('a');
    a.href = '#' + h2.id;
    a.className = 'anchor-link';
    a.textContent = '#';
    a.setAttribute('aria-label', 'Link to this section');
    h2.appendChild(a);
  });

  // ── TOC ACTIVE STATE (sidebar + mobile) ──
  var sections = document.querySelectorAll('.article-body h2[id]');
  var allTocLinks = document.querySelectorAll('.toc a, .mobile-toc-list a');

  function setActiveSection(id) {
    allTocLinks.forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('href') === '#' + id);
    });
  }

  if ('IntersectionObserver' in window && sections.length) {
    var tocObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActiveSection(entry.target.id);
      });
    }, { rootMargin: '-15% 0% -70% 0%', threshold: 0 });
    sections.forEach(function (s) { tocObserver.observe(s); });
  }

  // ── MOBILE TOC TOGGLE ──
  window.toggleMobileToc = function () {
    var list = document.getElementById('mobile-toc-list');
    var btn  = document.getElementById('mobile-toc-toggle');
    if (!list || !btn) return;
    var open = list.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
  };

  window.closeMobileToc = function () {
    var list = document.getElementById('mobile-toc-list');
    var btn  = document.getElementById('mobile-toc-toggle');
    if (!list || !btn) return;
    list.classList.remove('open');
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  };
})();
