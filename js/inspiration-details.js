// js/inspiration-details.js
// Slug-based inspiration details — travel-inspiration-details.html?slug={slug}

(function () {
  'use strict';

  var API_BASE_URL = window.API_BASE_URL || 'https://tours-yd3g.onrender.com/api';

  function getSlugFromUrl() {
    return new URLSearchParams(window.location.search).get('slug');
  }

  function loadInspirationDetails() {
    var slug = getSlugFromUrl();
    if (!slug) {
      return;
    }

    fetch(apiUrl('/inspirations/' + encodeURIComponent(slug)))
      .then(function (response) {
        if (!response.ok) throw new Error('API error ' + response.status);
        return response.json();
      })
      .then(function (result) {
        var item = parseApiItem(result);
        if (!item || (item.status && item.status !== 'active')) return;

        var titleEl = document.getElementById('inspiration-detail-title');
        var introEl = document.getElementById('inspiration-detail-intro');
        var heroImg = document.querySelector(
          '#inspiration-detail-hero img'
        );
        var categoryEl = document.getElementById('inspiration-detail-category');

        if (titleEl && item.title) {
          titleEl.textContent = item.title;
        }

        if (introEl) {
          var intro = item.excerpt || item.shortDescription || '';
          if (intro) introEl.textContent = intro;
        }

        if (heroImg) {
          heroImg.src = resolveImageUrl(item.images, 'images/blog-img1.jpg');
          heroImg.alt = item.title || '';
          heroImg.onerror = function () {
            this.onerror = null;
            this.src = 'images/blog-img1.jpg';
          };
        }

        if (categoryEl) {
          var category = item.category || item.location || '';
          if (category) categoryEl.textContent = category;
        }

        if (item.content) {
          var contentEl = document.getElementById('inspiration-detail-content');
          if (contentEl) contentEl.innerHTML = item.content;
        }

        if (item.title) {
          document.title = item.title + ' - Gofly';
        }
      })
      .catch(function () {
        /* static inspiration detail remains */
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadInspirationDetails);
  } else {
    loadInspirationDetails();
  }
})();
