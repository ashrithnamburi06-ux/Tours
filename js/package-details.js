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

        // 1. Render Inclusions (Included details)
        const includedList = document.querySelector('.single-feature-list ul.items-list:not(.two)');
        if (includedList && pkg.included && pkg.included.length > 0) {
            includedList.innerHTML = pkg.included.map(inc => `
                <li>
                    <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 8C15 4.13401 11.866 1 8 1C4.13401 1 1 4.13401 1 8C1 11.866 4.13401 15 8 15V16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8C16 12.4183 12.4183 16 8 16V15C11.866 15 15 11.866 15 8Z"></path>
                        <path d="M11.6947 6.45795L7.24644 10.9086C7.17556 10.9771 7.08572 11.0126 6.99596 11.0126C6.9494 11.0127 6.90328 11.0035 6.86027 10.9857C6.81727 10.9678 6.77822 10.9416 6.7454 10.9086L4.3038 8.46699C4.16436 8.32987 4.16436 8.10539 4.3038 7.96595L5.16652 7.10083C5.29892 6.96851 5.53524 6.96851 5.66764 7.10083L6.99596 8.42915L10.3309 5.09179C10.3638 5.05887 10.4028 5.03274 10.4457 5.01489C10.4887 4.99705 10.5347 4.98784 10.5812 4.98779C10.6757 4.98779 10.7656 5.02563 10.8317 5.09179L11.6944 5.95699C11.8341 6.09643 11.8341 6.32091 11.6947 6.45795Z"></path>
                    </svg>
                    ${inc}
                </li>
            `).join('');
        }

        // 2. Render Exclusions (Excluded details)
        const excludedList = document.querySelector('.single-feature-list ul.items-list.two');
        if (excludedList && pkg.excluded && pkg.excluded.length > 0) {
            excludedList.innerHTML = pkg.excluded.map(exc => `
                <li>
                    <svg class="exclude" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                        <g>
                            <path d="M15 8C15 4.13401 11.866 1 8 1C4.13401 1 1 4.13401 1 8C1 11.866 4.13401 15 8 15C11.866 15 15 11.866 15 8ZM16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8Z"></path>
                            <path d="M6.00165 5.00036C5.8601 5.00368 5.72612 5.05514 5.62413 5.15703L5.1296 5.65267C4.89714 5.88495 4.92646 6.28828 5.19443 6.55662L6.67129 8.03561L5.19443 9.51394C4.92646 9.78219 4.89704 10.1856 5.1296 10.4184L5.62413 10.9136C5.8566 11.1458 6.2592 11.117 6.52753 10.8486L8.0044 9.36982L9.48126 10.8486C9.74978 11.117 10.1527 11.1458 10.3847 10.9136L10.8799 10.4184C11.1119 10.1857 11.0831 9.78228 10.8145 9.51394L9.33769 8.03561L10.8145 6.55662C11.0831 6.28828 11.1119 5.88495 10.8799 5.65267L10.3847 5.15703C10.1527 4.92429 9.74978 4.9537 9.48126 5.22241L8.0044 6.70084L6.52753 5.2225C6.37677 5.07109 6.18321 4.99594 6.00165 5.00036Z"></path>
                        </g>
                    </svg>
                    ${exc}
                </li>
            `).join('');
        }

        // 3. Render Availability Badge
        const availabilityArea = document.querySelector('.pricing-and-booking-area .batch');
        if (availabilityArea) {
            let badgeColor = '#28a745'; // Green for Available
            if (pkg.availabilityStatus === 'Limited Seats') {
                badgeColor = '#ffc107'; // Yellow for Limited Seats
            } else if (pkg.availabilityStatus === 'Sold Out') {
                badgeColor = '#dc3545'; // Red for Sold Out
            }
            availabilityArea.innerHTML = `<span style="background-color: ${badgeColor}; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;">${pkg.availabilityStatus || 'Available'}</span>`;
        }

        // Disable booking if sold out
        const checkAvailabilityBtn = document.querySelector('.pricing-and-booking-area button.primary-btn1:not(.transparent)');
        if (pkg.availabilityStatus === 'Sold Out' && checkAvailabilityBtn) {
            checkAvailabilityBtn.disabled = true;
            checkAvailabilityBtn.style.backgroundColor = '#6c757d';
            checkAvailabilityBtn.style.cursor = 'not-allowed';
            checkAvailabilityBtn.style.borderColor = '#6c757d';
            checkAvailabilityBtn.innerHTML = '<span>Sold Out</span>';
        }

        // 4. Populate Dynamic Dates in booking modal
        const dateInput = document.querySelector('input[name="tourBookingCalendar"]');
        if (dateInput && pkg.travelDates && pkg.travelDates.length > 0) {
            const selectHtml = `
                <select name="travelDate" class="form-select" id="booking-travel-date" style="padding: 10px; border-radius: 5px; border: 1px solid #ccc; width: 100%;">
                    ${pkg.travelDates.map(date => `<option value="${date}">${date}</option>`).join('')}
                </select>
            `;
            const parent = dateInput.parentElement;
            if (parent) {
                parent.innerHTML = selectHtml;
            }
        }

        // 5. Handle Booking Modal Form Submissions / Checkout Redirection
        const bookNowBtn = document.querySelector('#bookingModal .btn-area a.primary-btn1');
        if (bookNowBtn) {
            bookNowBtn.addEventListener('click', function (e) {
                e.preventDefault();
                
                const dateSelect = document.getElementById('booking-travel-date');
                const selectedDate = dateSelect ? dateSelect.value : '';
                
                const adultsInput = document.querySelector('input[name="adult_quantity"]');
                const childInput = document.querySelector('input[name="child_quantity"]');
                const adults = adultsInput ? adultsInput.value : 1;
                const children = childInput ? childInput.value : 0;
                
                if (!selectedDate) {
                    alert('Please select a travel date.');
                    return;
                }
                
                window.location.href = `checkout.html?package=${pkg.slug}&date=${encodeURIComponent(selectedDate)}&adults=${adults}&children=${children}`;
            });
        }

        // 6. Handle Inquiry Form Submission
        const enquiryForm = document.querySelector('#enquiryModal form');
        if (enquiryForm) {
            // Unbind any previous listener
            const newForm = enquiryForm.cloneNode(true);
            enquiryForm.parentNode.replaceChild(newForm, enquiryForm);
            
            newForm.addEventListener('submit', async function (e) {
                e.preventDefault();
                
                const nameInput = newForm.querySelector('input[type="text"]:not([name])'); // Full Name
                const emailInput = newForm.querySelector('input[type="email"]');
                const peopleInput = newForm.querySelector('input[placeholder="Number of people"]');
                const dateInput = newForm.querySelector('input[name="inOut"]');
                const detailsInput = newForm.querySelector('textarea');
                
                const payload = {
                    name: nameInput ? nameInput.value : '',
                    email: emailInput ? emailInput.value : '',
                    numberOfPeople: peopleInput ? Number(peopleInput.value) || 1 : 1,
                    travelDate: dateInput ? dateInput.value : '',
                    details: detailsInput ? detailsInput.value : ''
                };
                
                if (!payload.name || !payload.email || !payload.details) {
                    alert('Please fill out Name, Email, and Tour Details.');
                    return;
                }
                
                try {
                    const response = await fetch(apiUrl('/inquiries'), {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    });
                    
                    if (response.ok) {
                        alert('Your inquiry was submitted successfully! Our agents will contact you shortly.');
                        newForm.reset();
                        // Hide modal using bootstrap
                        jQuery('#enquiryModal').modal('hide');
                    } else {
                        const err = await response.json();
                        alert('Failed to submit inquiry: ' + (err.message || 'Server error'));
                    }
                } catch (err) {
                    alert('Cannot reach the server right now. Please try again later.');
                }
            });
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
