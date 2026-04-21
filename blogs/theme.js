function updateThemeToggleIcons() {
  const icon = document.body.classList.contains('light') ? '☀' : '☾';
  document.querySelectorAll('[data-theme-toggle]').forEach(function(btn) {
    btn.textContent = icon;
  });
}

function toggleTheme() {
  document.body.classList.toggle('light');
  localStorage.setItem('theme', document.body.classList.contains('light') ? 'light' : 'dark');
  updateThemeToggleIcons();
}

function toggleMobileNav() {
  var nav = document.getElementById('mobile-nav');
  var btn = document.querySelector('.hamburger');
  if (!nav) return;
  var isOpen = nav.classList.toggle('open');
  if (btn) btn.classList.toggle('open', isOpen);
  document.body.classList.toggle('menu-open', isOpen);
}

// Close mobile nav on link click
document.addEventListener('DOMContentLoaded', function() {
  var mobileLinks = document.querySelectorAll('.mobile-nav a');
  mobileLinks.forEach(function(link) {
    link.addEventListener('click', function() {
      var nav = document.getElementById('mobile-nav');
      var btn = document.querySelector('.hamburger');
      if (nav) nav.classList.remove('open');
      if (btn) btn.classList.remove('open');
      document.body.classList.remove('menu-open');
    });
  });

  // Copy header logo image into footer logo (avoids duplicating the large base64 string)
  var headerImg = document.querySelector('nav .logo img');
  var footerLogoLink = document.querySelector('footer .logo');
  if (headerImg && footerLogoLink) {
    var cloned = headerImg.cloneNode(true);
    footerLogoLink.innerHTML = '';
    footerLogoLink.appendChild(cloned);
  }
});

if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.remove('light');
} else {
  document.body.classList.add('light');
}
updateThemeToggleIcons();
