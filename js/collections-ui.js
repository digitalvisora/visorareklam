/* ============================================================
   VISORA — collections-ui.js
   Shared Card Builder + Momentum Drag Slider
   Exposed as window.VISORA_UI
   Used by: index.html (homepage) + gallery.js (collections page)
   ============================================================ */

(function () {
  'use strict';

  /* ── Language helpers ── */
  function lang() {
    return document.documentElement.getAttribute('lang') ||
           localStorage.getItem('visora-lang') || 'tr';
  }

  function tl(obj, keyBase) {
    var l = lang();
    return obj[keyBase + (l === 'tr' ? 'TR' : 'EN')] || obj[keyBase + 'TR'] || '';
  }

  /* ── Read a field's defaultValue across all segments ── */
  function getFieldDefault(tpl, fieldId) {
    var fm = [];
    if (tpl.segments) {
      tpl.segments.forEach(function (s) { fm = fm.concat(s.fieldMap || []); });
    } else {
      fm = tpl.fieldMap || [];
    }
    for (var i = 0; i < fm.length; i++) {
      if (fm[i].id === fieldId) return fm[i].defaultValue || fm[i].placeholder || '';
    }
    return '';
  }

  /* ── Build the invitation-style overlay for a card ── */
  function buildInvPreview(tpl) {
    var cs = tpl.cardStyle;
    if (!cs) return null;

    var wrap = document.createElement('div');
    wrap.className = 'vs-inv-preview vs-inv--' + cs.theme;

    /* ─ Neon Party: big glowing title → name → date ─ */
    if (cs.theme === 'neon-party') {
      var nTitle = document.createElement('div');
      nTitle.className = 'vs-inv-neon-title';
      nTitle.textContent = cs.invLabel;
      wrap.appendChild(nTitle);

      if (cs.name1Field) {
        var nName = document.createElement('div');
        nName.className = 'vs-inv-name vs-inv-name--neon';
        nName.textContent = getFieldDefault(tpl, cs.name1Field);
        wrap.appendChild(nName);
      }

      if (cs.dateField) {
        var nDate = document.createElement('div');
        nDate.className = 'vs-inv-date';
        nDate.textContent = getFieldDefault(tpl, cs.dateField);
        wrap.appendChild(nDate);
      }
      return wrap;
    }

    /* ─ Shared label (cinematic + kina-split) ─ */
    var label = document.createElement('div');
    label.className = 'vs-inv-label';
    label.textContent = cs.invLabel || '';
    wrap.appendChild(label);

    /* ─ Cinematic: diamond ornament SVG ─ */
    if (cs.theme === 'cinematic') {
      var orn = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      orn.setAttribute('class', 'vs-inv-ornament');
      orn.setAttribute('viewBox', '0 0 120 20');
      orn.innerHTML =
        '<line x1="0" y1="10" x2="46" y2="10" stroke="rgba(198,167,125,0.65)" stroke-width="0.8"/>' +
        '<polygon points="60,3 65,10 60,17 55,10" fill="rgba(198,167,125,0.65)"/>' +
        '<line x1="74" y1="10" x2="120" y2="10" stroke="rgba(198,167,125,0.65)" stroke-width="0.8"/>';
      wrap.appendChild(orn);
    }

    /* ─ Timeless: interlocking rings ornament ─ */
    if (cs.theme === 'timeless') {
      var orn2 = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      orn2.setAttribute('class', 'vs-inv-ornament');
      orn2.setAttribute('viewBox', '0 0 120 20');
      orn2.innerHTML =
        '<line x1="0" y1="10" x2="44" y2="10" stroke="rgba(198,167,125,0.5)" stroke-width="0.7"/>' +
        '<circle cx="56" cy="10" r="5" fill="none" stroke="rgba(198,167,125,0.75)" stroke-width="0.85"/>' +
        '<circle cx="64" cy="10" r="5" fill="none" stroke="rgba(198,167,125,0.75)" stroke-width="0.85"/>' +
        '<line x1="76" y1="10" x2="120" y2="10" stroke="rgba(198,167,125,0.5)" stroke-width="0.7"/>';
      wrap.appendChild(orn2);
    }

    /* ─ Names row ─ */
    var n1 = cs.name1Field ? getFieldDefault(tpl, cs.name1Field) : '';
    var n2 = cs.name2Field ? getFieldDefault(tpl, cs.name2Field) : '';
    var namesEl = document.createElement('div');
    namesEl.className = 'vs-inv-names';
    namesEl.innerHTML =
      '<span class="vs-inv-name">' + n1 + '</span>' +
      (n2
        ? '<span class="vs-inv-amp">' + (cs.ampText || '&amp;') + '</span>' +
          '<span class="vs-inv-name">' + n2 + '</span>'
        : '');
    wrap.appendChild(namesEl);

    /* ─ Kina-split: two labelled dates ─ */
    if (cs.theme === 'kina-split') {
      var dWrap = document.createElement('div');
      dWrap.className = 'vs-inv-dates';
      if (cs.dateField) {
        var d1 = document.createElement('div');
        d1.className = 'vs-inv-date';
        d1.innerHTML = '<span class="vs-inv-date-label">DÜĞÜN</span>' +
                       getFieldDefault(tpl, cs.dateField);
        dWrap.appendChild(d1);
      }
      if (cs.date2Field) {
        var d2 = document.createElement('div');
        d2.className = 'vs-inv-date vs-inv-date--henna';
        d2.innerHTML = '<span class="vs-inv-date-label">KINA</span>' +
                       getFieldDefault(tpl, cs.date2Field);
        dWrap.appendChild(d2);
      }
      wrap.appendChild(dWrap);
      return wrap;
    }

    /* ─ Cinematic: single date ─ */
    if (cs.dateField) {
      var dEl = document.createElement('div');
      dEl.className = 'vs-inv-date';
      dEl.textContent = getFieldDefault(tpl, cs.dateField);
      wrap.appendChild(dEl);
    }

    return wrap;
  }

  /* ── Localized button label (falls back to plain TR/EN if i18n.js absent) ── */
  function ctaText(key, fallbackTR, fallbackEN) {
    if (window.VISORA_I18N) return window.VISORA_I18N.t(key);
    return lang() === 'tr' ? fallbackTR : fallbackEN;
  }

  /* ── (Re)apply name/category/description/button text to a card ── */
  function applyCardTexts(card, tpl) {
    var name = tl(tpl, 'name');
    var cat  = tl(tpl, 'cat');
    var desc = tl(tpl, 'desc');
    card.setAttribute('data-cat', cat);

    var catEl  = card.querySelector('.vs-card-cat');
    var nameEl = card.querySelector('.vs-card-name');
    var descEl = card.querySelector('.vs-card-desc');
    var demoEl = card.querySelector('.vs-btn-demo');
    var createEl = card.querySelector('.vs-btn-create');

    if (catEl)  catEl.textContent  = cat;
    if (nameEl) nameEl.textContent = name;
    if (descEl) descEl.textContent = desc || '';
    if (demoEl)   demoEl.textContent   = ctaText('card.cta.demo',   'Demo', 'Demo');
    if (createEl) createEl.textContent = ctaText('card.cta.create', 'Oluştur', 'Create');
  }

  /* ── Build one portrait card ── */
  function buildCard(tpl) {
    var card = document.createElement('div');
    card.className = 'vs-card';
    if (tpl.cardStyle && tpl.cardStyle.theme) {
      card.classList.add('vs-card--' + tpl.cardStyle.theme);
    }
    card.setAttribute('data-id', tpl.id);

    /* Cover image — theme-aware */
    var cs = tpl.cardStyle;
    var bgDark  = (cs && (cs.kolBg        || cs.bgUrl)) || tpl._thumbUrl;
    var bgLight = (cs && (cs.kolBgLight   || cs.kolBg || cs.bgUrl)) || tpl._thumbUrl;
    var isDark  = document.documentElement.getAttribute('data-theme') === 'dark';
    var bgSrc   = isDark ? bgDark : bgLight;
    var img = document.createElement('div');
    img.className = 'vs-card-img';
    img.style.backgroundImage = 'url("' + bgSrc + '")';
    if (bgDark !== bgLight) {
      img.setAttribute('data-bg-dark',  bgDark);
      img.setAttribute('data-bg-light', bgLight);
    }

    /* Gradient overlay */
    var overlay = document.createElement('div');
    overlay.className = 'vs-card-overlay';

    /* Gold shine layer */
    var shine = document.createElement('div');
    shine.className = 'vs-card-shine';

    /* Badge */
    if (tpl.badge) {
      var badge = document.createElement('div');
      badge.className = 'vs-card-badge';
      badge.textContent = tpl.badge;
      card.appendChild(badge);
    }

    /* Info body */
    var body = document.createElement('div');
    body.className = 'vs-card-body';
    body.innerHTML =
      '<span class="vs-card-cat"></span>' +
      '<h3 class="vs-card-name"></h3>' +
      '<p class="vs-card-desc"></p>' +
      '<div class="vs-card-actions">' +
        '<a href="' + tpl._demoUrl + '" target="_blank" rel="noopener" ' +
            'class="vs-card-btn vs-btn-demo"></a>' +
        '<a href="' + tpl._createUrl + '" ' +
            'class="vs-card-btn vs-btn-create"></a>' +
      '</div>';

    card.appendChild(img);
    card.appendChild(overlay);
    card.appendChild(shine);
    card.appendChild(body);

    applyCardTexts(card, tpl);

    /* Mobile tap: toggle vs-active + center */
    card.addEventListener('click', function (e) {
      if (e.target.closest('a')) return;
      if (window.innerWidth >= 1024) return;
      var isActive = card.classList.contains('vs-active');
      document.querySelectorAll('.vs-card.vs-active').forEach(function (c) {
        c.classList.remove('vs-active');
      });
      if (!isActive) {
        card.classList.add('vs-active');
        var slider = card.closest('.vs-slider');
        if (slider) centerCard(card, slider);
      }
    });

    return card;
  }

  /* ── Smoothly center a card in its slider ── */
  function centerCard(card, slider) {
    var sliderRect = slider.getBoundingClientRect();
    var cardRect   = card.getBoundingClientRect();
    var targetLeft = slider.scrollLeft + cardRect.left - sliderRect.left
                     - (sliderRect.width - cardRect.width) / 2;
    slider.scrollTo({ left: targetLeft, behavior: 'smooth' });
  }

  /* ── Add momentum drag to a .vs-slider element ── */
  function initDrag(slider) {
    var dragging = false;
    var moved    = false;
    var startX   = 0;
    var scrollL  = 0;
    var velX     = 0;
    var prevX    = 0;
    var prevT    = 0;
    var rafId    = null;

    function stop() {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    }

    function coast() {
      if (Math.abs(velX) < 0.4) { rafId = null; return; }
      slider.scrollLeft += velX;
      velX *= 0.91;
      rafId = requestAnimationFrame(coast);
    }

    /* ── Mouse ── */
    slider.addEventListener('mousedown', function (e) {
      if (e.button !== 0) return;
      dragging = true;
      moved    = false;
      startX   = e.clientX;
      scrollL  = slider.scrollLeft;
      velX     = 0;
      prevX    = e.clientX;
      prevT    = Date.now();
      slider.classList.add('vs-dragging');
      stop();
    });

    document.addEventListener('mousemove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      slider.scrollLeft = scrollL - dx;
      var now = Date.now();
      velX = -(e.clientX - prevX) / Math.max(now - prevT, 1) * 14;
      prevX = e.clientX;
      prevT = now;
    });

    document.addEventListener('mouseup', function () {
      if (!dragging) return;
      dragging = false;
      slider.classList.remove('vs-dragging');
      if (moved) rafId = requestAnimationFrame(coast);
    });

    /* Block click-through after a drag */
    slider.addEventListener('click', function (e) {
      if (moved) { e.stopPropagation(); moved = false; }
    }, true);

    /* ── Touch ── */
    var tSX = 0, tSL = 0, tVX = 0, tPX = 0, tPT = 0;

    slider.addEventListener('touchstart', function (e) {
      var t = e.touches[0];
      tSX = t.clientX; tSL = slider.scrollLeft;
      tVX = 0; tPX = t.clientX; tPT = Date.now();
      stop();
    }, { passive: true });

    slider.addEventListener('touchmove', function (e) {
      var t = e.touches[0];
      slider.scrollLeft = tSL - (t.clientX - tSX);
      var now = Date.now();
      tVX = -(t.clientX - tPX) / Math.max(now - tPT, 1) * 14;
      tPX = t.clientX; tPT = now;
    }, { passive: true });

    slider.addEventListener('touchend', function () {
      velX = tVX;
      rafId = requestAnimationFrame(coast);
    }, { passive: true });
  }

  /* ── Build a complete slider from an array of templates ── */
  function buildSlider(templates) {
    var slider = document.createElement('div');
    slider.className = 'vs-slider';
    templates.forEach(function (tpl) {
      slider.appendChild(buildCard(tpl));
    });
    initDrag(slider);
    return slider;
  }

  /* ── Auto-init homepage slider ── */
  function initHome() {
    var mount = document.getElementById('homeSliderMount');
    if (!mount) return;
    var templates = window.VISORA_TEMPLATES || [];
    if (!templates.length) return;
    mount.innerHTML = '';
    mount.appendChild(buildSlider(templates));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHome);
  } else {
    initHome();
  }

  /* ── Re-render all rendered cards' text in the active language ── */
  function refreshAllCardTexts() {
    var templates = window.VISORA_TEMPLATES || [];
    document.querySelectorAll('.vs-card[data-id]').forEach(function (card) {
      var id  = card.getAttribute('data-id');
      var tpl = templates.filter(function (t) { return t.id === id; })[0];
      if (tpl) applyCardTexts(card, tpl);
    });
  }

  /* ── Watch theme + language attribute changes ── */
  if (window.MutationObserver) {
    new MutationObserver(function (mutations) {
      var themeChanged = mutations.some(function (m) { return m.attributeName === 'data-theme'; });
      var langChanged  = mutations.some(function (m) { return m.attributeName === 'lang'; });

      if (themeChanged) {
        var dark = document.documentElement.getAttribute('data-theme') === 'dark';
        document.querySelectorAll('.vs-card-img[data-bg-dark]').forEach(function (el) {
          el.style.backgroundImage = 'url("' + (dark ? el.getAttribute('data-bg-dark') : el.getAttribute('data-bg-light')) + '")';
        });
      }
      if (langChanged) refreshAllCardTexts();
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'lang'] });
  }

  /* ── Public API ── */
  window.VISORA_UI = {
    buildCard:   buildCard,
    buildSlider: buildSlider,
    initDrag:    initDrag,
    lang:        lang,
    tl:          tl
  };

})();
