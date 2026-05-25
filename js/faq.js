// js/faq.js
// Dynamic FAQ accordion — fallback-first

(function () {
  'use strict';

  var API_BASE_URL = window.API_BASE_URL || 'https://tours-yd3g.onrender.com/api';

  function renderFAQItem(faq, index) {
    var delay = (index % 4) * 200 + 200;
    var isFirst = index === 0;
    var buttonClass = isFirst
      ? 'accordion-button'
      : 'accordion-button collapsed';
    var expandedAttr = isFirst ? 'true' : 'false';
    var collapseClass = isFirst
      ? 'accordion-collapse collapse show'
      : 'accordion-collapse collapse';

    return (
      '<div class="accordion-item wow animate fadeInDown" data-wow-delay="' +
      delay +
      'ms" data-wow-duration="1500ms">' +
      '<h5 class="accordion-header" id="flush-heading' +
      index +
      '">' +
      '<button class="' +
      buttonClass +
      '" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapse' +
      index +
      '" aria-expanded="' +
      expandedAttr +
      '" aria-controls="flush-collapse' +
      index +
      '">' +
      faq.question +
      '</button></h5>' +
      '<div id="flush-collapse' +
      index +
      '" class="' +
      collapseClass +
      '" aria-labelledby="flush-heading' +
      index +
      '" data-bs-parent="#accordionFlushExample">' +
      '<div class="accordion-body">' +
      faq.answer +
      '</div></div></div>'
    );
  }

  function loadFAQs() {
    var wrap = document.getElementById('accordionFlushExample');
    if (!wrap) return;

    fetch(apiUrl('/faqs'))
      .then(function (response) {
        if (!response.ok) throw new Error('API error ' + response.status);
        return response.json();
      })
      .then(function (result) {
        var faqs = parseApiList(result).filter(function (faq) {
          return faq.status === 'active';
        });
        if (!faqs.length) return;

        wrap.innerHTML = faqs
          .map(function (faq, i) {
            return renderFAQItem(faq, i);
          })
          .join('');

        if (typeof WOW !== 'undefined') {
          new WOW({ live: false }).init();
        }
      })
      .catch(function () {
        /* static FAQ accordion remains */
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadFAQs);
  } else {
    loadFAQs();
  }
})();
