/* ============================================================
   visora-bridge.js  v3
   VISORA Editör İletişim Köprüsü — Segment Desteği

   ─ SEGMENT KAVRAMLARI ─
   Bazı davetiyeler birden fazla bölüm (segment) içerir.
   Örnek: wedding-video → tek segment (null id = tüm sayfa)
          dugun-kina    → iki segment: #wedding + #henna
          bride-groom   → iki segment: #bride   + #groom

   Segment ID'si, HTML'deki section id'sine karşılık gelir.
   Segment-scoped mesajlar sadece o section içindeki elementleri günceller.
   ============================================================ */

(function () {
  'use strict';

  var inIframe = window.self !== window.top;

  /* Watermark ve güvenlik her zaman aktif */
  injectWatermark();
  applyBasicSecurity();

  /* ── Render mode: yayınlanmış davetiye, iframe DIŞINDA, kendi başına açılmış ──
     URL'de ?instance=ID varsa veya sayfaya gömülü <script id="visora-instance-data">
     varsa, VISORA_API'den/gömülü JSON'dan veriyi okuyup aynı apply* fonksiyonlarını
     postMessage olmadan çalıştırır. Şablon kodu hiç değişmez. */
  if (!inIframe) {
    initRenderMode();
    return;
  }

  /* Hazır sinyali */
  function notifyReady() {
    try { window.parent.postMessage({ type: 'visora-ready' }, '*'); } catch (e) {}
  }

  /* ── Global overflow fix (iframe içindeki tüm davetiyeler için) ──
     Editor'daki ölçekleme sırasında sağa taşma ve horizontal scroll önlenir. */
  (function injectGlobalFixes() {
    var fix = document.createElement('style');
    fix.id = 'visora-global-fix';
    fix.textContent =
      /* html = tek scroll container; overscroll-behavior prevent chaining */
      'html{' +
        'margin:0!important;padding:0!important;' +
        'width:100%!important;' +
        'overflow-x:hidden!important;' +
        'overflow-y:auto!important;' +
        'background:transparent!important;' +
        'overscroll-behavior:contain;' +
      '}' +
      /* body: height auto → içeriği tam kapsar, html taşırsa html scroll eder */
      'body{' +
        'margin:0!important;padding:0!important;' +
        'width:100%!important;height:auto!important;min-height:100%!important;' +
        'overflow-x:hidden!important;' +
        'overflow-y:visible!important;' +
        'background:transparent!important;' +
      '}' +
      /* Davetiye wrapper'larını da serbest bırak */
      '.invite-wrap,.invitation-wrap,main{height:auto!important;overflow:visible!important;}' +
      '*{box-sizing:border-box;}' +
      '::-webkit-scrollbar{display:none!important;width:0!important;height:0!important;}' +
      '*{scrollbar-width:none!important;-ms-overflow-style:none!important;}';
    document.head.appendChild(fix);
  })();

  /* ── Global: harita butonlarını yakala — link yoksa uyarı göster ── */
  (function () {
    var _mapLink = '';
    /* Store map link when bridge receives it */
    window._visoraSetMapLink = function (url) { _mapLink = url; };

    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-visora-mapbtn], #ccMapBtn, .visora-map-btn, [href*="maps.google"], [href*="goo.gl/maps"]');
      if (!btn) return;
      /* Only intercept anchor hrefs that are placeholder (#) */
      var href = btn.getAttribute('href');
      if (href && href !== '#') return; /* real link — let browser handle */
      e.preventDefault();
      if (!_mapLink) {
        alert('Lütfen davetiye düzenleme panelinden harita bağlantısını ekleyin.');
        return;
      }
      window.open(_mapLink, '_blank', 'noopener');
    });
  })();

  /* ── Segment scope yardımcısı ── */
  function getScope(segmentId) {
    if (!segmentId) return document;
    return document.getElementById(segmentId) || document;
  }

  /* ── Türkçe ay adı → ISO tarih dönüştürücü (geri sayım senkronizasyonu için) ── */
  var _VTMONTHS = {
    'ocak':0,'şubat':1,'mart':2,'nisan':3,'mayıs':4,'haziran':5,
    'temmuz':6,'ağustos':7,'eylül':8,'ekim':9,'kasım':10,'aralık':11
  };

  function _vtParseDate(str) {
    /* "23 AĞUSTOS 2026 · 20.00"  veya  "23 Ağustos 2026"  → "2026-08-23" */
    var clean = (str || '').trim().replace(/\s*[·•–—]\s*.*/,'');
    var p = clean.split(/\s+/);
    if (p.length < 3) return null;
    var d = parseInt(p[0], 10), m = _VTMONTHS[p[1].toLowerCase()], y = parseInt(p[2], 10);
    if (isNaN(d) || m === undefined || isNaN(y)) return null;
    return y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
  }

  function _vtExtractTime(str) {
    /* "· 20.00"  veya  "20:30"  gibi formatlardan  "HH:MM:SS" döndürür */
    var m = (str || '').match(/[·•–—]\s*(\d{1,2})[.:h](\d{2})/);
    if (m) return String(parseInt(m[1], 10)).padStart(2, '0') + ':' + m[2] + ':00';
    m = (str || '').match(/^(\d{1,2})[.:h](\d{2})$/);
    if (m) return String(parseInt(m[1], 10)).padStart(2, '0') + ':' + m[2] + ':00';
    return null;
  }

  /* ── Metin / input alanı güncellemesi ── */
  function applyUpdate(field, value, segmentId) {
    /* Harita linkini güncelle — segment-scoped + geriye uyumlu global */
    if (field === 'map-link') {
      if (window._visoraSetMapLink) window._visoraSetMapLink(value);
      /* Segment içindeki data-visora-mapbtn butonlarını güncelle */
      getScope(segmentId).querySelectorAll('[data-visora-mapbtn], .visora-map-btn').forEach(function(btn){
        btn.href = value || '#';
      });
      /* Geriye uyumlu: segment dışındaki #ccMapBtn */
      document.querySelectorAll('#ccMapBtn').forEach(function(btn){
        btn.href = value || '#';
      });
      return;
    }

    /* Kapak fotoğrafı: .hero-image arka planını güncelle */
    if (field === 'hero-image' && value) {
      document.querySelectorAll('.hero-image').forEach(function(el) {
        el.style.backgroundImage = 'url(' + value + ')';
      });
      return;
    }

    /* DOM metnini güncelle */
    getScope(segmentId)
      .querySelectorAll('[data-visora-field="' + field + '"]')
      .forEach(function (el) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.value = value;
        } else {
          el.textContent = value;
        }
      });

    /* ── Geri sayım otomatik senkronizasyonu ──
       Editörden tarih alanı geldiğinde tüm davetiye türleri güncellenir:
       1. [data-visora-field="event-date-iso"] öğelerini günceller  (timeless-garden)
       2. Segment'in .event-page data-date attribute'unu günceller  (dugun-kina, bride-groom) */
    if (field.indexOf('event-date') === 0 && field.indexOf('event-time') < 0 && value) {
      var iso = _vtParseDate(value);
      var embeddedTime = _vtExtractTime(value);
      if (iso) {
        /* ISO span'larını güncelle (timeless-garden MutationObserver bunu yakalar) */
        document.querySelectorAll('[data-visora-field="event-date-iso"]').forEach(function(el) {
          el.textContent = iso;
        });
        /* Segment element'inin data-date'ini güncelle */
        var scopeEl = segmentId ? document.getElementById(segmentId) : null;
        if (scopeEl && scopeEl.classList.contains('event-page')) {
          var prevDate = scopeEl.dataset.date || '';
          var prevTime = embeddedTime || (prevDate.indexOf('T') > -1 ? prevDate.split('T')[1] : '20:00:00');
          scopeEl.dataset.date = iso + 'T' + prevTime;
        }
      }
    }

    /* Saat alanı güncellenince de data-date'i güncelle */
    if ((field === 'event-time' || field.indexOf('event-time-') === 0) && value) {
      var scopeEl2 = segmentId ? document.getElementById(segmentId) : null;
      if (scopeEl2 && scopeEl2.classList.contains('event-page')) {
        var timeVal = value.trim().replace(/[.:h]/, ':');
        if (timeVal.split(':').length === 2) timeVal += ':00';
        var prevDatePart = (scopeEl2.dataset.date || '2026-01-01T20:00:00').split('T')[0];
        scopeEl2.dataset.date = prevDatePart + 'T' + timeVal;
      }
    }
  }

  /* ── Font değişimi ── */
  function applyFont(fontFamily, segmentId) {
    var scope = getScope(segmentId);
    document.body.style.setProperty('--visora-inv-font', fontFamily);
    scope.querySelectorAll(
      'h1, h2, .hero-copy h1, .cover-inner h1, .hero-panel h2, ' +
      '[data-visora-field="bride-name"], [data-visora-field="groom-name"], ' +
      '[data-visora-field="henna-name"]'
    ).forEach(function (el) { el.style.fontFamily = fontFamily; });
  }

  /* ── Galeri sıfırlama ── */
  function applyGalleryReset(msg) {
    var scope = getScope(msg.segment);
    /* Yalnızca dinamik eklenenler kaldırılır; demo kartların arka planı korunur */
    scope.querySelectorAll('[data-visora-added]').forEach(function (el) { el.remove(); });
    scope.querySelectorAll('[data-visora-gallery-bg]').forEach(function (el) {
      el.style.backgroundImage = '';
    });
  }

  /* ── Galeri güncellemesi (base64 dataURL) ── */
  function applyGalleryUpdate(msg) {
    var idx   = msg.index || 0;
    var scope = getScope(msg.segment);

    /* 1. Özel data-visora-gallery-bg öğeleri */
    var bgItems = scope.querySelectorAll('[data-visora-gallery-bg]');
    if (bgItems[idx]) {
      bgItems[idx].style.backgroundImage = 'url(' + msg.dataUrl + ')';
      return;
    }

    /* 2. data-visora-gallery-container içindeki mevcut/dinamik kartlar */
    scope.querySelectorAll('[data-visora-gallery-container]').forEach(function (c) {
      var items = c.querySelectorAll('img, .gallery-card, .gallery-item');
      if (items[idx]) {
        if (items[idx].tagName === 'IMG') items[idx].src = msg.dataUrl;
        else items[idx].style.backgroundImage = 'url(' + msg.dataUrl + ')';
        return;
      }
      /* Kart yoksa dinamik olarak oluştur */
      var needed = idx - items.length + 1;
      for (var i = 0; i < needed; i++) {
        var card = document.createElement('div');
        card.className = 'gallery-card';
        card.setAttribute('data-visora-added', '1');
        c.appendChild(card);
      }
      var newItems = c.querySelectorAll('.gallery-card');
      if (newItems[idx]) {
        newItems[idx].style.backgroundImage = 'url(' + msg.dataUrl + ')';
      }
    });
  }

  /* ── Timeline senkronizasyonu ── */
  function applyTimelineSync(items, segmentId) {
    var scope = getScope(segmentId);
    scope.querySelectorAll('[data-visora-timeline-container]').forEach(function (c) {
      var fmt = c.getAttribute('data-visora-timeline-format') || 'default';
      c.innerHTML = buildTimelineHTML(items, fmt);
    });
  }

  function buildTimelineHTML(items, fmt) {
    if (!items || !items.length) return '';
    function img(src) { return src ? '<img src="' + src + '" alt="">' : ''; }
    switch (fmt) {
      case 'wedding-video':
        return items.map(function (i) {
          return '<div class="timeline-item">' +
            '<div class="timeline-icon">' + img(i.icon) + '</div>' +
            '<div class="timeline-time">' + i.time + '</div>' +
            '<div class="timeline-line"><span class="timeline-dot"></span></div>' +
            '<div class="timeline-content"><h3>' + escH(i.title) + '</h3></div>' +
            '</div>';
        }).join('');
      case 'dugun-kina':
        return items.map(function (i) {
          return '<article>' + img(i.icon) +
            '<time>' + i.time + '</time>' +
            '<strong>' + escH(i.title) + '</strong></article>';
        }).join('');
      case 'dugun-kina-henna':
        return items.map(function (i) {
          return '<article>' + img(i.icon) +
            '<time>' + i.time + '</time>' +
            '<div><strong>' + escH(i.title) + '</strong></div></article>';
        }).join('');
      case 'party-bride':
      case 'party-groom':
        return items.map(function (i) {
          return '<article>' + img(i.icon) +
            '<time>' + i.time + '</time>' +
            '<div><strong>' + escH(i.title) + '</strong>' +
            (i.desc ? '<span>' + escH(i.desc) + '</span>' : '') +
            '</div></article>';
        }).join('');
      case 'timeless-garden':
        return items.map(function (i) {
          return '<div class="tg-tl-item">' +
            '<div class="tg-tl-left">' +
              '<span class="tg-tl-time">' + i.time + '</span>' +
              '<span class="tg-tl-dot"></span>' +
            '</div>' +
            '<div class="tg-tl-right">' +
              '<span class="tg-tl-title">' + escH(i.title) + '</span>' +
              (i.desc ? '<span class="tg-tl-desc">' + escH(i.desc) + '</span>' : '') +
            '</div>' +
            '</div>';
        }).join('');
      default:
        return items.map(function (i) {
          return '<div class="tl-item">' +
            '<span class="tl-t">' + i.time + '</span>' +
            img(i.icon) +
            '<span class="tl-e">' + escH(i.title) + '</span></div>';
        }).join('');
    }
  }

  function escH(s) {
    return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  /* ── Bölüme scroll ── */
  function applyScroll(sectionId) {
    var el =
      document.querySelector('[data-visora-section="' + sectionId + '"]') ||
      document.getElementById(sectionId);
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }

    /* Farklı şablonlar farklı section id'leri kullanabilir — yaygın takma adlar */
    var _aliases = {
      'hero':       ['wedding-cover','henna-cover','hero-card','.cover'],
      'venue':      ['wedding-venue','henna-venue','.venue-section','.tg-venue'],
      'date':       ['wedding-cover','henna-cover','.tg-date'],
      'invitation': ['wedding-cover','message','.quote-block']
    };
    var fallbacks = _aliases[sectionId] || [];
    for (var i = 0; i < fallbacks.length; i++) {
      var f = fallbacks[i];
      var candidate = f[0] === '.'
        ? document.querySelector(f)
        : (document.querySelector('[data-visora-section="' + f + '"]') || document.getElementById(f));
      if (candidate && candidate.offsetParent !== null) {
        candidate.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
  }

  /* ── Template iç tab geçişi ──
     DÜĞÜN-KINA ve Bride-Groom Party gibi templateler
     kendi dahili tab sistemine sahip.
     Bu mesaj o tab butonuna programlı tıklar.
  ── */
  function applyTabSwitch(tabKey) {
    var btn = document.querySelector('[data-tab="' + tabKey + '"]');
    if (btn) {
      btn.click();
      /* Kısa gecikme sonra ilk bölüme scroll */
      setTimeout(function () {
        var eventPage = document.getElementById(tabKey);
        if (eventPage) eventPage.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    }
  }

  /* ── Mesaj dinleyici ── */
  window.addEventListener('message', function (e) {
    if (!e.data || typeof e.data !== 'object') return;
    var msg = e.data;
    switch (msg.type) {
      case 'visora-update':
        if (msg.field !== undefined) applyUpdate(msg.field, msg.value || '', msg.segment || null);
        break;
      case 'visora-font':
        if (msg.fontFamily) applyFont(msg.fontFamily, msg.segment || null);
        break;
      case 'visora-gallery-reset':
        applyGalleryReset(msg);
        break;
      case 'visora-gallery':
        if (msg.dataUrl) applyGalleryUpdate(msg);
        break;
      case 'visora-timeline-sync':
        if (msg.items) applyTimelineSync(msg.items, msg.segment || null);
        break;
      case 'visora-scroll':
        if (msg.section) applyScroll(msg.section);
        break;
      case 'visora-tab-switch':
        if (msg.tabKey) applyTabSwitch(msg.tabKey);
        break;
      case 'visora-lang':
        applyLangSwitch(msg.lang || 'tr');
        break;
      case 'visora-intro':
        applyIntro(
          msg.introId   || null,
          msg.introType || 'css',
          msg.videoFile || null,
          {
            mirror:    msg.mirror    || false,
            brideName: msg.brideName || '',
            groomName: msg.groomName || '',
            introDate: msg.introDate || '',
            hPos:      msg.hPos      || 'center',
            vPos:      msg.vPos      || 'center',
            font:      msg.font      || 'Cormorant Garamond',
            textSize:  msg.textSize  || 32,
            textColor: msg.textColor || '#ffffff',
            basePath:  msg.basePath  || null
          }
        );
        break;
    }
  });

  /* ══════════════════════════════════════════════════════════
     RENDER MODE — yayınlanmış davetiyeyi (iframe dışında) doldurur
     ══════════════════════════════════════════════════════════ */

  function getInstanceIdFromUrl() {
    var params = new URLSearchParams(window.location.search);
    return params.get('instance');
  }

  function getEmbeddedInstanceData() {
    var el = document.getElementById('visora-instance-data');
    if (!el) return null;
    try { return JSON.parse(el.textContent); } catch (e) { return null; }
  }

  function initRenderMode() {
    var embedded = getEmbeddedInstanceData();
    if (embedded) { applyPaidWatermark(embedded); applyInstanceDataSafe(embedded); return; }

    var id = getInstanceIdFromUrl();
    if (!id || !window.VISORA_API) return;

    window.VISORA_API.getInvitation(id).then(function (instance) {
      if (instance) { applyPaidWatermark(instance); applyInstanceDataSafe(instance); }
    }).catch(function () {});
  }

  /* Ödeme durumuna göre filigranı kaldırır — şablonun kendi script'inde
     (örn. countdown/timeline kodunda) atılabilecek hatalardan tamamen
     bağımsız çalışması için applyInstanceData'dan ÖNCE ve ayrı çağrılır. */
  function applyPaidWatermark(instance) {
    if (instance && instance.paid) removeWatermark();
  }

  /* applyInstanceData şablonun mevcut alan/timeline verisine bağlı çalışır;
     beklenmedik bir şablon hatası diğer apply* adımlarını ya da (daha önemlisi)
     filigran kaldırmayı bozmasın diye try/catch ile sarılır. */
  function applyInstanceDataSafe(instance) {
    try { applyInstanceData(instance); } catch (e) {}
  }

  /* Tek bir instance objesinden tüm alanları, fontu, paleti ve timeline'ı uygular.
     applyUpdate/applyFont/applyTimelineSync zaten saf fonksiyon — postMessage
     handler'ı ile bu yol arasında hiçbir kod tekrarı yok. */
  function applyInstanceData(instance) {
    if (!instance) return;

    var fieldValues = instance.fieldValues || {};

    /* Sekme başlığı + müzik — şablonun kendi alan/timeline işleme kodunda
       atılabilecek bir hatadan (aşağıdaki adımlar) tamamen bağımsız olsun diye
       EN ÖNCE ve kendi try/catch'i ile uygulanır (watermark kaldırmadaki ile
       aynı desen — bkz. applyPaidWatermark). */
    try {
      var titleBride = fieldValues['bride-name'];
      var titleGroom = fieldValues['groom-name'];
      if (titleBride && titleGroom) {
        document.title = titleBride + ' & ' + titleGroom + ' — VISORA Davetiye';
      }
    } catch (e) {}

    try {
      /* Editörde seçilen/yüklenen müzik (music-url alanı) — DÜZENLEME sırasında
         olustur.js bunu ayrı bir 'visora-music' postMessage'ı ile gönderir ve
         şablonların script.js'i bunu dinler; ama YAYINLANMIŞ sayfa (render mode)
         hiçbir postMessage almadan tek seferde açılıyor, bu yüzden müzik hiç
         set edilmiyordu. Aynı mesajı kendi pencereye gönderip var olan
         dinleyicileri (film-strip, cinematic-comparison-wedding, Slot Machine,
         wedding, timeless-garden) tetikliyoruz — şablon kodu tekrar edilmiyor. */
      if (fieldValues['music-url']) {
        window.postMessage({ type: 'visora-music', src: fieldValues['music-url'] }, window.location.origin);
      }
    } catch (e) {}

    Object.keys(fieldValues).forEach(function (fieldId) {
      applyUpdate(fieldId, fieldValues[fieldId] || '', instance.segment || null);
    });

    if (instance.font) applyFont(instance.font, instance.segment || null);

    if (instance.timelineItems && instance.timelineItems.length) {
      applyTimelineSync(instance.timelineItems, instance.segment || null);
    }

    if (instance.locale) applyLangSwitch(instance.locale);
  }

  function removeWatermark() {
    var wm = document.getElementById('visora-wm');
    if (wm) wm.remove();
  }

  /* ══════════════════════════════════════════════════════════
     SİNEMATİK INTRO SİSTEMİ
     Editor'dan seçilen intro tipi bu davetiyede canlı oynatılır.
     Her intro: CSS animasyonu + "Dokunun, açılsın" prompt.
  ══════════════════════════════════════════════════════════ */

  function applyIntro(introId, introType, videoFile, config) {
    /* Mevcut introyu kaldır */
    ['vi-overlay', 'vi-style'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.remove();
    });
    if (!introId) return;

    /* Inject shared CSS */
    var styleEl = document.createElement('style');
    styleEl.id = 'vi-style';
    styleEl.textContent = buildIntroSharedCSS() + buildIntroCSSByType(introId, introType);
    document.head.appendChild(styleEl);

    /* Choose player */
    config = config || {};
    if (introType === 'video' && videoFile) {
      buildVideoIntro(introId, videoFile, config);
    } else {
      buildCSSIntro(introId);
    }
  }

  /* ── Get couple names from the invitation (for video overlay display) ── */
  function getCoupleNames() {
    function txt(sel) {
      var el = document.querySelector('[data-visora-field="' + sel + '"]');
      return (el ? el.textContent.trim() : '') || '';
    }
    var b = txt('bride-name'), g = txt('groom-name');
    if (!b && !g) return '';
    if (!g) return b;
    if (!b) return g;
    return b + ' & ' + g;
  }

  /* ════════════════════════════════════════════════════════
     VIDEO INTRO PLAYER — Premium
     · davetiye websiteleri/intro/ klasöründen video oynatır
     · Video bitince veya dokunulunca davetiye açılır
     · Açılış: yumuşak blur+fade geçişi
     · İsimler: ayna videolarda ayna içine, diğerlerinde alta
  ════════════════════════════════════════════════════════ */
  function buildVideoIntro(introId, videoFile, config) {
    config = config || {};
    var mirror    = config.mirror    || false;
    var bride     = config.brideName || '';
    var groom     = config.groomName || '';
    var date      = config.introDate || '';
    var hPos      = config.hPos      || 'center';
    var vPos      = config.vPos      || 'center';
    var font      = config.font      || 'Cormorant Garamond';
    var textSize  = config.textSize  || 32;
    var textColor = config.textColor || '#ffffff';
    var basePath  = config.basePath  || null;

    /* ── Fix 4: Intro fontunu davetiye iframe'ine enjekte et ── */
    var FONT_GF_MAP = {
      'Cormorant Garamond': 'Cormorant+Garamond:ital,wght@0,400;0,600;1,400',
      'Playfair Display':   'Playfair+Display:wght@400;600',
      'Cinzel':             'Cinzel:wght@400;600',
      'Great Vibes':        'Great+Vibes',
      'Sacramento':         'Sacramento',
      'Parisienne':         'Parisienne'
    };
    var fontParam = FONT_GF_MAP[font];
    if (fontParam) {
      var fontLinkId = 'vi-font-' + font.replace(/\s+/g, '-');
      if (!document.getElementById(fontLinkId)) {
        var fLink = document.createElement('link');
        fLink.id = fontLinkId; fLink.rel = 'stylesheet';
        fLink.href = 'https://fonts.googleapis.com/css2?family=' + fontParam + '&display=swap';
        document.head.appendChild(fLink);
      }
    }

    /* Invitations at davetiye websiteleri/[template]/ → ../intro/ (global)
       Template-specific (basePath) → ./intro/ gibi kendi klasörü          */
    var src = (basePath || '../intro/') + videoFile;

    /* ─── HTML yapısı ─── */
    var overlay = document.createElement('div');
    overlay.id        = 'vi-overlay';
    overlay.className = 'vi-overlay vi-video-type' + (mirror ? ' vi-mirror-type' : '');

    /* Video (loop YOK — bir kez oynar, biter → davetiye açılır) */
    var videoEl = document.createElement('video');
    videoEl.id         = 'vi-bg-video';
    videoEl.className  = 'vi-bg-video';
    videoEl.autoplay   = true;
    videoEl.muted      = true;
    videoEl.playsInline = true;
    videoEl.preload    = 'auto';
    /* loop: false — video bitince davetiye otomatik açılır */
    var srcEl = document.createElement('source');
    srcEl.src  = src;
    srcEl.type = 'video/mp4';
    videoEl.appendChild(srcEl);
    overlay.appendChild(videoEl);

    /* Sinematik hafif örtü */
    var veil = document.createElement('div');
    veil.className = 'vi-veil';
    overlay.appendChild(veil);

    /* ─── İsimler & tarih ─── */
    var hasText = bride || groom || date;
    if (hasText) {
      var textWrap = document.createElement('div');
      /* Konum: mirror öncelik taşır → orta; aksi halde kullanıcı seçimi */
      /* Mirror → daima orta; normal → kullanıcı seçimi hPos+vPos */
      var posClass = mirror
        ? 'vi-pos-center-center'
        : ('vi-pos-' + vPos + '-' + hPos);
      textWrap.className = 'vi-text-wrap ' + posClass;

      if (bride || groom) {
        var namesEl = document.createElement('div');
        namesEl.className = 'vi-overlay-names';
        namesEl.textContent = [bride, groom].filter(Boolean).join(' & ').toUpperCase();
        namesEl.style.fontFamily  = "'" + font + "', Georgia, serif";
        namesEl.style.fontSize    = textSize + 'px';
        namesEl.style.color       = textColor;
        /* Mirror sınırlaması: ayna içinde font siyah zemin üstüyse gölge ekle */
        namesEl.style.textShadow  = mirror
          ? '0 0 12px rgba(255,255,255,0.25),0 1px 8px rgba(0,0,0,0.45)'
          : '0 2px 20px rgba(0,0,0,0.60),0 0 40px rgba(0,0,0,0.30)';
        textWrap.appendChild(namesEl);
      }
      if ((bride || groom) && date) {
        var ruleEl = document.createElement('div');
        ruleEl.className = 'vi-overlay-rule';
        textWrap.appendChild(ruleEl);
      }
      if (date) {
        var dateEl = document.createElement('div');
        dateEl.className = 'vi-overlay-date';
        dateEl.textContent = date.toUpperCase();
        dateEl.style.fontFamily = "'" + font + "', Georgia, serif";
        dateEl.style.fontSize   = Math.round(textSize * 0.45) + 'px'; /* tarih ismin %45'i */
        dateEl.style.color      = textColor;
        textWrap.appendChild(dateEl);
      }
      overlay.appendChild(textWrap);
    }

    /* ─── Dokunma prompu ─── */
    var tapArea = document.createElement('div');
    tapArea.className = 'vi-tap-area';
    tapArea.innerHTML =
      '<p class="vi-tap-text">Davetiyeyi açmak için dokunun</p>' +
      '<div class="vi-tap-ripple">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" width="20" height="20">' +
          '<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>' +
          '<circle cx="12" cy="9" r="2.5"/>' +
        '</svg>' +
      '</div>';

    /* Başlangıç konumu: absolute, orta-alt (video yüklenmeden önce) */
    tapArea.style.cssText =
      'position:absolute;left:0;right:0;' +
      'display:flex;flex-direction:column;align-items:center;gap:10px;' +
      'animation:viTapIn 1s ease 1.0s both;' +
      'bottom:15%;';  /* varsayılan — loadedmetadata sonra güncellenir */

    overlay.appendChild(tapArea);
    document.body.appendChild(overlay);

    /* ─── Video yüklenince: tapArea'yı VIDEO ALANI içine konumlandır ─── */
    videoEl.addEventListener('loadedmetadata', function () {
      repositionTapOnVideo(videoEl, tapArea, overlay);
    });
    /* Zaten yüklendiyse hemen uygula */
    if (videoEl.readyState >= 1) {
      repositionTapOnVideo(videoEl, tapArea, overlay);
    }

    dismissOnInteraction(overlay);

    videoEl.addEventListener('ended', function () {
      dismissVideoOverlay(overlay);
    });

    var unmuted = false;
    videoEl.addEventListener('click', function (e) {
      e.stopPropagation();
      if (!unmuted) { videoEl.muted = false; unmuted = true; }
    });
  }

  /* ── Video alanını hesapla, tapArea'yı siyah bantların dışına konumlandır ── */
  function repositionTapOnVideo(videoEl, tapArea, overlay) {
    var vw = videoEl.videoWidth;
    var vh = videoEl.videoHeight;
    if (!vw || !vh) return;

    var cw = overlay.offsetWidth  || 390;
    var ch = overlay.offsetHeight || 849;

    var videoAR     = vw / vh;
    var containerAR = cw / ch;

    var videoDisplayH, videoTop;

    if (videoAR <= containerAR) {
      /* Video portrait-ish: genişliğe göre ölçeklenir, üst/alt bant oluşur */
      videoDisplayH = cw / videoAR;
      videoTop      = (ch - videoDisplayH) / 2;
    } else {
      /* Video landscape: yüksekliğe göre ölçeklenir, sol/sağ bant oluşur */
      videoDisplayH = ch;
      videoTop      = 0;
    }

    /* tapArea'yı videonun alt %18'ine yerleştir (siyah bantta değil, video içinde) */
    var tapBottom = (ch - (videoTop + videoDisplayH * 0.82));
    tapArea.style.bottom = Math.max(Math.round(tapBottom), 16) + 'px';
  }

  /* Yumuşak blur+fade geçişiyle kapat — davetiye yavaşça görünür */
  function dismissVideoOverlay(overlay) {
    if (!overlay || overlay.getAttribute('data-dismissing')) return;
    overlay.setAttribute('data-dismissing', '1');
    overlay.classList.add('vi-dismissing');
    /* CSS transition ile blur+fade yapar, sonra DOM'dan kaldır */
    setTimeout(function () {
      if (overlay.parentNode) overlay.remove();
      var s = document.getElementById('vi-style');
      if (s) s.remove();
    }, 950);
  }

  /* ════════════════════════════════════════════════════════
     CSS ANIMATION INTRO (video yoksa fallback)
  ════════════════════════════════════════════════════════ */
  function buildCSSIntro(introId) {
    var overlay = document.createElement('div');
    overlay.id        = 'vi-overlay';
    overlay.className = 'vi-overlay vi-' + introId;
    overlay.innerHTML = buildIntroHTML(introId);
    document.body.appendChild(overlay);
    dismissOnInteraction(overlay);
  }

  /* Shared dismiss: click/tap */
  function dismissOnInteraction(overlay) {
    overlay.addEventListener('click', function () {
      dismissVideoOverlay(overlay);
    });
    /* Güvenlik: 60 saniye sonra her durumda kapat */
    setTimeout(function () {
      if (document.getElementById('vi-overlay') === overlay) dismissVideoOverlay(overlay);
    }, 10000);
  }

  /* ── Intro HTML builders ── */
  function buildIntroHTML(introId) {
    var content = '';
    switch (introId) {
      case 'royal-seal':
        content =
          '<div class="vi-seal-wrap">' +
            '<div class="vi-seal-outer"></div>' +
            '<svg class="vi-seal-svg" viewBox="0 0 80 80" fill="none">' +
              '<circle cx="40" cy="40" r="35" stroke="rgba(201,168,76,0.85)" stroke-width="1.5"/>' +
              '<circle cx="40" cy="40" r="26" stroke="rgba(201,168,76,0.45)" stroke-width="0.8"/>' +
              '<path d="M40 18l3.6 11H55l-9.4 6.8 3.6 11L40 40.2l-9.2 6.6 3.6-11L26 29h11.4z" fill="rgba(201,168,76,0.75)" stroke="none"/>' +
            '</svg>' +
            '<div class="vi-crack vi-crack--a"></div>' +
            '<div class="vi-crack vi-crack--b"></div>' +
          '</div>';
        break;
      case 'ivory-gates':
        content =
          '<div class="vi-gates-wrap">' +
            '<div class="vi-gate-panel vi-gp--l">' +
              '<div class="vi-gate-border"></div>' +
              '<div class="vi-gate-ornament"></div>' +
            '</div>' +
            '<div class="vi-gate-light-ray"></div>' +
            '<div class="vi-gate-panel vi-gp--r">' +
              '<div class="vi-gate-border"></div>' +
              '<div class="vi-gate-ornament vi-gate-ornament--r"></div>' +
            '</div>' +
          '</div>';
        break;
      case 'cinematic-venue':
        content =
          '<div class="vi-venue-wrap">' +
            '<div class="vi-venue-bg"></div>' +
            '<div class="vi-venue-lights-row">' +
              '<span class="vi-light"></span><span class="vi-light"></span>' +
              '<span class="vi-light"></span><span class="vi-light"></span>' +
              '<span class="vi-light"></span>' +
            '</div>' +
            '<div class="vi-venue-arch"></div>' +
          '</div>';
        break;
      case 'golden-vow':
        content =
          '<div class="vi-vow-wrap">' +
            '<div class="vi-vow-bg"></div>' +
            '<div class="vi-vow-silhouettes"></div>' +
            '<div class="vi-vow-glow"></div>' +
          '</div>';
        break;
      case 'ballroom':
        content =
          '<div class="vi-ball-wrap">' +
            '<div class="vi-ball-bg"></div>' +
            '<div class="vi-chandelier"></div>' +
            '<div class="vi-particle-field"></div>' +
          '</div>';
        break;
      default:
        content = '<div class="vi-default-content"></div>';
    }
    return content +
      '<div class="vi-tap-prompt">' +
        '<p class="vi-tap-text">Davetiyeyi açmak için dokunun</p>' +
        '<div class="vi-tap-icon">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" width="20" height="20">' +
          '<path d="M7 11V7a5 5 0 0 1 10 0v4"/>' +
          '<path d="M5 11h14v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-8z"/>' +
          '</svg>' +
        '</div>' +
      '</div>';
  }

  /* ── Intro CSS: shared base ── */
  function buildIntroSharedCSS() {
    return (
      /* Overlay container */
      '#vi-overlay{' +
        'position:fixed;inset:0;z-index:99990;overflow:hidden;' +
        'transition:opacity .65s ease,transform .65s ease;' +
        'cursor:pointer;' +
      '}' +
      /* Dismiss: yumuşak blur+fade+scale — davetiye yavaşça görünür */
      '#vi-overlay.vi-dismissing{' +
        'opacity:0!important;' +
        'transform:scale(1.04)!important;' +
        'filter:blur(14px)!important;' +
        'transition:' +
          'opacity 0.90s cubic-bezier(0.4,0,0.2,1),' +
          'filter  0.90s cubic-bezier(0.4,0,0.2,1),' +
          'transform 0.90s cubic-bezier(0.4,0,0.2,1)!important;' +
      '}' +

      /* Video type — contain: video tamamen görünür, kesilmez */
      '.vi-bg-video{' +
        'position:absolute;inset:0;' +
        'width:100%;height:100%;' +
        'object-fit:contain;' +    /* cover → contain: kırpma yok */
        'background:#000;' +
        'z-index:0;' +
      '}' +

      /* Siyah letterbox alanlarını kapatan blur background */
      '.vi-video-type::before{' +
        'content:"";' +
        'position:absolute;inset:0;z-index:0;' +
        'background:radial-gradient(ellipse 80% 80% at 50% 50%,' +
          'rgba(10,8,5,0.85) 0%,rgba(2,2,2,1) 100%);' +
      '}' +

      /* Cinematic veil — dark gradient over video */
      '.vi-veil{' +
        'position:absolute;inset:0;z-index:1;' +
        'background:linear-gradient(' +
          '180deg,' +
          'rgba(0,0,0,0.25) 0%,' +
          'rgba(0,0,0,0.08) 35%,' +
          'rgba(0,0,0,0.08) 60%,' +
          'rgba(0,0,0,0.72) 100%' +
        ');' +
      '}' +

      /* Content column */
      '.vi-content{' +
        'position:absolute;inset:0;z-index:2;' +
        'display:flex;flex-direction:column;' +
        'align-items:center;justify-content:flex-end;' +
        'padding-bottom:64px;' +
      '}' +

      /* Couple names */
      '.vi-couple-names{' +
        'font-family:\'Cormorant Garamond\',Georgia,serif;' +
        'font-size:28px;font-weight:400;' +
        'letter-spacing:0.12em;' +
        'color:rgba(255,255,255,0.92);' +
        'text-align:center;' +
        'line-height:1.2;' +
        'margin-bottom:12px;' +
        'animation:viNamesIn 1.2s cubic-bezier(.22,1,.36,1) .4s both;' +
      '}' +
      /* viNamesIn: sadece opacity — transform kullanmıyor.
         Aksi hâlde vi-pos-center-center gibi konumların translate(-50%,-50%)'si silinir. */
      '@keyframes viNamesIn{from{opacity:0}to{opacity:1}}' +

      /* Gold rule */
      '.vi-gold-rule,.vi-overlay-rule{' +
        'width:60px;height:1px;' +
        'background:rgba(201,168,76,0.70);' +
        'margin:8px auto 10px;' +
        'animation:viNamesIn 1s ease .7s both;' +
      '}' +

      /* Tap area */
      /* vi-tap-area konumu JS ile hesaplanır (repositionTapOnVideo) */
      '.vi-tap-area{' +
        'position:absolute;left:0;right:0;' +
        'display:flex;flex-direction:column;align-items:center;gap:10px;' +
        'pointer-events:none;' +
      '}' +
      '@keyframes viTapIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}' +

      '.vi-tap-text{' +
        'font-family:\'Inter\',sans-serif;' +
        'font-size:11px;font-weight:500;letter-spacing:0.18em;text-transform:uppercase;' +
        'color:rgba(255,255,255,0.68);text-align:center;' +
      '}' +

      '.vi-tap-ripple{' +
        'width:40px;height:40px;border-radius:50%;' +
        'background:rgba(201,168,76,0.18);' +
        'border:1px solid rgba(201,168,76,0.45);' +
        'display:flex;align-items:center;justify-content:center;' +
        'color:rgba(201,168,76,0.85);' +
        'animation:tapPulse 2.2s ease-in-out infinite;' +
      '}' +
      '@keyframes tapPulse{' +
        '0%,100%{transform:scale(1);box-shadow:0 0 0 0 rgba(201,168,76,0.3)}' +
        '50%{transform:scale(1.08);box-shadow:0 0 0 8px rgba(201,168,76,0)}' +
      '}' +

      /* ─── İSİM & TARİH OVERLAY ─── */

      /* Ortak wrapper — hepsi absolute, farklı pozisyonlar */
      '.vi-text-wrap{' +
        'position:absolute;' +
        'display:flex;flex-direction:column;align-items:center;gap:5px;' +
        'text-align:center;padding:0 20px;' +
        'animation:viNamesIn 1.2s cubic-bezier(.22,1,.36,1) .5s both;' +
        'pointer-events:none;' +
        'max-width:85%;' +
      '}' +

      /* ── 2 Eksen Konum (vPos-hPos kombinasyonu) ── */
      /* Üst satır */
      '.vi-pos-top-left   {top:10%;left:5%;transform:none;text-align:left;align-items:flex-start;}' +
      '.vi-pos-top-center {top:10%;left:50%;transform:translateX(-50%);}' +
      '.vi-pos-top-right  {top:10%;right:5%;transform:none;text-align:right;align-items:flex-end;}' +
      /* Orta satır */
      '.vi-pos-center-left  {top:50%;left:5%;transform:translateY(-50%);text-align:left;align-items:flex-start;}' +
      '.vi-pos-center-center{top:50%;left:50%;transform:translate(-50%,-50%);}' +
      '.vi-pos-center-right {top:50%;right:5%;transform:translateY(-50%);text-align:right;align-items:flex-end;}' +
      /* Alt satır */
      '.vi-pos-bottom-left  {bottom:110px;left:5%;transform:none;text-align:left;align-items:flex-start;}' +
      '.vi-pos-bottom-center{bottom:110px;left:50%;transform:translateX(-50%);}' +
      '.vi-pos-bottom-right {bottom:110px;right:5%;transform:none;text-align:right;align-items:flex-end;}' +

      /* Ayna tipi — orta konuma zorla ve boyutu sınırla */
      '.vi-mirror-type .vi-text-wrap{' +
        'top:38%!important;left:50%!important;' +
        'transform:translate(-50%,-50%)!important;' +
        'max-width:58%;' +
      '}' +

      /* İSİMLER — BÜYÜK HARF, belirgin boyut */
      '.vi-overlay-names{' +
        'font-weight:400;letter-spacing:0.12em;' +
        'text-transform:uppercase;' +
        'color:rgba(255,255,255,0.95);' +
        'line-height:1.2;' +
        /* Büyük ekranda büyük, küçük ekranda makul */
        'font-size:clamp(22px,6vw,42px);' +
        'text-shadow:' +
          '0 2px 20px rgba(0,0,0,0.60),' +
          '0 0  40px rgba(0,0,0,0.35);' +
      '}' +
      /* Ayna içinde daha küçük — sığsın */
      '.vi-mirror-type .vi-overlay-names{' +
        'font-size:clamp(13px,3.5vw,20px);' +
        'text-shadow:0 0 12px rgba(255,255,255,0.25),0 1px 8px rgba(0,0,0,0.45);' +
      '}' +

      /* TARİH */
      '.vi-overlay-date{' +
        'font-size:clamp(10px,2.5vw,15px);font-weight:500;' +
        'letter-spacing:0.22em;text-transform:uppercase;' +
        'color:rgba(201,168,76,0.90);' +
        'text-shadow:0 1px 10px rgba(0,0,0,0.50);' +
        'animation:viNamesIn 1s ease .8s both;' +
      '}' +
      '.vi-mirror-type .vi-overlay-date{font-size:clamp(8px,2vw,11px);}' +

      /* Old tap prompt (CSS intros) */
      '.vi-tap-prompt{' +
        'position:absolute;bottom:48px;left:0;right:0;' +
        'display:flex;flex-direction:column;align-items:center;gap:10px;' +
        'animation:viTapBounce 1.8s ease-in-out infinite;' +
      '}' +
      '.vi-tap-text.old{' +
        'font-family:Cormorant Garamond,Georgia,serif;' +
        'font-size:13px;font-weight:400;letter-spacing:.14em;' +
        'color:rgba(245,237,220,.75);text-align:center;' +
      '}' +
      '.vi-tap-icon{color:rgba(201,168,76,.65);}' +
      '@keyframes viTapBounce{' +
        '0%,100%{transform:translateY(0);opacity:.75}' +
        '50%{transform:translateY(-6px);opacity:1}' +
      '}'
    );
  }

  function buildIntroCSSByType(introId, introType) {
    if (introType === 'video') {
      return '.vi-video-type{background:#000;}';
    }
    return buildCSSTheme(introId);
  }

  /* ── CSS animation themes (non-video intros) ── */
  function buildCSSTheme(introId) {
    /* same as previous buildIntroCSS switch, just the theme part */
    switch (introId) {
      case 'royal-seal': return '/* Royal Seal CSS theme */' +
          '.vi-royal-seal{background:radial-gradient(ellipse at 50% 50%,#1e1508 0%,#080604 100%);}';
      case 'ivory-gates': return '.vi-ivory-gates{background:linear-gradient(180deg,#140e08 0%,#0a0806 100%);}' +
          '.vi-gates-wrap{position:absolute;inset:0;display:flex;}' +
          '.vi-gate-panel{flex:1;background:linear-gradient(180deg,rgba(245,237,220,.10) 0%,rgba(245,237,220,.04) 100%);border:1px solid rgba(201,168,76,.18);}' +
          '.vi-gp--l{animation:gateOpenL 1.2s cubic-bezier(.22,1,.36,1) 2.5s forwards;}' +
          '.vi-gp--r{animation:gateOpenR 1.2s cubic-bezier(.22,1,.36,1) 2.5s forwards;}' +
          '@keyframes gateOpenL{to{transform:translateX(-100%)}}' +
          '@keyframes gateOpenR{to{transform:translateX(100%)}}' +
          '.vi-gate-light-ray{position:absolute;left:50%;top:0;bottom:0;width:2px;transform:translateX(-50%);background:linear-gradient(180deg,rgba(201,168,76,0) 0%,rgba(201,168,76,.55) 50%,rgba(201,168,76,0) 100%);animation:rayGlow 2.5s ease-in-out infinite;}' +
          '@keyframes rayGlow{0%,100%{opacity:.4}50%{opacity:1}}';
      case 'golden-vow': return '.vi-golden-vow{background:linear-gradient(160deg,#150e08 0%,#0c0907 100%);}' +
          '.vi-vow-wrap{position:absolute;inset:0;}' +
          '.vi-vow-bg{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 80%,rgba(201,168,76,.12) 0%,transparent 60%);}' +
          '.vi-vow-silhouettes{position:absolute;bottom:20%;left:50%;transform:translateX(-50%);width:48px;height:64px;background:rgba(201,168,76,.18);border-radius:24px 24px 8px 8px;animation:vowEntrance 1.4s cubic-bezier(.22,1,.36,1) .5s both;}' +
          '@keyframes vowEntrance{from{opacity:0;transform:translateX(-50%) translateY(20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}' +
          '.vi-vow-glow{position:absolute;bottom:18%;left:50%;transform:translateX(-50%);width:80px;height:40px;background:radial-gradient(ellipse,rgba(201,168,76,.25) 0%,transparent 70%);animation:vowGlow 2.5s ease-in-out infinite;}' +
          '@keyframes vowGlow{0%,100%{opacity:.4}50%{opacity:.8}}';
      case 'ballroom': return '.vi-ballroom{background:radial-gradient(ellipse at 50% 30%,#1c1108 0%,#080507 70%);}' +
          '.vi-ball-wrap{position:absolute;inset:0;}' +
          '.vi-ball-bg{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 10%,rgba(201,168,76,.15) 0%,transparent 55%);}' +
          '.vi-chandelier{position:absolute;top:14%;left:50%;transform:translateX(-50%);width:60px;height:60px;}' +
          '.vi-chandelier::before{content:"";position:absolute;top:0;left:50%;transform:translateX(-50%);width:1px;height:20px;background:rgba(201,168,76,.50);}' +
          '.vi-chandelier::after{content:"";position:absolute;top:20px;left:50%;transform:translateX(-50%);width:40px;height:40px;border-radius:50%;border:1px solid rgba(201,168,76,.40);background:radial-gradient(circle,rgba(201,168,76,.30) 0%,transparent 70%);animation:chandelierGlow 2s ease-in-out infinite;}' +
          '@keyframes chandelierGlow{0%,100%{opacity:.6}50%{opacity:1}}' +
          '.vi-particle-field{position:absolute;inset:0;background-image:radial-gradient(circle,rgba(201,168,76,.55) 1px,transparent 1px);background-size:24px 24px;animation:particleDrift 8s linear infinite;opacity:.18;}' +
          '@keyframes particleDrift{from{background-position:0 0}to{background-position:24px 24px}}';
      default: return '.vi-overlay{background:#0a0806;}';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', notifyReady);
  } else {
    notifyReady();
  }

  /* ══════════════════════════════════════════════════════════
     WATERMARK INJECTION
  ══════════════════════════════════════════════════════════ */

  function injectWatermark() {
    if (document.getElementById('visora-wm')) return;

    var style = document.createElement('style');
    style.textContent = [
      '#visora-wm {',
      '  position: fixed; inset: 0; z-index: 99997;',
      '  pointer-events: none; user-select: none;',
      /* Filigran opaklığı artırıldı: 0.06 → 0.18 — artık açık davetiyelerde de görünür */
      '  background-image: url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'120\' height=\'120\'%3E%3Ctext x=\'5\' y=\'65\' fill=\'rgba(140%2C110%2C60%2C0.18)\' font-family=\'Georgia%2Cserif\' font-style=\'italic\' font-size=\'15\' font-weight=\'500\' letter-spacing=\'4\' transform=\'rotate(-30 60 60)\'%3EVISORA%3C%2Ftext%3E%3C%2Fsvg%3E");',
      '  background-repeat: repeat;',
      '}'
    ].join('');
    document.head.appendChild(style);

    var wm = document.createElement('div');
    wm.id = 'visora-wm';
    wm.setAttribute('aria-hidden', 'true');
    document.body.appendChild(wm);
  }

  /* ══════════════════════════════════════════════════════════
     BASIC SECURITY
  ══════════════════════════════════════════════════════════ */

  function applyBasicSecurity() {
    document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    document.addEventListener('dragstart', function (e) {
      if (e.target.tagName === 'IMG' ||
          e.target.closest('.gallery-card, .gallery-item, [data-visora-gallery-bg]')) {
        e.preventDefault();
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && 'IJC'.includes((e.key||'').toUpperCase())) ||
          (e.ctrlKey && 'US'.includes((e.key||'').toUpperCase()))) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    });
    var s = document.createElement('style');
    s.textContent = '.hero-card, .cover-wedding, .cover-henna, .hero-bride, .hero-groom, ' +
      '.gallery-card, .gallery-track { -webkit-user-select:none; user-select:none; } ' +
      'img { pointer-events:none; }';
    document.head.appendChild(s);
  }

  /* ══════════════════════════════════════════════════════════
     GLOBAL MEDYA ARAÇLARI
     Tüm davetiyeler bu yardımcıları kullanabilir.
     window.VISORA_MEDIA  — silinebilir medya kartı
     window.VISORA_AUDIO  — ses kayıt motoru
  ══════════════════════════════════════════════════════════ */

  /* ── Silinebilir medya kartı ── */
  window.VISORA_MEDIA = {
    /**
     * createCard(container, url, type)
     * container : DOM element (grid/list)
     * url       : object URL veya kaynak URL
     * type      : 'image' | 'video' | 'audio' | 'note'
     * noteText  : sadece type==='note' için metin
     */
    createCard: function (container, url, type, noteText) {
      if (!container) return;

      var card = document.createElement('div');
      card.className = 'visora-media-card';
      card.style.cssText =
        'position:relative;border-radius:6px;overflow:visible;' +
        'border:1px solid rgba(200,169,110,0.20);background:rgba(0,0,0,0.04);';

      if (type === 'image') {
        var img = document.createElement('img');
        img.src = url; img.alt = '';
        img.style.cssText = 'width:100%;aspect-ratio:1;object-fit:cover;display:block;border-radius:5px;';
        card.appendChild(img);

      } else if (type === 'video') {
        var vid = document.createElement('video');
        vid.src = url; vid.controls = true; vid.muted = true;
        vid.style.cssText = 'width:100%;aspect-ratio:1;object-fit:cover;display:block;border-radius:5px;';
        card.appendChild(vid);

      } else if (type === 'audio') {
        var aud = document.createElement('audio');
        aud.src = url; aud.controls = true;
        aud.style.cssText = 'width:100%;margin:8px 0;padding:4px;';
        var aIcon = document.createElement('div');
        aIcon.style.cssText = 'text-align:center;padding:10px 4px 0;color:rgba(200,169,110,0.70);font-size:22px;';
        aIcon.textContent = '♬';
        card.appendChild(aIcon);
        card.appendChild(aud);

      } else if (type === 'note') {
        var p = document.createElement('p');
        p.style.cssText = 'padding:10px 12px;font-style:italic;font-size:0.9rem;line-height:1.5;color:inherit;';
        p.textContent = noteText || '';
        card.appendChild(p);
      }

      /* ✕ delete button */
      var del = document.createElement('button');
      del.textContent = '✕';
      del.setAttribute('aria-label', 'Sil');
      del.style.cssText =
        'position:absolute;top:-6px;right:-6px;' +
        'width:20px;height:20px;border-radius:50%;' +
        'background:#1a1208;border:1px solid rgba(200,169,110,0.30);' +
        'color:#c8a96e;font-size:9px;line-height:1;' +
        'display:flex;align-items:center;justify-content:center;' +
        'cursor:pointer;opacity:0;transition:opacity 0.18s,background 0.18s;z-index:5;';

      card.addEventListener('mouseenter', function () { del.style.opacity = '1'; });
      card.addEventListener('mouseleave', function () { del.style.opacity = '0'; });
      del.addEventListener('click', function (e) {
        e.stopPropagation();
        card.remove();
        if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
      });
      del.addEventListener('mouseenter', function () { this.style.background='#b43232';this.style.color='#fff'; });
      del.addEventListener('mouseleave', function () { this.style.background='#1a1208';this.style.color='#c8a96e'; });

      card.appendChild(del);
      container.appendChild(card);
      return card;
    }
  };

  /* ── Ses kayıt motoru ── */
  window.VISORA_AUDIO = (function () {
    var _recorder = null, _stream = null, _chunks = [], _blob = null;
    var _interval = null, _secs = 0;
    var _onStop = null;

    function pad(n) { return n < 10 ? '0' + n : '' + n; }

    return {
      /**
       * start(onTick, onStop)
       * onTick(mm:ss) — her saniyede çağrılır
       * onStop(blob)  — kayıt bitince blob ile çağrılır
       */
      start: function (onTick, onStop) {
        _onStop = onStop;
        _chunks = []; _secs = 0;
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(function (stream) {
            _stream = stream;
            _recorder = new MediaRecorder(stream);
            _recorder.ondataavailable = function (e) { if (e.data.size > 0) _chunks.push(e.data); };
            _recorder.onstop = function () {
              _blob = new Blob(_chunks, { type: 'audio/webm' });
              if (_onStop) _onStop(_blob);
            };
            _recorder.start();
            _interval = setInterval(function () {
              _secs++;
              if (onTick) onTick(pad(Math.floor(_secs/60)) + ':' + pad(_secs%60));
            }, 1000);
          })
          .catch(function () {
            alert('Mikrofon erişimi gerekli. Lütfen tarayıcı izinlerini kontrol edin.');
          });
      },

      stop: function () {
        if (_interval) clearInterval(_interval);
        if (_recorder && _recorder.state !== 'inactive') _recorder.stop();
        if (_stream) _stream.getTracks().forEach(function (t) { t.stop(); });
      },

      reset: function () {
        this.stop();
        _recorder = null; _stream = null; _chunks = []; _blob = null;
        _interval = null; _secs = 0;
      },

      getBlob: function () { return _blob; }
    };
  })();

  /* ══════════════════════════════════════════════════════════
     DİL GEÇİŞİ — applyLangSwitch
     TR → EN / EN → TR davetiye içi metin değiştirici.
  ══════════════════════════════════════════════════════════ */

  var _LANG_TR_TO_EN = {
    'TAKVİME EKLE':'ADD TO CALENDAR', 'Takvime Ekle':'Add to Calendar',
    'KONUMA GİT':'GET DIRECTIONS',    'Konuma Git':'Get Directions',
    'YOL TARİF AL':'Get Directions',  'Yol Tarif Al':'Get Directions',
    'HARITADA AÇ':'OPEN IN MAPS',     'Haritada Aç':'Open in Maps',
    'PROGRAM':'PROGRAM',
    'Düğün Akışı':'Wedding Schedule', 'Kına Akışı':'Henna Schedule',
    'KONUM':'LOCATION',               'Konum':'Location',
    'GALERİ':'GALLERY',               'Galeri':'Gallery',
    'DÜĞÜN MEKANI':'WEDDING VENUE',   'Düğün Mekanı':'Wedding Venue',
    'KINA MEKANI':'HENNA VENUE',
    'Gelin Ailesi':"Bride's Family",  'Damat Ailesi':"Groom's Family",
    'GELİN AİLESİ':"BRIDE'S FAMILY", 'DAMAT AİLESİ':"GROOM'S FAMILY",
    'GÜN':'DAYS',   'SAAT':'HRS',  'DAKİKA':'MIN',  'SANİYE':'SEC',
    'Anı Bırak':'Leave a Memory',     'Fotoğraf Yükle':'Upload Photo',
    'Video Yükle':'Upload Video',     'Ses Kaydı':'Voice Message',
    'Mesaj Yaz':'Write a Note',       'Gönder':'Send',
    'Katılıyorum':'Attending',        'Katılamıyorum':'Not Attending',
    'PARTY COUNTDOWN':'PARTY COUNTDOWN',
    'BRIDE TO BE':'BRIDE TO BE',      'GROOM NIGHT':'GROOM NIGHT',
    'Instagram\'da Bizi Takip Edin':'Follow Us on Instagram',
    'Partiye Katıl':'Join the Party', 'Davetiyeyi Görüntüle':'View Invitation',
    'Müziği Aç':'Play Music',         'Müziği Kapat':'Pause Music',
    'Bu mutlu günümüzde sizleri de aramızda görmekten mutluluk duyarız.':
      'We would be honored to have you join us on our special day.',
    'Hayatımızın en özel gününde mutluluğumuzu paylaşmanızdan onur duyarız.':
      'It would be our honor to share the joy of our most special day with you.',
    'Birlikteliğimizi taçlandıracağımız bu özel günde sizleri de aramızda görmek isteriz.':
      'We would love to have you with us as we celebrate our union.',
  };

  var _LANG_EN_TO_TR = (function () {
    var m = {};
    Object.keys(_LANG_TR_TO_EN).forEach(function (k) { m[_LANG_TR_TO_EN[k]] = k; });
    return m;
  })();

  var _currentDocLang = 'tr';

  function applyLangSwitch(lang) {
    if (lang === _currentDocLang) return;
    var map = lang === 'en' ? _LANG_TR_TO_EN : _LANG_EN_TO_TR;
    _currentDocLang = lang;
    translateTextNodes(document.body, map);
    document.documentElement.lang = lang;
  }

  function translateTextNodes(root, map) {
    if (!root) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    var node, queue = [];
    while ((node = walker.nextNode())) {
      var pTag = node.parentNode && node.parentNode.tagName;
      if (pTag === 'SCRIPT' || pTag === 'STYLE') continue;
      var t = node.textContent.trim();
      if (t && map[t] !== undefined) queue.push({ n: node, v: node.textContent.replace(t, map[t]) });
    }
    queue.forEach(function (r) { r.n.textContent = r.v; });
  }

})();
