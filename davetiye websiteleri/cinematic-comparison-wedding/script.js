/* ================================================================
   Sinematik Karşılaştırma — script.js
   ================================================================ */

(function () {
  'use strict';

  var DEMO_PHOTOS = (function () {
    var base = ['images/slider1.jpg','images/slider2.jpg','images/slider3.jpg','images/slider4.jpg','images/slider5.jpg'];
    var out = [];
    while (out.length < 20) out = out.concat(base);
    return out.slice(0, 20);
  })();

  var filmPhotos = [];

  /* ════════════════════════════════════════════
     HERO COMPARISON SLIDER
  ════════════════════════════════════════════ */
  var hero    = document.getElementById('ccHero');
  var divider = document.getElementById('ccDivider');
  var panelL  = document.getElementById('ccPanelL');
  var panelR  = document.getElementById('ccPanelR');
  var hintEl  = document.getElementById('ccHeroHint');
  var pct = 50, dragging = false;

  function applySlider(p) {
    p = Math.max(8, Math.min(92, p));
    pct = p;
    divider.style.left = p + '%';
    divider.setAttribute('aria-valuenow', Math.round(p));
    panelL.style.clipPath = 'inset(0 ' + (100 - p).toFixed(2) + '% 0 0)';
    panelR.style.clipPath = 'inset(0 0 0 ' + p.toFixed(2) + '%)';
    if (hintEl) {
      if (p < 35)      hintEl.textContent = '→  İSİMLERİ GÖRMEK İÇİN SAĞA DOĞRU SÜRÜKLEYİN';
      else if (p > 65) hintEl.textContent = '←  TARİHİ GÖRMEK İÇİN SOLA DOĞRU SÜRÜKLEYİN';
      else             hintEl.textContent = 'KAYDIRIN';
    }
  }

  function xPct(cx) { var r = hero.getBoundingClientRect(); return ((cx - r.left) / r.width) * 100; }

  divider.addEventListener('mousedown', function (e) { e.preventDefault(); dragging = true; divider.classList.add('dragging'); });
  window.addEventListener('mousemove',  function (e) { if (dragging) applySlider(xPct(e.clientX)); });
  window.addEventListener('mouseup',    function ()  { if (dragging) { dragging = false; divider.classList.remove('dragging'); } });

  divider.addEventListener('touchstart', function (e) { e.preventDefault(); dragging = true; divider.classList.add('dragging'); }, { passive: false });
  window.addEventListener('touchmove',   function (e) { if (dragging) applySlider(xPct(e.touches[0].clientX)); }, { passive: true });
  window.addEventListener('touchend',    function ()  { if (dragging) { dragging = false; divider.classList.remove('dragging'); } });

  hero.addEventListener('click', function (e) { if (!divider.contains(e.target)) applySlider(xPct(e.clientX)); });
  divider.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft')  applySlider(pct - 4);
    if (e.key === 'ArrowRight') applySlider(pct + 4);
  });

  applySlider(50);

  /* ════════════════════════════════════════════
     3D SPIRAL FILM STRIP  (JS-driven depth effects)
  ════════════════════════════════════════════ */
  var spiralEls   = [];
  var spiralAngle = 0;
  var spiralRAF   = null;

  var SP = {
    R  : 52,
    dY : 78,
    N  : 10,
    spd: 0.40
  };

  function buildSpiral(photos) {
    var world = document.getElementById('ccSpiralWorld');
    if (!world) return;

    if (spiralRAF) { cancelAnimationFrame(spiralRAF); spiralRAF = null; }

    var base = (photos && photos.length) ? photos.slice(0, 20) : DEMO_PHOTOS;
    var src  = base.slice();
    while (src.length < SP.N) src = src.concat(base);
    src = src.slice(0, SP.N);

    world.innerHTML = '';
    spiralEls = [];

    src.forEach(function (url, i) {
      var f = document.createElement('div');
      f.className = 'cc-spiral-frame';
      var img = document.createElement('img');
      img.src = url; img.alt = ''; img.loading = 'lazy';
      img.onerror = function () { f.classList.add('no-img'); };
      var num = document.createElement('span');
      num.className = 'cc-spiral-num';
      num.textContent = String(i + 1).padStart(2, '0');
      f.appendChild(img);
      f.appendChild(num);
      world.appendChild(f);
      spiralEls.push(f);
    });

    spiralAngle = 0;
    runSpiral();
  }

  function runSpiral() {
    spiralAngle = (spiralAngle + SP.spd) % 360;

    var N  = SP.N;
    var R  = SP.R;
    var dY = SP.dY;

    for (var i = 0; i < spiralEls.length; i++) {
      var el = spiralEls[i];
      var deg = ((i / N) * 360 + spiralAngle) % 360;
      var rad = deg * Math.PI / 180;
      var x = R * Math.sin(rad);
      var z = R * Math.cos(rad);
      var y = (i - (N - 1) / 2) * dY;
      var facing = Math.cos(rad);

      if (facing < -0.05) {
        el.style.visibility = 'hidden';
        continue;
      }
      el.style.visibility = 'visible';
      el.style.opacity = (0.22 + 0.78 * Math.max(0, facing)).toFixed(3);
      var br  = (0.68 + 0.42 * Math.max(0, facing)).toFixed(3);
      var sep = (0.30 - 0.12 * Math.max(0, facing)).toFixed(3);
      el.style.filter = 'sepia(' + sep + ') contrast(1.08) brightness(' + br + ')';
      el.style.transform =
        'translateX(' + x.toFixed(1) + 'px) ' +
        'translateY(' + y.toFixed(1) + 'px) ' +
        'translateZ(' + z.toFixed(1) + 'px)';
    }

    spiralRAF = requestAnimationFrame(runSpiral);
  }

  /* ════════════════════════════════════════════
     COUNTDOWN
  ════════════════════════════════════════════ */
  var cdTarget = null;
  function tick() {
    if (!cdTarget) return;
    var d = Math.max(0, cdTarget - Date.now());
    setTxt('cdDays',  pad(Math.floor(d / 86400000)));
    setTxt('cdHours', pad(Math.floor((d % 86400000) / 3600000)));
    setTxt('cdMins',  pad(Math.floor((d % 3600000)  / 60000)));
    setTxt('cdSecs',  pad(Math.floor((d % 60000)    / 1000)));
  }
  function setTxt(id, v) { var e = document.getElementById(id); if (e) e.textContent = v; }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  setInterval(tick, 1000);

  /* ════════════════════════════════════════════
     RSVP
  ════════════════════════════════════════════ */
  var rsvpMsg = document.getElementById('rsvpMsg');
  function bindRSVP(id, msgTxt) {
    var btn = document.getElementById(id); if (!btn) return;
    btn.addEventListener('click', function () {
      ['rsvpYes', 'rsvpNo'].forEach(function (bid) {
        var b = document.getElementById(bid); if (b) b.classList.toggle('selected', b.id === id);
      });
      if (rsvpMsg) rsvpMsg.textContent = msgTxt;
    });
  }
  bindRSVP('rsvpYes', 'Teşekkürler! Sizi görmekten büyük mutluluk duyacağız.');
  bindRSVP('rsvpNo',  'Teşekkürler. Umarız başka bir zaman bir arada oluruz.');

  /* ════════════════════════════════════════════
     TAKVİM
  ════════════════════════════════════════════ */
  document.querySelectorAll('.calendar-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var s = (btn.dataset.start || '').replace(/[-:]/g, '').split('.')[0];
      var e = (btn.dataset.end   || '').replace(/[-:]/g, '').split('.')[0];
      window.open(
        'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' +
        encodeURIComponent(btn.dataset.title || 'Düğün') +
        '&dates=' + s + 'Z/' + e + 'Z', '_blank'
      );
    });
  });

  /* ════════════════════════════════════════════
     HARİTA
  ════════════════════════════════════════════ */
  var mapHref = '', mapBtn = document.getElementById('ccMapBtn');
  if (mapBtn) mapBtn.addEventListener('click', function (e) {
    e.preventDefault();
    if (!mapHref) { alert('Lütfen düzenleme panelinden harita bağlantısını ekleyin.'); return; }
    window.open(mapHref, '_blank', 'noopener');
  });

  /* ════════════════════════════════════════════
     MÜZİK
  ════════════════════════════════════════════ */
  var audio    = document.getElementById('ccAudio');
  var musicBtn = document.getElementById('ccMusicBtn');
  var playIco  = document.getElementById('ccPlayIco');
  var pauseIco = document.getElementById('ccPauseIco');
  var playing  = false;

  if (audio && !audio.src) audio.src = '../wedding/music.mp3';
  if (musicBtn) musicBtn.addEventListener('click', function () {
    if (!audio) return;
    if (playing) { audio.pause(); playing = false; }
    else { audio.play().catch(function () {}); playing = true; }
    if (playIco)  playIco.style.display  = playing ? 'none' : '';
    if (pauseIco) pauseIco.style.display = playing ? '' : 'none';
  });

  /* ════════════════════════════════════════════
     BRIDGE MESAJ DİNLEYİCİSİ
  ════════════════════════════════════════════ */
  var DAYS_TR = ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];

  window.addEventListener('message', function (e) {
    var d = e.data;
    if (!d || !d.type) return;

    if (d.type === 'visora-update') {
      var f = d.field, v = d.value || '';
      if (f === 'event-date-iso' && v) {
        cdTarget = new Date(v).getTime();
        var dayEl = document.getElementById('ccDateDay');
        if (dayEl) dayEl.textContent = DAYS_TR[new Date(v).getDay()].toUpperCase();
        var endMs  = new Date(v).getTime() + 5 * 3600000;
        var endIso = new Date(endMs).toISOString().split('.')[0];
        document.querySelectorAll('.calendar-btn').forEach(function (b) {
          b.dataset.start = v; b.dataset.end = endIso;
        });
        return;
      }
      if (f === 'map-link') {
        mapHref = v;
        if (mapBtn) mapBtn.href = v || '#';
        return;
      }
    }

    if (d.type === 'visora-gallery-reset') {
      filmPhotos = [];
      buildSpiral([]);
      return;
    }

    if (d.type === 'visora-gallery') {
      var idx = typeof d.index === 'number' ? d.index : 0;
      while (filmPhotos.length <= idx) filmPhotos.push(null);
      filmPhotos[idx] = d.dataUrl || null;
      buildSpiral(filmPhotos.filter(Boolean));
      return;
    }

    if (d.type === 'visora-music' && d.src) {
      if (audio) { audio.src = d.src; audio.load(); }
    }
  });

  /* ════════════════════════════════════════════
     BAŞLATMA
  ════════════════════════════════════════════ */
  buildSpiral([]);
  setRecUI && setRecUI('idle');

  var def = new Date(); def.setFullYear(def.getFullYear() + 1);
  cdTarget = def.getTime(); tick();

})();
