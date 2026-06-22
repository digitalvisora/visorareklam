/* ============================================================
   VISORA — Timeless Garden  script.js
   ============================================================ */
'use strict';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   1. SCROLL-REVEAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
(function () {
  var targets = '.tg-date, .tg-venue, .tg-actions';

  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll(targets).forEach(function (el) { el.classList.add('tg-vis'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('tg-vis'); io.unobserve(e.target); }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

  document.querySelectorAll(targets).forEach(function (el) { io.observe(el); });
})();

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   2. COUNTDOWN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
(function () {
  var dEl  = document.getElementById('cdDays');
  var hEl  = document.getElementById('cdHours');
  var mEl  = document.getElementById('cdMinutes');
  var iso  = document.getElementById('countdownTarget');

  function target() {
    var s = iso ? iso.textContent.trim() : '2026-08-23';
    if (!/^\d{4}-\d{2}-\d{2}/.test(s)) s = '2026-08-23';
    return new Date(s + 'T20:00:00');
  }

  function tick() {
    var d = target() - Date.now();
    if (!dEl || !hEl || !mEl) return;
    if (d <= 0) { dEl.textContent = hEl.textContent = mEl.textContent = '0'; return; }
    dEl.textContent = Math.floor(d / 86400000);
    hEl.textContent = String(Math.floor((d % 86400000) / 3600000)).padStart(2, '0');
    mEl.textContent = String(Math.floor((d % 3600000)  / 60000)).padStart(2, '0');
  }

  tick();
  setInterval(tick, 60000);

  if (iso && 'MutationObserver' in window) {
    new MutationObserver(tick).observe(iso, { childList: true, characterData: true, subtree: true });
  }
})();

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   3. DYNAMIC MAPS LINK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
(function () {
  var nameEl = document.querySelector('[data-visora-field="venue-name"]');
  var addrEl = document.querySelector('[data-visora-field="venue-address"]');
  var btns   = ['venueMapBtn', 'mapsBtn'].map(function (id) { return document.getElementById(id); });

  function update() {
    var q    = [(nameEl ? nameEl.textContent : ''), (addrEl ? addrEl.textContent : '')].join(' ').trim();
    var href = 'https://maps.google.com/?q=' + encodeURIComponent(q);
    btns.forEach(function (b) { if (b) b.setAttribute('href', href); });
  }
  update();
  if ('MutationObserver' in window) {
    var cfg = { childList: true, characterData: true, subtree: true };
    var mo  = new MutationObserver(update);
    if (nameEl) mo.observe(nameEl, cfg);
    if (addrEl) mo.observe(addrEl, cfg);
  }
})();

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   4. DYNAMIC WHATSAPP LINK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
(function () {
  var numEl = document.querySelector('[data-visora-field="whatsapp-number"]');
  var btn   = document.getElementById('whatsappBtn');
  if (!btn) return;

  function update() {
    var num = numEl ? numEl.textContent.trim().replace(/\D/g, '') : '905372395824';
    if (!num) num = '905372395824';
    btn.setAttribute('href', 'https://wa.me/' + num);
  }
  update();
  if (numEl && 'MutationObserver' in window) {
    new MutationObserver(update).observe(numEl, { childList: true, characterData: true, subtree: true });
  }
})();

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   5. DYNAMIC INSTAGRAM LINK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
(function () {
  var handleEl = document.querySelector('[data-visora-field="instagram-handle"]');
  var link     = document.getElementById('instaLink');
  if (!link) return;

  function update() {
    var handle = handleEl ? handleEl.textContent.trim().replace(/^@/, '') : 'davetiye_visora';
    if (!handle) handle = 'davetiye_visora';
    link.setAttribute('href', 'https://instagram.com/' + handle);
  }
  update();
  if (handleEl && 'MutationObserver' in window) {
    new MutationObserver(update).observe(handleEl, { childList: true, characterData: true, subtree: true });
  }
})();

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   6. CALENDAR ADD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
(function () {
  function addCal() {
    var bride = (document.querySelector('[data-visora-field="bride-name"]')  || {}).textContent || 'Gelin';
    var groom = (document.querySelector('[data-visora-field="groom-name"]')  || {}).textContent || 'Damat';
    var addr  = (document.querySelector('[data-visora-field="venue-address"]') || {}).textContent || '';
    var isoEl = document.getElementById('countdownTarget');
    var s     = (isoEl ? isoEl.textContent.trim() : '2026-08-23');
    if (!/^\d{4}-\d{2}-\d{2}/.test(s)) s = '2026-08-23';
    var d  = s.replace(/-/g, '');
    window.open(
      'https://calendar.google.com/calendar/render?action=TEMPLATE' +
      '&text='     + encodeURIComponent(bride + ' & ' + groom + ' Düğünü') +
      '&location=' + encodeURIComponent(addr) +
      '&dates='    + d + 'T180000Z/' + d + 'T220000Z',
      '_blank'
    );
  }

  ['calBtn'].forEach(function (id) {
    var b = document.getElementById(id);
    if (b) b.addEventListener('click', addCal);
  });
})();

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   7. MUSIC PLAYER  (single toggle button)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
(function () {
  var music     = document.getElementById('bgMusic');
  var btn       = document.getElementById('musicBtn');
  var noteIcon  = document.getElementById('iconNote');
  var pauseIcon = document.getElementById('iconPause');
  var playing   = false;

  if (!music || !btn) return;

  /* Sync button icon with playback state */
  function setUI(isPlaying) {
    if (noteIcon)  noteIcon.style.display  = isPlaying ? 'none' : '';
    if (pauseIcon) pauseIcon.style.display = isPlaying ? '' : 'none';
    btn.setAttribute('aria-label', isPlaying ? 'Müziği durdur' : 'Müziği başlat');
  }

  /* Fade volume in from 0 → 1 */
  function fadeIn() {
    music.volume = 0;
    var vol  = 0;
    var fade = setInterval(function () {
      vol = Math.min(vol + 0.04, 1);
      music.volume = vol;
      if (vol >= 1) clearInterval(fade);
    }, 80);
  }

  /* Toggle play / pause */
  function toggle() {
    if (playing) {
      music.pause();
      playing = false;
      setUI(false);
    } else {
      /* play() returns a Promise — handle autoplay rejection cleanly */
      var promise = music.play();
      if (promise !== undefined) {
        promise.then(function () {
          playing = true;
          setUI(true);
          fadeIn();
        }).catch(function (err) {
          /* Browser blocked autoplay — user needs to interact first, which
             they already did by clicking the button, so this shouldn't fire */
          console.warn('[VISORA] Müzik başlatılamadı:', err);
        });
      } else {
        /* Older browser — play() has no Promise */
        playing = true;
        setUI(true);
        fadeIn();
      }
    }
  }

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    toggle();
  });

  /* Preload the audio so it's ready on first click */
  music.load();

  /* Editörden seçilen/yüklenen müzik — diğer şablonlarla aynı visora-music
     mesaj kalıbı. */
  window.addEventListener('message', function (e) {
    var d = e.data;
    if (d && d.type === 'visora-music' && d.src) {
      music.src = d.src;
      music.load();
    }
  });
})();
