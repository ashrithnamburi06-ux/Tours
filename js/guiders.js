// js/guiders.js
// Dynamic guider listing — fallback-first (static cards remain if API fails)

(function () {
  'use strict';

  var API_BASE_URL = window.API_BASE_URL || 'https://tours-yd3g.onrender.com/api';

  function renderGuiderCard(guider, index) {
    var delay = (index % 4) * 200 + 200;
    var image = resolveImageUrl(guider.photo || guider.profileImage, 'images/tour-guide-img1.png');
    var name = guider.name || 'Guider';
    var designation =
      guider.title || guider.designation || 'GoFly Guider';
    var detailHref = guider.slug
      ? 'guider-details.html?slug=' + encodeURIComponent(guider.slug)
      : 'guider-details.html';

    var socialLinksHtml = '';
    if (guider.socialLinks && typeof guider.socialLinks === 'object') {
      if (guider.socialLinks.facebook) {
        socialLinksHtml +=
          '<li><a href="' +
          guider.socialLinks.facebook +
          '"><i class="bx bxl-facebook"></i></a></li>';
      }
      if (guider.socialLinks.linkedin) {
        socialLinksHtml +=
          '<li><a href="' +
          guider.socialLinks.linkedin +
          '"><i class="bx bxl-linkedin"></i></a></li>';
      }
      if (guider.socialLinks.twitter) {
        socialLinksHtml +=
          '<li><a href="' +
          guider.socialLinks.twitter +
          '"><i class="bx bxl-twitter"></i></a></li>';
      }
      if (guider.socialLinks.instagram) {
        socialLinksHtml +=
          '<li><a href="' +
          guider.socialLinks.instagram +
          '"><i class="bx bxl-instagram"></i></a></li>';
      }
    }

    if (!socialLinksHtml) {
      socialLinksHtml =
        '<li><a href="https://www.facebook.com/"><i class="bx bxl-facebook"></i></a></li>' +
        '<li><a href="https://www.linkedin.com/"><i class="bx bxl-linkedin"></i></a></li>';
    }

    var specialty = guider.destinationSpecialty || guider.specialty || '';
    var specialtyHtml = specialty
      ? '<span class="d-block" style="font-size:12px;margin-top:4px;color:#666;">' +
        specialty +
        '</span>'
      : '';

    return (
      '<div class="col-lg-3 col-md-4 col-sm-6 wow animate fadeInDown" data-wow-delay="' +
      delay +
      'ms" data-wow-duration="1500ms">' +
      '<div class="tour-guide-card two">' +
      '<div class="guide-img-wrap">' +
      '<a href="' +
      detailHref +
      '" class="guide-img">' +
      '<img src="' +
      image +
      '" alt="' +
      name +
      '" onerror="this.onerror=null;this.src=\'images/tour-guide-img1.png\';">' +
      '</a>' +
      '<ul class="social-list">' +
      socialLinksHtml +
      '</ul>' +
      '</div>' +
      '<div class="guide-info">' +
      '<h5><a href="' +
      detailHref +
      '">' +
      name +
      '</a></h5>' +
      '<span>' +
      designation +
      '</span>' +
      specialtyHtml +
      '</div>' +
      '</div>' +
      '</div>'
    );
  }

  function loadGuiders() {
    var wrap = document.getElementById('guider-list-wrap');
    if (!wrap) return;

    fetch(apiUrl('/guiders'))
      .then(function (response) {
        if (!response.ok) throw new Error('API error ' + response.status);
        return response.json();
      })
      .then(function (result) {
        var items = parseApiList(result).filter(function (g) {
          return g.status === 'active';
        });
        if (!items.length) return;

        var html = '';
        items.forEach(function (item, index) {
          html += renderGuiderCard(item, index);
        });
        wrap.innerHTML = html;

        if (typeof WOW !== 'undefined') {
          new WOW({ live: false }).init();
        }
      })
      .catch(function () {
        /* static guider cards remain */
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadGuiders);
  } else {
    loadGuiders();
  }
})();
