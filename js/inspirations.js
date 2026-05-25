// js/inspirations.js
// Travel inspiration list + experience grid (same API, layout-aware)

(function () {
  'use strict';

  var API_BASE_URL = window.API_BASE_URL || 'https://tours-yd3g.onrender.com/api';

  var locationSvg16 =
    '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M7.81273 0C4.31731 0 1.47302 2.84433 1.47302 6.34163C1.47302 9.07242 5.28467 13.5258 6.92353 15.3136C7.15049 15.5628 7.47603 15.7042 7.81273 15.7042C8.14943 15.7042 8.47497 15.5628 8.70193 15.3136C10.3408 13.5258 14.1524 9.07238 14.1524 6.34163C14.1524 2.84433 11.3081 0 7.81273 0ZM8.35963 14.9991C8.21639 15.1535 8.02294 15.2391 7.81273 15.2391C7.60252 15.2391 7.40907 15.1536 7.26583 14.9991C5.66414 13.2525 1.93809 8.90875 1.93809 6.34167C1.93809 3.10103 4.57218 0.465067 7.81273 0.465067C11.0533 0.465067 13.6874 3.10103 13.6874 6.34167C13.6874 8.90875 9.96132 13.2524 8.35963 14.9991Z"></path>' +
    '<path d="M7.81274 9.76647C9.67127 9.76647 11.1779 8.25983 11.1779 6.4013C11.1779 4.54277 9.67127 3.03613 7.81274 3.03613C5.95421 3.03613 4.44757 4.54277 4.44757 6.4013C4.44757 8.25983 5.95421 9.76647 7.81274 9.76647Z"></path>' +
    '</svg>';

  var locationSvg14 =
    '<svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M6.83615 0C3.77766 0 1.28891 2.48879 1.28891 5.54892C1.28891 7.93837 4.6241 11.8351 6.05811 13.3994C6.25669 13.6175 6.54154 13.7411 6.83615 13.7411C7.13076 13.7411 7.41561 13.6175 7.6142 13.3994C9.04821 11.8351 12.3834 7.93833 12.3834 5.54892C12.3834 2.48879 9.89464 0 6.83615 0ZM7.31469 13.1243C7.18936 13.2594 7.02008 13.3342 6.83615 13.3342C6.65222 13.3342 6.48295 13.2594 6.35761 13.1243C4.95614 11.5959 1.69584 7.79515 1.69584 5.54896C1.69584 2.7134 4.00067 0.406933 6.83615 0.406933C9.67164 0.406933 11.9765 2.7134 11.9765 5.54896C11.9765 7.79515 8.71617 11.5959 7.31469 13.1243Z"></path>' +
    '<path d="M6.83618 8.54554C8.4624 8.54554 9.7807 7.22723 9.7807 5.60102C9.7807 3.9748 8.4624 2.65649 6.83618 2.65649C5.20997 2.65649 3.89166 3.9748 3.89166 5.60102C3.89166 7.22723 5.20997 8.54554 6.83618 8.54554Z"></path>' +
    '</svg>';

  var calendarSvg =
    '<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">' +
    '<g><path d="M5.33329 9.66683C5.70148 9.66683 5.99996 9.36835 5.99996 9.00016C5.99996 8.63197 5.70148 8.3335 5.33329 8.3335C4.9651 8.3335 4.66663 8.63197 4.66663 9.00016C4.66663 9.36835 4.9651 9.66683 5.33329 9.66683Z"></path>' +
    '<path fill-rule="evenodd" clip-rule="evenodd" d="M0.833313 13.0002V4.3335C0.833666 3.67056 1.09717 3.03488 1.56594 2.56612C2.0347 2.09735 2.67038 1.83385 3.33331 1.8335H12.6666C13.3296 1.83385 13.9653 2.09735 14.434 2.56612C14.9028 3.03488 15.1663 3.67056 15.1666 4.3335V13.0002C15.1663 13.6631 14.9028 14.2988 14.434 14.7675C13.9653 15.2363 13.3296 15.4998 12.6666 15.5002H3.33331C2.67038 15.4998 2.0347 15.2363 1.56594 14.7675C1.09717 14.2988 0.833666 13.6631 0.833313 13.0002ZM1.83331 6.50016V13.0002C1.83331 13.398 1.99135 13.7795 2.27265 14.0608C2.55396 14.3421 2.93549 14.5002 3.33331 14.5002H12.6666C13.0645 14.5002 13.446 14.3421 13.7273 14.0608C14.0086 13.7795 14.1666 13.398 14.1666 13.0002V6.50016H1.83331Z"></path></g></svg>';

  var dividerSvgBlog =
    '<svg class="divider" height="6" viewBox="0 0 288 6" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M5 2.5L0 0.113249V5.88675L5 3.5V2.5ZM283 3.5L288 5.88675V0.113249L283 2.5V3.5ZM4.5 3.5H283.5V2.5H4.5V3.5Z"></path></svg>';

  var dividerSvgPackage =
    '<svg class="divider" height="6" viewBox="0 0 374 6" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M5 2.5L0 0.113249V5.88675L5 3.5V2.5ZM369 3.5L374 5.88675V0.113249L369 2.5V3.5ZM4.5 3.5H369.5V2.5H4.5V3.5Z"></path></svg>';

  function detailsUrl(slug) {
    return (
      'travel-inspiration-details.html?slug=' + encodeURIComponent(slug || '')
    );
  }

  function formatDate(item) {
    var dateObj = item.date ? new Date(item.date) : new Date(item.createdAt);
    if (isNaN(dateObj.getTime())) return '';
    var months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return (
      dateObj.getDate() +
      ' ' +
      months[dateObj.getMonth()] +
      ', ' +
      dateObj.getFullYear()
    );
  }

  function getImage(item) {
    return resolveImageUrl(item.images, 'images/blog-img1.jpg');
  }

  function getCategory(item) {
    return item.category || item.location || '';
  }

  function getDescription(item) {
    return item.excerpt || item.shortDescription || '';
  }

  function renderInspirationBlogCard(item, index) {
    var delay = (index % 3) * 200 + 200;
    var href = item.slug ? detailsUrl(item.slug) : 'travel-inspiration-details.html';
    var image = getImage(item);
    var category = getCategory(item);
    var title = item.title || '';
    var description = getDescription(item);
    var dateLabel = formatDate(item);

    return (
      '<div class="col-lg-6 wow animate fadeInDown" data-wow-delay="' +
      delay +
      'ms" data-wow-duration="1500ms">' +
      '<div class="blog-card">' +
      '<a href="' +
      href +
      '" class="blog-img"><img src="' +
      image +
      '" alt=""></a>' +
      '<div class="blog-content">' +
      '<div class="blog-content-top">' +
      '<a href="' +
      href +
      '" class="location">' +
      locationSvg16 +
      category +
      '</a>' +
      '<h4><a href="' +
      href +
      '">' +
      title +
      '</a></h4>' +
      (dateLabel
        ? '<a href="travel-inspiration-01.html" class="blog-date">' +
          calendarSvg +
          dateLabel +
          '</a>'
        : '') +
      '</div>' +
      dividerSvgBlog +
      (description ? '<p>' + description + '</p>' : '') +
      '</div></div></div>'
    );
  }

  function renderInspirationPackageCard(item, index) {
    var delay = (index % 4) * 200 + 200;
    var href = item.slug ? detailsUrl(item.slug) : 'travel-inspiration-details.html';
    var image = getImage(item);
    var category = getCategory(item);
    var title = item.title || '';
    var description = getDescription(item);

    return (
      '<div class="col-md-6 item wow animate fadeInDown" data-wow-delay="' +
      delay +
      'ms" data-wow-duration="1500ms">' +
      '<div class="package-card">' +
      '<div class="package-img-wrap">' +
      '<a href="' +
      href +
      '" class="package-img"><img src="' +
      image +
      '" alt=""></a>' +
      '</div>' +
      '<div class="package-content">' +
      '<h5><a href="' +
      href +
      '">' +
      title +
      '</a></h5>' +
      '<div class="location-and-time">' +
      '<div class="location">' +
      locationSvg14 +
      '<a href="travel-inspiration-01.html">' +
      category +
      '</a></div></div>' +
      (description
        ? '<ul class="package-info"><li>' + description + '</li></ul>'
        : '') +
      '<div class="btn-and-price-area">' +
      '<a href="' +
      href +
      '" class="primary-btn1"><span>Read More</span><span>Read More</span></a>' +
      '</div>' +
      dividerSvgPackage +
      '</div></div></div>'
    );
  }

  function detectLayout(wrap) {
    if (wrap.getAttribute('data-layout') === 'package') return 'package';
    if (wrap.closest('.list-grid-product-wrap')) return 'package';
    return 'blog';
  }

  function loadInspirations() {
    var wrap = document.getElementById('inspirations-list-wrap');
    if (!wrap) return;

    var layout = detectLayout(wrap);

    fetch(apiUrl('/inspirations'))
      .then(function (response) {
        if (!response.ok) throw new Error('API error ' + response.status);
        return response.json();
      })
      .then(function (result) {
        var items = parseApiList(result).filter(function (item) {
          return item.status === 'active';
        });
        if (!items.length) return;

        var html = '';
        items.forEach(function (item, index) {
          html +=
            layout === 'package'
              ? renderInspirationPackageCard(item, index)
              : renderInspirationBlogCard(item, index);
        });
        wrap.innerHTML = html;

        if (typeof WOW !== 'undefined') {
          new WOW({ live: false }).init();
        }
      })
      .catch(function () {
        /* static inspiration cards remain */
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadInspirations);
  } else {
    loadInspirations();
  }
})();
