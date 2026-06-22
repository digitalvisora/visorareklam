/* ─── SAYAÇ ─── */
const MONTHS_TR = {
  'ocak':0,'şubat':1,'mart':2,'nisan':3,'mayıs':4,'haziran':5,
  'temmuz':6,'ağustos':7,'eylül':8,'ekim':9,'kasım':10,'aralık':11
};

let weddingDateStr = "23 Ağustos 2026";
let weddingTimeStr = "20:00";

function buildTargetDate() {
  const parts = weddingDateStr.trim().split(/\s+/);
  let d = 23, m = 7, y = 2026;
  if (parts.length >= 3) {
    const pd = parseInt(parts[0], 10);
    const pm = MONTHS_TR[parts[1].toLowerCase()];
    const py = parseInt(parts[2], 10);
    if (!isNaN(pd)) d = pd;
    if (pm !== undefined) m = pm;
    if (!isNaN(py)) y = py;
  }
  const tp = (weddingTimeStr || "20:00").split(":");
  const h = parseInt(tp[0], 10) || 20;
  const min = parseInt(tp[1], 10) || 0;
  return new Date(y, m, d, h, min, 0);
}

let targetDate = buildTargetDate();

const daysEl    = document.getElementById("days");
const hoursEl   = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");

function updateCountdown() {
  const now  = new Date();
  const diff = targetDate - now;

  if (diff <= 0) {
    if (daysEl)    daysEl.textContent    = "0";
    if (hoursEl)   hoursEl.textContent   = "0";
    if (minutesEl) minutesEl.textContent = "0";
    if (secondsEl) secondsEl.textContent = "00";
    return;
  }

  const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours   = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  if (daysEl)    daysEl.textContent    = days;
  if (hoursEl)   hoursEl.textContent   = hours;
  if (minutesEl) minutesEl.textContent = minutes;
  if (secondsEl) secondsEl.textContent = seconds < 10 ? "0" + seconds : seconds;
}

updateCountdown();
setInterval(updateCountdown, 1000);

/* Editörden gelen tarih/saat güncellemelerini dinle */
window.addEventListener("message", function (e) {
  if (!e.data || e.data.type !== "visora-update") return;
  if (e.data.field === "event-date" && e.data.value) {
    weddingDateStr = e.data.value;
    targetDate = buildTargetDate();
    updateCountdown();
  }
  if (e.data.field === "event-time" && e.data.value) {
    weddingTimeStr = e.data.value;
    targetDate = buildTargetDate();
    updateCountdown();
  }
});

document.getElementById("calendarBtn")?.addEventListener("click", () => {
  const title    = encodeURIComponent("Senem & Mehmet Düğünü");
  const details  = encodeURIComponent("Düğün daveti");
  const location = encodeURIComponent("Gloria Meram, Konya");
  const start    = "20260823T170000Z";
  const end      = "20260823T210000Z";
  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${start}/${end}`;
  window.open(url, "_blank");
});

/* ─── FOTOĞRAF / VİDEO YÜKLEME ─── */
const photoInput   = document.getElementById("photoInput");
const videoInput   = document.getElementById("videoInput");
const uploadState  = document.getElementById("uploadState");
const photoStatus  = document.getElementById("photoStatus");
const photoProgress = document.getElementById("photoProgress");
const videoStatus  = document.getElementById("videoStatus");
const videoProgress = document.getElementById("videoProgress");
const photoPreview = document.getElementById("photoPreview");
const videoPreview = document.getElementById("videoPreview");
const audioState   = document.getElementById("audioState");
const audioPreview = document.getElementById("audioPreview");
const senderName   = document.getElementById("senderName");
const noteText     = document.getElementById("noteText");
const noteFocusBtn = document.getElementById("noteFocusBtn");
const sendBtn      = document.querySelector(".send-btn");

let selectedPhotos    = [];
let selectedVideos    = [];
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
  if (!photoPreview || !photoStatus || !photoProgress) return;
  photoPreview.innerHTML = "";
  selectedPhotos.forEach((file, index) => {
    const url  = URL.createObjectURL(file);
    const item = document.createElement("div");
    item.className = "preview-item";
    item.innerHTML = `<img src="${url}" alt="Fotoğraf önizleme">
      <button class="remove-btn" type="button" data-index="${index}" data-type="photo">×</button>`;
    photoPreview.appendChild(item);
  });
  photoStatus.textContent  = `Fotoğraf: ${selectedPhotos.length}`;
  photoProgress.textContent = `Yükleniyor: ${selectedPhotos.length} · Kalan: 0`;
}

function renderVideos() {
  if (!videoPreview || !videoStatus || !videoProgress) return;
  videoPreview.innerHTML = "";
  selectedVideos.forEach((file, index) => {
    const url  = URL.createObjectURL(file);
    const item = document.createElement("div");
    item.className = "video-item";
    item.innerHTML = `<video src="${url}" controls></video>
      <button class="remove-btn" type="button" data-index="${index}" data-type="video">×</button>`;
    videoPreview.appendChild(item);
  });
  videoStatus.textContent  = `Video: ${selectedVideos.length}`;
  videoProgress.textContent = `Yükleniyor: ${selectedVideos.length} · Kalan: 0`;
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
  const type  = btn.dataset.type;
  if (type === "photo") { selectedPhotos.splice(index, 1); renderPhotos(); }
  if (type === "video") { selectedVideos.splice(index, 1); renderVideos(); }
  hideUploadStateIfEmpty();
});

document.querySelectorAll(".attend-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".attend-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

/* ─── GALERİ ─── */
const galleryTrack = document.getElementById("galleryTrack");
const prevSlide    = document.getElementById("prevSlide");
const nextSlide    = document.getElementById("nextSlide");
const galleryDots  = document.getElementById("galleryDots");
const galleryCards = Array.from(document.querySelectorAll(".gallery-card"));
let currentSlide   = 0;

function visibleCount() { return window.innerWidth <= 420 ? 3 : 4; }
function maxSlide()     { return Math.max(0, galleryCards.length - visibleCount()); }

function createDots() {
  if (!galleryDots) return;
  galleryDots.innerHTML = "";
  const total = maxSlide() + 1;
  for (let i = 0; i < total; i++) {
    const dot = document.createElement("button");
    if (i === currentSlide) dot.classList.add("active");
    dot.addEventListener("click", () => { currentSlide = i; updateSlider(); });
    galleryDots.appendChild(dot);
  }
}

function updateSlider() {
  if (!galleryTrack || !galleryCards.length) return;
  const card  = galleryCards[0];
  const style = getComputedStyle(galleryTrack);
  const gap   = parseFloat(style.gap) || 0;
  const step  = card.getBoundingClientRect().width + gap;
  galleryTrack.style.transform = `translateX(-${currentSlide * step}px)`;
  [...galleryDots.children].forEach((dot, i) => {
    dot.classList.toggle("active", i === currentSlide);
  });
}

nextSlide?.addEventListener("click", () => { if (currentSlide < maxSlide()) currentSlide++; updateSlider(); });
prevSlide?.addEventListener("click", () => { if (currentSlide > 0) currentSlide--; updateSlider(); });
window.addEventListener("resize", () => {
  if (currentSlide > maxSlide()) currentSlide = maxSlide();
  createDots(); updateSlider();
});
createDots();
updateSlider();

/* ─── SESLİ MESAJ ─── */
let mediaRecorder    = null;
let audioChunks      = [];
let recordingStream  = null;
let recordingState   = "idle"; // idle | recording | done
let recordingTimer   = null;
let recordingSeconds = 0;

const recordBtn      = document.getElementById("recordBtn");
const voiceResultRow = document.getElementById("voiceResultRow");
const reRecordBtn    = document.getElementById("reRecordBtn");

function pad2r(n) { return n < 10 ? "0" + n : String(n); }

function setRecordState(state) {
  recordingState = state;
  if (!recordBtn) return;
  if (state === "idle") {
    recordBtn.textContent = "SESLİ MESAJ";
    recordBtn.classList.remove("recording", "recorded");
    if (voiceResultRow) voiceResultRow.classList.add("hidden");
  } else if (state === "recording") {
    recordBtn.textContent = "⏹ 00:00";
    recordBtn.classList.add("recording");
    recordBtn.classList.remove("recorded");
    if (voiceResultRow) voiceResultRow.classList.add("hidden");
  } else if (state === "done") {
    recordBtn.textContent = "✓ KAYIT HAZIR";
    recordBtn.classList.remove("recording");
    recordBtn.classList.add("recorded");
    if (voiceResultRow) voiceResultRow.classList.remove("hidden");
  }
}

async function startRecording() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    if (recordBtn) {
      recordBtn.textContent = "MİKROFON DESTEKLENMİYOR";
      setTimeout(() => setRecordState("idle"), 2500);
    }
    return;
  }

  try {
    recordingStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (err) {
    console.error("getUserMedia hatası:", err);
    if (recordBtn) {
      recordBtn.textContent = "İZİN VERİLMEDİ";
      setTimeout(() => setRecordState("idle"), 2500);
    }
    return;
  }

  audioChunks = [];

  const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
    ? "audio/webm;codecs=opus"
    : MediaRecorder.isTypeSupported("audio/webm")
      ? "audio/webm"
      : MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : "";

  try {
    mediaRecorder = new MediaRecorder(recordingStream, mimeType ? { mimeType } : undefined);
  } catch (err) {
    mediaRecorder = new MediaRecorder(recordingStream);
  }

  mediaRecorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) audioChunks.push(e.data);
  };

  mediaRecorder.onstop = () => {
    const blobType = mediaRecorder ? mediaRecorder.mimeType : (mimeType || "audio/webm");
    recordedAudioBlob = new Blob(audioChunks, { type: blobType || "audio/webm" });
    const url = URL.createObjectURL(recordedAudioBlob);
    if (audioPreview) { audioPreview.src = url; audioPreview.load(); }
    showUploadState();
    if (audioState) audioState.textContent = "Ses: Kayıt hazır ✓";

    recordingStream.getTracks().forEach((t) => t.stop());
    recordingStream = null;
    mediaRecorder   = null;
    audioChunks     = [];
    if (recordingTimer) { clearInterval(recordingTimer); recordingTimer = null; }
    recordingSeconds = 0;
    setRecordState("done");
  };

  mediaRecorder.start(250);
  setRecordState("recording");
  if (audioState) audioState.textContent = "Ses: Kaydediliyor...";
  showUploadState();

  recordingSeconds = 0;
  recordingTimer = setInterval(() => {
    recordingSeconds++;
    if (recordBtn) recordBtn.textContent = "⏹ " + pad2r(Math.floor(recordingSeconds / 60)) + ":" + pad2r(recordingSeconds % 60);
  }, 1000);
}

function stopRecording() {
  if (recordingTimer) { clearInterval(recordingTimer); recordingTimer = null; }
  if (audioState) audioState.textContent = "Ses: İşleniyor...";
  if (mediaRecorder && mediaRecorder.state !== "inactive") mediaRecorder.stop();
}

function resetRecording() {
  recordedAudioBlob = null;
  if (audioPreview) { audioPreview.src = ""; }
  if (audioState)   audioState.textContent = "Ses: Hazır";
  hideUploadStateIfEmpty();
  setRecordState("idle");
}

recordBtn?.addEventListener("click", async () => {
  if (recordingState === "idle") {
    await startRecording();
  } else if (recordingState === "recording") {
    stopRecording();
  } else if (recordingState === "done") {
    resetRecording();
    await startRecording();
  }
});

reRecordBtn?.addEventListener("click", () => {
  resetRecording();
});

/* ─── NOT GÖNDER ─── */
noteFocusBtn?.addEventListener("click", () => {
  if (senderName && senderName.value.trim() === "") { senderName.focus(); return; }
  noteText?.focus();
  noteText?.scrollIntoView({ behavior: "smooth", block: "center" });
});

/* ─── GÖNDER ─── */
sendBtn?.addEventListener("click", async () => {
  const attendance = document.querySelector(".attend-btn.active")?.dataset.attendance || "";
  const name = senderName?.value.trim() || "";
  const note = noteText?.value.trim() || "";

  if (!name) {
    senderName?.focus();
    senderName?.classList.add("input-error");
    setTimeout(() => senderName?.classList.remove("input-error"), 2000);
    return;
  }

  sendBtn.disabled = true;
  sendBtn.textContent = "GÖNDERİLİYOR...";

  const rsvp = window.VISORA_RSVP;

  if (!rsvp || !rsvp.configured) {
    console.log("RSVP payload:", { senderName: name, note, attendance,
      photos: selectedPhotos.length, videos: selectedVideos.length, audio: !!recordedAudioBlob });
    sendBtn.textContent = "GÖNDERİLDİ ✓";
    setTimeout(() => { sendBtn.disabled = false; sendBtn.textContent = "GÖNDER"; }, 3000);
    return;
  }

  try {
    await rsvp.submit({
      templateId: "wedding-video",
      senderName: name,
      note, attendance,
      photos:    selectedPhotos,
      videos:    selectedVideos,
      audioBlob: recordedAudioBlob,
      onProgress: (pct, label) => { sendBtn.textContent = label + " (" + pct + "%)"; }
    });
    sendBtn.textContent  = "GÖNDERİLDİ ✓";
    senderName.value     = "";
    noteText.value       = "";
    selectedPhotos       = [];
    selectedVideos       = [];
    resetRecording();
    renderPhotos();
    renderVideos();
    hideUploadStateIfEmpty();
  } catch (err) {
    console.error("RSVP gönderim hatası:", err);
    sendBtn.textContent = "HATA — TEKRAR DENE";
  }

  setTimeout(() => { sendBtn.disabled = false; sendBtn.textContent = "GÖNDER"; }, 4000);
});

/* ─── MÜZİK ─── */
const music = document.getElementById("bgMusic");
const btn   = document.getElementById("musicBtn");
const icon  = document.getElementById("musicIcon");

let isPlaying = false;
let started   = false;
const START_TIME = 96;

document.addEventListener("click", async () => {
  if (!started) {
    try {
      music.currentTime = START_TIME;
      music.volume = 0;
      await music.play();
      let vol = 0;
      const fade = setInterval(() => {
        if (vol < 1) { vol += 0.05; music.volume = vol; }
        else clearInterval(fade);
      }, 100);
      icon.textContent = "❚❚";
      isPlaying = true;
      started   = true;
    } catch (e) { console.log("autoplay engellendi"); }
  }
});

btn.addEventListener("click", () => {
  if (isPlaying) { music.pause(); icon.textContent = "▶"; }
  else           { music.play();  icon.textContent = "❚❚"; }
  isPlaying = !isPlaying;
});

/* Editörden seçilen/yüklenen müzik — diğer şablonlarla (film-strip,
   cinematic-comparison-wedding, Slot Machine) aynı visora-music mesaj kalıbı. */
window.addEventListener("message", (e) => {
  var d = e.data;
  if (d && d.type === "visora-music" && d.src && music) {
    music.src = d.src;
    music.load();
  }
});
