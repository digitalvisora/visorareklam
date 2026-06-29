const tabButtons = document.querySelectorAll('.tab-btn');
const pages = document.querySelectorAll('.event-page');
const galleryTrack = document.getElementById('galleryTrack');
const galleryDots = document.getElementById('galleryDots');
const prevSlide = document.getElementById('prevSlide');
const nextSlide = document.getElementById('nextSlide');

const defaultGallery = [
  '../wedding/images/slider1.jpg',
  '../wedding/images/slider2.jpg',
  '../wedding/images/slider3.jpg',
  '../wedding/images/slider4.jpg',
  '../wedding/images/slider5.jpg'
];

/* Editörden yüklenen fotoğraflar — kına segmenti */
let userPhotos = [];

function getActiveItems() {
  return userPhotos.length ? userPhotos : defaultGallery;
}

let currentSlide = 0;

const tabsTrack = document.getElementById('tabsTrack');

function setTab(tab){
  tabButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tab));
  pages.forEach(page => page.classList.toggle('active', page.id === tab));
  tabsTrack?.classList.toggle('is-henna', tab === 'henna');
  tabsTrack?.classList.toggle('is-wedding', tab === 'wedding');
  document.querySelector('.invite-shell')?.classList.toggle('theme-wedding', tab === 'wedding');
  window.scrollTo({top:0, behavior:'smooth'});
}

tabButtons.forEach(btn => btn.addEventListener('click', () => setTab(btn.dataset.tab)));

function renderGallery(){
  if (!galleryTrack) return;
  const items = getActiveItems();
  galleryTrack.innerHTML = '';
  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'gallery-card';
    card.style.backgroundImage = `url('${item}')`;
    galleryTrack.appendChild(card);
  });
  createDots();
  updateGallery();
}

function maxSlide(){ return Math.max(0, getActiveItems().length - 1); }

function createDots(){
  if (!galleryDots) return;
  galleryDots.innerHTML = '';
  for(let i=0;i<=maxSlide();i++){
    const dot = document.createElement('button');
    dot.addEventListener('click',()=>{ currentSlide=i; updateGallery(); });
    galleryDots.appendChild(dot);
  }
}

function updateGallery(){
  const card = galleryTrack?.querySelector('.gallery-card');
  if(!card) return;
  const gap = parseFloat(getComputedStyle(galleryTrack).gap) || 0;
  const step = card.getBoundingClientRect().width + gap;
  if(currentSlide > maxSlide()) currentSlide = maxSlide();
  galleryTrack.style.transform = `translateX(-${currentSlide * step}px)`;
  [...galleryDots.children].forEach((d,i)=>d.classList.toggle('active', i===currentSlide));
}

nextSlide?.addEventListener('click',()=>{ if(currentSlide < maxSlide()) currentSlide++; updateGallery(); });
prevSlide?.addEventListener('click',()=>{ if(currentSlide > 0) currentSlide--; updateGallery(); });
window.addEventListener('resize',()=>{ createDots(); updateGallery(); });

function updateCountdowns(){
  pages.forEach(page=>{
    if (!page.dataset.date) return;
    const target = new Date(page.dataset.date).getTime();
    const diff = Math.max(0, target - Date.now());
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff / 3600000) % 24);
    const minutes = Math.floor((diff / 60000) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    page.querySelectorAll('.days').forEach(el=>el.textContent=String(days).padStart(2,'0'));
    page.querySelectorAll('.hours').forEach(el=>el.textContent=String(hours).padStart(2,'0'));
    page.querySelectorAll('.minutes').forEach(el=>el.textContent=String(minutes).padStart(2,'0'));
    page.querySelectorAll('.seconds').forEach(el=>el.textContent=String(seconds).padStart(2,'0'));
  });
}
updateCountdowns();
setInterval(updateCountdowns,1000);

document.querySelectorAll('.calendar-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const title = encodeURIComponent(btn.dataset.title);
    const start = new Date(btn.dataset.start).toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';
    const end = new Date(btn.dataset.end).toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}`;
    window.open(url,'_blank');
  });
});

document.querySelectorAll('.scroll-down').forEach(btn => {
  btn.addEventListener('click', () => {
    const page = btn.closest('.event-page');
    const nextSection = page?.querySelector('.glass-section');
    nextSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

document.querySelectorAll('.attend-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.attend-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
  });
});

const photoInput = document.getElementById('photoInput');
const videoInput = document.getElementById('videoInput');
const previewArea = document.getElementById('previewArea');
const uploadStatus = document.getElementById('uploadStatus');
const photoStatus = document.getElementById('photoStatus');
const videoStatus = document.getElementById('videoStatus');
const photoProgressText = document.getElementById('photoProgressText');
const videoProgressText = document.getElementById('videoProgressText');
const photoProgressBar = document.getElementById('photoProgressBar');
const videoProgressBar = document.getElementById('videoProgressBar');

let selectedPhotos = [];
let selectedVideos = [];
let photoUploaded = 0;
let videoUploaded = 0;

function updateUploadStatus(){
  const hasFiles = selectedPhotos.length > 0 || selectedVideos.length > 0;
  uploadStatus?.classList.toggle('hidden', !hasFiles);

  if(photoStatus) photoStatus.textContent = `Fotoğraf: ${selectedPhotos.length} seçildi`;
  if(videoStatus) videoStatus.textContent = `Video: ${selectedVideos.length} seçildi`;
  if(photoProgressText) photoProgressText.textContent = `${photoUploaded} / ${selectedPhotos.length} yüklendi`;
  if(videoProgressText) videoProgressText.textContent = `${videoUploaded} / ${selectedVideos.length} yüklendi`;
  if(photoProgressBar) photoProgressBar.style.width = selectedPhotos.length ? `${Math.round((photoUploaded / selectedPhotos.length) * 100)}%` : '0%';
  if(videoProgressBar) videoProgressBar.style.width = selectedVideos.length ? `${Math.round((videoUploaded / selectedVideos.length) * 100)}%` : '0%';
}

function simulateUpload(type, addedCount){
  let remaining = addedCount;
  const timer = setInterval(() => {
    if(remaining <= 0){ clearInterval(timer); return; }
    if(type === 'photo') photoUploaded = Math.min(photoUploaded + 1, selectedPhotos.length);
    if(type === 'video') videoUploaded = Math.min(videoUploaded + 1, selectedVideos.length);
    remaining -= 1;
    updateUploadStatus();
    if(remaining <= 0) clearInterval(timer);
  }, 360);
}

function addPreview(file, type){
  const url = URL.createObjectURL(file);
  const wrap = document.createElement('div');
  wrap.className = 'preview-item';
  wrap.dataset.type = type;
  wrap.innerHTML = type === 'video'
    ? `<video src="${url}" controls></video><button class="remove-btn" type="button">×</button>`
    : `<img src="${url}" alt=""><button class="remove-btn" type="button">×</button>`;
  wrap.querySelector('button').onclick = () => {
    if(type === 'photo'){
      const index = selectedPhotos.findIndex(item => item.name === file.name && item.size === file.size && item.lastModified === file.lastModified);
      if(index > -1) selectedPhotos.splice(index, 1);
      photoUploaded = Math.min(photoUploaded, selectedPhotos.length);
    } else {
      const index = selectedVideos.findIndex(item => item.name === file.name && item.size === file.size && item.lastModified === file.lastModified);
      if(index > -1) selectedVideos.splice(index, 1);
      videoUploaded = Math.min(videoUploaded, selectedVideos.length);
    }
    wrap.remove();
    updateUploadStatus();
  };
  previewArea.appendChild(wrap);
}

photoInput?.addEventListener('change', e => {
  const files = [...e.target.files];
  if(!files.length) return;
  selectedPhotos = [...selectedPhotos, ...files];
  files.forEach(f => addPreview(f, 'photo'));
  updateUploadStatus();
  simulateUpload('photo', files.length);
  photoInput.value = '';
});

videoInput?.addEventListener('change', e => {
  const files = [...e.target.files];
  if(!files.length) return;
  selectedVideos = [...selectedVideos, ...files];
  files.forEach(f => addPreview(f, 'video'));
  updateUploadStatus();
  simulateUpload('video', files.length);
  videoInput.value = '';
});

document.getElementById('noteFocusBtn')?.addEventListener('click',()=>document.getElementById('noteText')?.focus());
document.querySelector('.send-btn')?.addEventListener('click',()=>alert('Demo gönderim hazır. Gerçek form bağlantısını sonra ekleyeceğiz.'));

/* SES KAYDI: kaydet / duraklat-devam / bitir */
const recordBtn = document.getElementById('recordBtn');
const pauseRecordBtn = document.getElementById('pauseRecordBtn');
const stopRecordBtn = document.getElementById('stopRecordBtn');
const recordStatus = document.getElementById('recordStatus');
const audioPreview = document.getElementById('audioPreview');
let mediaRecorder = null;
let recordStream = null;
let audioChunks = [];
let recordedAudioBlob = null;

function setRecordUi(state){
  if(!recordBtn || !pauseRecordBtn || !stopRecordBtn || !recordStatus) return;

  const showControls = state === "recording" || state === "paused" || state === "processing";
  pauseRecordBtn.classList.toggle("hidden", !showControls);
  stopRecordBtn.classList.toggle("hidden", !showControls);

  if(state === "idle"){
    recordBtn.disabled = false;
    pauseRecordBtn.disabled = true;
    stopRecordBtn.disabled = true;
    recordBtn.textContent = "Sesi Kaydet";
    pauseRecordBtn.textContent = "Duraklat";
    if(recordedAudioBlob){
      recordStatus.classList.remove("hidden");
      recordStatus.textContent = "Ses: Kaydedildi";
    } else {
      recordStatus.classList.add("hidden");
      recordStatus.textContent = "";
    }
  }

  if(state === "recording"){
    recordBtn.disabled = true;
    pauseRecordBtn.disabled = false;
    stopRecordBtn.disabled = false;
    pauseRecordBtn.textContent = "Duraklat";
    recordStatus.classList.remove("hidden");
    recordStatus.textContent = "Ses: Kaydediliyor...";
  }

  if(state === "paused"){
    recordBtn.disabled = true;
    pauseRecordBtn.disabled = false;
    stopRecordBtn.disabled = false;
    pauseRecordBtn.textContent = "Devam Ettir";
    recordStatus.classList.remove("hidden");
    recordStatus.textContent = "Ses: Duraklatıldı";
  }

  if(state === "processing"){
    recordBtn.disabled = true;
    pauseRecordBtn.disabled = true;
    stopRecordBtn.disabled = true;
    recordStatus.classList.remove("hidden");
    recordStatus.textContent = "Ses: İşleniyor...";
  }
}

async function initRecorder(){
  if(mediaRecorder) return true;
  if(!navigator.mediaDevices?.getUserMedia){
    alert('Bu tarayıcı ses kaydını desteklemiyor. Chrome ile dene.');
    return false;
  }
  try{
    recordStream = await navigator.mediaDevices.getUserMedia({ audio:true });
    mediaRecorder = new MediaRecorder(recordStream);

    mediaRecorder.ondataavailable = e => {
      if(e.data && e.data.size > 0) audioChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      recordedAudioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType || 'audio/webm' });
      audioChunks = [];
      if(audioPreview){
        audioPreview.src = URL.createObjectURL(recordedAudioBlob);
        audioPreview.hidden = false;
      }
      setRecordUi('idle');
    };
    return true;
  }catch(err){
    alert('Mikrofon izni verilmedi ya da tarayıcı izin vermedi.');
    console.error(err);
    return false;
  }
}

recordBtn?.addEventListener('click', async () => {
  const ok = await initRecorder();
  if(!ok || !mediaRecorder) return;
  audioChunks = [];
  recordedAudioBlob = null;
  if(audioPreview){
    audioPreview.hidden = true;
    audioPreview.removeAttribute('src');
  }
  mediaRecorder.start();
  setRecordUi('recording');
});

pauseRecordBtn?.addEventListener('click', () => {
  if(!mediaRecorder) return;
  if(mediaRecorder.state === 'recording'){
    mediaRecorder.pause();
    setRecordUi('paused');
  } else if(mediaRecorder.state === 'paused'){
    mediaRecorder.resume();
    setRecordUi('recording');
  }
});

stopRecordBtn?.addEventListener('click', () => {
  if(!mediaRecorder) return;
  if(mediaRecorder.state === 'recording' || mediaRecorder.state === 'paused'){
    setRecordUi('processing');
    mediaRecorder.stop();
  }
});

/* ── Müzik ── */
const hennaMusic = document.getElementById('hennaMusic');
const musicBtn = document.getElementById('musicBtn');
const musicIcon = document.getElementById('musicIcon');
const musicPlayer = document.querySelector('.music-player');
let isPlaying = false;

async function playMusic(){
  if(!hennaMusic || !hennaMusic.src) return;
  try{
    hennaMusic.volume = 0.82;
    await hennaMusic.play();
    isPlaying = true;
    musicIcon.textContent = '❚❚';
    musicPlayer?.classList.remove('waiting');
  }catch(e){
    isPlaying = false;
    musicIcon.textContent = '▶';
    musicPlayer?.classList.add('waiting');
  }
}

musicBtn?.addEventListener('click', async () => {
  if(!hennaMusic) return;
  if(isPlaying){
    hennaMusic.pause();
    isPlaying = false;
    musicIcon.textContent = '▶';
  }else{
    await playMusic();
  }
});

['click','touchstart','keydown','scroll'].forEach(evt => {
  window.addEventListener(evt, () => {
    if(!isPlaying) playMusic();
  }, { once:true, passive:true });
});

renderGallery();
setRecordUi('idle');

/* ── Editörden gelen galeri / müzik güncellemeleri ── */
window.addEventListener('message', function(e) {
  if (!e.data || typeof e.data !== 'object') return;
  const msg = e.data;
  if (msg.type === 'visora-gallery-reset') {
    userPhotos = [];
    renderGallery();
  } else if (msg.type === 'visora-gallery' && msg.dataUrl) {
    userPhotos[msg.index || 0] = msg.dataUrl;
    renderGallery();
  } else if (msg.type === 'visora-music' && msg.src && hennaMusic) {
    hennaMusic.src = msg.src;
    hennaMusic.load();
    if (isPlaying) playMusic();
  }
});
