/**
 * hotels.js
 * Collects all filter inputs → POST /api/hotels/search → renders results
 */

const API_BASE = 'http://localhost:3000';   // change to your server URL in production

// ── Colour map for hotel thumbs ──────────────────────────────────
const THUMB_COLORS = {
    'H001': 'thumb-teal',
    'H002': 'thumb-amber',
    'H003': 'thumb-coral',
    'H004': 'thumb-teal',
    'H005': 'thumb-teal',
    'H006': 'thumb-teal',
    'H007': 'thumb-blue',
    'H008': 'thumb-blue',
    'H009': 'thumb-purple',
    'H010': 'thumb-blue',
    'H011': 'thumb-teal',
    'H012': 'thumb-amber',
};

// ── Tag style map ────────────────────────────────────────────────
const TAG_CLASS = {
    'Eco-Certified': 'htag-eco',
    'Hidden Gem': 'htag-gem',
    'Best Value': 'htag-val',
    'Hot Deal': 'htag-hot',
};

// ── State ────────────────────────────────────────────────────────
let selectedStars = [];     // array of star numbers (1-5)
let currentResults = [];    // last results from server

// ── DOM refs ─────────────────────────────────────────────────────
const hotelList = document.getElementById('hotel-list');
const resultCount = document.getElementById('result-count');
const loadingEl = document.getElementById('loading');
const errorBox = document.getElementById('error-box');
const errorMsg = document.getElementById('error-msg');
const noResults = document.getElementById('no-results');
const priceRange = document.getElementById('price-range');
const priceDisplay = document.getElementById('price-display');
const sortSelect = document.getElementById('sort-select');
const cardTpl = document.getElementById('hotel-card-tpl');

// ── Price slider live update ──────────────────────────────────────
priceRange.addEventListener('input', () => {
    priceDisplay.textContent = '₹' + Number(priceRange.value).toLocaleString('en-IN');
});

// ── Star buttons toggle ───────────────────────────────────────────
document.querySelectorAll('.star-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const star = Number(btn.dataset.star);
        if (selectedStars.includes(star)) {
            selectedStars = selectedStars.filter(s => s !== star);
            btn.classList.remove('active');
        } else {
            selectedStars.push(star);
            btn.classList.add('active');
        }
    });
});

// ── Sort change → re-sort without re-fetching ────────────────────
sortSelect.addEventListener('change', () => {
    if (currentResults.length) renderHotels(sortResults(currentResults));
});

// ── Collect all filter values → return payload object ────────────
function collectFilters() {
    const tags = [];
    if (document.getElementById('f-eco').checked) tags.push('Eco-Certified');
    if (document.getElementById('f-gem').checked) tags.push('Hidden Gem');
    if (document.getElementById('f-deal').checked) tags.push('Hot Deal');

    const amenities = [];
    if (document.getElementById('a-wifi').checked) amenities.push('WiFi');
    if (document.getElementById('a-breakfast').checked) amenities.push('Breakfast');
    if (document.getElementById('a-parking').checked) amenities.push('Parking');
    if (document.getElementById('a-gym').checked) amenities.push('Gym');
    if (document.getElementById('a-spa').checked) amenities.push('Spa');

    return {
        destination: document.getElementById('search-destination').value.trim() || null,
        checkIn: document.getElementById('search-checkin').value || null,
        checkOut: document.getElementById('search-checkout').value || null,
        guests: Number(document.getElementById('search-guests').value) || null,
        maxPrice: Number(priceRange.value),
        freeCancellation: document.getElementById('f-cancel').checked || null,
        poolIncluded: document.getElementById('f-pool').checked || null,
        tags: tags.length ? tags : null,
        amenities: amenities.length ? amenities : null,
        stars: selectedStars.length ? selectedStars : null,
        sortBy: sortSelect.value,
    };
}

// ── POST request to backend ───────────────────────────────────────
async function fetchHotels(filters) {
    showLoading(true);
    showError(false);

    try {
        const res = await fetch(`${API_BASE}/api/hotels/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(filters),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || `Server error ${res.status}`);
        }

        const data = await res.json();
        currentResults = data.hotels || [];
        renderHotels(currentResults);
        resultCount.textContent =
            `${currentResults.length} hotel${currentResults.length !== 1 ? 's' : ''} found`
            + (filters.destination ? ` in ${filters.destination}` : ' in Rajasthan');

    } catch (err) {
        showError(true, err.message);
    } finally {
        showLoading(false);
    }
}

// ── Client-side sort (mirrors backend sort for instant UX) ────────
function sortResults(hotels) {
    const sorted = [...hotels];
    const sortBy = sortSelect.value;
    sorted.sort((a, b) => {
        if (sortBy === 'price_asc') return a.pricePerNight - b.pricePerNight;
        if (sortBy === 'price_desc') return b.pricePerNight - a.pricePerNight;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'eco_score') return b.ecoScore - a.ecoScore;
        // best_value: sort by rating / (price/1000) ratio
        return (b.rating / (b.pricePerNight / 1000)) - (a.rating / (a.pricePerNight / 1000));
    });
    return sorted;
}

// ── Render hotel cards ────────────────────────────────────────────
function renderHotels(hotels) {
    hotelList.innerHTML = '';

    if (!hotels.length) {
        noResults.style.display = 'block';
        return;
    }
    noResults.style.display = 'none';

    hotels.forEach(hotel => {
        const card = cardTpl.content.cloneNode(true);
        const el = card.querySelector('.hotel-card');

        // Thumb colour
        const thumb = card.querySelector('.thumb-placeholder');
        thumb.classList.add(THUMB_COLORS[hotel.id] || 'thumb-teal');

        // Name & rating
        card.querySelector('.hotel-name').textContent = hotel.name;
        card.querySelector('.hotel-rating').textContent = `★ ${hotel.rating.toFixed(1)}`;

        // Location & reviews
        card.querySelector('.hotel-loc').textContent =
            `${hotel.location.city}, ${hotel.location.state} · ${hotel.location.distanceFromCenter} · ${hotel.reviews.toLocaleString('en-IN')} reviews`;

        // Tags
        const tagsEl = card.querySelector('.hotel-tags');
        hotel.tags.slice(0, 4).forEach(tag => {
            const span = document.createElement('span');
            span.className = 'htag ' + (TAG_CLASS[tag] || '');
            span.textContent = tag;
            tagsEl.appendChild(span);
        });

        // Amenities
        const amenEl = card.querySelector('.hotel-amenities');
        hotel.amenities.slice(0, 5).forEach(am => {
            const div = document.createElement('div');
            div.className = 'amen-item';
            div.innerHTML = `<span class="amen-dot"></span>${am}`;
            amenEl.appendChild(div);
        });

        // Eco score leaves
        const leavesEl = card.querySelector('.eco-leaves');
        for (let i = 1; i <= 5; i++) {
            const leaf = document.createElement('div');
            leaf.className = 'leaf' + (i > hotel.ecoScore ? ' empty' : '');
            leavesEl.appendChild(leaf);
        }
        card.querySelector('.eco-label').textContent = `Eco score ${hotel.ecoScore}/5`;

        // Price
        card.querySelector('.hotel-price').textContent =
            '₹' + hotel.pricePerNight.toLocaleString('en-IN');
        card.querySelector('.hotel-price-sub').textContent =
            'per night' + (hotel.freeCancellation ? ' · free cancel' : '');

        // Book button
        card.querySelector('.btn-book').addEventListener('click', (e) => {
            e.stopPropagation();
            alert(`Booking flow for: ${hotel.name}\n(Connect to your booking route here)`);
        });

        // Card click → detail view
        el.addEventListener('click', () => {
            // Replace with your dialog/detail page logic
            console.log('Hotel selected:', hotel.id, hotel.name);
        });

        hotelList.appendChild(card);
    });
}

// ── UI helpers ────────────────────────────────────────────────────
function showLoading(show) {
    loadingEl.style.display = show ? 'block' : 'none';
    if (show) hotelList.innerHTML = '';
}
function showError(show, msg = '') {
    errorBox.style.display = show ? 'block' : 'none';
    if (msg) errorMsg.textContent = msg;
}

// ── Reset filters ─────────────────────────────────────────────────
document.getElementById('reset-filters').addEventListener('click', () => {
    // Uncheck all checkboxes
    document.querySelectorAll('.sf-check input[type="checkbox"]').forEach(cb => cb.checked = false);
    // Reset price
    priceRange.value = 8000;
    priceDisplay.textContent = '₹8,000';
    // Reset stars
    selectedStars = [];
    document.querySelectorAll('.star-btn').forEach(b => b.classList.remove('active'));
    // Reset search fields
    document.getElementById('search-destination').value = '';
    document.getElementById('search-checkin').value = '';
    document.getElementById('search-checkout').value = '';
    document.getElementById('search-guests').value = '';
    // Re-fetch with clean filters
    fetchHotels(collectFilters());
});

// ── Apply filters button ──────────────────────────────────────────
document.getElementById('apply-filters').addEventListener('click', () => {
    fetchHotels(collectFilters());
});

// ── Search button ─────────────────────────────────────────────────
document.getElementById('search-btn').addEventListener('click', () => {
    fetchHotels(collectFilters());
});

// ── Auto-fetch on page load ───────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
    fetchHotels(collectFilters());
});