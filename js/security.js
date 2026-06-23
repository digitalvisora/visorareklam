/* ============================================================
   VISORA — security.js  v2
   Site-wide Anti-Theft & Protection System

   Amaç:
   · Tasarım, metin ve görsellerin kolay kopyalanmasını caydırmak.
   · Watermark sistemi ile telif hakkı görünürlüğü.
   · Kullanıcı deneyimini bozmadan temel koruma.

   NOT: Tam engelleme teknik olarak mümkün değildir.
   Amaç caydırıcılık + marka koruma.
   ============================================================ */

(function () {
  'use strict';

  /* ── Sağ tık menüsünü engelle ── */
  document.addEventListener('contextmenu', function (e) {
    /* Editör input/textarea'larında sağ tık çalışsın (kullanıcı rahatlığı) */
    var tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
    e.preventDefault();
  });

  /* ── Görsel sürüklemeyi engelle ── */
  document.addEventListener('dragstart', function (e) {
    if (e.target.tagName === 'IMG' ||
        e.target.closest('.gallery-card, .gallery-item, .vs-card, .tpl-phone-screen')) {
      e.preventDefault();
    }
  });

  /* ── DevTools kısayol caydırması ── */
  document.addEventListener('keydown', function (e) {
    var blocked =
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && ['I','i','J','j','C','c','K','k'].includes(e.key)) ||
      (e.ctrlKey && ['U','u','S','s'].includes(e.key));

    if (blocked) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return false;
    }
  }, true);

  /* ── Metin kopyalamayı caydır (davetiye önizleme alanında) ── */
  document.addEventListener('copy', function (e) {
    var src = document.activeElement || document.body;
    /* Editör inputlarında kopyalamaya izin ver */
    var tag = (src.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;
    /* Preview alanında kopyalamayı engelle */
    if (src.closest('.create-preview, .phone-mock, .tpl-phone-screen')) {
      e.preventDefault();
    }
  });

  /* ── Konsol uyarısı (brand protection) ── */
  if (window.console && window.console.log) {
    setTimeout(function () {
      console.log(
        '%c🔒 VISORA — Korumalı Platform',
        'color:#C6A77D;font-size:18px;font-weight:bold;font-family:Georgia,serif'
      );
      console.log(
        '%cBu platform VISORA marka koruma sistemi tarafından denetlenmektedir.\nİzinsiz içerik kopyalama, tasarım çalma ve görsel indirme yasaktır.\nTüm şikayetler: legal@visora.com.tr',
        'color:#888;font-size:12px;line-height:1.6'
      );
    }, 800);
  }

  /* ── CSS: invitation önizleme, galeri ve kart koruma ── */
  var style = document.createElement('style');
  style.textContent = [
    /* Davetiye önizleme ve galeri alanı */
    '.hero-card, .cover-wedding, .cover-henna, .hero-bride, .hero-groom,',
    '.gallery-card, .gallery-track, .gallery-item, .tpl-thumb-img,',
    '.phone-mock, .create-preview, .tpl-phone-screen {',
    '  -webkit-user-select: none !important;',
    '  -moz-user-select: none !important;',
    '  user-select: none !important;',
    '  -webkit-touch-callout: none !important;',
    '}',
    /* Tüm görseller pointer-events: none */
    '.phone-mock img, .create-preview img, .tpl-thumb-img,',
    '.gallery-card, .gallery-item, .vs-card-img { pointer-events: none !important; }',
    /* Editör inputları normal çalışsın */
    '.create-input, .create-textarea, .vs-preset-select,',
    '.vs-dp-sel, .vs-tp-sel {',
    '  -webkit-user-select: text !important;',
    '  user-select: text !important;',
    '  pointer-events: auto !important;',
    '}'
  ].join('\n');
  document.head.appendChild(style);

  /* ── Print caydırıcısı ── */
  var printStyle = document.createElement('style');
  printStyle.textContent =
    '@media print {' +
    '  .create-preview, .phone-mock, .phone-frame, .tpl-phone-screen {' +
    '    visibility: hidden !important;' +
    '    filter: blur(8px) !important;' +
    '  }' +
    '}';
  document.head.appendChild(printStyle);

})();
