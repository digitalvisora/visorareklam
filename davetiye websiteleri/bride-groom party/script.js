const body=document.body;
const tabButtons=document.querySelectorAll('.tab-btn');
const pages=document.querySelectorAll('.event-page');
let activeTab='bride';

function setTab(tab){
  activeTab=tab;
  body.classList.toggle('theme-bride',tab==='bride');
  body.classList.toggle('theme-groom',tab==='groom');
  tabButtons.forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  pages.forEach(p=>p.classList.toggle('active',p.id===tab));
  switchMusicForTab();
  window.scrollTo({top:0,behavior:'smooth'});
}
tabButtons.forEach(btn=>btn.addEventListener('click',()=>setTab(btn.dataset.tab)));

function updateCountdowns(){
  pages.forEach(page=>{
    const target=new Date(page.dataset.date).getTime();
    const diff=Math.max(0,target-Date.now());
    const days=Math.floor(diff/86400000);
    const hours=Math.floor((diff/3600000)%24);
    const minutes=Math.floor((diff/60000)%60);
    const seconds=Math.floor((diff/1000)%60);
    page.querySelectorAll('.days').forEach(el=>el.textContent=String(days).padStart(2,'0'));
    page.querySelectorAll('.hours').forEach(el=>el.textContent=String(hours).padStart(2,'0'));
    page.querySelectorAll('.minutes').forEach(el=>el.textContent=String(minutes).padStart(2,'0'));
    page.querySelectorAll('.seconds').forEach(el=>el.textContent=String(seconds).padStart(2,'0'));
  });
}
updateCountdowns();setInterval(updateCountdowns,1000);

document.querySelectorAll('.calendar-btn').forEach(btn=>btn.addEventListener('click',()=>{
  const title=encodeURIComponent(btn.dataset.title);
  const start=new Date(btn.dataset.start).toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';
  const end=new Date(btn.dataset.end).toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';
  window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}`,'_blank');
}));

document.querySelectorAll('.scroll-down').forEach(btn=>btn.addEventListener('click',()=>btn.closest('.event-page')?.querySelector('.glass-section')?.scrollIntoView({behavior:'smooth'})));

const photoInput=document.getElementById('photoInput');
const videoInput=document.getElementById('videoInput');
const previewArea=document.getElementById('previewArea');
const uploadStatus=document.getElementById('uploadStatus');
const photoStatus=document.getElementById('photoStatus');
const videoStatus=document.getElementById('videoStatus');
const photoPercent=document.getElementById('photoPercent');
const videoPercent=document.getElementById('videoPercent');
const photoProgressBar=document.getElementById('photoProgressBar');
const videoProgressBar=document.getElementById('videoProgressBar');
let photoTotal=0, videoTotal=0, photoProgress=0, videoProgress=0;
let photoTimer=null, videoTimer=null;

function updateProgress(type,value){
  const hasFiles = photoTotal > 0 || videoTotal > 0;
  uploadStatus?.classList.toggle('hidden', !hasFiles);

  if(type==='photo' || type==='all'){
    photoProgress=Math.min(value ?? photoProgress, photoTotal);
    const pct=photoTotal?Math.min(100,Math.round(photoProgress/photoTotal*100)):0;
    if(photoStatus) photoStatus.textContent=`Fotoğraf: ${photoTotal} seçildi`;
    if(photoPercent) photoPercent.textContent=`${pct}%`;
    if(photoProgressBar) photoProgressBar.style.width=`${pct}%`;
  }
  if(type==='video' || type==='all'){
    videoProgress=Math.min(type==='video' ? value : videoProgress, videoTotal);
    const pct=videoTotal?Math.min(100,Math.round(videoProgress/videoTotal*100)):0;
    if(videoStatus) videoStatus.textContent=`Video: ${videoTotal} seçildi`;
    if(videoPercent) videoPercent.textContent=`${pct}%`;
    if(videoProgressBar) videoProgressBar.style.width=`${pct}%`;
  }
}

function simulateUpload(type){
  if(type==='photo' && photoTimer) clearInterval(photoTimer);
  if(type==='video' && videoTimer) clearInterval(videoTimer);

  const timer=setInterval(()=>{
    if(type==='photo'){
      if(photoProgress >= photoTotal){ clearInterval(timer); return; }
      updateProgress('photo', Math.min(photoTotal, photoProgress + 1));
    } else {
      if(videoProgress >= videoTotal){ clearInterval(timer); return; }
      updateProgress('video', Math.min(videoTotal, videoProgress + 1));
    }
  },220);

  if(type==='photo') photoTimer=timer;
  if(type==='video') videoTimer=timer;
}

function removePreview(item,type,url){
  URL.revokeObjectURL(url);
  item.remove();
  if(type==='photo'){
    photoTotal=Math.max(0, photoTotal-1);
    photoProgress=Math.min(photoProgress, photoTotal);
    updateProgress('photo', photoProgress);
  }else{
    videoTotal=Math.max(0, videoTotal-1);
    videoProgress=Math.min(videoProgress, videoTotal);
    updateProgress('video', videoProgress);
  }
  updateProgress('all');
}

function addPreview(file,type){
  const url=URL.createObjectURL(file);
  const item=document.createElement('div');
  item.className='preview-item';
  const media = type==='video'
    ? `<video src="${url}" controls></video>`
    : `<img src="${url}" alt="">`;
  item.innerHTML=`${media}<button class="remove-preview" type="button" aria-label="Seçili ${type==='video'?'videoyu':'fotoğrafı'} sil">×</button>`;
  item.querySelector('.remove-preview')?.addEventListener('click',()=>removePreview(item,type,url));
  previewArea?.appendChild(item);
}
photoInput?.addEventListener('change',e=>{
  const files=[...e.target.files]; if(!files.length) return;
  photoTotal+=files.length;
  files.forEach(f=>addPreview(f,'photo'));
  updateProgress('photo', photoProgress);
  simulateUpload('photo');
  photoInput.value='';
});
videoInput?.addEventListener('change',e=>{
  const files=[...e.target.files]; if(!files.length) return;
  videoTotal+=files.length;
  files.forEach(f=>addPreview(f,'video'));
  updateProgress('video', videoProgress);
  simulateUpload('video');
  videoInput.value='';
});

document.getElementById('noteFocusBtn')?.addEventListener('click',()=>document.getElementById('noteText')?.focus());

const recordBtn=document.getElementById('recordBtn');
let recorder=null,recordStream=null,chunks=[],recordedAudioBlob=null;
recordBtn?.addEventListener('click',async()=>{
  if(!navigator.mediaDevices?.getUserMedia){alert('Bu tarayıcı ses kaydını desteklemiyor.');return;}
  if(recorder&&recorder.state==='recording'){
    recorder.stop(); recordBtn.textContent='Ses Kaydet'; return;
  }
  try{
    recordStream=await navigator.mediaDevices.getUserMedia({audio:true});
    recorder=new MediaRecorder(recordStream);chunks=[];
    recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
    recorder.onstop=()=>{
      recordedAudioBlob=new Blob(chunks,{type:'audio/webm'});
      const audio=document.createElement('audio');
      audio.controls=true;audio.src=URL.createObjectURL(recordedAudioBlob);audio.style.width='100%';audio.style.marginTop='12px';
      previewArea?.appendChild(audio);
      recordStream?.getTracks().forEach(t=>t.stop());
    };
    recorder.start(); recordBtn.textContent='Kaydı Bitir';
  }catch(e){alert('Mikrofon izni verilmedi.');}
});

const brideMusic=document.getElementById('brideMusic');
const groomMusic=document.getElementById('groomMusic');
const musicBtn=document.getElementById('musicBtn');
const musicIcon=document.getElementById('musicIcon');
let isPlaying=false;

// Müzik başlangıçları:
// Bride: Bridal Glow Hour
// Groom: Velvet Drive
const MUSIC_STARTS = { bride: 0, groom: 0 };

function getMusic(){return activeTab==='groom'?groomMusic:brideMusic}
function getMusicStart(){return activeTab==='groom'?MUSIC_STARTS.groom:MUSIC_STARTS.bride}
function pauseAll(){[brideMusic,groomMusic].forEach(a=>a&&a.pause())}
function primeMusic(audio, startSecond){
  if(!audio) return;
  try{
    if(audio.currentTime < startSecond || audio.currentTime < 1){
      audio.currentTime = startSecond;
    }
  }catch(e){}
}
async function playActive(){
  pauseAll();
  const a=getMusic();
  const start=getMusicStart();
  try{
    a.volume=.78;
    primeMusic(a,start);
    await a.play();
    isPlaying=true;
    musicIcon.textContent='❚❚';
  }catch(e){
    isPlaying=false;
    musicIcon.textContent='▶';
  }
}
function switchMusicForTab(){
  primeMusic(getMusic(), getMusicStart());
  if(isPlaying) playActive();
}
[brideMusic,groomMusic].forEach(audio=>{
  audio?.addEventListener('timeupdate',()=>{
    const start = audio===groomMusic ? MUSIC_STARTS.groom : MUSIC_STARTS.bride;
    if(audio.currentTime < start - .25 && !audio.paused){
      try{audio.currentTime=start;}catch(e){}
    }
  });
});
musicBtn?.addEventListener('click',async()=>{if(isPlaying){pauseAll();isPlaying=false;musicIcon.textContent='▶'}else await playActive()});
['click','touchstart','keydown','scroll'].forEach(evt=>window.addEventListener(evt,()=>{if(!isPlaying)playActive()},{once:true,passive:true}));

/* Seçilen fotoğraf/video dosyalarını gerçek File nesneleriyle takip ediyoruz
   (RSVP submit'in beklediği format previewArea'daki File listesi). */
let selectedPhotosForSupabase = [];
let selectedVideosForSupabase = [];
addPreview = function(file,type){
  if(type === 'photo') selectedPhotosForSupabase.push(file);
  if(type === 'video') selectedVideosForSupabase.push(file);
  const url=URL.createObjectURL(file);
  const item=document.createElement('div');
  item.className='preview-item';
  const media = type==='video'
    ? `<video src="${url}" controls></video>`
    : `<img src="${url}" alt="">`;
  item.innerHTML=`${media}<button class="remove-preview" type="button" aria-label="Seçili ${type==='video'?'videoyu':'fotoğrafı'} sil">×</button>`;
  item.querySelector('.remove-preview')?.addEventListener('click',()=>{
    if(type === 'photo') selectedPhotosForSupabase = selectedPhotosForSupabase.filter(f => f !== file);
    if(type === 'video') selectedVideosForSupabase = selectedVideosForSupabase.filter(f => f !== file);
    removePreview(item,type,url);
  });
  previewArea?.appendChild(item);
};

/* V13 - Anı gönderimi: fotoğraf + video + ses + not artık VISORA backend'ine (D1/R2) gider.
   Diğer şablonlarla (wedding script.js) aynı window.VISORA_RSVP.submit() akışı kullanılır. */
document.querySelector('.memory-section .send-btn')?.addEventListener('click', async (e) => {
  const btn = e.currentTarget;
  const name = document.getElementById('senderName')?.value.trim() || '';
  const note = document.getElementById('noteText')?.value.trim() || '';

  if(!name){
    document.getElementById('senderName')?.focus();
    alert('Lütfen adını yaz.');
    return;
  }

  const rsvp = window.VISORA_RSVP;
  if(!rsvp || !rsvp.configured){
    console.log('RSVP payload:', { senderName:name, note, photos:selectedPhotosForSupabase.length, videos:selectedVideosForSupabase.length, audio:!!recordedAudioBlob });
    btn.textContent='Gönderildi ✓';
    setTimeout(()=>{ btn.disabled=false; btn.textContent='Gönder'; },3000);
    return;
  }

  btn.disabled=true;
  btn.textContent='Gönderiliyor...';

  try{
    await rsvp.submit({
      templateId:'bride-groom-party',
      senderName:name,
      note,
      attendance:'',
      photos:selectedPhotosForSupabase,
      videos:selectedVideosForSupabase,
      audioBlob:recordedAudioBlob,
      onProgress:(pct,label)=>{ btn.textContent = label + ' (' + pct + '%)'; }
    });
    btn.textContent='Gönderildi ✓';
    document.getElementById('senderName').value='';
    document.getElementById('noteText').value='';
    selectedPhotosForSupabase=[];
    selectedVideosForSupabase=[];
    recordedAudioBlob=null;
    photoTotal=0; videoTotal=0; photoProgress=0; videoProgress=0;
    previewArea.innerHTML='';
    updateProgress('all');
  }catch(err){
    console.error('RSVP gönderim hatası:', err);
    btn.textContent='Hata — Tekrar Dene';
  }

  setTimeout(()=>{ btn.disabled=false; if(btn.textContent.indexOf('Hata')===-1) btn.textContent='Gönder'; },4000);
});

/* V14 - Anket artık ayrı bir sayfada (anket.html) — buton oraya yönlendirir,
   şablonun kendi sayfasının estetiğini bozmasın. */
function getSurveyInstanceId(){
  const embedded = document.getElementById('visora-instance-data');
  if(embedded){
    try{ return JSON.parse(embedded.textContent).id || null; }catch(e){}
  }
  const params = new URLSearchParams(window.location.search);
  return params.get('instance');
}

document.querySelectorAll('[data-anket-side]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const side = btn.dataset.anketSide;
    const instanceId = getSurveyInstanceId();
    let url = 'anket.html?side=' + side;
    if(instanceId) url += '&instance=' + encodeURIComponent(instanceId);
    window.open(url, '_blank');
  });
});
