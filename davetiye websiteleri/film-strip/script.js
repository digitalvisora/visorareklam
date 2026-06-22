/* ================================================================
   Sinematik Anılar — script.js
   Film strip photo loop + countdown + music + calendar
   ================================================================ */

(function () {
  'use strict';

  /* ── Demo photos (relative to this page) ── */
  var DEMO_PHOTOS = [
    '../wedding/images/slider1.jpg',
    '../wedding/images/slider2.jpg',
    '../wedding/images/slider3.jpg',
    '../wedding/images/slider4.jpg',
    '../wedding/images/slider5.jpg'
  ];

  /* User-uploaded photos replace demos */
  var userPhotos   = [];
  var spiralPhotos = [];

  /* ════════════════════════════════════════════
     BACKGROUND SLIDESHOW — blurred user photos
     Fotoğraf yoksa .fs-invitation::before CSS
     animasyonu ambient ışık etkisi verir.
  ════════════════════════════════════════════ */
  var bgSlideEls  = [];
  var bgCurrentIdx = 0;
  var bgTimerId   = null;

  function buildBackground(photos) {
    var container = document.getElementById('fsBgSlides');
    if (!container) return;

    /* Clear */
    container.innerHTML = '';
    bgSlideEls = [];
    bgCurrentIdx = 0;
    if (bgTimerId) { clearInterval(bgTimerId); bgTimerId = null; }

    var src = (photos || []).filter(Boolean);
    if (!src.length) return; /* CSS ambient animasyon devreye girer */

    src.forEach(function (url) {
      var slide = document.createElement('div');
      slide.className = 'fs-bg-photo';
      slide.style.backgroundImage = 'url(' + url + ')';
      container.appendChild(slide);
      bgSlideEls.push(slide);
    });

    /* İlk fotoğrafı göster */
    bgSlideEls[0].classList.add('visible');
    if (bgSlideEls.length < 2) return;

    /* 5 saniyede bir geçiş — döngü sonu = başa dön */
    bgTimerId = setInterval(function () {
      bgSlideEls[bgCurrentIdx].classList.remove('visible');
      bgCurrentIdx = (bgCurrentIdx + 1) % bgSlideEls.length;
      bgSlideEls[bgCurrentIdx].classList.add('visible');
    }, 5000);
  }

  /* ════════════════════════════════════════════
     FILM STRIP — build photo track
  ════════════════════════════════════════════ */
  function buildFilmStrip(photos) {
    var track = document.getElementById('stripTrack');
    if (!track) return;
    track.innerHTML = '';

    var src = photos.length ? photos : DEMO_PHOTOS;
    /* Duplicate for seamless infinite loop */
    var doubled = src.concat(src);

    doubled.forEach(function (url, i) {
      var frame = document.createElement('div');
      frame.className = 'fs-frame';

      var img = document.createElement('img');
      img.src = url;
      img.alt = '';
      img.loading = 'lazy';
      img.onerror = function () { frame.style.background = '#0e0c09'; };

      var num = document.createElement('span');
      num.className = 'fs-frame-num';
      num.textContent = String((i % src.length) + 1).padStart(2, '0');

      frame.appendChild(img);
      frame.appendChild(num);
      track.appendChild(frame);
    });

    /* Recalculate animation duration based on photo count */
    var dur = Math.max(16, src.length * 4.5);
    track.style.animationDuration = dur + 's';
  }

  /* ════════════════════════════════════════════
     PERFORATIONS — build holes
  ════════════════════════════════════════════ */
  function buildPerforations() {
    ['perfLeft', 'perfRight'].forEach(function (id) {
      var perf = document.getElementById(id);
      if (!perf) return;
      perf.innerHTML = '';
      /* 60 holes × 2 (duplicated for loop) */
      for (var i = 0; i < 120; i++) {
        var hole = document.createElement('div');
        hole.className = 'fs-perf-hole';
        perf.appendChild(hole);
      }
    });
  }

  /* ════════════════════════════════════════════
     SPİRAL FİLM ŞERİDİ — çapraz arka plan döngüsü
  ════════════════════════════════════════════ */
  function buildSpiralStrip(photos) {
    var trackL = document.getElementById('spiralTrackL');
    var trackR = document.getElementById('spiralTrackR');
    if (!trackL || !trackR) return;

    var base = (photos && photos.length) ? photos.filter(Boolean) : DEMO_PHOTOS;
    var src  = base.slice();
    while (src.length < 16) src = src.concat(base);
    src = src.slice(0, Math.min(src.length, 20));

    var doubled = src.concat(src);

    [trackL, trackR].forEach(function (track) {
      track.innerHTML = '';
      doubled.forEach(function (url) {
        var frame = document.createElement('div');
        frame.className = 'fs-spiral-frame';
        var img = document.createElement('img');
        img.src = url; img.alt = ''; img.loading = 'lazy';
        img.onerror = function () { frame.style.background = 'rgba(15,10,5,0.40)'; };
        frame.appendChild(img);
        track.appendChild(frame);
      });
    });

    /* Farklı hızlar: sol şerit hızlı, sağ biraz yavaş */
    var durL = Math.max(18, src.length * 2.6);
    var durR = Math.max(24, src.length * 3.2);
    trackL.style.animationDuration = durL + 's';
    trackR.style.animationDuration = durR + 's';
  }

  /* ════════════════════════════════════════════
     COUNTDOWN
  ════════════════════════════════════════════ */
  var countdownTarget = null;

  function setCountdownDate(isoStr) {
    if (!isoStr) return;
    var d = new Date(isoStr);
    if (isNaN(d)) return;
    countdownTarget = d;
    tickCountdown();
  }

  function tickCountdown() {
    if (!countdownTarget) return;
    var now  = Date.now();
    var diff = countdownTarget.getTime() - now;
    if (diff < 0) diff = 0;

    var days  = Math.floor(diff / 86400000);
    var hours = Math.floor((diff % 86400000) / 3600000);
    var mins  = Math.floor((diff % 3600000)  / 60000);

    setText('cdDays',  pad(days));
    setText('cdHours', pad(hours));
    setText('cdMins',  pad(mins));
  }

  function pad(n) { return n < 10 ? '0' + n : String(n); }
  function setText(id, v) { var el = document.getElementById(id); if (el) el.textContent = v; }

  setInterval(tickCountdown, 1000);

  /* ════════════════════════════════════════════
     MAP LINK
  ════════════════════════════════════════════ */
  function setMapLink(url) {
    var btn = document.getElementById('fsMapBtn');
    if (btn && url) btn.href = url;
  }

  /* ════════════════════════════════════════════
     MUSIC
  ════════════════════════════════════════════ */
  var audio    = document.getElementById('fsAudio');
  var musicBtn = document.getElementById('fsMusicBtn');
  var playIcon = document.getElementById('fsPlayIcon');
  var pauseIcon = document.getElementById('fsPauseIcon');
  var isPlaying = false;

  function setMusicSrc(src) {
    if (!audio || !src) return;
    audio.src = src;
    audio.load();
  }

  function toggleMusic() {
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      isPlaying = false;
    } else {
      audio.play().catch(function () {});
      isPlaying = true;
    }
    updateMusicUI();
  }

  function updateMusicUI() {
    if (!playIcon || !pauseIcon) return;
    playIcon.style.display  = isPlaying ? 'none'  : '';
    pauseIcon.style.display = isPlaying ? ''      : 'none';
  }

  if (musicBtn) musicBtn.addEventListener('click', toggleMusic);

  /* ════════════════════════════════════════════
     CALENDAR BUTTON
  ════════════════════════════════════════════ */
  document.querySelectorAll('.calendar-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var title = btn.dataset.title || 'Düğün';
      var start = (btn.dataset.start || '').replace(/[-:]/g, '').replace('T', 'T').split('.')[0];
      var end   = (btn.dataset.end   || '').replace(/[-:]/g, '').replace('T', 'T').split('.')[0];
      var url   = 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
                  '&text=' + encodeURIComponent(title) +
                  '&dates=' + start + 'Z/' + end + 'Z';
      window.open(url, '_blank');
    });
  });

  /* ════════════════════════════════════════════
     GALLERY HANDLER — user-uploaded photos
  ════════════════════════════════════════════ */
  function handleGalleryUpdate(index, dataUrl) {
    if (!dataUrl) return;
    userPhotos[index] = dataUrl;
    var filtered = userPhotos.filter(Boolean);
    buildFilmStrip(filtered);
    buildBackground(filtered);
  }

  /* ════════════════════════════════════════════
     VISORA BRIDGE — field updates
  ════════════════════════════════════════════ */
  window.addEventListener('message', function (e) {
    var d = e.data;
    if (!d || !d.type) return;

    if (d.type === 'visora-update') {
      var field = d.field;
      var value = d.value || '';

      if (field === 'event-date-iso') {
        setCountdownDate(value);
        /* Update calendar buttons */
        document.querySelectorAll('.calendar-btn').forEach(function (btn) {
          btn.dataset.start = value;
          /* end = start + 5h */
          var end = new Date(new Date(value).getTime() + 5 * 3600000);
          btn.dataset.end = end.toISOString().split('.')[0];
        });
        return;
      }
      if (field === 'map-link') { setMapLink(value); return; }
    }

    /* Galeri sıfırlama: tüm kullanıcı fotoğraflarını temizle */
    if (d.type === 'visora-gallery-reset') {
      userPhotos = [];
      buildFilmStrip([]);
      buildBackground([]);
      return;
    }

    if (d.type === 'visora-gallery') {
      handleGalleryUpdate(d.index || 0, d.dataUrl);
      return;
    }

    /* Spiral arka plan şeridi sıfırla */
    if (d.type === 'visora-spiral-reset') {
      spiralPhotos = [];
      buildSpiralStrip([]);
      return;
    }

    /* Spiral arka plan şeridi fotoğraf ekle */
    if (d.type === 'visora-spiral-gallery') {
      spiralPhotos[d.index || 0] = d.dataUrl;
      buildSpiralStrip(spiralPhotos.filter(Boolean));
      return;
    }

    if (d.type === 'visora-music') {
      setMusicSrc(d.src);
      return;
    }
  });

  /* ════════════════════════════════════════════
     WHATSAPP + INSTAGRAM DYNAMIC LINKS
  ════════════════════════════════════════════ */
  (function () {
    var numEl    = document.querySelector('[data-visora-field="whatsapp-number"]');
    var waBtn    = document.getElementById('fsWhatsappBtn');
    var handleEl = document.querySelector('[data-visora-field="instagram-handle"]');
    var instaBtn = document.getElementById('fsInstaBtn');

    function updateWa() {
      if (!waBtn) return;
      var num = numEl ? numEl.textContent.trim().replace(/\D/g, '') : '905372395824';
      if (!num) num = '905372395824';
      waBtn.setAttribute('href', 'https://wa.me/' + num);
    }
    function updateInsta() {
      if (!instaBtn) return;
      var handle = handleEl ? handleEl.textContent.trim().replace(/^@/, '') : 'davetiye_visora';
      if (!handle) handle = 'davetiye_visora';
      instaBtn.setAttribute('href', 'https://instagram.com/' + handle);
    }

    updateWa();
    updateInsta();
    if (numEl && 'MutationObserver' in window)
      new MutationObserver(updateWa).observe(numEl, { childList: true, characterData: true, subtree: true });
    if (handleEl && 'MutationObserver' in window)
      new MutationObserver(updateInsta).observe(handleEl, { childList: true, characterData: true, subtree: true });
  })();

  /* ════════════════════════════════════════════
     INIT
  ════════════════════════════════════════════ */
  /* Spiral bg yüksekliğini tam içerik yüksekliğiyle senkronize et */
  function syncSpiralBg() {
    var inv = document.querySelector('.fs-invitation');
    var bg  = document.querySelector('.fs-spiral-bg');
    if (!inv || !bg) return;
    var h = Math.max(inv.scrollHeight, inv.clientHeight, window.innerHeight);
    bg.style.height = h + 'px';
  }
  syncSpiralBg();
  window.addEventListener('resize', syncSpiralBg);
  setTimeout(syncSpiralBg, 500);

  buildPerforations();
  buildFilmStrip([]);
  buildSpiralStrip([]);

  /* Default countdown — 1 year from today */
  var defaultDate = new Date();
  defaultDate.setFullYear(defaultDate.getFullYear() + 1);
  setCountdownDate(defaultDate.toISOString());
  setTimeout(syncSpiralBg, 1000);

})();
