/* ============================================================
   wedding-slot.js — Saray / DÜĞÜN sekmesi
   "Slot Machine" mekaniğinin Saray'a özel, bağımsız bir kopyası.
   Orijinal "davetiye websiteleri/Slot Machine/" şablonunun
   script.js'ine dokunmaz — tamamen ayrı bir dosyadır.
   ============================================================ */
(function () {
  'use strict';

  function parseTurkishDate(dateText) {
    const months = {
      OCAK: "01", ŞUBAT: "02", SUBAT: "02", MART: "03", NİSAN: "04", NISAN: "04",
      MAYIS: "05", HAZİRAN: "06", HAZIRAN: "06", TEMMUZ: "07", AĞUSTOS: "08", AGUSTOS: "08",
      EYLÜL: "09", EYLUL: "09", EKİM: "10", EKIM: "10", KASIM: "11", ARALIK: "12"
    };
    const clean = String(dateText || "").trim().toUpperCase();
    const numeric = clean.match(/(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})/);
    if (numeric) {
      return { day: numeric[1].padStart(2, "0"), month: numeric[2].padStart(2, "0"), year: numeric[3].slice(-2) };
    }
    const written = clean.match(/(\d{1,2})\s+([A-ZÇĞİÖŞÜ]+)\s+(\d{2,4})/);
    if (written) {
      return { day: written[1].padStart(2, "0"), month: months[written[2]] || "01", year: written[3].slice(-2) };
    }
    return { day: "14", month: "09", year: "26" };
  }

  function getDateParts() {
    const dateEl = document.querySelector('[data-visora-field="event-date-wedding"]');
    return parseTurkishDate(dateEl?.textContent || "14 EYLÜL 2026");
  }

  const REEL_STEP = 28;
  const REEL_ARC  = 2.5;

  function getDaysInMonth(month, year) {
    const fy = Number(year) < 70 ? 2000 + Number(year) : 1900 + Number(year);
    return new Date(fy, Number(month), 0).getDate();
  }
  function buildDayItems(month, year) { return Array.from({ length: getDaysInMonth(month, year) }, (_, i) => i + 1); }
  function buildMonthItems() { return Array.from({ length: 12 }, (_, i) => i + 1); }
  function buildYearItems()  { return Array.from({ length: 100 }, (_, i) => i); }

  function renderReel3D(el, items, drumOffset) {
    if (!el) return;
    const n = items.length;
    const h = el.getBoundingClientRect().height || 120;
    const R = h * 0.40;
    el.innerHTML = "";
    const iMin = Math.ceil(drumOffset - REEL_ARC);
    const iMax = Math.floor(drumOffset + REEL_ARC);
    for (let i = iMin; i <= iMax; i++) {
      const slot = i - drumOffset;
      const angleDeg = slot * REEL_STEP;
      const rad = angleDeg * Math.PI / 180;
      const sy = Math.max(0, Math.cos(rad));
      const yPx = R * Math.sin(rad);
      const opacity = Math.max(0, Math.cos(rad * 0.55));
      const isCenter = Math.abs(slot) < 0.5;
      const idx = ((i % n) + n) % n;
      const div = document.createElement("div");
      div.style.cssText = [
        "position:absolute", "left:0", "right:0", "top:50%",
        `transform:translateY(calc(-50% + ${yPx.toFixed(2)}px)) perspective(360px) rotateX(${(-angleDeg).toFixed(2)}deg) scaleY(${sy.toFixed(4)})`,
        "transform-origin:center center",
        `opacity:${opacity.toFixed(3)}`,
        "font-family:'Cinzel',serif",
        `font-size:${isCenter ? "clamp(16px,5.5vw,32px)" : "clamp(8px,2.6vw,17px)"}`,
        `font-weight:${isCenter ? "700" : "400"}`,
        `color:${isCenter ? "#1a0e04" : `rgba(202,160,82,${(opacity * 0.85).toFixed(3)})`}`,
        "text-align:center", "will-change:transform", "pointer-events:none", "letter-spacing:.04em"
      ].join(";");
      div.textContent = String(items[idx]).padStart(2, "0");
      el.appendChild(div);
    }
  }

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function spinReel3D(reelId, items, targetIndex, duration, onDone) {
    const el = document.getElementById(reelId);
    if (!el) { onDone && onDone(); return; }
    const n = items.length;
    const endOffset = 6 * n + targetIndex;
    let startTime = null;
    let cancelled = false;
    function tick(now) {
      if (cancelled) return;
      if (!startTime) startTime = now;
      const t = Math.min((now - startTime) / duration, 1);
      renderReel3D(el, items, easeOutCubic(t) * endOffset);
      if (t < 1) requestAnimationFrame(tick);
      else { renderReel3D(el, items, endOffset); onDone && onDone(); }
    }
    requestAnimationFrame(tick);
    return () => { cancelled = true; };
  }

  function launchGoldConfetti() {
    const container = document.querySelector(".ws-slot-hero");
    if (!container) return;
    const colors = ["#f0d050", "#caa052", "#6a4808", "#fff8e7", "#f3dc9c", "#d4a030"];
    for (let i = 0; i < 65; i++) {
      const el = document.createElement("div");
      el.className = "ws-gold-confetti";
      const size = 3 + Math.random() * 6;
      el.style.cssText = [
        `left:${8 + Math.random() * 84}%`,
        `background:${colors[Math.floor(Math.random() * colors.length)]}`,
        `width:${size}px`, `height:${size}px`,
        `border-radius:${Math.random() > 0.45 ? "50%" : "2px"}`,
        `animation-delay:${Math.floor(Math.random() * 450)}ms`,
        `animation-duration:${1200 + Math.floor(Math.random() * 900)}ms`
      ].join(";");
      container.appendChild(el);
      setTimeout(() => el.remove(), 2800);
    }
  }

  let wsHasStarted = false;
  let wsIsAnimating = false;
  let wsCurrent = { dayItems: [], monthItems: [], yearItems: [], tDay: 0, tMonth: 0, tYear: 0 };

  function showReelZero(reelId) {
    const el = document.getElementById(reelId);
    if (!el) return;
    el.innerHTML = "";
    const div = document.createElement("div");
    div.style.cssText = [
      "position:absolute", "left:0", "right:0", "top:50%", "transform:translateY(-50%)",
      "text-align:center", "font-family:'Cinzel',serif", "font-size:clamp(16px,5.5vw,32px)",
      "font-weight:700", "color:#1a0e04", "letter-spacing:.04em"
    ].join(";");
    div.textContent = "00";
    el.appendChild(div);
  }

  function loadSlotDate() {
    const date = getDateParts();
    const month = parseInt(date.month, 10);
    const year = parseInt(date.year, 10);
    wsCurrent.dayItems = buildDayItems(month, year);
    wsCurrent.monthItems = buildMonthItems();
    wsCurrent.yearItems = buildYearItems();
    wsCurrent.tDay = parseInt(date.day, 10) - 1;
    wsCurrent.tMonth = month - 1;
    wsCurrent.tYear = year;
  }

  function doSpin() {
    if (wsHasStarted || wsIsAnimating) return;
    loadSlotDate();
    wsHasStarted = true;
    wsIsAnimating = true;

    document.getElementById("wsSlotHelper")?.classList.add("is-hidden");

    const snd = document.getElementById("wsSlotSound");
    if (snd) { snd.currentTime = 0; snd.play().catch(() => {}); }

    let done = 0;
    const onDone = () => { if (++done === 3) { wsIsAnimating = false; launchGoldConfetti(); } };

    spinReel3D("ws-reel-day",   wsCurrent.dayItems,   wsCurrent.tDay,   1800, onDone);
    spinReel3D("ws-reel-month", wsCurrent.monthItems, wsCurrent.tMonth, 2400, onDone);
    spinReel3D("ws-reel-year",  wsCurrent.yearItems,  wsCurrent.tYear,  3200, onDone);
  }

  function initWeddingSlot() {
    if (!document.querySelector(".ws-slot-hero")) return;
    loadSlotDate();
    showReelZero("ws-reel-day");
    showReelZero("ws-reel-month");
    showReelZero("ws-reel-year");

    document.getElementById("wsSlotStartBtn")?.addEventListener("click", (e) => {
      e.stopPropagation();
      doSpin();
    });
    document.querySelector(".ws-slot-hero")?.addEventListener("click", doSpin);

    const dateEl = document.querySelector('[data-visora-field="event-date-wedding"]');
    if (dateEl) {
      new MutationObserver(() => {
        if (wsIsAnimating) return;
        loadSlotDate();
        wsHasStarted = false;
        document.getElementById("wsSlotHelper")?.classList.remove("is-hidden");
        showReelZero("ws-reel-day");
        showReelZero("ws-reel-month");
        showReelZero("ws-reel-year");
      }).observe(dateEl, { characterData: true, childList: true, subtree: true });
    }
  }

  /* İsimler uzunsa otomatik küçült (Slot Machine şablonuyla aynı mantık) */
  function fitWsHeroNames() {
    document.querySelectorAll(".ws-hero-names [data-visora-field]").forEach((el) => {
      el.style.fontSize = "";
      const maxWidth = el.parentElement.clientWidth;
      let size = parseFloat(getComputedStyle(el).fontSize);
      const minSize = size * 0.45;
      while (el.scrollWidth > maxWidth && size > minSize) {
        size -= 1;
        el.style.fontSize = size + "px";
      }
    });
  }

  function init() {
    initWeddingSlot();
    fitWsHeroNames();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  window.addEventListener('resize', fitWsHeroNames);

})();
