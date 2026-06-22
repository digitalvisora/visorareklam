/* ============================================================
   VISORA — visora-api.js
   Davetiye kaydetme / yayınlama / RSVP API katmanı

   Cloudflare Pages Functions'a (functions/api/invitations/...) bağlanır.
   Fonksiyon imzaları mock dönemiyle (localStorage) birebir aynı —
   çağıran taraf (olustur.js, visora-bridge.js, visora-rsvp.js)
   hiç değişmedi, sadece bu dosyanın gövdesi fetch() ile değişti.
   ============================================================ */

(function () {
  'use strict';

  var API_BASE = '/api/invitations';

  function toJson(res) {
    if (!res.ok) return res.text().then(function (t) { throw new Error(t || ('HTTP ' + res.status)); });
    return res.json();
  }

  /**
   * createInvitation(templateId) → Promise<{id, ownerToken}>
   */
  function createInvitation(templateId) {
    return fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId: templateId })
    }).then(toJson);
  }

  /**
   * updateInvitation(id, partialData) → Promise<instance>
   */
  function updateInvitation(id, partialData) {
    return fetch(API_BASE + '/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partialData)
    }).then(toJson);
  }

  /**
   * publishInvitation(id) → Promise<{id, url}>
   */
  function publishInvitation(id) {
    return fetch(API_BASE + '/' + id + '/publish', { method: 'POST' }).then(toJson);
  }

  /**
   * getInvitation(id) → Promise<instance|null>
   */
  function getInvitation(id) {
    return fetch(API_BASE + '/' + id).then(toJson);
  }

  /**
   * submitRsvp(id, data) → Promise<{ok:true}>
   */
  function submitRsvp(id, data) {
    return fetch(API_BASE + '/' + id + '/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(toJson);
  }

  /**
   * submitGuestbook(id, data) → Promise<{ok:true}>
   */
  function submitGuestbook(id, data) {
    return fetch(API_BASE + '/' + id + '/guestbook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(toJson);
  }

  /**
   * submitSurvey(id, data) → Promise<{ok:true}>
   */
  function submitSurvey(id, data) {
    return fetch(API_BASE + '/' + id + '/survey', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(toJson);
  }

  /**
   * uploadMedia(id, file) → Promise<{url}>
   * file: File/Blob (input[type=file] veya FileReader değil — ham dosya).
   * R2'ye yükler, herkese açık servis edilen URL döner.
   */
  function uploadMedia(id, file) {
    var qs = '?filename=' + encodeURIComponent(file.name || 'file') +
              '&type=' + encodeURIComponent(file.type || 'application/octet-stream');
    return fetch(API_BASE + '/' + id + '/media' + qs, {
      method: 'POST',
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      body: file
    }).then(toJson);
  }

  /**
   * saveInvitation(id) → Promise<{ok:true}> — giriş yapmış kullanıcının hesabına bağlar
   */
  function saveInvitation(id) {
    return fetch(API_BASE + '/' + id + '/save', { method: 'POST' }).then(toJson);
  }

  /**
   * unsaveInvitation(id) → Promise<{ok:true}> — "Kaydettiklerim" listesinden kaldırır
   */
  function unsaveInvitation(id) {
    return fetch(API_BASE + '/' + id + '/unsave', { method: 'POST' }).then(toJson);
  }

  /**
   * getMyInvitations() → Promise<{items:[...]}> — "Kaydettiklerim" listesi
   */
  function getMyInvitations() {
    return fetch('/api/user/invitations').then(toJson);
  }

  /**
   * createOrder({instanceId, templateId, basePrice, extras, total}) → Promise<{id}>
   */
  function createOrder(data) {
    return fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(toJson);
  }

  /**
   * getOrder(id) → Promise<order>
   */
  function getOrder(id) {
    return fetch('/api/orders/' + id).then(toJson);
  }

  /**
   * getMyOrders() → Promise<{items:[...]}>
   */
  function getMyOrders() {
    return fetch('/api/orders').then(toJson);
  }

  /**
   * payOrder(id) → Promise<order> — mock onay (test ortamı / eski akış için saklanıyor)
   */
  function payOrder(id) {
    return fetch('/api/orders/' + id + '/pay', { method: 'POST' }).then(toJson);
  }

  /**
   * getPaytrToken(id) → Promise<{token}> — gerçek PayTR iFrame ödeme akışı, adım 1
   */
  function getPaytrToken(id) {
    return fetch('/api/orders/' + id + '/paytr-token', { method: 'POST' }).then(toJson);
  }

  /**
   * getInvitationDashboard(id) → Promise<{instance, views, rsvp, guestbook, mediaCount}>
   * "Davetiyem" paneli — sadece sahibi (giriş yapmış hesap) görebilir.
   */
  function getInvitationDashboard(id) {
    return fetch(API_BASE + '/' + id + '/dashboard').then(toJson);
  }

  window.VISORA_API = {
    createInvitation: createInvitation,
    updateInvitation: updateInvitation,
    publishInvitation: publishInvitation,
    getInvitation: getInvitation,
    submitRsvp: submitRsvp,
    submitGuestbook: submitGuestbook,
    submitSurvey: submitSurvey,
    uploadMedia: uploadMedia,
    saveInvitation: saveInvitation,
    unsaveInvitation: unsaveInvitation,
    getMyInvitations: getMyInvitations,
    createOrder: createOrder,
    getOrder: getOrder,
    getMyOrders: getMyOrders,
    payOrder: payOrder,
    getPaytrToken: getPaytrToken,
    getInvitationDashboard: getInvitationDashboard
  };

})();
