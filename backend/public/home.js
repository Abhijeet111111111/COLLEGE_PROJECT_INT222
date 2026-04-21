
    const API = window.location.hostname === "localhost"
  ? "http://localhost:3000"
  : "https://college-project-int222.onrender.com";

  const navLogout = document.getElementById('nav-logout');
  navLogout.addEventListener('click',(evt)=>{
    Auth.logout();
  })

const dashboard = document.getElementById("dashboard");
console.log(Auth.isLoggedIn())
if (Auth.isLoggedIn()) {
    dashboard.innerHTML = `<a style="text-decoration: none; color: inherit;" href="/plan-trip">plan a trip</a>`
}
else dashboard.innerHTML = `<a style="text-decoration: none; color: inherit;" href="/login">plan a trip</a>`

const dasboardli = document.getElementById('nav-dashboard');
const logoutli = document.getElementById('nav-logout');

if(!Auth.isLoggedIn()){
  dasboardli.innerHTML = `<a style="text-decoration: none; color: inherit;" href="/login">Login</a>`
  logoutli.innerHTML = `<a style="text-decoration: none; color: inherit;" href="/login?mode=signup">Signup</a>`
}


  function getFormattedAmout(amt) {
    const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amt);
    return formatted
}

const amount = document.querySelectorAll('.main__featured-hotel__price-rupees');
const formattedAmt = Array.from(amount).map(el => {
    const amt = parseInt(el.innerText);
    return getFormattedAmout(amt);
})



const rupee = document.querySelectorAll(
    ".main__featured-hotel__price-rupees",
);
rupee.forEach((el, idx) => (el.innerText = formattedAmt[idx]));

const dialog = document.querySelector('dialog');
const destinationEles = document.querySelectorAll('.main__top-destination')
destinationEles.forEach(destinationEle => {
    destinationEle.addEventListener('click', async function (evt) {
        //console.log(evt.currentTarget.id);
        const fetchedData = await fetch(`${API}/destinations/${evt.currentTarget.id}`)
        const body = await fetchedData.json();
        const destination = JSON.parse(body.destination)[0];
        console.log(destination)
        const months = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
        ];

        let content = `<p>Select a Tab Button`

        dialog.innerHTML = `
    <header style="background-image:url(destinations/${destination.image})" class="destinationDialog__header destinationDialog__header-background-img">
            <div class="destinationDialog__header-menu">
              <div class="destinationDialog__header-tags">
                ${destination.badges.map(el => `<p id="${el.toLowerCase().split(' ').join('')}">${el}</p>`).join('')}
              </div>
              <form method="dialog" style="position:sticky;z-index:10;">
              <button class="closeModal" onclick="closeDialog()">
                <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2">
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                </svg>
                </button>
              </form>
            </div>
          <div class="destinationDialog__header-head">
            <h1>${destination.name}, ${destination.state}</h1>
            <p><span>${destination.region}</span><span>${destination.totalPackages} Packages Available</span><span>${destination.rating}</span><span>${destination.totalReviews} reviews</span></p>
          </div>
          
        </header>
        <main class="destinationDialog__main">
            <div class="destinationDialog__main-desc">
              <p>${destination.tagline}.</p>
              <div class="destinationDialog__main-desc__rating">
                <p style="font-size:large">⭐${destination.rating}</p>
                <p style="font-size:x-small">${destination.totalReviews} reviews</p>
              </div>
            </div>
            <ul class="destinationDialog__main-tagslist">
              ${destination.categories.map(el => `<li class="destinationDialog__main-tagslist-item">${el}</li>`).join('')}
            </ul>
            <section class="destinationDialog__main-tabs">
              <ul class="destinationDialog__main-tabs-btns">
                <li class="destinationDialog__main-tabs-item"><span class="destinationDialog__main-tabs-btn" id="overview">Destination Overview</span></li>
                <li class="destinationDialog__main-tabs-item"><span class="destinationDialog__main-tabs-btn" id="itinerary">Itineray Ideas</span></li>
                <li class="destinationDialog__main-tabs-item"><span class="destinationDialog__main-tabs-btn" id="reach">How to reach</span></li>
              </ul>



              <div id="overview" class="tabOverview tabcontent">
              <div class="destinationDialog__main-tabs-topattractions">
                <p class="destinationDialog__main-tabs-topattractions-head">Top Attraction</p>
                  <ul class="destinationDialog__main-tabs-topattractions-list">
                  ${destination.topAttractions.map(el => `<li class="destinationDialog__main-tabs-topattraction">
                    <div class="topAttractionImage">
                      <p class="topAttractionName">${el}</p>
                    </li>` ).join('')}
                      </div>
                </ul>
              

              <section class="dialog-overviewinfo">
                <div class="overview-quickinfo">
                  <h2 class="overview-quickinfo-head"><span>Quick Info</span></h2>
                  <p><span>State</span> <span>${destination.state}</span> </p>
                  <p><span>Region</span> <span>${destination.region}</span> </p>
                  <p><span>Summer</span> <span>${destination.weather.summer}</span> </p>
                  <p><span>Winter</span> <span>${destination.weather.winter.slice(0, 27)}</span> </p>
                  <p><span>Packages</span> <span>${destination.totalPackages}</span> </p>
                  <p><span>Starting from</span> <span style="color:#42f54e;font-size:large">${getFormattedAmout(destination.startingPrice)}<span style="font-size:medium;color:rgba(255,255,255,.8)">/person</span></span>  </p>

                </div>
                <div class="overview-localcuisine">
                  <h2>Local Cuisine</h2>
                  <ul class="overview-localcuisine-tags">
                    ${destination.localCuisine.map(el => `<li class="overview-localcuisine-tag">${el}</li>`).join('')}
                  </ul>
                  <div class="overview-localcuisine-rating">
                    <p>Eco Score</p>
                    <div class="eco-score-row">
                      <div class="eco-leaves">
                        <div class="leaf ${parseInt(destination.ecoRating) < 1 ? "empty" : ""}"> </div>
                         <div class="leaf ${parseInt(destination.ecoRating) < 2 ? "empty" : ""}"> </div>
                          <div class="leaf ${parseInt(destination.ecoRating) < 3 ? "empty" : ""}"> </div>
                           <div class="leaf ${parseInt(destination.ecoRating) < 4 ? "empty" : ""}"> </div>
                            <div class="leaf ${parseInt(destination.ecoRating) < 5 ? "empty" : ""}"> </div>
                             <div class="eco-label">${destination.ecoRating}/5 ${parseInt(destination.ecoRating) == 3 ? "moderate" : parseInt(destination.ecoRating) > 3 ? "high" : "low"} sustainability  </div>
                      </div>
                       
                    </div>
                  </div>
                </div>
              </section>
            

            <section class="destinationDialogMonths">
              <p>Best Time to Visit</p>
              <ul>
                ${months.map(el => `<li class="${destination.bestTimeToVisit.includes(el) ? 'bestTimeToVisit' : ''}">${el.slice(0, 3)}</li>`).join('')}
              </ul>
            </section>
            <section class="destinationDialogMonths">
              <p>Near By destinations</p>
              <ul>
                ${destination.nearbyDestinations.map(el => `<li>${el}</li>`).join('')}
              </ul>
            </section>
            
            </div>
            </div>


             <section id="itinerary" class="tabItinerary tabcontent">
        <ul class="ItineraryItems">
            <li class="ItineraryItem">
                <p>Day 1 — Arrival & Old City</p>
                <p>Check-in at hotel · Johari Bazaar · Hawa Mahal evening view · Local dinner</p>
            </li>
            <li class="ItineraryItem">
                <p>Day 1 — Arrival & Old City</p>
                <p>Check-in at hotel · Johari Bazaar · Hawa Mahal evening view · Local dinner</p>
            </li>
            <li class="ItineraryItem">
                <p>Day 1 — Arrival & Old City</p>
                <p>Check-in at hotel · Johari Bazaar · Hawa Mahal evening view · Local dinner</p>
            </li>
            <li class="ItineraryItem ItineraryItem-btn">
                <button class="ItineraryItemBtn">Generate Full custom Itineray</button>
            </li>
        </ul>
    </section>

    <section id="reach" class="howToReach tabcontent">
      <ul class="howToReachItems">
        
        <li class="howToReachItem">
          <div class="reachBy- reachBy-air"></div>
          <div class="reachByDesc">
            <p>BY AIR</p>
            <p>
              ${destination.howToReach.byAir}
            </p>
          </div>
        </li>
        <li class="howToReachItem">
          <div class="reachBy- reachBy-train"></div>
          <div class="reachByDesc">
            <p>BY TRAIN</p>
            <p>
              ${destination.howToReach.byTrain}
            </p>
          </div>
        </li>
        <li class="howToReachItem">
          <div class="reachBy- reachBy-road"></div>
          <div class="reachByDesc">
            <p>BY ROAD</p>
            <p>
              ${destination.howToReach.byRoad}
            </p>
          </div>
        </li>
      </ul>
    </section>
            
            
          </main>
          <footer class="destinationDialog__footer">
            <div class="destinationDialog__footer-price">
              <p style="font-size: medium;">Starting From</p>
              <p><span style="font-size:x-large;color: #42f54e;">${getFormattedAmout(destination.startingPrice)}</span><span>/person</span></p>
              <p style="font-size: medium;" >${destination.totalPackages} packages available</p>
            </div>
              <button class="goToHotels">View Hotels</button>
          </footer>
    `


        document.body.style.overflow = "hidden";
        dialog.showModal();
        const goToHotels = document.querySelector(".goToHotels");
        goToHotels.addEventListener("click", (evt) => {
            window.location.href = `${API}/destinations/hotels?city=${destination.name}`;
        });
        const topImgs = document.querySelectorAll('.topAttractionImage')
          Array.from(topImgs).forEach( el =>{
              fetch("https://api.unsplash.com/photos/random?query=travel&client_id=uEKuqX6Pyj60Sp7kG8ShXlLzsXBK7GXBTF20c4TjL_c")
          .then(res => res.json())
          .then(data => {
            el.style.backgroundImage = `url(${data.urls.full})`;
          });
        })
       const alltabitems = document.querySelectorAll('.destinationDialog__main-tabs-item');
const allSpanBtn = document.querySelectorAll('.destinationDialog__main-tabs-btn');
const allTabContent = document.querySelectorAll('.tabcontent');

// default active
allSpanBtn[0].classList.add('activeSpan');
alltabitems[0].classList.add('activeli');
allTabContent[0].classList.add('active');

alltabitems.forEach((tab, index) => {
  tab.addEventListener('click', () => {

    // remove all active classes
    alltabitems.forEach(el => el.classList.remove('activeli'));
    allSpanBtn.forEach(el => el.classList.remove('activeSpan'));
    allTabContent.forEach(el => el.classList.remove('active'));

    // add active to current
    tab.classList.add('activeli');
    allSpanBtn[index].classList.add('activeSpan');
    allTabContent[index].classList.add('active');
  });
});
    })
})

function closeDialog() {
    document.body.style.overflow = "";
}







/**
* hotel-dialog.js
* ─────────────────────────────────────────────────────────────────
* Usage: call  openHotelDialog(hotelId)  from any card click.
*
* Depends on:  hotel-dialog.html  (injected into page)
*              hotel-dialog.css
*
* API calls:
*   GET  /api/hotels/:id          → load hotel detail
*   POST /api/hotels/:id/book     → submit booking → save to hotelGuests.json
* ─────────────────────────────────────────────────────────────────
*/

  const HD_API = window.location.hostname === "localhost"
  ? "http://localhost:3000"
  : "https://college-project-int222.onrender.com";

/* Default fallback thumb */
// function getThumb(hotel) {
//   if (t) {
//     return `<svg viewBox="0 0 580 220" xmlns="http://www.w3.org/2000/svg">${t.svg}</svg>`;
//   }
//   const colors = { Heritage:'#f4a843', Nature:'#9FE1CB', Luxury:'#CECBF6', Beach:'#B5D4F4',
//                    Wellness:'#9FE1CB', Wildlife:'#FAC775', Adventure:'#B5D4F4', Budget:'#C0DD97' };
//   // const bg = colors[hotel.category] || '#B5D4F4';
//   return `<div style="width:100%;height:100%;background:${bg};"></div>`;
// }

/* ── Tag badge class helper ────────────────────────────────────── */
function tagClass(tag) {
    if (tag.toLowerCase().includes('eco')) return 'hd-tag-eco';
    if (tag.toLowerCase().includes('hidden')) return 'hd-tag-gem';
    if (tag.toLowerCase().includes('value')) return 'hd-tag-val';
    return '';
}
function badgeClass(tag) {
    if (tag.toLowerCase().includes('eco')) return 'hd-badge-eco';
    if (tag.toLowerCase().includes('hidden')) return 'hd-badge-gem';
    if (tag.toLowerCase().includes('value')) return 'hd-badge-val';
    if (tag.toLowerCase().includes('deal')) return 'hd-badge-hot';
    return 'hd-badge-default';
}

/* ════════════════════════════════════════════════════════════════
   STATE
════════════════════════════════════════════════════════════════ */
let _hotel = null;   // current hotel object
let _step = 1;      // current dialog step
let _payMethod = 'card'; // active payment tab
let _nights = 1;      // computed from dates

/* ════════════════════════════════════════════════════════════════
   OPEN DIALOG — call this from any hotel card click
════════════════════════════════════════════════════════════════ */
async function openHotelDialog(hotelId) {
    _hotel = null;
    _step = 1;

    /* Show backdrop + skeleton */
    document.getElementById('hd-backdrop').style.display = 'flex';
    document.getElementById('hd-skeleton').style.display = 'block';
    document.getElementById('hd-content').style.display = 'none';
    document.body.style.overflow = 'hidden';


    /* Scroll dialog to top */
    document.getElementById('hd-dialog').scrollTop = 0;

    try {
        const res = await fetch(`${HD_API}/hotels/hotel/${hotelId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        _hotel = await res.json();

        const thumbnail = document.getElementById("hd-thumb");
        thumbnail.style.backgroundImage = `url(hotels/${_hotel.images[0]})`;
        thumbnail.style.backgroundSize = "contain";
        thumbnail.style.backgroundRepeat = "no-repeat"
        thumbnail.style.backgroundPosition = "center";
        _populateStep1(_hotel);
        document.getElementById('hd-skeleton').style.display = 'none';
        document.getElementById('hd-content').style.display = 'block';
        _goStep(1);
    } catch (err) {
        console.error('Hotel fetch failed:', err);
        document.getElementById('hd-skeleton').innerHTML =
            '<div style="padding:32px 24px;color:#F09595;font-size:14px;">Failed to load hotel details. Please try again.</div>';
    }
}

/* ── Populate step 1 ───────────────────────────────────────────── */
function _populateStep1(h) {
    /* Thumb */
    //document.getElementById('hd-thumb').innerHTML = getThumb(h);

    /* Badges */
    const badgesEl = document.getElementById('hd-thumb-badges');
    badgesEl.innerHTML = '';
    (h.tags || []).slice(0, 3).forEach(tag => {
        const s = document.createElement('span');
        s.className = `hd-badge ${badgeClass(tag)}`;
        s.textContent = tag;
        badgesEl.appendChild(s);
    });

    /* Title, location, rating */
    document.getElementById('hd-name').textContent = h.name;
    document.getElementById('hd-loc').textContent =
        `${h.location.address} · ${h.location.distanceFromCenter} from centre`;
    document.getElementById('hd-rating').textContent = `★ ${h.rating.toFixed(1)}`;
    document.getElementById('hd-reviews').textContent = `${h.reviews.toLocaleString()} reviews`;

    /* Description */
    document.getElementById('hd-desc').textContent = h.description;

    /* Quick stats */
    const statsEl = document.getElementById('hd-stats');
    statsEl.innerHTML = '';
    const stats = [
        { lbl: 'Category', val: h.category },
        { lbl: 'Stars', val: '★'.repeat(h.stars) },
        { lbl: 'Price / night', val: `₹${h.pricePerNight.toLocaleString()}`, cls: 'green' },
    ];
    stats.forEach(s => {
        const card = document.createElement('div');
        card.className = 'hd-stat-card';
        card.innerHTML = `<div class="hd-stat-lbl">${s.lbl}</div>
                      <div class="hd-stat-val ${s.cls || ''}">${s.val}</div>`;
        statsEl.appendChild(card);
    });

    /* Tags */
    const tagsEl = document.getElementById('hd-tags');
    tagsEl.innerHTML = '';
    (h.tags || []).forEach(tag => {
        const s = document.createElement('span');
        s.className = `hd-tag ${tagClass(tag)}`;
        s.textContent = tag;
        tagsEl.appendChild(s);
    });

    /* Amenities */
    const amenEl = document.getElementById('hd-amenities');
    amenEl.innerHTML = '';
    (h.amenities || []).forEach(am => {
        const d = document.createElement('div');
        d.className = 'hd-amen';
        d.innerHTML = `<span class="hd-amen-dot"></span>${am}`;
        amenEl.appendChild(d);
    });

    /* Eco score */
    const ecoEl = document.getElementById('hd-eco-row');
    ecoEl.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
        const l = document.createElement('span');
        l.className = 'hd-leaf' + (i > h.ecoScore ? ' empty' : '');
        ecoEl.appendChild(l);
    }
    const ecoLbl = document.createElement('span');
    ecoLbl.className = 'hd-eco-lbl';
    ecoLbl.textContent = `${h.ecoScore}/5 eco rating`;
    ecoEl.appendChild(ecoLbl);

    /* Price */
    document.getElementById('hd-price').textContent =
        `₹${h.pricePerNight.toLocaleString()}`;
    document.getElementById('hd-price-sub').textContent =
        `per night${h.freeCancellation ? ' · free cancellation' : ''}`;

    /* Pre-fill form hotel name */
    document.getElementById('hd-form-hotel-name').textContent = h.name;
    document.getElementById('hd-form-hotel-sub').textContent =
        `${h.location.city}, ${h.location.state} · ₹${h.pricePerNight.toLocaleString()} / night`;
}

/* ════════════════════════════════════════════════════════════════
   STEP NAVIGATION
════════════════════════════════════════════════════════════════ */
function _goStep(n) {
    _step = n;
    document.getElementById('hd-step-1').style.display = n === 1 ? 'block' : 'none';
    document.getElementById('hd-step-2').style.display = n === 2 ? 'block' : 'none';
    document.getElementById('hd-step-3').style.display = n === 3 ? 'block' : 'none';

    [1, 2, 3].forEach(i => {
        const pill = document.getElementById(`hd-step-pill-${i}`);
        pill.classList.toggle('active', i === n);
        pill.classList.toggle('done', i < n);
    });

    document.getElementById('hd-dialog').scrollTop = 0;
}

function _closeDialog() {
    document.getElementById('hd-backdrop').style.display = 'none';
    document.body.style.overflow = '';
}

/* ════════════════════════════════════════════════════════════════
   TOTAL CALCULATION
════════════════════════════════════════════════════════════════ */
function _recalcTotal() {
    if (!_hotel) return;
    const ci = document.getElementById('hg-checkin').value;
    const co = document.getElementById('hg-checkout').value;
    if (ci && co && co > ci) {
        const ms = new Date(co) - new Date(ci);
        _nights = Math.max(1, Math.round(ms / 86400000));
    } else {
        _nights = 1;
    }
    const total = _hotel.pricePerNight * _nights;
    document.getElementById('hd-total-preview').textContent =
        `${_nights} night${_nights > 1 ? 's' : ''} · ₹${total.toLocaleString()}`;
    return total;
}

/* ════════════════════════════════════════════════════════════════
   VALIDATION HELPERS
════════════════════════════════════════════════════════════════ */
function _markErr(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('hd-error');
    el.addEventListener('input', () => el.classList.remove('hd-error'), { once: true });
    el.addEventListener('change', () => el.classList.remove('hd-error'), { once: true });
}
function _clearErr() {
    document.querySelectorAll('.hd-error').forEach(e => e.classList.remove('hd-error'));
}
function _showErr(msg) {
    document.getElementById('hd-err-msg').textContent = msg;
    document.getElementById('hd-err-overlay').style.display = 'flex';
}

/* ════════════════════════════════════════════════════════════════
   STEP 1 → STEP 2
════════════════════════════════════════════════════════════════ */
function _validateStep2() {
    const fields = [
        { id: 'hg-name', label: 'Full name', val: () => document.getElementById('hg-name').value.trim() },
        { id: 'hg-email', label: 'Email address', val: () => document.getElementById('hg-email').value.trim() },
        { id: 'hg-phone', label: 'Phone number', val: () => document.getElementById('hg-phone').value.trim() },
        { id: 'hg-guests', label: 'Number of guests', val: () => document.getElementById('hg-guests').value },
        { id: 'hg-checkin', label: 'Check-in date', val: () => document.getElementById('hg-checkin').value },
        { id: 'hg-checkout', label: 'Check-out date', val: () => document.getElementById('hg-checkout').value },
    ];
    const missing = fields.filter(f => !f.val());
    if (missing.length) {
        missing.forEach(f => _markErr(f.id));
        _showErr(`You missed something... Please fill in: ${missing.map(f => f.label).join(', ')}.`);
        return false;
    }
    const ci = document.getElementById('hg-checkin').value;
    const co = document.getElementById('hg-checkout').value;
    if (co <= ci) {
        _markErr('hg-checkout');
        _showErr('Check-out date must be after check-in date.');
        return false;
    }
    return true;
}

/* ════════════════════════════════════════════════════════════════
   STEP 2 → STEP 3
════════════════════════════════════════════════════════════════ */
function _prepStep3() {
    const total = _recalcTotal();
    const guests = document.getElementById('hg-guests').value;
    document.getElementById('hd-pay-summary').textContent =
        `${_hotel.name} · ${_nights} night${_nights > 1 ? 's' : ''} · ${guests} guest${guests !== '1' ? 's' : ''} · ₹${total.toLocaleString()}`;
    document.getElementById('hd-pay-btn-amt').textContent = `₹${total.toLocaleString()}`;
}

/* ════════════════════════════════════════════════════════════════
   PAYMENT VALIDATION
════════════════════════════════════════════════════════════════ */
function _validatePayment() {
    if (_payMethod === 'card') {
        const checks = [
            { id: 'hp-name', label: 'Name on card', ok: () => !!document.getElementById('hp-name').value.trim() },
            { id: 'hp-num', label: 'Card number', ok: () => document.getElementById('hp-num').value.replace(/\s/g, '').length >= 15 },
            { id: 'hp-expiry', label: 'Expiry date', ok: () => document.getElementById('hp-expiry').value.trim().length >= 4 },
            { id: 'hp-cvv', label: 'CVV', ok: () => document.getElementById('hp-cvv').value.trim().length >= 3 },
        ];
        const missing = checks.filter(c => !c.ok());
        if (missing.length) {
            missing.forEach(c => _markErr(c.id));
            _showErr(`You missed something... Please fill in: ${missing.map(c => c.label).join(', ')}.`);
            return false;
        }
    } else if (_payMethod === 'upi') {
        const upi = document.getElementById('hp-upi').value.trim();
        if (!upi || !upi.includes('@')) {
            _markErr('hp-upi');
            _showErr('Please enter a valid UPI ID (e.g. yourname@upi).');
            return false;
        }
    } else if (_payMethod === 'netbanking') {
        if (!document.getElementById('hp-bank').value) {
            _markErr('hp-bank');
            _showErr('You missed something... Please select your bank.');
            return false;
        }
    }
    return true;
}

/* ════════════════════════════════════════════════════════════════
   SUBMIT BOOKING — POST to backend
════════════════════════════════════════════════════════════════ */
async function _submitBooking() {
    const total = _recalcTotal();
    const ref = 'WS' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const payload = {
        bookingRef: ref,
        hotelId: _hotel._id,
        hotelName: _hotel.name,
        city: _hotel.location.city,
        state: _hotel.location.state,
        pricePerNight: _hotel.pricePerNight,
        nights: _nights,
        totalAmount: total,
        guest: {
            name: document.getElementById('hg-name').value.trim(),
            email: document.getElementById('hg-email').value.trim(),
            phone: document.getElementById('hg-phone').value.trim(),
            guests: document.getElementById('hg-guests').value,
            checkIn: document.getElementById('hg-checkin').value,
            checkOut: document.getElementById('hg-checkout').value,
            requests: document.getElementById('hg-requests').value.trim() || null,
        },
        paymentMethod: _payMethod,
        bookedAt: new Date().toISOString(),
    };

    /* Close dialog, show loading */
    _closeDialog();
    document.getElementById('hd-loading-overlay').style.display = 'flex';
    document.body.style.overflow = 'hidden';

    try {
        const res = await fetch(`${HD_API}/hotels/${_hotel._id}/book`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        /* Regardless of response we show success for demo (payment is dummy) */
        if (!res.ok) console.warn('Booking API returned', res.status);
        const data = await res.json().catch(() => ({}));
        const finalRef = data.bookingRef || payload.bookingRef;

        setTimeout(() => {
            document.getElementById('hd-loading-overlay').style.display = 'none';
            _showSuccess(payload, finalRef);
        }, 2000);

    } catch (err) {
        console.error('Booking POST failed:', err);
        setTimeout(() => {
            document.getElementById('hd-loading-overlay').style.display = 'none';
            _showSuccess(payload, payload.bookingRef); // still show success (demo mode)
        }, 2000);
    }
}

/* ════════════════════════════════════════════════════════════════
   SUCCESS ANIMATION
════════════════════════════════════════════════════════════════ */
function _showSuccess(p, ref) {
    const firstName = p.guest.name.split(' ')[0];
    document.getElementById('hd-success-hotel').textContent = p.hotelName;
    document.getElementById('hd-success-msg').textContent =
        `Hey ${firstName}! Your stay is confirmed. A confirmation has been sent to ${p.guest.email}.`;
    document.getElementById('hd-success-meta').textContent =
        `${p.guest.checkIn}  →  ${p.guest.checkOut} · ${p.nights} night${p.nights > 1 ? 's' : ''} · ₹${p.totalAmount.toLocaleString()}`;
    document.getElementById('hd-success-ref').textContent = ref;
    document.getElementById('hd-success-overlay').style.display = 'flex';
}

/* ════════════════════════════════════════════════════════════════
   RESET FORM
════════════════════════════════════════════════════════════════ */
function _resetForm() {
    ['hg-name', 'hg-email', 'hg-phone', 'hg-requests',
        'hp-name', 'hp-num', 'hp-expiry', 'hp-cvv', 'hp-upi'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
    ['hg-guests', 'hp-bank'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    document.getElementById('hg-checkin').value = '';
    document.getElementById('hg-checkout').value = '';
    _clearErr();
    _payMethod = 'card';
    document.querySelectorAll('.hd-pay-tab').forEach(b => b.classList.remove('active'));
    document.querySelector('.hd-pay-tab[data-method="card"]').classList.add('active');
    document.getElementById('hd-card-form').style.display = 'grid';
    document.getElementById('hd-upi-form').style.display = 'none';
    document.getElementById('hd-net-form').style.display = 'none';
    document.getElementById('hd-total-preview').textContent = `1 night · ₹${_hotel?.pricePerNight?.toLocaleString() || '–'}`;
}

/* ════════════════════════════════════════════════════════════════
   EVENT LISTENERS — set up once on DOM ready
════════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {

    /* ── Close / backdrop ─────────────────────────────────────── */
    document.getElementById('hd-close').addEventListener('click', _closeDialog);
    document.getElementById('hd-close-2').addEventListener('click', _closeDialog);
    document.getElementById('hd-close-3').addEventListener('click', _closeDialog);
    document.getElementById('hd-backdrop').addEventListener('click', e => {
        if (e.target === document.getElementById('hd-backdrop')) _closeDialog();
    });

    /* ── Step 1 → Book Now ────────────────────────────────────── */
    document.getElementById('hd-btn-book').addEventListener('click', () => {
      const map = {
        "hg-name": "name",
        "hg-email" : "email",
        "hg-phone" : "phone"
      };
      if(Auth.isLoggedIn()){
        _resetForm();
        Auth.prefillForm(map);
        _goStep(2);
      }
       else  Auth.requireAuth(()=>{});
        
    });

    /* ── Date change → recalc total ───────────────────────────── */
    document.getElementById('hg-checkin').addEventListener('change', _recalcTotal);
    document.getElementById('hg-checkout').addEventListener('change', _recalcTotal);

    /* ── Step 2 → Next ────────────────────────────────────────── */
    document.getElementById('hd-next-2').addEventListener('click', () => {
        if (!_validateStep2()) return;
        _clearErr();
        _prepStep3();
        _goStep(3);
    });

    /* ── Step 3 → Back ────────────────────────────────────────── */
    document.getElementById('hd-back-1').addEventListener('click', () => _goStep(1));
    document.getElementById('hd-back-2').addEventListener('click', () => _goStep(2));

    /* ── Payment method tabs ──────────────────────────────────── */
    document.querySelectorAll('.hd-pay-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.hd-pay-tab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            _payMethod = btn.dataset.method;
            document.getElementById('hd-card-form').style.display = _payMethod === 'card' ? 'grid' : 'none';
            document.getElementById('hd-upi-form').style.display = _payMethod === 'upi' ? 'grid' : 'none';
            document.getElementById('hd-net-form').style.display = _payMethod === 'netbanking' ? 'grid' : 'none';
        });
    });

    /* Card number auto-format */
    document.getElementById('hp-num').addEventListener('input', function () {
        let v = this.value.replace(/\D/g, '').substring(0, 16);
        this.value = v.replace(/(.{4})/g, '$1  ').trim();
    });
    /* Expiry auto-format */
    document.getElementById('hp-expiry').addEventListener('input', function () {
        let v = this.value.replace(/\D/g, '').substring(0, 4);
        if (v.length >= 3) v = v.substring(0, 2) + ' / ' + v.substring(2);
        this.value = v;
    });

    /* ── Confirm & Pay ────────────────────────────────────────── */
    document.getElementById('hd-btn-pay').addEventListener('click', () => {
        if (!_validatePayment()) return;
        _clearErr();
        _submitBooking();
    });

    /* ── Error popup dismiss ──────────────────────────────────── */
    document.getElementById('hd-btn-fix').addEventListener('click', () => {
        document.getElementById('hd-err-overlay').style.display = 'none';
    });

    /* ── Success done ─────────────────────────────────────────── */
    document.getElementById('hd-btn-done').addEventListener('click', () => {
        document.getElementById('hd-success-overlay').style.display = 'none';
        document.body.style.overflow = '';
        _hotel = null;
    });

    /* Escape key closes dialog */
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            _closeDialog();
            document.getElementById('hd-err-overlay').style.display = 'none';
            document.getElementById('hd-success-overlay').style.display = 'none';
        }
    });

});

if(!Auth.isLoggedIn()){
        document.getElementById('hd-btn-book').innerText = "Login To Book"
      }

      

      
const navToggle = document.getElementById('navbar-toggle');
const navItems = document.getElementById('nav-items');

navToggle.addEventListener('click', () => {
  navItems.classList.toggle('active');
  navToggle.classList.toggle('active');
});

// Close menu when a link is clicked
document.querySelectorAll('.nav__item').forEach(item => {
  item.addEventListener('click', () => {
    navItems.classList.remove('active');
    navToggle.classList.remove('active');
  });
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('#navbar')) {
    navItems.classList.remove('active');
    navToggle.classList.remove('active');
  }
});