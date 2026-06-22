/* ============================================================
   VISORA — visora-rsvp.js
   Guest uploads (photo / video / audio) + RSVP submissions.
   Replaces supabase-rsvp.js — no Supabase, talks to window.VISORA_API
   (js/visora-api.js) which is mock/localStorage today and will become
   real fetch() calls to the Cloudflare backend later, with the exact
   same submit() signature used by every template's script.js.
   ============================================================ */

(function (global) {
  'use strict';

  function getInstanceId() {
    var embedded = document.getElementById('visora-instance-data');
    if (embedded) {
      try { return JSON.parse(embedded.textContent).id || null; } catch (e) {}
    }
    var params = new URLSearchParams(window.location.search);
    return params.get('instance');
  }

  var configured = !!(global.VISORA_API);

  /* Dosyayı base64 data URL'e çevirir — mock depolama için.
     Gerçek backend'e geçince burada yerine R2 presigned upload kullanılacak. */
  function readAsDataURL(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload  = function () { resolve(reader.result); };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /*
   * submit({ templateId, senderName, note, attendance,
   *          photos[], videos[], audioBlob,
   *          onProgress(pct, label) })
   *
   * Returns a Promise that resolves when everything is saved.
   * Aynı imza supabase-rsvp.js ile birebir aynı — şablon kodu değişmez.
   */
  function submit(opts) {
    opts = opts || {};

    if (!global.VISORA_API) {
      return Promise.reject(new Error('VISORA: visora-api.js yüklenmedi.'));
    }

    var instanceId = getInstanceId();
    if (!instanceId) {
      return Promise.reject(new Error('VISORA: davetiye instance id bulunamadı.'));
    }

    var senderName = opts.senderName || '';
    var note       = opts.note       || '';
    var attendance = opts.attendance || '';
    var photos     = opts.photos     || [];
    var videos     = opts.videos     || [];
    var audioBlob  = opts.audioBlob  || null;
    var onProgress = opts.onProgress || function () {};

    var total = photos.length + videos.length + (audioBlob ? 1 : 0);
    var done  = 0;
    function tick(label) {
      done++;
      onProgress(Math.round((done / Math.max(total, 1)) * 90), label);
    }

    var mediaPromises = [];
    photos.forEach(function (f) {
      mediaPromises.push(readAsDataURL(f).then(function (url) {
        tick('Fotoğraf yüklendi');
        return { type: 'photo', url: url };
      }));
    });
    videos.forEach(function (f) {
      mediaPromises.push(readAsDataURL(f).then(function (url) {
        tick('Video yüklendi');
        return { type: 'video', url: url };
      }));
    });
    if (audioBlob) {
      mediaPromises.push(readAsDataURL(audioBlob).then(function (url) {
        tick('Ses yüklendi');
        return { type: 'audio', url: url };
      }));
    }

    return Promise.all(mediaPromises).then(function (media) {
      onProgress(92, 'Kaydediliyor...');
      return global.VISORA_API.submitRsvp(instanceId, {
        senderName: senderName,
        note:       note,
        attendance: attendance,
        media:      media
      });
    }).then(function () {
      onProgress(100, 'Gönderildi!');
    });
  }

  /* Misafir defteri için ayrı, hafif giriş noktası (sadece not/medya, RSVP yok) */
  function submitGuestbookEntry(opts) {
    opts = opts || {};
    if (!global.VISORA_API) return Promise.reject(new Error('VISORA: visora-api.js yüklenmedi.'));
    var instanceId = getInstanceId();
    if (!instanceId) return Promise.reject(new Error('VISORA: davetiye instance id bulunamadı.'));
    return global.VISORA_API.submitGuestbook(instanceId, {
      name:    opts.name    || '',
      message: opts.message || '',
      mediaUrl:  opts.mediaUrl  || null,
      mediaType: opts.mediaType || null
    });
  }

  global.VISORA_RSVP = {
    submit:               submit,
    submitGuestbookEntry: submitGuestbookEntry,
    configured:           configured
  };

}(window));
