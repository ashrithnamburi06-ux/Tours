// admin/js/admin-auth.js — auth guard prep (soft by default)
(function () {
  'use strict';

  var AUTH_TOKEN_KEY = 'jwt_token';
  var USER_INFO_KEY = 'user_info';

  /** Set true when ready to enforce login on all admin pages */
  var ADMIN_AUTH_ENFORCED = true;

  window.isAuthenticated = function () {
    return !!localStorage.getItem(AUTH_TOKEN_KEY);
  };

  window.getAdminToken = function () {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  };

  window.getCurrentUser = function () {
    var raw = localStorage.getItem(USER_INFO_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  };

  window.guardAdmin = function () {
    if (!ADMIN_AUTH_ENFORCED) {
      showAuthBanner();
      return;
    }
    if (!isAuthenticated()) {
      var redirect = encodeURIComponent(
        window.location.pathname + window.location.search
      );
      window.location.href =
        '../login.html?redirect=' + redirect;
    }
  };

  function showAuthBanner() {
    if (isAuthenticated()) return;
    var main = document.querySelector('.admin-main');
    if (!main || document.getElementById('admin-auth-banner')) return;
    var el = document.createElement('div');
    el.id = 'admin-auth-banner';
    el.className = 'admin-alert-banner';
    el.innerHTML =
      '<strong>Preview mode:</strong> Log in at <a href="../login.html">login.html</a> to save changes via API. Mock data is shown when the API is unavailable.';
    main.insertBefore(el, main.firstChild);
  }

  window.adminLogout = function () {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_INFO_KEY);
    window.location.href = '../login.html';
  };

  document.addEventListener('DOMContentLoaded', function () {
    guardAdmin();
    var userEl = document.getElementById('admin-user-name');
    if (userEl) {
      var user = getCurrentUser();
      userEl.textContent = user ? user.name || user.email : 'Guest';
    }
    var logoutBtn = document.getElementById('admin-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function (e) {
        e.preventDefault();
        adminLogout();
      });
    }
  });
})();
