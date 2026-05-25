// js/api.js — shared API helpers (classic script, global)
(function () {
  'use strict';

  var PLACEHOLDER_IMAGE = 'images/tour-package-img1.jpg';

  function resolveApiBase() {
    // Connect permanently to the deployed Render backend for both production and development
    return 'https://tours-yd3g.onrender.com/api';
  }

  function getToken() {
    return localStorage.getItem('jwt_token');
  }

  window.API_BASE_URL = resolveApiBase();

  window.apiUrl = function (path) {
    var p = path.charAt(0) === '/' ? path : '/' + path;
    return window.API_BASE_URL + p;
  };

  window.getAuthHeaders = function (json) {
    var headers = {};
    if (json !== false) headers['Content-Type'] = 'application/json';
    var token = getToken();
    if (token) headers.Authorization = 'Bearer ' + token;
    return headers;
  };

  /** Normalize list responses: { success, data } or raw array */
  window.parseApiList = function (json) {
    if (!json) return [];
    if (Array.isArray(json)) return json;
    if (json.data !== undefined) {
      return Array.isArray(json.data) ? json.data : [];
    }
    return [];
  };

  /** Normalize single-item responses */
  window.parseApiItem = function (json) {
    if (!json) return null;
    if (json.data !== undefined && !Array.isArray(json.data)) return json.data;
    if (json.success && json.user) return json.user;
    return json;
  };

  window.parseApiMessage = function (json) {
    if (!json) return 'Something went wrong. Please try again.';
    if (json.message) return json.message;
    if (json.errors && json.errors.length) {
      return json.errors.map(function (e) {
        return e.message || e.msg || String(e);
      }).join(' ');
    }
    return 'Something went wrong. Please try again.';
  };

  window.resolveImageUrl = function (src, fallback) {
    fallback = fallback || PLACEHOLDER_IMAGE;
    if (!src) return fallback;
    if (typeof src === 'string' && src.trim()) return src;
    if (Array.isArray(src) && src.length && src[0]) return src[0];
    return fallback;
  };

  window.apiFetch = function (path, options) {
    options = options || {};
    var headers = Object.assign(
      {},
      getAuthHeaders(options.json !== false),
      options.headers || {}
    );
    return fetch(apiUrl(path), {
      method: options.method || 'GET',
      headers: headers,
      body: options.body,
    }).then(function (res) {
      return res.json().catch(function () {
        return {};
      }).then(function (json) {
        return { ok: res.ok, status: res.status, json: json };
      });
    });
  };

  window.safeApiList = function (path, options) {
    return apiFetch(path, options).then(function (result) {
      if (!result.ok) {
        return {
          ok: false,
          data: [],
          error: parseApiMessage(result.json),
          usedFallback: true,
        };
      }
      return {
        ok: true,
        data: parseApiList(result.json),
        usedFallback: false,
      };
    }).catch(function () {
      return {
        ok: false,
        data: [],
        error: 'Unable to reach the server. Showing saved content.',
        usedFallback: true,
      };
    });
  };

  window.safeApiItem = function (path, options) {
    return apiFetch(path, options).then(function (result) {
      if (!result.ok) {
        return {
          ok: false,
          data: null,
          error: parseApiMessage(result.json),
          usedFallback: true,
        };
      }
      return {
        ok: true,
        data: parseApiItem(result.json),
        usedFallback: false,
      };
    }).catch(function () {
      return {
        ok: false,
        data: null,
        error: 'Unable to reach the server.',
        usedFallback: true,
      };
    });
  };

  window.refName = function (ref) {
    if (!ref) return '';
    if (typeof ref === 'string') return ref;
    return ref.name || ref.title || '';
  };
})();
