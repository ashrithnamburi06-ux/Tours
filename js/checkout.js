// js/checkout.js
// Handles dynamic package loading and prefill inside checkout page
// Support fallback-first rendering (graceful enhancement only)

(function () {
    'use strict';

    async function initCheckoutFlow() {
        const params = new URLSearchParams(window.location.search);
        const packageSlug = params.get('package');

        // Step 4: Prefill traveler details from logged-in user session
        try {
            const userInfoRaw = localStorage.getItem('user_info');
            if (userInfoRaw) {
                const userInfo = JSON.parse(userInfoRaw);
                const nameInput = document.getElementById('checkout-name');
                const emailInput = document.getElementById('checkout-email');

                if (userInfo && typeof userInfo === 'object') {
                    if (userInfo.name && nameInput && !nameInput.value) {
                        nameInput.value = userInfo.name;
                    }
                    if (userInfo.email && emailInput && !emailInput.value) {
                        emailInput.value = userInfo.email;
                    }
                }
            }
        } catch (e) {
            // Silence user prefill error, continue normally
        }

        // If no package slug, remain static checkout
        if (!packageSlug) {
            return;
        }

        try {
            // Rename Headers immediately for premium feel
            const orderHeader = document.getElementById('order-summary-heading');
            const billingHeader = document.getElementById('billing-title-heading');

            if (orderHeader) {
                orderHeader.textContent = 'Booking Summary';
            }
            if (billingHeader) {
                billingHeader.textContent = 'Traveler Information';
            }

            // Fetch package data from backend
            const response = await fetch(apiUrl('/packages/' + encodeURIComponent(packageSlug)));
            if (!response.ok) {
                throw new Error('API Package fetch failed: ' + response.status);
            }

            const result = await response.json();
            const pkg = parseApiItem(result);

            if (!pkg || !pkg.title) {
                throw new Error('Invalid package payload received');
            }

            // Replace Cart body items with dynamic package card
            const cartList = document.querySelector('.cart-body ul');
            if (cartList) {
                const imgUrl = resolveImageUrl(pkg.images || pkg.image, 'images/tour-package-img1.jpg');
                const destName = refName(pkg.destination) || 'Various';
                const duration = pkg.duration || '5 Days/ 4 Nights';
                const category = refName(pkg.category) || 'Tour';

                cartList.innerHTML = `
                    <li class="single-item">
                        <div class="item-area">
                            <div class="main-item">
                                <div class="item-img">
                                    <img src="${imgUrl}" alt="${pkg.title}" onerror="this.onerror=null;this.src='images/tour-package-img1.jpg';" style="width: 70px; height: 70px; object-fit: cover; border-radius: 8px;">
                                </div>
                                <div class="content-and-quantity">
                                    <div class="content">
                                        <span style="font-size: 13px; color: #222; font-weight: 500;">${category} &bull; ${destName}</span>
                                        <h6 style="margin-top: 4px; font-size: 16px;"><a href="travel-package-details.html?slug=${pkg.slug}">${pkg.title}</a></h6>
                                        <span style="color: #666; font-size: 13px;">Duration: ${duration}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                `;
            }

            // Parse travelers count and selected date
            const adults = Number(params.get('adults')) || 1;
            const children = Number(params.get('children')) || 0;
            const totalTravelers = adults + children;
            const selectedDate = params.get('date') || 'Selected Date';
            const totalPrice = pkg.price * totalTravelers;

            // Update Pricing Area
            const pricingArea = document.querySelector('.pricing-area');
            if (pricingArea) {
                pricingArea.innerHTML = `
                    <ul>
                        <li>
                            Sub Total
                            <span>$${pkg.price} x ${totalTravelers} traveler(s)</span>
                            <strong>$${totalPrice}</strong>
                        </li>
                        <li>
                            Booking Fee
                            <div class="order-info">
                                <p>Free*</p>
                                <span>No hidden charges</span>
                            </div>
                        </li>
                        <li>
                            <strong>Total</strong>
                            <strong>$${totalPrice}</strong>
                        </li>
                    </ul>
                `;
            }

            // Append Traveler Summary card block
            const cartFooter = document.querySelector('.cart-footer');
            if (cartFooter) {
                let summaryBlock = document.getElementById('dynamic-traveler-summary');
                if (!summaryBlock) {
                    summaryBlock = document.createElement('div');
                    summaryBlock.id = 'dynamic-traveler-summary';
                    summaryBlock.className = 'traveler-summary-card';
                    summaryBlock.setAttribute('style', 'margin-top: 25px; padding: 18px; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; background: rgba(0,0,0,0.01);');
                    
                    const paymentMethodBlock = cartFooter.querySelector('.choose-payment-method');
                    if (paymentMethodBlock) {
                        cartFooter.insertBefore(summaryBlock, paymentMethodBlock);
                    } else {
                        cartFooter.appendChild(summaryBlock);
                    }
                }

                summaryBlock.innerHTML = `
                    <h6 style="margin-bottom: 12px; font-weight: 600; color: #222; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Traveler Summary</h6>
                    <ul style="padding: 0; list-style: none; margin: 0; font-size: 13px; color: #555; line-height: 1.8;">
                        <li style="margin-bottom: 6px; display: flex; justify-content: space-between;">
                            <span style="color: #888;">Package:</span>
                            <span style="font-weight: 500; text-align: right;">${pkg.title}</span>
                        </li>
                        <li style="margin-bottom: 6px; display: flex; justify-content: space-between;">
                            <span style="color: #888;">Travel Date:</span>
                            <span style="font-weight: 500; text-align: right;">${selectedDate}</span>
                        </li>
                        <li style="margin-bottom: 6px; display: flex; justify-content: space-between;">
                            <span style="color: #888;">Travelers:</span>
                            <span style="font-weight: 500; text-align: right;">${adults} Adults, ${children} Children (${totalTravelers} Total)</span>
                        </li>
                        <li style="margin-bottom: 6px; display: flex; justify-content: space-between;">
                            <span style="color: #888;">Destination:</span>
                            <span style="font-weight: 500; text-align: right;">${refName(pkg.destination)}</span>
                        </li>
                        <li style="margin-bottom: 6px; display: flex; justify-content: space-between;">
                            <span style="color: #888;">Duration:</span>
                            <span style="font-weight: 500; text-align: right;">${pkg.duration || 'N/A'}</span>
                        </li>
                        <li style="display: flex; justify-content: space-between;">
                            <span style="color: #888;">Category:</span>
                            <span style="font-weight: 500; text-align: right;">${refName(pkg.category) || 'Tour Package'}</span>
                        </li>
                    </ul>
                `;
            }

            // Wire up checkout form submission
            const checkoutForm = document.querySelector('.checkout-form form') || document.querySelector('form');
            if (checkoutForm) {
                // Remove existing submit listeners by cloning
                const newForm = checkoutForm.cloneNode(true);
                checkoutForm.parentNode.replaceChild(newForm, checkoutForm);

                newForm.addEventListener('submit', async function (e) {
                    e.preventDefault();
                    
                    const nameInput = document.getElementById('checkout-name');
                    const phoneInput = document.getElementById('checkout-phone');
                    const emailInput = document.getElementById('checkout-email');
                    const locationInput = newForm.querySelector('input[placeholder="Type Location"]');
                    const streetAddressInput = newForm.querySelector('input[placeholder="Street address"]');
                    const postalCodeInput = newForm.querySelector('input[placeholder="Postal code"]');
                    const notesInput = newForm.querySelector('textarea');
                    
                    if (!nameInput || !phoneInput || !nameInput.value || !phoneInput.value) {
                        alert('Full Name and Phone Number are required.');
                        return;
                    }
                    
                    const payload = {
                        packageId: pkg._id,
                        name: nameInput.value,
                        phone: phoneInput.value,
                        email: emailInput ? emailInput.value : '',
                        travelDate: selectedDate,
                        numberOfTravelers: totalTravelers,
                        location: locationInput ? locationInput.value : '',
                        streetAddress: streetAddressInput ? streetAddressInput.value : '',
                        postalCode: postalCodeInput ? postalCodeInput.value : '',
                        notes: notesInput ? notesInput.value : ''
                    };
                    
                    try {
                        const submitRes = await fetch(apiUrl('/bookings'), {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(payload)
                        });
                        
                        if (submitRes.ok) {
                            const resultData = await submitRes.json();
                            alert(`Booking confirmed successfully!\nYour booking ID is: ${resultData.data._id}.\nThank you for booking with GoFly!`);
                            window.location.href = 'index.html';
                        } else {
                            const err = await submitRes.json();
                            alert('Booking failed: ' + (err.message || 'Server error'));
                        }
                    } catch (err) {
                        alert('Error connecting to the booking server. Please try again.');
                    }
                });
            }

        } catch (error) {
            console.error('Checkout load failed. Using offline fallback:', error);
            // Dynamic flow fails gracefully: static shop summary values remain untouched
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCheckoutFlow);
    } else {
        initCheckoutFlow();
    }
})();
