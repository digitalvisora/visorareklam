/* ============================================================
   VISORA — Main JavaScript
   ============================================================ */

(function () {
  'use strict';

  const html    = document.documentElement;
  const body    = document.body;

  /* ======================== ZİYARET TAKİBİ ======================== */
  /* Admin panelindeki "Raporlama" sekmesi için anonim sayfa görüntüleme kaydı. */
  fetch('/api/track-visit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: window.location.pathname })
  }).catch(function () {});

  /* ======================== THEME ======================== */

  const themeToggle = document.getElementById('themeToggle');

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('visora-theme', theme);
  }

  // Load saved preference; default to dark
  const savedTheme = localStorage.getItem('visora-theme') || 'dark';
  applyTheme(savedTheme);

  themeToggle.addEventListener('click', function () {
    const current = html.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });

  /* ======================== NAVBAR SCROLL ======================== */

  const navbar = document.getElementById('navbar');

  function onScroll() {
    if (window.scrollY > 48) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  /* ======================== SCROLL INDICATOR FADE ======================== */

  const scrollIndicator = document.getElementById('scrollIndicator');

  if (scrollIndicator) {
    window.addEventListener('scroll', function () {
      var opacity = Math.max(0, 1 - window.scrollY / 280);
      scrollIndicator.style.opacity = opacity * 0.55;
    }, { passive: true });
  }

  /* ======================== MOBILE MENU ======================== */

  const menuToggle  = document.getElementById('menuToggle');
  const menuClose   = document.getElementById('menuClose');
  const mobileMenu  = document.getElementById('mobileMenu');
  const menuOverlay = document.getElementById('menuOverlay');

  function openMenu() {
    mobileMenu.classList.add('open');
    menuOverlay.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    body.style.overflow = 'hidden';
  }

  function closeMenu() {
    mobileMenu.classList.remove('open');
    menuOverlay.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    body.style.overflow = '';
  }

  menuToggle.addEventListener('click',  openMenu);
  menuClose.addEventListener('click',   closeMenu);
  menuOverlay.addEventListener('click', closeMenu);

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  // Close when a menu link is clicked
  mobileMenu.querySelectorAll('.menu-link').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  /* ======================== FAQ ACCORDION ======================== */

  document.querySelectorAll('.faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item   = btn.closest('.faq-item');
      var isOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.faq-item').forEach(function (i) {
        i.classList.remove('open');
        i.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });

      // Open clicked if it was closed
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ======================== COLLECTION CARD — MOBILE TAP ======================== */

  var cards = document.querySelectorAll('.collection-card');

  cards.forEach(function (card) {
    card.addEventListener('click', function () {
      // Only activate tap behavior on touch / small screens
      if (window.innerWidth >= 1024) return;

      var isActive = card.classList.contains('active');
      cards.forEach(function (c) { c.classList.remove('active'); });
      if (!isActive) card.classList.add('active');
    });
  });

  /* ======================== SCROLL REVEAL ======================== */

  var revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    // Fallback for old browsers
    revealEls.forEach(function (el) { el.classList.add('revealed'); });
  }

  /* ======================== HERO INITIAL REVEAL ======================== */

  // Hero elements are above the fold — force reveal immediately
  document.querySelectorAll('.hero .reveal').forEach(function (el) {
    setTimeout(function () { el.classList.add('revealed'); }, 200);
  });

  /* ======================== SMOOTH SCROLL ======================== */

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = anchor.getAttribute('href');
      if (href.length < 2) return; /* bare "#" — no real anchor target */
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      var offset = 88; // navbar height
      var top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

})();
