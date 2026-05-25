// js/packages.js
(function () {
    'use strict';

    const state = {
        packages: [],
        destinations: [],
        categories: [],
        filters: {
            destination: [],
            category: [],
            duration: [],
            travelType: [],
            availability: [],
            date: '',
            priceMin: 10,
            priceMax: 3000,
            search: ''
        }
    };

    function parseQueryParams() {
        const params = new URLSearchParams(window.location.search);
        
        if (params.has('destination')) {
            const dests = params.get('destination').toLowerCase().split(',');
            dests.forEach(dest => {
                if (!state.filters.destination.includes(dest)) {
                    state.filters.destination.push(dest);
                }
            });
        }
        
        if (params.has('category')) {
            const cats = params.get('category').toLowerCase().split(',');
            cats.forEach(cat => {
                if (!state.filters.category.includes(cat)) {
                    state.filters.category.push(cat);
                }
            });
        }
        
        if (params.has('duration')) {
            const durs = params.get('duration').split(',');
            durs.forEach(dur => {
                if (!state.filters.duration.includes(dur)) {
                    state.filters.duration.push(dur);
                }
            });
        }

        if (params.has('travelType')) {
            const types = params.get('travelType').split(',');
            types.forEach(t => {
                if (!state.filters.travelType.includes(t)) {
                    state.filters.travelType.push(t);
                }
            });
        }

        if (params.has('availability')) {
            const avails = params.get('availability').split(',');
            avails.forEach(a => {
                if (!state.filters.availability.includes(a)) {
                    state.filters.availability.push(a);
                }
            });
        }

        if (params.has('date')) {
            state.filters.date = params.get('date');
        }

        if (params.has('priceMin')) {
            state.filters.priceMin = parseInt(params.get('priceMin'), 10) || 10;
        }

        if (params.has('priceMax')) {
            state.filters.priceMax = parseInt(params.get('priceMax'), 10) || 3000;
        }

        if (params.has('search')) {
            state.filters.search = params.get('search');
        }
    }

    async function loadFilters() {
        try {
            // Load Destinations
            const destResponse = await fetch(apiUrl('/destinations'));
            if (destResponse.ok) {
                const destData = await destResponse.json();
                state.destinations = parseApiList(destData);
                renderDestinationsFilter();
            }

            // Load Categories
            const catResponse = await fetch(apiUrl('/categories'));
            if (catResponse.ok) {
                const catData = await catResponse.json();
                state.categories = parseApiList(catData);
                renderCategoriesFilter();
            }
            
            syncDurationsFilter();
            renderAdditionalFilters();
            syncAdditionalFilters();
            initPriceSlider();

        } catch (error) {
            /* keep static filter UI */
            renderAdditionalFilters();
            syncAdditionalFilters();
            initPriceSlider();
        }
    }

    function renderDestinationsFilter() {
        const list = document.getElementById('destinations-filter-list');
        if (!list) return;

        let html = '';
        state.destinations.forEach(dest => {
            const destName = dest.name || dest.title || dest;
            const destValue = destName.toLowerCase();
            const isChecked = state.filters.destination.includes(destValue) ? 'checked' : '';
            
            html += `
                <li>
                    <label class="containerss">
                        <input type="checkbox" value="${destValue}" class="filter-checkbox" data-filter-type="destination" ${isChecked}>
                        <span class="checkmark"></span>
                        <strong><span>${destName}</span></strong>
                    </label>
                </li>
            `;
        });
        
        if (html) {
            list.innerHTML = html;
        }
    }

    function renderCategoriesFilter() {
        const list = document.getElementById('categories-filter-list');
        if (!list) return;

        let html = '';
        state.categories.forEach(cat => {
            const catName = cat.name || cat.title || cat;
            const catValue = catName.toLowerCase();
            const isChecked = state.filters.category.includes(catValue) ? 'checked' : '';
            
            html += `
                <li>
                    <label class="containerss">
                        <input type="checkbox" value="${catValue}" class="filter-checkbox" data-filter-type="category" ${isChecked}>
                        <span class="checkmark"></span>
                        <strong><span>${catName}</span></strong>
                    </label>
                </li>
            `;
        });
        
        if (html) {
            list.innerHTML = html;
        }
    }

    function syncDurationsFilter() {
        const list = document.getElementById('durations-filter-list');
        if (!list) return;
        
        const checkboxes = list.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(cb => {
            cb.classList.add('filter-checkbox');
            cb.setAttribute('data-filter-type', 'duration');
            if (state.filters.duration.includes(cb.value)) {
                cb.checked = true;
            }
        });
    }

    function renderAdditionalFilters() {
        const sidebar = document.querySelector('.sidebar-wrapper');
        if (!sidebar) return;

        if (document.getElementById('availability-filter-list')) return;

        const widgets = sidebar.querySelectorAll('.single-widgets');
        let durationWidget = null;
        widgets.forEach(w => {
            const titleEl = w.querySelector('h5');
            if (titleEl && titleEl.textContent.trim() === 'Duration') {
                durationWidget = w;
            }
        });

        const insertAfter = durationWidget || widgets[widgets.length - 1];

        // 1. Availability Filter Widget
        const availWidget = document.createElement('div');
        availWidget.className = 'single-widgets';
        availWidget.innerHTML = `
            <div class="widget-title">
                <h5>Availability</h5>
            </div>
            <div class="checkbox-container two">
                <ul id="availability-filter-list">
                    <li>
                        <label class="containerss">
                            <input type="checkbox" value="Available" class="filter-checkbox" data-filter-type="availability">
                            <span class="checkmark"></span>
                            <strong><span>Available</span></strong>
                        </label>
                    </li>
                    <li>
                        <label class="containerss">
                            <input type="checkbox" value="Limited Seats" class="filter-checkbox" data-filter-type="availability">
                            <span class="checkmark"></span>
                            <strong><span>Limited Seats</span></strong>
                        </label>
                    </li>
                    <li>
                        <label class="containerss">
                            <input type="checkbox" value="Sold Out" class="filter-checkbox" data-filter-type="availability">
                            <span class="checkmark"></span>
                            <strong><span>Sold Out</span></strong>
                        </label>
                    </li>
                </ul>
            </div>
        `;

        // 2. Travel Type Filter Widget
        const typeWidget = document.createElement('div');
        typeWidget.className = 'single-widgets';
        typeWidget.innerHTML = `
            <div class="widget-title">
                <h5>Travel Type</h5>
            </div>
            <div class="checkbox-container two">
                <ul id="traveltype-filter-list">
                    <li>
                        <label class="containerss">
                            <input type="checkbox" value="Group Tour" class="filter-checkbox" data-filter-type="travelType">
                            <span class="checkmark"></span>
                            <strong><span>Group Tour</span></strong>
                        </label>
                    </li>
                    <li>
                        <label class="containerss">
                            <input type="checkbox" value="Solo Tour" class="filter-checkbox" data-filter-type="travelType">
                            <span class="checkmark"></span>
                            <strong><span>Solo Tour</span></strong>
                        </label>
                    </li>
                    <li>
                        <label class="containerss">
                            <input type="checkbox" value="Family Tour" class="filter-checkbox" data-filter-type="travelType">
                            <span class="checkmark"></span>
                            <strong><span>Family Tour</span></strong>
                        </label>
                    </li>
                </ul>
            </div>
        `;

        // 3. Travel Date Filter Widget
        const dateWidget = document.createElement('div');
        dateWidget.className = 'single-widgets';
        dateWidget.innerHTML = `
            <div class="widget-title">
                <h5>Travel Date</h5>
            </div>
            <div style="padding: 10px 0;">
                <input type="date" id="date-filter-input" class="form-control" style="padding: 10px; border-radius: 5px; border: 1px solid #ccc; width: 100%; color: #333; background: #fff;">
            </div>
        `;

        insertAfter.parentNode.insertBefore(dateWidget, insertAfter.nextSibling);
        insertAfter.parentNode.insertBefore(typeWidget, insertAfter.nextSibling);
        insertAfter.parentNode.insertBefore(availWidget, insertAfter.nextSibling);

        const dateInput = document.getElementById('date-filter-input');
        if (dateInput) {
            dateInput.addEventListener('change', function() {
                state.filters.date = dateInput.value;
                updateUrlParams();
                loadPackages();
            });
        }
    }

    function syncAdditionalFilters() {
        const availList = document.getElementById('availability-filter-list');
        if (availList) {
            availList.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                cb.classList.add('filter-checkbox');
                if (state.filters.availability.includes(cb.value)) {
                    cb.checked = true;
                }
            });
        }

        const typeList = document.getElementById('traveltype-filter-list');
        if (typeList) {
            typeList.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                cb.classList.add('filter-checkbox');
                if (state.filters.travelType.includes(cb.value)) {
                    cb.checked = true;
                }
            });
        }

        const dateInput = document.getElementById('date-filter-input');
        if (dateInput && state.filters.date) {
            dateInput.value = state.filters.date;
        }

        if (state.filters.search) {
            const searchInputs = document.querySelectorAll('.search-area input, .search-input input');
            searchInputs.forEach(input => {
                input.value = state.filters.search;
            });
        }
    }

    function initPriceSlider() {
        if (typeof jQuery !== 'undefined' && jQuery.fn.slider) {
            const sliderEl = jQuery("#slider-range");
            if (sliderEl.length) {
                sliderEl.empty();
                sliderEl.slider({
                    range: true,
                    min: 10,
                    max: 3000,
                    values: [state.filters.priceMin, state.filters.priceMax],
                    slide: function(event, ui) {
                        jQuery("#slider-range-value1").text("$" + ui.values[0].toLocaleString());
                        jQuery("#slider-range-value2").text("$" + ui.values[1].toLocaleString());
                    },
                    change: function(event, ui) {
                        state.filters.priceMin = ui.values[0];
                        state.filters.priceMax = ui.values[1];
                        updateUrlParams();
                        loadPackages();
                    }
                });
                jQuery("#slider-range-value1").text("$" + state.filters.priceMin.toLocaleString());
                jQuery("#slider-range-value2").text("$" + state.filters.priceMax.toLocaleString());
            }
        }
    }

    function setupFilterListeners() {
        document.addEventListener('change', function(e) {
            if (e.target && e.target.classList.contains('filter-checkbox')) {
                const type = e.target.getAttribute('data-filter-type');
                const value = e.target.value;
                
                if (e.target.checked) {
                    if (!state.filters[type].includes(value)) {
                        state.filters[type].push(value);
                    }
                } else {
                    state.filters[type] = state.filters[type].filter(v => v !== value);
                }
                
                updateUrlParams();
                loadPackages();
            }
        });
        
        const clearBtn = document.getElementById('clear-filters');
        if (clearBtn) {
            clearBtn.addEventListener('click', function() {
                state.filters = {
                    destination: [],
                    category: [],
                    duration: [],
                    travelType: [],
                    availability: [],
                    date: '',
                    priceMin: 10,
                    priceMax: 3000,
                    search: ''
                };
                document.querySelectorAll('.filter-checkbox').forEach(cb => cb.checked = false);
                const dateInput = document.getElementById('date-filter-input');
                if (dateInput) dateInput.value = '';
                const searchInputs = document.querySelectorAll('.search-area input, .search-input input');
                searchInputs.forEach(input => input.value = '');
                
                if (typeof jQuery !== 'undefined' && jQuery.fn.slider) {
                    jQuery("#slider-range").slider("values", [10, 3000]);
                    jQuery("#slider-range-value1").text("$10");
                    jQuery("#slider-range-value2").text("$3,000");
                }
                
                updateUrlParams();
                loadPackages();
            });
        }

        // Global search form interception
        document.querySelectorAll('.search-area, .search-input form').forEach(form => {
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                const input = form.querySelector('input');
                if (input) {
                    state.filters.search = input.value.trim();
                    updateUrlParams();
                    loadPackages();
                }
            });
        });
    }

    function updateUrlParams() {
        const url = new URL(window.location);
        url.search = '';
        if (state.filters.destination.length) url.searchParams.set('destination', state.filters.destination.join(','));
        if (state.filters.category.length) url.searchParams.set('category', state.filters.category.join(','));
        if (state.filters.duration.length) url.searchParams.set('duration', state.filters.duration.join(','));
        if (state.filters.travelType.length) url.searchParams.set('travelType', state.filters.travelType.join(','));
        if (state.filters.availability.length) url.searchParams.set('availability', state.filters.availability.join(','));
        if (state.filters.date) url.searchParams.set('date', state.filters.date);
        if (state.filters.priceMin !== 10) url.searchParams.set('priceMin', state.filters.priceMin);
        if (state.filters.priceMax !== 3000) url.searchParams.set('priceMax', state.filters.priceMax);
        if (state.filters.search) url.searchParams.set('search', state.filters.search);
        window.history.pushState({}, '', url);
    }

    function generatePackageCardHTML(pkg) {
        let slidesHtml = '';
        const images = (pkg.images && pkg.images.length)
            ? pkg.images
            : (pkg.gallery && pkg.gallery.length ? pkg.gallery : [resolveImageUrl(pkg.image)]);
        
        images.forEach((img) => {
            slidesHtml += `
                <div class="swiper-slide">
                    <a href="travel-package-details.html?slug=${pkg.slug}" class="package-img">
                        <img src="${resolveImageUrl(img)}" alt="${pkg.title || 'Tour'}" onerror="this.onerror=null;this.src='images/tour-package-img1.jpg';">
                    </a>
                </div>
            `;
        });
        
        const swiperId = 'swiper-' + Math.random().toString(36).substr(2, 9);
        
        // Custom Availability Badge
        let badgeHtml = '';
        if (pkg.featured) {
            badgeHtml = `<div class="batch"><span class="discount">Featured</span></div>`;
        } else if (pkg.availabilityStatus) {
            let badgeColor = '#28a745'; // Green for Available
            if (pkg.availabilityStatus === 'Limited Seats') {
                badgeColor = '#ffc107'; // Yellow
            } else if (pkg.availabilityStatus === 'Sold Out') {
                badgeColor = '#dc3545'; // Red
            }
            badgeHtml = `<div class="batch"><span style="background-color: ${badgeColor}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px; font-weight: bold;">${pkg.availabilityStatus}</span></div>`;
        } else if (pkg.badge) {
            badgeHtml = `<div class="batch"><span>${pkg.badge}</span></div>`;
        }

        // Sold Out booking control
        let bookNowBtnHtml = '';
        if (pkg.availabilityStatus === 'Sold Out') {
            bookNowBtnHtml = `
                <a href="#" class="primary-btn1" style="flex: 1; height: 40px; line-height: 40px; justify-content: center; padding: 0 8px; font-size: 12px; background-color: #6c757d; border-color: #6c757d; cursor: not-allowed;" onclick="event.preventDefault(); alert('This package is sold out and no longer available for booking.');">
                    <span>Sold Out</span>
                    <span>Sold Out</span>
                </a>
            `;
        } else {
            bookNowBtnHtml = `
                <a href="checkout.html?package=${pkg.slug}" class="primary-btn1" style="flex: 1; height: 40px; line-height: 40px; justify-content: center; padding: 0 8px; font-size: 12px;">
                    <span>Book Now</span>
                    <span>Book Now</span>
                </a>
            `;
        }

        return `
            <div class="col-md-6 item wow animate fadeInDown" data-wow-delay="200ms" data-wow-duration="1500ms">
                <div class="package-card four">
                    <div class="package-img-wrap">
                        <div class="swiper package-card-img-slider">
                            <div class="swiper-wrapper" id="${swiperId}">
                                ${slidesHtml}
                            </div>
                        </div>
                        <div class="slider-btn-grp">
                            <div class="slider-btn package-img-slider-prev">
                                <svg width="12" height="12" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4.84554 6.00254L9.33471 1.51317C9.45832 1.38985 9.52632 1.22498 9.52632 1.04917C9.52632 0.873268 9.45832 0.708488 9.33471 0.584976L8.94135 0.191805C8.81793 0.0680975 8.65295 0 8.47715 0C8.30134 0 8.13656 0.0680975 8.01305 0.191805L2.66798 5.53678C2.54398 5.66068 2.47608 5.82624 2.47657 6.00224C2.47608 6.17902 2.54388 6.34439 2.66798 6.46839L8.00808 11.8082C8.13159 11.9319 8.29637 12 8.47227 12C8.64808 12 8.81286 11.9319 8.93647 11.8082L9.32973 11.415C9.58564 11.1591 9.58564 10.7425 9.32973 10.4867L4.84554 6.00254Z" />
                                </svg>
                            </div>
                            <div class="slider-btn package-img-slider-next">
                                <svg width="12" height="12" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7.15446 6.00254L2.66529 1.51317C2.54168 1.38985 2.47368 1.22498 2.47368 1.04917C2.47368 0.873268 2.54168 0.708488 2.66529 0.584976L3.05865 0.191805C3.18207 0.0680975 3.34705 0 3.52285 0C3.69866 0 3.86344 0.0680975 3.98695 0.191805L9.33202 5.53678C9.45602 5.66068 9.52392 5.82624 9.52343 6.00224C9.52392 6.17902 9.45612 6.34439 9.33202 6.46839L3.99192 11.8082C3.86841 11.9319 3.70363 12 3.52773 12C3.35192 12 3.18714 11.9319 3.06353 11.8082L2.67027 11.415C2.41436 11.1591 2.41436 10.7425 2.67027 10.4867L7.15446 6.00254Z" />
                                </svg>
                            </div>
                        </div>
                        ${badgeHtml}
                        <a href="#" class="map-view-btn" data-bs-toggle="modal" data-bs-target="#mapViewModal">
                            <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                                <g>
                                    <path d="M13.125 3.28125C13.125 3.75238 12.9846 4.21493 12.752 4.57227L10.8125 7.55273L8.87305 4.57227C8.64043 4.21494 8.5 3.75238 8.5 3.28125C8.50001 2.00412 9.53534 0.96875 10.8125 0.96875C12.0897 0.968755 13.125 2.00412 13.125 3.28125ZM14.125 3.28125C14.125 1.45184 12.6419 -0.0312455 10.8125 -0.03125C8.98305 -0.03125 7.50001 1.45184 7.5 3.28125C7.5 3.9403 7.69305 4.59297 8.03418 5.11719L10.8125 9.38574L13.5908 5.11719C13.9319 4.59298 14.125 3.94031 14.125 3.28125Z" />
                                    <path d="M11.25 3.28125C11.25 3.54336 11.0322 3.75 10.8125 3.75C10.5928 3.75 10.375 3.54336 10.375 3.28125C10.375 3.04058 10.5718 2.84375 10.8125 2.84375C11.0532 2.84375 11.25 3.04058 11.25 3.28125ZM12.25 3.28125C12.25 2.4883 11.6055 1.84375 10.8125 1.84375C10.0195 1.84375 9.375 2.4883 9.375 3.28125C9.375 4.05277 9.99859 4.75 10.8125 4.75C11.6264 4.75 12.25 4.05276 12.25 3.28125Z" />
                                    <path d="M5.19336 14.1855L10.6562 15.9756L10.8271 16.0312L15.7129 14.1221L16.0312 13.998V3.51465L12.6914 4.83496L13.0586 5.76465L15.0312 4.98535V13.3154L10.7979 14.9697L5.34277 13.1807L5.18066 13.1279L0.96875 14.6348V6.46484L5.20215 4.7832L8.70605 5.9502L9.02246 5.00098L5.17285 3.71777L0.28418 5.66016L-0.03125 5.78613V16.0537L5.19336 14.1855Z" />
                                    <path d="M5.6875 13.6562V4.25H4.6875V13.6562H5.6875Z" />
                                    <path d="M11.3125 15.5V8.46875H10.3125V15.5H11.3125Z" />
                                </g>
                            </svg>
                            View Map
                        </a>
                    </div>
                    <div class="package-content">
                        <div class="package-content-title-area">
                            <a href="#" class="rating-area">
                                <img src="./images/tripadvisor-rating2.svg" alt="">
                                <span>${pkg.reviews || Math.floor(Math.random() * 200) + 10} reviews</span>
                            </a>
                            <h5><a href="travel-package-details.html?slug=${pkg.slug}">${pkg.title || ''}</a></h5>
                            <ul class="package-features">
                                <li>
                                    <svg width="10" height="10" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9.61933 3.0722L4.05903 8.6355C3.97043 8.7211 3.85813 8.7655 3.74593 8.7655C3.68772 8.76559 3.63008 8.75415 3.57632 8.73184C3.52256 8.70952 3.47376 8.67678 3.43272 8.6355L0.380725 5.5835C0.206425 5.4121 0.206425 5.1315 0.380725 4.9572L1.45912 3.8758C1.62462 3.7104 1.92002 3.7104 2.08552 3.8758L3.74593 5.5362L7.91463 1.3645C7.95569 1.32334 8.00445 1.29068 8.05814 1.26837C8.11183 1.24607 8.16939 1.23456 8.22753 1.2345C8.34563 1.2345 8.45792 1.2818 8.54063 1.3645L9.61903 2.446C9.79363 2.6203 9.79363 2.9009 9.61933 3.0722Z" />
                                    </svg>
                                    No Booking Fee
                                </li>
                                <li>
                                    <svg width="10" height="10" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9.61933 3.0722L4.05903 8.6355C3.97043 8.7211 3.85813 8.7655 3.74593 8.7655C3.68772 8.76559 3.63008 8.75415 3.57632 8.73184C3.52256 8.70952 3.47376 8.67678 3.43272 8.6355L0.380725 5.5835C0.206425 5.4121 0.206425 5.1315 0.380725 4.9572L1.45912 3.8758C1.62462 3.7104 1.92002 3.7104 2.08552 3.8758L3.74593 5.5362L7.91463 1.3645C7.95569 1.32334 8.00445 1.29068 8.05814 1.26837C8.11183 1.24607 8.16939 1.23456 8.22753 1.2345C8.34563 1.2345 8.45792 1.2818 8.54063 1.3645L9.61903 2.446C9.79363 2.6203 9.79363 2.9009 9.61933 3.0722Z" />
                                    </svg>
                                    Best Price Ever
                                </li>
                            </ul>
                        </div>
                        <div class="package-content-bottom-area">
                            <ul class="package-info-list">
                                <li><span>Duration:</span> ${pkg.duration || '5 Days/ 4 Nights'}</li>
                                <li><span>Category:</span> ${refName(pkg.category) || 'Package'}</li>
                            </ul>
                            <div class="location-area">
                                <span>Destinations: <strong>${refName(pkg.destination) || 'Various Locations'}</strong></span>
                            </div>
                            <div class="btn-and-price-area" style="flex-wrap: wrap; gap: 8px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-bottom: 5px;">
                                    <div class="price-area">
                                        <h6>Per Person</h6>
                                        <span>$${pkg.price || 399}</span>
                                    </div>
                                </div>
                                <div class="cta-button-group" style="display: flex; gap: 8px; width: 100%;">
                                    <a href="travel-package-details.html?slug=${pkg.slug}" class="primary-btn1 two" style="flex: 1; height: 40px; line-height: 40px; justify-content: center; padding: 0 8px; font-size: 12px;">
                                        <span>View Details</span>
                                        <span>View Details</span>
                                    </a>
                                    ${bookNowBtnHtml}
                                </div>
                            </div>
                            <svg class="divider" height="6" viewBox="0 0 374 6" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 2.5L0 0.113249V5.88675L5 3.5V2.5ZM369 3.5L374 5.88675V0.113249L369 2.5V3.5ZM4.5 3.5H369.5V2.5H4.5V3.5Z" />
                            </svg>
                            <div class="bottom-area">
                                <ul>
                                    <li>
                                        <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M9.2732 12.9807H6.7268C6.68429 12.9807 6.64298 12.9666 6.60935 12.9406C6.55906 12.9018 5.36398 11.9718 4.14989 10.4857C3.43499 9.61078 2.86499 8.72565 2.45543 7.8549C1.93974 6.75846 1.67834 5.68141 1.67834 4.65329C1.67834 3.50657 2.36043 2.33394 3.54995 1.43595C4.1378 0.992226 4.81163 0.641781 5.55321 0.394396C6.33797 0.132617 7.16112 0 8 0C8.83888 0 9.66203 0.132617 10.4466 0.394396C11.1882 0.641781 11.862 0.992035 12.4499 1.43595C13.6392 2.33394 14.3215 3.50676 14.3215 4.65329C14.3215 5.63247 14.0599 6.67939 13.544 7.7647C13.1348 8.62565 12.5652 9.51367 11.8511 10.4036C10.6383 11.9148 9.40697 12.9272 9.39468 12.9371C9.36046 12.9653 9.31752 12.9807 9.2732 12.9807ZM6.79378 12.5969H9.20334C9.4465 12.3905 10.5082 11.4651 11.5563 10.1576C12.6425 8.8026 13.9374 6.74772 13.9374 4.65329C13.9374 2.63794 11.3981 0.38384 7.99981 0.38384C4.60148 0.38384 2.06238 2.63794 2.06238 4.65329C2.06238 6.85769 3.3563 8.90624 4.44199 10.2364C5.49084 11.5215 6.55311 12.4032 6.79378 12.5969Z" />
                                            <path d="M7.51886 12.7888C7.51886 12.7888 5.68372 9.03538 5.68372 4.65327C5.68372 2.43045 6.72066 0.191895 8 0.191895C9.27934 0.191895 10.3163 2.43045 10.3163 4.65327C10.3163 8.82024 8.48114 12.7888 8.48114 12.7888" />
                                            <path d="M7.34653 12.873C7.32753 12.8343 6.87594 11.9042 6.41802 10.4209C5.9956 9.05229 5.492 6.94079 5.492 4.65329C5.492 3.53843 5.74668 2.39036 6.19079 1.50312C6.67577 0.533921 7.31832 0 8.00002 0C8.68172 0 9.32426 0.53373 9.80944 1.50312C10.2535 2.39036 10.5082 3.53843 10.5082 4.65329C10.5082 6.82928 10.0048 8.94655 9.5824 10.3393C9.12505 11.8478 8.67423 12.8283 8.65542 12.8692L8.30709 12.7082C8.31169 12.6984 8.7675 11.7058 9.21717 10.2213C9.63114 8.85481 10.1246 6.77977 10.1246 4.65329C10.1246 3.5962 9.88467 2.51051 9.46648 1.67489C9.05577 0.854428 8.52146 0.38384 8.00021 0.38384C7.47895 0.38384 6.94465 0.854428 6.53394 1.67489C6.11574 2.51051 5.87584 3.5962 5.87584 4.65329C5.87584 6.893 6.37023 8.96439 6.78497 10.3076C7.23406 11.7626 7.68699 12.6951 7.6916 12.7043L7.34653 12.873ZM8.77038 16H7.22965C6.84658 16 6.5349 15.6883 6.5349 15.3052V13.9892C6.5349 13.8833 6.62088 13.7973 6.72682 13.7973H9.27321C9.37915 13.7973 9.46513 13.8833 9.46513 13.9892V15.3052C9.46513 15.6883 9.15346 16 8.77038 16ZM6.91874 14.1812V15.3052C6.91874 15.4766 7.05826 15.6162 7.22965 15.6162H8.77038C8.94177 15.6162 9.08129 15.4766 9.08129 15.3052V14.1812H6.91874Z" />
                                            <path d="M8.90952 14.1812H7.0907C7.00606 14.1812 6.93159 14.126 6.90703 14.045L6.54334 12.8445C6.52568 12.7863 6.53662 12.7232 6.5729 12.6745C6.60917 12.6257 6.66636 12.5969 6.72701 12.5969H9.2734C9.33424 12.5969 9.39143 12.6257 9.42751 12.6745C9.4454 12.6985 9.45739 12.7264 9.46252 12.756C9.46765 12.7855 9.46579 12.8158 9.45707 12.8445L9.09338 14.045C9.06862 14.1258 8.99397 14.1812 8.90952 14.1812ZM7.23291 13.7974H8.76693L9.01431 12.9808H6.98552L7.23291 13.7974Z" />
                                        </svg>
                                        Experience
                                    </li>
                                    <li>
                                        <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                                            <g>
                                                <path d="M8 0C3.58853 0 0 3.58853 0 8C0 12.4115 3.58853 16 8 16C12.4115 16 16 12.4108 16 8C16 3.58916 12.4115 0 8 0ZM8 14.7607C4.27266 14.7607 1.23934 11.728 1.23934 8C1.23934 4.27203 4.27266 1.23934 8 1.23934C11.7273 1.23934 14.7607 4.27203 14.7607 8C14.7607 11.728 11.728 14.7607 8 14.7607Z" />
                                                <path d="M11.0984 7.32445H8.6197V4.84576C8.6197 4.5037 8.3427 4.22607 8.00001 4.22607C7.65733 4.22607 7.38033 4.5037 7.38033 4.84576V7.32445H4.90164C4.55895 7.32445 4.28195 7.60207 4.28195 7.94414C4.28195 8.2862 4.55895 8.56382 4.90164 8.56382H7.38033V11.0425C7.38033 11.3846 7.65733 11.6622 8.00001 11.6622C8.3427 11.6622 8.6197 11.3846 8.6197 11.0425V8.56382H11.0984C11.4411 8.56382 11.7181 8.2862 11.7181 7.94414C11.7181 7.60207 11.4411 7.32445 11.0984 7.32445Z" />
                                            </g>
                                        </svg>
                                        Inclusion
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async function loadPackages() {
        const grid = document.getElementById('packages-grid');
        if (!grid) return;

        try {
            const params = new URLSearchParams();
            if (state.filters.destination.length) {
                params.append('destination', state.filters.destination.join(','));
            }
            if (state.filters.category.length) {
                params.append('category', state.filters.category.join(','));
            }
            if (state.filters.duration.length) {
                params.append('duration', state.filters.duration.join(','));
            }
            
            const queryString = params.toString() ? `?${params.toString()}` : '';

            const response = await fetch(apiUrl('/packages' + queryString));
            if (!response.ok) throw new Error('API fetch failed');
            
            const data = await response.json();
            let packages = parseApiList(data);
            
            let activePackages = packages.filter(function (pkg) {
                return !pkg.status || pkg.status === 'active';
            });

            // 1. Search Query Filter
            if (state.filters.search) {
                const searchLower = state.filters.search.toLowerCase();
                activePackages = activePackages.filter(function (pkg) {
                    const title = (pkg.title || '').toLowerCase();
                    const desc = (pkg.description || '').toLowerCase();
                    const dest = (refName(pkg.destination) || '').toLowerCase();
                    const cat = (refName(pkg.category) || '').toLowerCase();
                    const type = (pkg.travelType || '').toLowerCase();
                    const status = (pkg.availabilityStatus || '').toLowerCase();
                    const dur = (pkg.duration || '').toLowerCase();
                    
                    return title.indexOf(searchLower) !== -1 ||
                           desc.indexOf(searchLower) !== -1 ||
                           dest.indexOf(searchLower) !== -1 ||
                           cat.indexOf(searchLower) !== -1 ||
                           type.indexOf(searchLower) !== -1 ||
                           status.indexOf(searchLower) !== -1 ||
                           dur.indexOf(searchLower) !== -1;
                });
            }

            // 2. Destination Filter
            if (state.filters.destination.length) {
                activePackages = activePackages.filter(function (pkg) {
                    const destName = refName(pkg.destination).toLowerCase();
                    return state.filters.destination.some(function (f) {
                        return destName.indexOf(f) !== -1 || f.indexOf(destName) !== -1;
                    });
                });
            }

            // 3. Category Filter
            if (state.filters.category.length) {
                activePackages = activePackages.filter(function (pkg) {
                    const catName = refName(pkg.category).toLowerCase();
                    return state.filters.category.some(function (f) {
                        return catName.indexOf(f) !== -1 || f.indexOf(catName) !== -1;
                    });
                });
            }

            // 4. Duration Filter
            if (state.filters.duration.length) {
                activePackages = activePackages.filter(function (pkg) {
                    const durStr = (pkg.duration || '').toLowerCase();
                    const match = durStr.match(/\d+/);
                    if (!match) return false;
                    const days = parseInt(match[0], 10);
                    
                    return state.filters.duration.some(function (f) {
                        if (f === '1-3') return days >= 1 && days <= 3;
                        if (f === '4-7') return days >= 4 && days <= 7;
                        if (f === '8-14') return days >= 8 && days <= 14;
                        if (f === '15+') return days >= 15;
                        return durStr.indexOf(f.toLowerCase()) !== -1;
                    });
                });
            }

            // 5. Travel Type Filter
            if (state.filters.travelType.length) {
                activePackages = activePackages.filter(function (pkg) {
                    const typeStr = (pkg.travelType || 'Group Tour').toLowerCase();
                    return state.filters.travelType.some(function (f) {
                        return typeStr.indexOf(f.toLowerCase()) !== -1;
                    });
                });
            }

            // 6. Availability Status Filter
            if (state.filters.availability.length) {
                activePackages = activePackages.filter(function (pkg) {
                    const availStr = (pkg.availabilityStatus || 'Available').toLowerCase();
                    return state.filters.availability.some(function (f) {
                        return availStr.indexOf(f.toLowerCase()) !== -1;
                    });
                });
            }

            // 7. Travel Date Filter
            if (state.filters.date) {
                activePackages = activePackages.filter(function (pkg) {
                    if (!pkg.travelDates || pkg.travelDates.length === 0) return false;
                    return pkg.travelDates.some(function (d) {
                        return d === state.filters.date;
                    });
                });
            }

            // 8. Price Range Filter
            activePackages = activePackages.filter(function (pkg) {
                const price = pkg.price || 0;
                return price >= state.filters.priceMin && price <= state.filters.priceMax;
            });
            
            if (activePackages.length === 0) {
                grid.innerHTML = '<div class="col-12"><p>No packages found matching your criteria.</p></div>';
                return;
            }

            let html = '';
            activePackages.forEach(pkg => {
                html += generatePackageCardHTML(pkg);
            });

            grid.innerHTML = html;

            setTimeout(() => {
                if (typeof WOW !== 'undefined') {
                    new WOW().init();
                }
                
                const swipers = grid.querySelectorAll('.package-card-img-slider');
                swipers.forEach(swiperEl => {
                    if (typeof Swiper !== 'undefined') {
                        new Swiper(swiperEl, {
                            loop: true,
                            effect: "fade",
                            navigation: {
                                nextEl: swiperEl.parentElement.querySelector('.package-img-slider-next'),
                                prevEl: swiperEl.parentElement.querySelector('.package-img-slider-prev'),
                            },
                        });
                    }
                });
            }, 100);

            renderPagination(activePackages.length, 1);

        } catch (error) {
            /* static package cards remain visible */
        }
    }

    function renderPagination(totalItems, currentPage) {
        const paginationArea = document.querySelector('.pagination-area');
        if (!paginationArea) return;
        if (totalItems <= 0) return;
    }

    function init() {
        parseQueryParams();
        loadFilters().then(() => {
            setupFilterListeners();
            loadPackages();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
