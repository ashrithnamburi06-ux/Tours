// admin/js/admin-api.js — API client with mock fallback
(function () {
  'use strict';

  var API_BASE_URL = 'https://tours-yd3g.onrender.com/api';

  function normalizeList(json, key) {
    if (Array.isArray(json)) return json;
    if (json && Array.isArray(json.data)) return json.data;
    if (key && json && json[key]) return json[key];
    return [];
  }

  function authHeaders(json) {
    var h = {};
    if (!json) h['Content-Type'] = 'application/json';
    var token = typeof getAdminToken === 'function' ? getAdminToken() : null;
    if (token) h.Authorization = 'Bearer ' + token;
    return h;
  }

  window.AdminAPI = {
    baseUrl: API_BASE_URL,

    get: function (endpoint, mockKey) {
      var url = API_BASE_URL + endpoint;
      url += (url.indexOf('?') === -1 ? '?' : '&') + 'all=true';
      return fetch(url, { headers: authHeaders(true) })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.json();
        })
        .then(function (json) {
          return { ok: true, data: normalizeList(json), raw: json };
        })
        .catch(function (err) {
          console.warn('[AdminAPI] GET ' + endpoint + ' failed, using mock:', err.message);
          var mock = typeof AdminMockData !== 'undefined' && mockKey ? AdminMockData[mockKey] : [];
          return { ok: false, data: mock || [], error: err.message, mock: true };
        });
    },

    getOne: function (endpoint, id, mockKey) {
      return fetch(API_BASE_URL + endpoint + '/' + encodeURIComponent(id), {
        headers: authHeaders(true),
      })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.json();
        })
        .then(function (json) {
          var item = json.data || json;
          return { ok: true, data: item };
        })
        .catch(function (err) {
          console.warn('[AdminAPI] GET one failed, using mock:', err.message);
          var list = (AdminMockData && mockKey && AdminMockData[mockKey]) || [];
          var item = list.find(function (x) {
            return x._id === id || x.slug === id;
          });
          return { ok: false, data: item || null, mock: true };
        });
    },

    post: function (endpoint, body) {
      return fetch(API_BASE_URL + endpoint, {
        method: 'POST',
        headers: authHeaders(false),
        body: JSON.stringify(body),
      })
        .then(function (res) {
          return res.json().then(function (json) {
            if (!res.ok) {
              throw new Error((json && json.message) || 'Request failed');
            }
            return { ok: true, data: (json && json.data) || json };
          });
        })
        .catch(function (err) {
          if (err.message) throw err;
          throw new Error('Network error — is the API server running?');
        });
    },

    put: function (endpoint, id, body) {
      return fetch(API_BASE_URL + endpoint + '/' + encodeURIComponent(id), {
        method: 'PUT',
        headers: authHeaders(false),
        body: JSON.stringify(body),
      }).then(function (res) {
        return res.json().then(function (json) {
          if (!res.ok) {
            throw new Error((json && json.message) || 'Request failed');
          }
          return { ok: true, data: (json && json.data) || json };
        });
      });
    },

    patchStatus: function (endpoint, id, status) {
      return fetch(
        API_BASE_URL + endpoint + '/' + encodeURIComponent(id) + '/status',
        {
          method: 'PATCH',
          headers: authHeaders(false),
          body: JSON.stringify({ status: status }),
        }
      ).then(function (res) {
        return res.json().then(function (json) {
          if (!res.ok) throw new Error(json.message || 'Status update failed');
          return { ok: true, data: json.data || json };
        });
      });
    },

    delete: function (endpoint, id) {
      return fetch(API_BASE_URL + endpoint + '/' + encodeURIComponent(id), {
        method: 'DELETE',
        headers: authHeaders(true),
      }).then(function (res) {
        if (!res.ok) {
          return res
            .json()
            .catch(function () {
              return {};
            })
            .then(function (json) {
              throw new Error((json && json.message) || 'Delete failed');
            });
        }
        return { ok: true };
      });
    },
  };
})();
