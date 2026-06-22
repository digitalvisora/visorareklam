/* TARİH OKUMA */

function parseTurkishDate(dateText) {
  const months = {
    OCAK: "01",
    ŞUBAT: "02",
    SUBAT: "02",
    MART: "03",
    NİSAN: "04",
    NISAN: "04",
    MAYIS: "05",
    HAZİRAN: "06",
    HAZIRAN: "06",
    TEMMUZ: "07",
    AĞUSTOS: "08",
    AGUSTOS: "08",
    EYLÜL: "09",
    EYLUL: "09",
    EKİM: "10",
    EKIM: "10",
    KASIM: "11",
    ARALIK: "12"
  };

  const clean = String(dateText || "").trim().toUpperCase();

  const numeric = clean.match(/(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})/);
  if (numeric) {
    return {
      day: numeric[1].padStart(2, "0"),
      month: numeric[2].padStart(2, "0"),
      year: numeric[3].slice(-2)
    };
  }

  const written = clean.match(/(\d{1,2})\s+([A-ZÇĞİÖŞÜ]+)\s+(\d{2,4})/);
  if (written) {
    return {
      day: written[1].padStart(2, "0"),
      month: months[written[2]] || "01",
      year: written[3].slice(-2)
    };
  }

  return {
    day: "14",
    month: "09",
    year: "26"
  };
}

function getDateParts() {
  const dateEl = document.querySelector('[data-visora-field="event-date"]');
  return parseTurkishDate(dateEl?.textContent || "14 EYLÜL 2026");
}

function getEventDateObject() {
  const parts = getDateParts();
  const fullYear = Number(parts.year) < 70 ? 2000 + Number(parts.year) : 1900 + Number(parts.year);

  return new Date(`${fullYear}-${parts.month}-${parts.day}T20:00:00`);
}

/* SLOT MACHINE 3D */

const REEL_STEP = 28;   // degrees between adjacent drum items
const REEL_ARC  = 2.5;  // visible items on each side of center

function getDaysInMonth(month, year) {
  const fy = Number(year) < 70 ? 2000 + Number(year) : 1900 + Number(year);
  return new Date(fy, Number(month), 0).getDate();
}

function buildDayItems(month, year) {
  return Array.from({ length: getDaysInMonth(month, year) }, (_, i) => i + 1);
}

function buildMonthItems() {
  return Array.from({ length: 12 }, (_, i) => i + 1);
}

function buildYearItems() {
  return Array.from({ length: 100 }, (_, i) => i);
}

function renderReel3D(el, items, drumOffset) {
  if (!el) return;
  const n = items.length;
  const h = el.getBoundingClientRect().height || 120;
  const R = h * 0.40;

  el.innerHTML = "";

  const iMin = Math.ceil(drumOffset - REEL_ARC);
  const iMax = Math.floor(drumOffset + REEL_ARC);

  for (let i = iMin; i <= iMax; i++) {
    const slot    = i - drumOffset;                     // 0 = center
    const angleDeg = slot * REEL_STEP;
    const rad      = angleDeg * Math.PI / 180;
    const sy       = Math.max(0, Math.cos(rad));
    const yPx      = R * Math.sin(rad);
    const opacity  = Math.max(0, Math.cos(rad * 0.55));
    const isCenter = Math.abs(slot) < 0.5;
    const idx      = ((i % n) + n) % n;

    const div = document.createElement("div");
    div.style.cssText = [
      "position:absolute",
      "left:0",
      "right:0",
      "top:50%",
      `transform:translateY(calc(-50% + ${yPx.toFixed(2)}px)) perspective(360px) rotateX(${(-angleDeg).toFixed(2)}deg) scaleY(${sy.toFixed(4)})`,
      "transform-origin:center center",
      `opacity:${opacity.toFixed(3)}`,
      "font-family:'Cinzel',serif",
      `font-size:${isCenter ? "clamp(16px,5.5vw,32px)" : "clamp(8px,2.6vw,17px)"}`,
      `font-weight:${isCenter ? "700" : "400"}`,
      `color:${isCenter ? "#1a0e04" : `rgba(90,60,15,${(opacity * 0.85).toFixed(3)})`}`,
      "text-align:center",
      "will-change:transform",
      "pointer-events:none",
      "letter-spacing:.04em",
    ].join(";");
    div.textContent = String(items[idx]).padStart(2, "0");
    el.appendChild(div);
  }
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

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
    if (t < 1) {
      requestAnimationFrame(tick);
    } else {
      renderReel3D(el, items, endOffset);
      onDone && onDone();
    }
  }

  requestAnimationFrame(tick);
  return () => { cancelled = true; };
}

/* CONFETTI */

function launchGoldConfetti() {
  const container = document.querySelector(".slot-hero");
  if (!container) return;
  const colors = ["#f0d050","#c89820","#6a4808","#fff8e7","#e8c060","#d4a030"];
  for (let i = 0; i < 65; i++) {
    const el = document.createElement("div");
    el.className = "gold-confetti";
    const size = 3 + Math.random() * 6;
    el.style.cssText = [
      `left:${8 + Math.random() * 84}%`,
      `background:${colors[Math.floor(Math.random() * colors.length)]}`,
      `width:${size}px`,
      `height:${size}px`,
      `border-radius:${Math.random() > 0.45 ? "50%" : "2px"}`,
      `animation-delay:${Math.floor(Math.random() * 450)}ms`,
      `animation-duration:${1200 + Math.floor(Math.random() * 900)}ms`,
    ].join(";");
    container.appendChild(el);
    setTimeout(() => el.remove(), 2800);
  }
}

/* SLOT STATE */

let slotHasStarted  = false;
let slotIsAnimating = false;
let slotCurrent = { dayItems: [], monthItems: [], yearItems: [], tDay: 0, tMonth: 0, tYear: 0 };

function showReelZero(reelId) {
  const el = document.getElementById(reelId);
  if (!el) return;
  el.innerHTML = "";
  const div = document.createElement("div");
  div.style.cssText = [
    "position:absolute", "left:0", "right:0", "top:50%",
    "transform:translateY(-50%)",
    "text-align:center",
    "font-family:'Cinzel',serif",
    "font-size:clamp(16px,5.5vw,32px)",
    "font-weight:700",
    "color:#1a0e04",
    "letter-spacing:.04em",
  ].join(";");
  div.textContent = "00";
  el.appendChild(div);
}

function loadSlotDate() {
  const date  = getDateParts();
  const month = parseInt(date.month, 10);
  const year  = parseInt(date.year, 10);
  slotCurrent.dayItems   = buildDayItems(month, year);
  slotCurrent.monthItems = buildMonthItems();
  slotCurrent.yearItems  = buildYearItems();
  slotCurrent.tDay   = parseInt(date.day, 10) - 1;
  slotCurrent.tMonth = month - 1;
  slotCurrent.tYear  = year;
}

function doSpin() {
  if (slotHasStarted || slotIsAnimating) return;

  /* her seferinde güncel tarihi oku */
  loadSlotDate();

  slotHasStarted  = true;
  slotIsAnimating = true;

  const helper = document.getElementById("slotHelper");
  helper?.classList.add("is-hidden");

  /* sesi bloke etmeden çal */
  const snd = document.getElementById("slotSound");
  if (snd) { snd.currentTime = 0; snd.play().catch(() => {}); }

  let done = 0;
  const onDone = () => {
    if (++done === 3) {
      slotIsAnimating = false;
      launchGoldConfetti();
    }
  };

  spinReel3D("reel-day",   slotCurrent.dayItems,   slotCurrent.tDay,   1800, onDone);
  spinReel3D("reel-month", slotCurrent.monthItems,  slotCurrent.tMonth, 2400, onDone);
  spinReel3D("reel-year",  slotCurrent.yearItems,   slotCurrent.tYear,  3200, onDone);
}

function initSlotMachine() {
  loadSlotDate();
  showReelZero("reel-day");
  showReelZero("reel-month");
  showReelZero("reel-year");

  /* kol butonu */
  document.getElementById("slotStartBtn")?.addEventListener("click", (e) => {
    e.stopPropagation();
    doSpin();
  });

  /* hero'nun tamamı tıklanabilir — editör önizlemesinde de çalışsın */
  document.querySelector(".slot-hero")?.addEventListener("click", doSpin);
}

/* VISORA DATE SYNC — animasyon devam ediyorsa müdahale etme */

function watchDateField() {
  const dateEl = document.querySelector('[data-visora-field="event-date"]');
  if (!dateEl) return;

  const observer = new MutationObserver(() => {
    if (slotIsAnimating) return;          /* spin devam ederken dokunma */
    loadSlotDate();
    slotHasStarted = false;
    document.getElementById("slotHelper")?.classList.remove("is-hidden");
    showReelZero("reel-day");
    showReelZero("reel-month");
    showReelZero("reel-year");
    updateCountdown();
  });

  observer.observe(dateEl, { characterData: true, childList: true, subtree: true });
}

/* COUNTDOWN */

const daysEl    = document.getElementById("days");
const hoursEl   = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");

function updateCountdown() {
  const targetDate = getEventDateObject();
  const now  = new Date();
  const diff = targetDate - now;

  if (diff <= 0) {
    if (daysEl)    daysEl.textContent    = "0";
    if (hoursEl)   hoursEl.textContent   = "0";
    if (minutesEl) minutesEl.textContent = "0";
    if (secondsEl) secondsEl.textContent = "0";
    return;
  }

  if (daysEl)    daysEl.textContent    = Math.floor(diff / 86400000);
  if (hoursEl)   hoursEl.textContent   = Math.floor((diff / 3600000) % 24);
  if (minutesEl) minutesEl.textContent = Math.floor((diff / 60000) % 60);
  if (secondsEl) secondsEl.textContent = Math.floor((diff / 1000) % 60);
}

/* TAKVİME EKLE */

document.getElementById("calendarBtn")?.addEventListener("click", () => {
  const bride = document.querySelector('[data-visora-field="bride-name"]')?.textContent?.trim() || "Elif";
  const groom = document.querySelector('[data-visora-field="groom-name"]')?.textContent?.trim() || "Arda";
  const venue = document.querySelector('[data-visora-field="venue-name"]')?.textContent?.trim() || "Çırağan Palace";
  const address = document.querySelector('[data-visora-field="venue-address"]')?.textContent?.trim() || "İstanbul";

  const eventDate = getEventDateObject();
  const startDate = new Date(eventDate);
  const endDate = new Date(eventDate);

  startDate.setHours(20, 0, 0, 0);
  endDate.setHours(23, 59, 0, 0);

  function formatGoogleDate(date) {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  }

  const title = encodeURIComponent(`${bride} & ${groom} Düğünü`);
  const details = encodeURIComponent("Düğün daveti");
  const location = encodeURIComponent(`${venue}, ${address}`);
  const start = formatGoogleDate(startDate);
  const end = formatGoogleDate(endDate);

  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${start}/${end}`;
  window.open(url, "_blank");
});

/* GALLERY */

const galleryTrack = document.getElementById("galleryTrack");
const prevSlide = document.getElementById("prevSlide");
const nextSlide = document.getElementById("nextSlide");
const galleryDots = document.getElementById("galleryDots");
const galleryCards = Array.from(document.querySelectorAll(".gallery-card"));

let currentSlide = 0;

function visibleCount() {
  return window.innerWidth <= 420 ? 3 : 4;
}

function maxSlide() {
  return Math.max(0, galleryCards.length - visibleCount());
}

function createDots() {
  if (!galleryDots) return;

  galleryDots.innerHTML = "";
  const total = maxSlide() + 1;

  for (let i = 0; i < total; i++) {
    const dot = document.createElement("button");

    if (i === currentSlide) dot.classList.add("active");

    dot.addEventListener("click", () => {
      currentSlide = i;
      updateSlider();
    });

    galleryDots.appendChild(dot);
  }
}

function updateSlider() {
  if (!galleryTrack || !galleryCards.length) return;

  const card = galleryCards[0];
  const style = getComputedStyle(galleryTrack);
  const gap = parseFloat(style.gap) || 0;
  const step = card.getBoundingClientRect().width + gap;

  galleryTrack.style.transform = `translateX(-${currentSlide * step}px)`;

  [...galleryDots.children].forEach((dot, i) => {
    dot.classList.toggle("active", i === currentSlide);
  });
}

nextSlide?.addEventListener("click", () => {
  if (currentSlide < maxSlide()) currentSlide++;
  updateSlider();
});

prevSlide?.addEventListener("click", () => {
  if (currentSlide > 0) currentSlide--;
  updateSlider();
});

window.addEventListener("resize", () => {
  if (currentSlide > maxSlide()) currentSlide = maxSlide();
  createDots();
  updateSlider();
});

/* RSVP */

const photoInput = document.getElementById("photoInput");
const videoInput = document.getElementById("videoInput");
const uploadState = document.getElementById("uploadState");
const photoStatus = document.getElementById("photoStatus");
const videoStatus = document.getElementById("videoStatus");
const audioState = document.getElementById("audioState");
const photoPreview = document.getElementById("photoPreview");
const videoPreview = document.getElementById("videoPreview");
const audioPreview = document.getElementById("audioPreview");
const senderName = document.getElementById("senderName");
const noteText = document.getElementById("noteText");
const noteFocusBtn = document.getElementById("noteFocusBtn");
const sendBtn = document.querySelector(".send-btn");

let selectedPhotos = [];
let selectedVideos = [];
let recordedAudioBlob = null;

function showUploadState() {
  uploadState?.classList.remove("hidden");
}

function hideUploadStateIfEmpty() {
  if (selectedPhotos.length === 0 && selectedVideos.length === 0 && !recordedAudioBlob) {
    uploadState?.classList.add("hidden");
  }
}

function renderPhotos() {
  if (!photoPreview || !photoStatus) return;

  photoPreview.innerHTML = "";

  selectedPhotos.forEach((file, index) => {
    const url = URL.createObjectURL(file);
    const item = document.createElement("div");

    item.className = "preview-item";
    item.innerHTML = `
      <img src="${url}" alt="Fotoğraf önizleme">
      <button class="remove-btn" type="button" data-index="${index}" data-type="photo">×</button>
    `;

    photoPreview.appendChild(item);
  });

  photoStatus.textContent = `Fotoğraf: ${selectedPhotos.length}`;
}

function renderVideos() {
  if (!videoPreview || !videoStatus) return;

  videoPreview.innerHTML = "";

  selectedVideos.forEach((file, index) => {
    const url = URL.createObjectURL(file);
    const item = document.createElement("div");

    item.className = "video-item";
    item.innerHTML = `
      <video src="${url}" controls></video>
      <button class="remove-btn" type="button" data-index="${index}" data-type="video">×</button>
    `;

    videoPreview.appendChild(item);
  });

  videoStatus.textContent = `Video: ${selectedVideos.length}`;
}

photoInput?.addEventListener("change", (e) => {
  const files = Array.from(e.target.files || []);
  if (!files.length) return;

  selectedPhotos = [...selectedPhotos, ...files];
  showUploadState();
  renderPhotos();
  photoInput.value = "";
});

videoInput?.addEventListener("change", (e) => {
  const files = Array.from(e.target.files || []);
  if (!files.length) return;

  selectedVideos = [...selectedVideos, ...files];
  showUploadState();
  renderVideos();
  videoInput.value = "";
});

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".remove-btn");
  if (!btn) return;

  const index = Number(btn.dataset.index);
  const type = btn.dataset.type;

  if (type === "photo") {
    selectedPhotos.splice(index, 1);
    renderPhotos();
  }

  if (type === "video") {
    selectedVideos.splice(index, 1);
    renderVideos();
  }

  hideUploadStateIfEmpty();
});

document.querySelectorAll(".attend-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".attend-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

/* SES KAYDI */

let mediaRecorder = null;
let audioChunks = [];
let recordingState = "idle";

const recordBtn = document.getElementById("recordBtn");

async function setupRecorder() {
  if (mediaRecorder) return true;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) audioChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      recordedAudioBlob = new Blob(audioChunks, { type: "audio/webm" });
      const url = URL.createObjectURL(recordedAudioBlob);

      if (audioPreview) {
        audioPreview.src = url;
        audioPreview.hidden = false;
      }

      showUploadState();
      if (audioState) audioState.textContent = "Ses: Hazır";

      audioChunks = [];
      recordingState = "idle";
      if (recordBtn) recordBtn.textContent = "SESLİ MESAJ";
    };

    return true;
  } catch (error) {
    alert("Mikrofon izni verilmedi ya da tarayıcı desteklemiyor.");
    return false;
  }
}

recordBtn?.addEventListener("click", async () => {
  const ok = await setupRecorder();
  if (!ok) return;

  if (recordingState === "idle") {
    audioChunks = [];
    mediaRecorder.start();
    recordingState = "recording";
    showUploadState();

    if (audioState) audioState.textContent = "Ses: Kaydediliyor...";
    recordBtn.textContent = "DURDUR";
    return;
  }

  if (recordingState === "recording") {
    mediaRecorder.stop();
    if (audioState) audioState.textContent = "Ses: İşleniyor...";
    recordBtn.textContent = "SESLİ MESAJ";
  }
});

noteFocusBtn?.addEventListener("click", () => {
  if (senderName && senderName.value.trim() === "") {
    senderName.focus();
    return;
  }

  noteText?.focus();
  noteText?.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
});

sendBtn?.addEventListener("click", async () => {
  const attendance = document.querySelector(".attend-btn.active")?.dataset.attendance || "";
  const name = senderName?.value.trim() || "";
  const note = noteText?.value.trim() || "";

  if (!name) {
    senderName?.focus();
    senderName?.classList.add("input-error");

    setTimeout(() => {
      senderName?.classList.remove("input-error");
    }, 2000);

    return;
  }

  sendBtn.disabled = true;
  sendBtn.textContent = "GÖNDERİLİYOR...";

  const rsvp = window.VISORA_RSVP;

  if (!rsvp || !rsvp.configured) {
    console.log("RSVP payload:", {
      senderName: name,
      note,
      attendance,
      photos: selectedPhotos.length,
      videos: selectedVideos.length,
      audio: !!recordedAudioBlob
    });

    sendBtn.textContent = "GÖNDERİLDİ ✓";

    setTimeout(() => {
      sendBtn.disabled = false;
      sendBtn.textContent = "GÖNDER";
    }, 3000);

    return;
  }

  try {
    await rsvp.submit({
      templateId: "slot-save-date",
      senderName: name,
      note,
      attendance,
      photos: selectedPhotos,
      videos: selectedVideos,
      audioBlob: recordedAudioBlob
    });

    sendBtn.textContent = "GÖNDERİLDİ ✓";

    senderName.value = "";
    noteText.value = "";
    selectedPhotos = [];
    selectedVideos = [];
    recordedAudioBlob = null;

    if (audioPreview) {
      audioPreview.src = "";
      audioPreview.hidden = true;
    }

    renderPhotos();
    renderVideos();
    hideUploadStateIfEmpty();

  } catch (err) {
    console.error("RSVP gönderim hatası:", err);
    sendBtn.textContent = "HATA — TEKRAR DENE";
  }

  setTimeout(() => {
    sendBtn.disabled = false;
    sendBtn.textContent = "GÖNDER";
  }, 4000);
});

/* MÜZİK */

const music = document.getElementById("bgMusic");
const musicBtn = document.getElementById("musicBtn");
const musicIcon = document.getElementById("musicIcon");

let isPlaying = false;
let started = false;
const START_TIME = 0;

document.addEventListener("click", async () => {
  if (!music || started) return;

  try {
    music.currentTime = START_TIME;
    music.volume = 0;
    await music.play();

    let vol = 0;
    const fade = setInterval(() => {
      if (vol < 1) {
        vol += 0.05;
        music.volume = Math.min(vol, 1);
      } else {
        clearInterval(fade);
      }
    }, 100);

    if (musicIcon) musicIcon.textContent = "❚❚";

    isPlaying = true;
    started = true;
  } catch (e) {
    console.log("Autoplay engellendi.");
  }
});

musicBtn?.addEventListener("click", (e) => {
  e.stopPropagation();

  if (!music || !musicIcon) return;

  if (isPlaying) {
    music.pause();
    musicIcon.textContent = "▶";
  } else {
    music.play();
    musicIcon.textContent = "❚❚";
  }

  isPlaying = !isPlaying;
});

/* Editörden seçilen/yüklenen müzik — diğer şablonlarla (film-strip,
   cinematic-comparison-wedding) aynı visora-music mesaj kalıbı. */
window.addEventListener("message", (e) => {
  var d = e.data;
  if (d && d.type === "visora-music" && d.src && music) {
    music.src = d.src;
    music.load();
  }
});

/* İSİMLERİN OTOMATİK SIĞDIRILMASI
   Gelin/damat adı süslü çerçevenin dışına taşacak kadar uzunsa (örn. "GÜZİDE",
   "ABDULLAH") yazı tipi, alana sığana kadar kademeli olarak küçültülür. */
function fitHeroNames() {
  document.querySelectorAll(".hero-names [data-visora-field]").forEach((el) => {
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

const heroNamesEl = document.querySelector(".hero-names");
if (heroNamesEl && window.MutationObserver) {
  new MutationObserver(fitHeroNames).observe(heroNamesEl, {
    characterData: true,
    childList: true,
    subtree: true,
  });
}
window.addEventListener("resize", fitHeroNames);

/* INIT */

window.addEventListener("load", () => {
  initSlotMachine();
  watchDateField();
  fitHeroNames();
  updateCountdown();
  setInterval(updateCountdown, 1000);
  createDots();
  updateSlider();
});