/* ============================================================
   VISORA — visora-auth.js
   Giriş/Üye Ol popup modal + oturum durumu + navbar hesap düğmesi
   API: window.VISORA_AUTH = { me, login, register, logout, requireAuth, openModal }
   ============================================================ */

(function () {
  'use strict';

  var cachedUser   = undefined; /* undefined = henüz kontrol edilmedi, null = giriş yok */
  var pendingResolve = null;    /* requireAuth() bekleyen callback */
  var overlay, modal, loginForm, registerForm, loginError, registerError;

  function t(key, fallback) {
    return window.VISORA_I18N ? window.VISORA_I18N.t(key) : fallback;
  }

  function toJson(res) {
    return res.text().then(function (text) {
      var data = null;
      try { data = text ? JSON.parse(text) : null; } catch (e) {
        throw new Error('bad_response_' + res.status + ':' + text.slice(0, 80));
      }
      if (!res.ok) throw new Error((data && data.error) || ('http_' + res.status));
      return data;
    });
  }

  function me(force) {
    if (!force && cachedUser !== undefined) return Promise.resolve(cachedUser);
    return fetch('/api/auth/me').then(toJson).then(function (data) {
      cachedUser = data.user || null;
      updateAccountBtn();
      return cachedUser;
    }).catch(function () { cachedUser = null; return null; });
  }

  function login(email, password) {
    return fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: password })
    }).then(toJson).then(function (data) {
      cachedUser = data.user;
      updateAccountBtn();
      return cachedUser;
    });
  }

  function register(name, email, password, phone) {
    return fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, email: email, password: password, phone: phone })
    }).then(toJson).then(function (data) {
      cachedUser = data.user;
      updateAccountBtn();
      return cachedUser;
    });
  }

  function logout() {
    return fetch('/api/auth/logout', { method: 'POST' }).then(function () {
      cachedUser = null;
      updateAccountBtn();
    });
  }

  /* ── Modal DOM ── */
  function buildModal() {
    overlay = document.createElement('div');
    overlay.className = 'va-overlay';
    overlay.id = 'vaOverlay';
    overlay.innerHTML =
      '<div class="va-modal" id="vaModal">' +
        '<button type="button" class="va-close" id="vaClose" aria-label="Kapat">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
        '</button>' +
        '<div class="va-tabs">' +
          '<button type="button" class="va-tab active" data-tab="login" id="vaTabLogin"></button>' +
          '<button type="button" class="va-tab" data-tab="register" id="vaTabRegister"></button>' +
        '</div>' +
        '<form class="va-form" id="vaLoginForm">' +
          '<div class="va-field"><label id="vaLoginEmailLabel"></label><input type="email" id="vaLoginEmail" autocomplete="email" required></div>' +
          '<div class="va-field"><label id="vaLoginPassLabel"></label><input type="password" id="vaLoginPassword" autocomplete="current-password" required></div>' +
          '<p class="va-error" id="vaLoginError" style="display:none"></p>' +
          '<button type="submit" class="btn btn-primary va-submit" id="vaLoginSubmit"></button>' +
        '</form>' +
        '<form class="va-form" id="vaRegisterForm" style="display:none">' +
          '<div class="va-field"><label id="vaRegNameLabel"></label><input type="text" id="vaRegName" autocomplete="name" required></div>' +
          '<div class="va-field"><label id="vaRegEmailLabel"></label><input type="email" id="vaRegEmail" autocomplete="email" required></div>' +
          '<div class="va-field"><label id="vaRegPhoneLabel"></label><input type="tel" id="vaRegPhone" autocomplete="tel" placeholder="05XX XXX XX XX" required></div>' +
          '<div class="va-field"><label id="vaRegPassLabel"></label><input type="password" id="vaRegPassword" autocomplete="new-password" minlength="6" required></div>' +
          '<p class="va-error" id="vaRegisterError" style="display:none"></p>' +
          '<button type="submit" class="btn btn-primary va-submit" id="vaRegisterSubmit"></button>' +
        '</form>' +
      '</div>';
    document.body.appendChild(overlay);

    modal         = document.getElementById('vaModal');
    loginForm     = document.getElementById('vaLoginForm');
    registerForm  = document.getElementById('vaRegisterForm');
    loginError    = document.getElementById('vaLoginError');
    registerError = document.getElementById('vaRegisterError');

    translateModal();

    document.getElementById('vaClose').addEventListener('click', closeModal);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });

    document.getElementById('vaTabLogin').addEventListener('click', function () { switchTab('login'); });
    document.getElementById('vaTabRegister').addEventListener('click', function () { switchTab('register'); });

    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      loginError.style.display = 'none';
      var btn = document.getElementById('vaLoginSubmit');
      btn.disabled = true;
      login(document.getElementById('vaLoginEmail').value, document.getElementById('vaLoginPassword').value)
        .then(onAuthSuccess)
        .catch(function (err) { showError(loginError, err.message); })
        .then(function () { btn.disabled = false; });
    });

    registerForm.addEventListener('submit', function (e) {
      e.preventDefault();
      registerError.style.display = 'none';
      var btn = document.getElementById('vaRegisterSubmit');
      btn.disabled = true;
      register(
        document.getElementById('vaRegName').value,
        document.getElementById('vaRegEmail').value,
        document.getElementById('vaRegPassword').value,
        document.getElementById('vaRegPhone').value
      )
        .then(onAuthSuccess)
        .catch(function (err) { showError(registerError, err.message); })
        .then(function () { btn.disabled = false; });
    });
  }

  var ERROR_KEYS = {
    invalid_credentials: 'auth.error.invalidCredentials',
    invalid_email:       'auth.error.invalidEmail',
    invalid_name:        'auth.error.invalidName',
    invalid_phone:       'auth.error.invalidPhone',
    weak_password:       'auth.error.weakPassword',
    email_taken:         'auth.error.emailTaken'
  };

  function showError(el, code) {
    var known = ERROR_KEYS[code];
    var msg = t(known || 'auth.error.generic', 'Bir hata oluştu, lütfen tekrar deneyin.');
    /* Tanınmayan hata kodları (ağ hatası, beklenmedik sunucu cevabı vb.) teşhis için köşeli
       parantez içinde gösterilir — geliştirme/destek amaçlı, kullanıcıyı bunaltmaz. */
    if (!known) msg += ' [' + code + ']';
    el.textContent = msg;
    el.style.display = '';
  }

  function onAuthSuccess(user) {
    closeModal();
    var cb = pendingResolve;
    pendingResolve = null;
    if (cb) cb(user);
  }

  function switchTab(tab) {
    document.getElementById('vaTabLogin').classList.toggle('active', tab === 'login');
    document.getElementById('vaTabRegister').classList.toggle('active', tab === 'register');
    loginForm.style.display    = tab === 'login'    ? '' : 'none';
    registerForm.style.display = tab === 'register' ? '' : 'none';
  }

  function translateModal() {
    document.getElementById('vaTabLogin').textContent     = t('auth.login.tab', 'Giriş Yap');
    document.getElementById('vaTabRegister').textContent  = t('auth.register.tab', 'Üye Ol');
    document.getElementById('vaLoginEmailLabel').textContent = t('auth.email', 'E-posta');
    document.getElementById('vaLoginPassLabel').textContent  = t('auth.password', 'Şifre');
    document.getElementById('vaLoginSubmit').textContent     = t('auth.login.submit', 'Giriş Yap');
    document.getElementById('vaRegNameLabel').textContent    = t('auth.name', 'Ad Soyad');
    document.getElementById('vaRegEmailLabel').textContent   = t('auth.email', 'E-posta');
    document.getElementById('vaRegPhoneLabel').textContent   = t('auth.phone', 'Telefon Numarası');
    document.getElementById('vaRegPassLabel').textContent    = t('auth.password', 'Şifre');
    document.getElementById('vaRegisterSubmit').textContent  = t('auth.register.submit', 'Üye Ol');
  }

  function openModal(onAuthed) {
    if (!overlay) buildModal();
    translateModal();
    switchTab('login');
    loginError.style.display = 'none';
    registerError.style.display = 'none';
    loginForm.reset();
    registerForm.reset();
    pendingResolve = onAuthed || null;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!overlay) return;
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* requireAuth(callback) — kullanıcı girişliyse callback(user) çağrılır,
     değilse modal açılır, başarılı girişten sonra callback(user) çağrılır. */
  function requireAuth(onAuthed) {
    me().then(function (user) {
      if (user) { onAuthed(user); return; }
      openModal(onAuthed);
    });
  }

  /* ── Navbar account button ── */
  var accountBtn, accountDropdown;

  function buildAccountBtn() {
    var actions = document.querySelector('.navbar-actions');
    if (!actions) return;
    var hamburger = actions.querySelector('.hamburger');

    var wrap = document.createElement('div');
    wrap.className = 'va-account-btn';
    wrap.innerHTML =
      '<button type="button" class="nav-btn" id="vaAccountToggle" aria-label="Hesabım">' +
        '<svg id="vaGuestIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>' +
        '</svg>' +
        '<span id="vaAvatar" class="va-avatar" style="display:none"></span>' +
      '</button>' +
      '<div class="va-dropdown" id="vaDropdown">' +
        '<div class="va-dropdown-email" id="vaDropdownEmail"></div>' +
        '<a href="kaydettiklerim.html" id="vaDropdownSaved"></a>' +
        '<a href="siparislerim.html" id="vaDropdownOrders"></a>' +
        '<button type="button" id="vaDropdownLogout"></button>' +
      '</div>';

    if (hamburger) actions.insertBefore(wrap, hamburger);
    else actions.appendChild(wrap);

    accountBtn      = document.getElementById('vaAccountToggle');
    accountDropdown = document.getElementById('vaDropdown');

    document.getElementById('vaDropdownSaved').textContent  = t('auth.dropdown.saved', 'Kaydettiklerim');
    document.getElementById('vaDropdownOrders').textContent = t('auth.dropdown.orders', 'Siparişlerim');
    document.getElementById('vaDropdownLogout').textContent = t('auth.dropdown.logout', 'Çıkış Yap');

    accountBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (cachedUser) {
        accountDropdown.classList.toggle('open');
      } else {
        openModal();
      }
    });

    document.addEventListener('click', function () { accountDropdown.classList.remove('open'); });

    document.getElementById('vaDropdownLogout').addEventListener('click', function () {
      logout().then(function () {
        accountDropdown.classList.remove('open');
        /* Cloudflare Pages "clean URL" davranışı /kaydettiklerim.html'i /kaydettiklerim'e
           çevirebilir, bu yüzden uzantı isteğe bağlı eşleştirilir. */
        if (/\/(kaydettiklerim|siparislerim)(\.html)?$/.test(window.location.pathname)) window.location.href = 'index.html';
      });
    });
  }

  function updateAccountBtn() {
    if (!accountBtn) return;
    var guestIcon = document.getElementById('vaGuestIcon');
    var avatar     = document.getElementById('vaAvatar');
    var emailLabel = document.getElementById('vaDropdownEmail');
    if (cachedUser) {
      guestIcon.style.display = 'none';
      avatar.style.display    = '';
      avatar.textContent      = (cachedUser.name || cachedUser.email).charAt(0);
      if (emailLabel) emailLabel.textContent = cachedUser.name ? (cachedUser.name + ' · ' + cachedUser.email) : cachedUser.email;
    } else {
      guestIcon.style.display = '';
      avatar.style.display    = 'none';
    }
  }

  function init() {
    buildAccountBtn();
    me();

    /* Dil değişince modal + navbar butonu yeniden çevrilsin */
    if (window.MutationObserver) {
      new MutationObserver(function (mutations) {
        if (mutations.some(function (m) { return m.attributeName === 'lang'; })) {
          if (overlay) translateModal();
          if (accountBtn) {
            document.getElementById('vaDropdownSaved').textContent  = t('auth.dropdown.saved', 'Kaydettiklerim');
            document.getElementById('vaDropdownOrders').textContent = t('auth.dropdown.orders', 'Siparişlerim');
            document.getElementById('vaDropdownLogout').textContent = t('auth.dropdown.logout', 'Çıkış Yap');
          }
        }
      }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.VISORA_AUTH = {
    me: me,
    login: login,
    register: register,
    logout: logout,
    requireAuth: requireAuth,
    openModal: openModal
  };

})();
