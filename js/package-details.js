// js/package-details.js

(function () {
    'use strict';

    var API_BASE_URL = window.API_BASE_URL || 'https://tours-yd3g.onrender.com/api';
    
    const state = {
        package: null,
        relatedPackages: []
    };

    function getSlugFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('slug');
    }

    async function loadPackageDetails(slug) {
        if (!slug) {
            return;
        }

        try {
            const response = await fetch(apiUrl('/packages/' + encodeURIComponent(slug)));
            if (!response.ok) {
                throw new Error('Package API error: ' + response.status);
            }
            
            const result = await response.json();
            const pkg = parseApiItem(result);
            state.package = pkg;
            
            renderPackageDetails(pkg);
            loadRelatedPackages(pkg);

        } catch (error) {
            /* static package content remains */
        }
    }

    function renderPackageDetails(pkg) {
        const titleEl = document.getElementById('pkg-main-title');
        const priceBadgeEl = document.getElementById('pkg-price-badge');
        const metaBadgeEl = document.getElementById('pkg-meta-badge');
        const overviewEl = document.getElementById('pkg-overview');
        
        if (titleEl && pkg.title) titleEl.textContent = pkg.title;
        if (priceBadgeEl && pkg.price) priceBadgeEl.textContent = `$${pkg.price}`;
        
        if (metaBadgeEl) {
            let meta = [];
            if (pkg.duration) meta.push(pkg.duration);
            if (pkg.destination && pkg.destination.name) meta.push(pkg.destination.name);
            else if (pkg.destination) meta.push(pkg.destination);
            
            if (meta.length > 0) {
                metaBadgeEl.textContent = meta.join(' | ');
            }
        }
        
        if (overviewEl && pkg.description) {
            overviewEl.innerHTML = pkg.description;
        }

        renderGallery(pkg);
    }

    function renderGallery(pkg) {
        const wrapper = document.getElementById('pkg-gallery-wrapper');
        if (!wrapper) return;
        
        const images = pkg.images && pkg.images.length > 0 ? pkg.images : (pkg.gallery || []);
        
        if (images.length === 0) return; // Keep static
        
        let html = '';
        images.forEach(img => {
            html += `
                <div class="swiper-slide">
                    <div class="banner-bg" style="background-image:linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${img});">
                    </div>
                </div>
            `;
        });
        
        wrapper.innerHTML = html;
        
        const swiperContainer = wrapper.closest('.swiper');
        if (swiperContainer && swiperContainer.swiper) {
            swiperContainer.swiper.destroy(true, true);
        }
        
        if (typeof Swiper !== 'undefined') {
            new Swiper('.home2-banner-slider', {
                slidesPerView: 1,
                speed: 1500,
                spaceBetween: 0,
                loop: true,
                autoplay: {
                    delay: 2500,
                    disableOnInteraction: false,
                },
                navigation: {
                    nextEl: '.banner-slider-next',
                    prevEl: '.banner-slider-prev',
                }
            });
        }
    }

    async function loadRelatedPackages(currentPkg) {
        const wrapper = document.getElementById('pkg-related-slider');
        if (!wrapper) return;
        
        try {
            let queryParams = new URLSearchParams();
            if (currentPkg.destination) {
                const destVal = typeof currentPkg.destination === 'object' ? currentPkg.destination.name : currentPkg.destination;
                queryParams.append('destination', destVal);
            } else if (currentPkg.category) {
                const catVal = typeof currentPkg.category === 'object' ? currentPkg.category.name : currentPkg.category;
                queryParams.append('category', catVal);
            }
            
            const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
            const result = await safeApiList('/packages' + queryString);
            if (!result.ok) return;
            var packages = result.data;
            var destId = currentPkg.destination && currentPkg.destination._id;
            var destName = refName(currentPkg.destination);
            var filtered = packages.filter(function (p) {
              if (p.slug === currentPkg.slug) return false;
              if (p.status && p.status !== 'active') return false;
              if (destId || destName) {
                var pd = p.destination;
                if (!pd) return false;
                if (typeof pd === 'object') {
                  return (destId && String(pd._id) === String(destId)) ||
                    (destName && refName(pd).toLowerCase() === destName.toLowerCase());
                }
              }
              return true;
            }).slice(0, 4);
            
            if (filtered.length === 0) return;
            
            let html = '';
            filtered.forEach(pkg => {
                const img = resolveImageUrl(pkg.images, 'images/tour-package-img1.jpg');
                const dest = refName(pkg.destination) || 'Various';
                
                html += `
                    <div class="swiper-slide">
                        <div class="package-card">
                            <div class="package-img-wrap">
                                <a href="travel-package-details.html?slug=${pkg.slug}" class="package-img">
                                    <img src="${img}" alt="" onerror="this.onerror=null;this.src='images/tour-package-img1.jpg';">
                                </a>
                            </div>
                            <div class="package-content">
                                <h5><a href="travel-package-details.html?slug=${pkg.slug}">${pkg.title}</a></h5>
                                <div class="location-and-time">
                                    <div class="location">
                                        <svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M6.83615 0C3.77766 0 1.28891 2.48879 1.28891 5.54892C1.28891 7.93837 4.6241 11.8351 6.05811 13.3994C6.25669 13.6175 6.54154 13.7411 6.83615 13.7411C7.13076 13.7411 7.41561 13.6175 7.6142 13.3994C9.04821 11.8351 12.3834 7.93833 12.3834 5.54892C12.3834 2.48879 9.89464 0 6.83615 0ZM7.31469 13.1243C7.18936 13.2594 7.02008 13.3342 6.83615 13.3342C6.65222 13.3342 6.48295 13.2594 6.35761 13.1243C4.95614 11.5959 1.69584 7.79515 1.69584 5.54896C1.69584 2.7134 4.00067 0.406933 6.83615 0.406933C9.67164 0.406933 11.9765 2.7134 11.9765 5.54896C11.9765 7.79515 8.71617 11.5959 7.31469 13.1243Z"></path>
                                            <path d="M6.83618 8.54554C8.4624 8.54554 9.7807 7.22723 9.7807 5.60102C9.7807 3.9748 8.4624 2.65649 6.83618 2.65649C5.20997 2.65649 3.89166 3.9748 3.89166 5.60102C3.89166 7.22723 5.20997 8.54554 6.83618 8.54554Z"></path>
                                        </svg>
                                        ${dest}
                                    </div>
                                    <div class="time">
                                        <svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M6.99965 14C3.13947 14 0 10.8605 0 7C0 3.13947 3.13947 0 6.99965 0C10.8602 0 14 3.13947 14 7C14 10.8605 10.8602 14 6.99965 14ZM6.99965 1.05001C3.71881 1.05001 1.05001 3.71881 1.05001 7C1.05001 10.2812 3.71881 12.95 6.99965 12.95C10.2809 12.95 12.95 10.2812 12.95 7C12.95 3.71881 10.2809 1.05001 6.99965 1.05001Z"></path>
                                            <path d="M10.1497 9.80036C10.0155 9.80036 9.88126 9.7491 9.77857 9.6464L6.62839 6.49622C6.52554 6.39324 6.46777 6.25368 6.46777 6.10803V2.44999C6.46777 2.16003 6.70283 1.92499 6.99279 1.92499C7.28275 1.92499 7.51781 2.16003 7.51781 2.44999V5.89047L10.4449 8.81755C10.6501 9.0227 10.6501 9.35532 10.4449 9.56046C10.3637 9.64166 10.2573 9.80036 10.1497 9.80036Z"></path>
                                        </svg>
                                        ${pkg.duration || '5 Days/ 4 Nights'}
                                    </div>
                                </div>
                                <div class="price-and-btn" style="flex-wrap: wrap; gap: 8px;">
                                    <div class="price-area" style="margin-bottom: 5px; width: 100%; display: flex; justify-content: space-between; align-items: center;">
                                        <div style="text-align: left;">
                                            <h6 style="margin-bottom: 0;">Per Person</h6>
                                            <span>$${pkg.price}</span>
                                        </div>
                                    </div>
                                    <div class="cta-button-group" style="display: flex; gap: 8px; width: 100%;">
                                        <a href="travel-package-details.html?slug=${pkg.slug}" class="primary-btn1 two" style="flex: 1; height: 40px; line-height: 40px; justify-content: center; padding: 0 8px; font-size: 12px; display: inline-flex; align-items: center;">
                                            <span>View Details</span>
                                            <span>View Details</span>
                                        </a>
                                        <a href="checkout.html?package=${pkg.slug}" class="primary-btn1" style="flex: 1; height: 40px; line-height: 40px; justify-content: center; padding: 0 8px; font-size: 12px; display: inline-flex; align-items: center;">
                                            <span>Book Now</span>
                                            <span>Book Now</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            wrapper.innerHTML = html;
            
            const swiperContainer = wrapper.closest('.swiper');
            if (swiperContainer && swiperContainer.swiper) {
                swiperContainer.swiper.destroy(true, true);
            }
            
            if (typeof Swiper !== 'undefined') {
                new Swiper('.home1-trip-slider', {
                    slidesPerView: 1,
                    speed: 1500,
                    spaceBetween: 25,
                    navigation: {
                        nextEl: '.home1-trip-slider-next',
                        prevEl: '.home1-trip-slider-prev',
                    },
                    breakpoints: {
                        280: { slidesPerView: 1 },
                        386: { slidesPerView: 1 },
                        576: { slidesPerView: 2, spaceBetween: 15 },
                        768: { slidesPerView: 2, spaceBetween: 15 },
                        992: { slidesPerView: 3, spaceBetween: 15 },
                        1200: { slidesPerView: 4, spaceBetween: 15 },
                        1400: { slidesPerView: 4 }
                    }
                });
            }
            
        } catch(error) {
            /* static related packages remain */
        }
    }

    function init() {
        const slug = getSlugFromUrl();
        loadPackageDetails(slug);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
