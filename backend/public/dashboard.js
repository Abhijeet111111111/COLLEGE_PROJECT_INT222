/**
 * dashboard.js  —  WanderSmart user dashboard
 * Requires: auth.js loaded first
 *
 * GET  /api/user/bookings/hotels  → user's hotel bookings
 * GET  /api/user/bookings/tours   → user's tour bookings
 * PUT  /api/user/profile          → update name / email / phone
 * PUT  /api/user/password         → change password
 * POST /api/user/avatar           → upload avatar (multipart)
 */

const API = Auth.API;

/* ══════════════════════════════════════════════════════════════
   SVG THUMBS — inline illustrations per hotel/tour
══════════════════════════════════════════════════════════════ */
const HOTEL_SVG = {
  H001: {
    bg: '#f4a843', svg: `<rect width="140" height="140" fill="#f4a843"/>
    <rect y="95" width="140" height="45" fill="#c8a96e"/>
    <circle cx="115" cy="24" r="20" fill="#f97316" opacity=".8"/>
    <rect x="10" y="46" width="120" height="68" fill="#e8c98a"/>
    <rect x="10" y="42" width="120" height="6" fill="#d4a855"/>
    <rect x="52" y="72" width="36" height="42" fill="#6b4420"/>
    <ellipse cx="70" cy="72" rx="18" ry="12" fill="#6b4420"/>
    <rect x="13" y="52" width="28" height="34" fill="#8b5e2a" rx="1"/>
    <path d="M13 70 Q27 60 41 70" fill="#c9a45a"/>
    <rect x="99" y="52" width="28" height="34" fill="#8b5e2a" rx="1"/>
    <path d="M99 70 Q113 60 127 70" fill="#c9a45a"/>
    <rect x="55" y="22" width="30" height="26" fill="#e8c98a"/>
    <polygon points="70,4 46,26 94,26" fill="#d4a855"/>
    <circle cx="70" cy="0" r="6" fill="#f97316"/>` },
  H002: {
    bg: '#c8952a', svg: `<rect width="140" height="140" fill="#c8952a"/>
    <rect y="100" width="140" height="40" fill="#9e6e1a"/>
    <circle cx="118" cy="22" r="16" fill="#e8b040" opacity=".9"/>
    <rect x="20" y="54" width="100" height="64" fill="#d4a030"/>
    <polygon points="70,18 12,54 128,54" fill="#b88020"/>
    <circle cx="70" cy="10" r="8" fill="#f4c050"/>
    <rect x="40" y="76" width="26" height="42" fill="#9e6e1a"/>
    <rect x="74" y="76" width="26" height="42" fill="#9e6e1a"/>` },
  H003: {
    bg: '#B5D4F4', svg: `<rect width="140" height="140" fill="#B5D4F4"/>
    <rect y="104" width="140" height="36" fill="#5DCAA5"/>
    <rect x="20" y="48" width="100" height="72" fill="#378ADD"/>
    <rect x="20" y="42" width="100" height="8" fill="#185FA5"/>
    <rect x="48" y="76" width="44" height="44" fill="#185FA5"/>
    <path d="M45 76 Q70 54 95 76" fill="#185FA5"/>
    <rect x="24" y="56" width="22" height="30" fill="#185FA5" rx="1"/>
    <rect x="94" y="56" width="22" height="30" fill="#185FA5" rx="1"/>
    <rect x="0" y="64" width="14" height="56" fill="#3B6D11" rx="2"/>
    <ellipse cx="7" cy="56" rx="18" ry="24" fill="#639922"/>
    <rect x="126" y="68" width="14" height="52" fill="#3B6D11" rx="2"/>
    <ellipse cx="133" cy="60" rx="16" ry="22" fill="#639922"/>` },
  H004: {
    bg: '#9FE1CB', svg: `<rect width="140" height="140" fill="#9FE1CB"/>
    <rect y="105" width="140" height="35" fill="#5DCAA5"/>
    <rect x="22" y="50" width="96" height="72" fill="#0F6E56"/>
    <rect x="22" y="44" width="96" height="8" fill="#085041"/>
    <rect x="54" y="20" width="32" height="36" fill="#085041"/>
    <polygon points="70,2 46,24 94,24" fill="#085041"/>
    <circle cx="70" cy="0" r="7" fill="#1D9E75"/>
    <rect x="28" y="62" width="30" height="30" fill="#1D9E75" rx="1"/>
    <rect x="82" y="62" width="30" height="30" fill="#1D9E75" rx="1"/>
    <rect x="56" y="82" width="28" height="38" fill="#085041"/>
    <rect x="4" y="72" width="14" height="48" fill="#27500A" rx="2"/>
    <ellipse cx="11" cy="64" rx="18" ry="22" fill="#639922"/>
    <rect x="122" y="76" width="14" height="44" fill="#27500A" rx="2"/>
    <ellipse cx="129" cy="68" rx="16" ry="20" fill="#639922"/>` },
  H009: {
    bg: '#CECBF6', svg: `<rect width="140" height="140" fill="#CECBF6"/>
    <rect y="104" width="140" height="36" fill="#AFA9EC"/>
    <rect x="14" y="46" width="112" height="72" fill="#534AB7"/>
    <rect x="14" y="40" width="112" height="8" fill="#3C3489"/>
    <rect x="46" y="10" width="48" height="40" fill="#3C3489"/>
    <ellipse cx="70" cy="10" rx="24" ry="16" fill="#534AB7"/>
    <circle cx="70" cy="0" r="8" fill="#7F77DD"/>
    <rect x="18" y="56" width="26" height="36" fill="#7F77DD" rx="1"/>
    <rect x="96" y="56" width="26" height="36" fill="#7F77DD" rx="1"/>
    <rect x="52" y="78" width="36" height="40" fill="#26215C"/>
    <path d="M52 78 Q70 62 88 78" fill="none" stroke="#7F77DD" stroke-width="1.5"/>` },
};

const TOUR_COLORS = {
  Adventure: '#B5D4F4', Culture: '#9FE1CB', Wildlife: '#FAC775',
  Spiritual: '#CECBF6', Beach: '#9FE1CB', Budget: '#C0DD97',
  Luxury: '#FAC775', Family: '#B5D4F4',
};

function hotelThumb(hotel) {
  const t = HOTEL_SVG[hotel.hotelId || hotel.id];
  if (t) return `<svg viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">${t.svg}</svg>`;
  const bg = '#B5D4F4';
  return `<div class="bc-thumb-fallback" style="background:${bg};min-height:140px;">
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" opacity=".4">
      <path d="M4 34V14L18 4l14 10v20" stroke="white" stroke-width="2" stroke-linejoin="round"/>
      <rect x="12" y="21" width="5" height="13" rx="1" fill="white"/>
      <rect x="19" y="21" width="5" height="13" rx="1" fill="white"/>
    </svg>
  </div>`;
}

function tourThumb(booking) {
  const color = TOUR_COLORS[booking.tourCategory] || '#B5D4F4';
  // pick letter(s) from tour title
  const initials = (booking.tourTitle || 'T').split(' ').map(w => w[0]).join('').substring(0, 2);
  return `<div class="bc-thumb-fallback" style="background:${color};min-height:140px;">
    <span style="font-size:28px;font-weight:600;color:rgba(0,0,0,0.25);">${initials}</span>
  </div>`;
}

/* ══════════════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  if (!Auth.isLoggedIn()) {
    document.getElementById('dashboard-gate').style.display = 'flex';
    document.getElementById('dashboard-content').style.display = 'none';
    return;
  }

  document.getElementById('dashboard-gate').style.display = 'none';
  document.getElementById('dashboard-content').style.display = 'block';

  populateProfile();
  loadHotelBookings();
  loadTourBookings();
  setupTabs();
  setupProfileForm();
  setupPasswordModal();
  setupAvatarUpload();
});

/* ══════════════════════════════════════════════════════════════
   PROFILE HERO
══════════════════════════════════════════════════════════════ */
function populateProfile() {
  const user = Auth.getUser();
  if (!user) return;

  const initials = user.name
    ? user.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()
    : '?';

  // Avatar: photo or initials
  const avatarEl = document.getElementById('ph-avatar');
  const savedPhoto = localStorage.getItem('ws_avatar');
  if (savedPhoto) {
    avatarEl.innerHTML = `<img src="${savedPhoto}" alt="avatar"/>`;
  } else {
    avatarEl.textContent = initials;
  }

  document.getElementById('ph-name').textContent = user.name || 'User';
  document.getElementById('ph-email').textContent = user.email || '';
  document.getElementById('ph-meta').textContent = user.phone ? `📞 ${user.phone}` : '';

  // Pre-fill both profile forms
  ['upd-name', 'm-name'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = user.name || '';
  });
  ['upd-email', 'm-email'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = user.email || '';
  });
  ['upd-phone', 'm-phone'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = user.phone || '';
  });
}

/* ══════════════════════════════════════════════════════════════
   AVATAR UPLOAD (local only — extend with real API call)
══════════════════════════════════════════════════════════════ */
function setupAvatarUpload() {
  document.getElementById('avatar-file-input').addEventListener('change', function () {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      localStorage.setItem('ws_avatar', dataUrl);
      document.getElementById('ph-avatar').innerHTML = `<img src="${dataUrl}" alt="avatar"/>`;
      showToast('Profile photo updated', 'success');

      // Optionally POST to backend:
      // const form = new FormData();
      // form.append('avatar', file);
      // Auth.authFetch(`${API}/api/user/avatar`, { method:'POST', body: form });
    };
    reader.readAsDataURL(file);
  });
}

/* ══════════════════════════════════════════════════════════════
   TABS
══════════════════════════════════════════════════════════════ */
function activateTab(tabName) {
  document.querySelectorAll('.dash-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.style.display = 'none');
  const targetTab = document.querySelector(`.dash-tab[data-tab="${tabName}"]`);
  const targetPanel = document.getElementById(`panel-${tabName}`);
  if (targetTab) targetTab.classList.add('active');
  if (targetPanel) targetPanel.style.display = 'block';
}

function activateTabFromHash() {
  const hash = window.location.hash.replace('#', '').toLowerCase();
  if (hash === 'tours' || hash === 'bookings') {
    activateTab('tours');
  } else if (hash === 'hotels') {
    activateTab('hotels');
  } else if (hash === 'profile') {
    activateTab('profile');
  }
}

function setupTabs() {
  document.querySelectorAll('.dash-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      activateTab(tab.dataset.tab);
    });
  });

  // Activate tab from URL hash on initial page load
  activateTabFromHash();

  // Also react when hash changes while already on the dashboard
  // (e.g. user clicks "My Bookings" from the nav dropdown)
  window.addEventListener('hashchange', activateTabFromHash);

  // Edit profile button → edit modal
  document.getElementById('btn-edit-profile').addEventListener('click', () => {
    openEditModal();
  });

  // Change password button → password modal
  document.getElementById('btn-change-pw').addEventListener('click', () => {
    openPwModal();
  });
}

/* ══════════════════════════════════════════════════════════════
   FETCH HOTEL BOOKINGS
══════════════════════════════════════════════════════════════ */
async function loadHotelBookings() {
  try {
    const curruser = Auth.getUser();
    const res = await Auth.authFetch(`${API}/bookings/hotel/${curruser.email}`);
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    console.log(data)
    renderHotelBookings(data || []);
  } catch (err) {
    console.warn('Hotel bookings fetch failed, using fallback:', err);
    // Fallback: load all bookings and filter by user email
    try {
      const res2 = await Auth.authFetch(`${API}/bookings`);
      const data2 = await res2.json();
      const user = Auth.getUser();
      const mine = (data2.bookings || []).filter(b =>
        b.guest && b.guest.email && user && b.guest.email.toLowerCase() === user.email.toLowerCase()
      );
      renderHotelBookings(mine);
    } catch {
      renderHotelBookings([]);
    }
  }
}

function renderHotelBookings(bookings) {
  const loading = document.getElementById('hotel-bookings-loading');
  const empty = document.getElementById('hotel-bookings-empty');
  const list = document.getElementById('hotel-bookings-list');
  const badge = document.getElementById('tab-badge-hotels');

  loading.style.display = 'none';
  badge.textContent = bookings.length;
  document.getElementById('stat-hotels').textContent = bookings.length;

  // Upcoming = checkOut in future
  const upcoming = bookings.filter(b => b.guest && new Date(b.guest.checkOut) >= new Date()).length;
  updateUpcomingStat(upcoming, 'hotel');

  if (!bookings.length) {
    empty.style.display = 'flex';
    list.style.display = 'none';
    return;
  }

  empty.style.display = 'none';
  list.style.display = 'flex';

  // Sort newest first
  bookings.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  bookings.forEach(b => {
    const card = document.createElement('div');
    card.className = 'booking-card';

    // Determine status
    const isUpcoming = b.guest && new Date(b.guest.checkOut) >= new Date();
    const statusClass = b.status === 'confirmed' ? 'status-confirmed' : 'status-pending';
    const statusText = isUpcoming ? 'Upcoming' : (b.status || 'Confirmed');

    // Tags to show
    const tags = [
      { text: statusText, cls: statusClass },
      ...(b.paymentMethod ? [{ text: b.paymentMethod, cls: '' }] : []),
    ];

    b.guest.checkIn = new Date(b.guest.checkIn).toDateString()
    b.guest.checkOut = new Date(b.guest.checkOut).toDateString()

    card.innerHTML = `
      <div class="bc-thumb">${hotelThumb(b)}</div>
      <div class="bc-body">
        <div class="bc-top">
          <div class="bc-name">${b.hotelName || '—'}</div>
          <div class="bc-sub">${b.hotelCity || ''}, ${b.hotelState || ''}</div>
          <div class="bc-tags">
            ${tags.map(t => `<span class="bc-tag ${t.cls}">${t.text}</span>`).join('')}
          </div>
          <div class="bc-details">
            <div class="bc-detail"><strong>Check-in</strong>${b.guest?.checkIn || '—'}</div>
            <div class="bc-detail"><strong>Check-out</strong>${b.guest?.checkOut || '—'}</div>
            <div class="bc-detail"><strong>Nights</strong>${b.nights || '—'}</div>
            <div class="bc-detail"><strong>Guests</strong>${b.guest?.guests || '—'}</div>
          </div>
        </div>
        <div class="bc-footer">
          <div>
            <div class="bc-amount">₹${Number(b.totalAmount || 0).toLocaleString('en-IN')}</div>
            <div class="bc-ref">Ref: ${b.bookingRef || '—'}</div>
          </div>
          <button class="bc-btn-view" onclick="alert('Booking ref: ${b.bookingRef}\\nHotel: ${b.hotelName}\\nStatus: ${b.status}')">View details</button>
        </div>
      </div>
    `;
    list.appendChild(card);
  });

  // Total spent
  const totalHotel = bookings.reduce((s, b) => s + Number(b.totalAmount || 0), 0);
  window._totalHotel = totalHotel;
  updateSpentStat();
}

/* ══════════════════════════════════════════════════════════════
   FETCH TOUR BOOKINGS
══════════════════════════════════════════════════════════════ */
async function loadTourBookings() {
  try {
    const user = Auth.getUser();
    const res = await Auth.authFetch(`${API}/bookings/tours/${user.email}`);
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    console.log(data);
    renderTourBookings(data || []);
  } catch (err) {
    console.warn('Tour bookings fetch failed, using fallback:', err);
    try {
      const res2 = await Auth.authFetch(`${API}/bookings`);
      const data2 = await res2.json();
      const user = Auth.getUser();
      const mine = (data2.bookings || []).filter(b =>
        b.traveller && b.traveller.email && user &&
        b.traveller.email.toLowerCase() === user.email.toLowerCase()
      );
      renderTourBookings(mine);
    } catch {
      renderTourBookings([]);
    }
  }
}

function renderTourBookings(bookings) {
  const loading = document.getElementById('tour-bookings-loading');
  const empty = document.getElementById('tour-bookings-empty');
  const list = document.getElementById('tour-bookings-list');
  const badge = document.getElementById('tab-badge-tours');

  loading.style.display = 'none';
  badge.textContent = bookings.length;
  document.getElementById('stat-tours').textContent = bookings.length;

  const upcoming = bookings.filter(b => b.travelDate && new Date(b.travelDate) >= new Date()).length;
  updateUpcomingStat(upcoming, 'tour');

  if (!bookings.length) {
    empty.style.display = 'flex';
    list.style.display = 'none';
    return;
  }
  empty.style.display = 'none';
  list.style.display = 'flex';

  bookings.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  bookings.forEach(b => {
    const card = document.createElement('div');
    card.className = 'booking-card';

    const isUpcoming = b.travelDate && new Date(b.travelDate) >= new Date();
    const statusClass = b.status === 'confirmed' ? 'status-confirmed' : 'status-pending';
    const itinStr = (b.itinerary || []).map(i => i.place).join(' → ') || '';

    card.innerHTML = `
      <div class="bc-thumb">${tourThumb(b)}</div>
      <div class="bc-body">
        <div class="bc-top">
          <div class="bc-name">${b.tourTitle || '—'}</div>
          <div class="bc-sub">${b.tourCategory || ''} · ${b.days || '?'} days, ${b.nights || '?'} nights${itinStr ? ' · ' + itinStr : ''}</div>
          <div class="bc-tags">
            <span class="bc-tag ${statusClass}">${isUpcoming ? 'Upcoming' : (b.status || 'Confirmed')}</span>
            <span class="bc-tag">${b.tourCategory || ''}</span>
            ${b.paymentMethod ? `<span class="bc-tag">${b.paymentMethod}</span>` : ''}
          </div>
          <div class="bc-details">
            <div class="bc-detail"><strong>Travel date</strong>${new Date(b.travelDate).toDateString() || '—'}</div>
            <div class="bc-detail"><strong>Travellers</strong>${b.travellers || '—'}</div>
            <div class="bc-detail"><strong>Per person</strong>₹${Number(b.pricePerPerson || 0).toLocaleString('en-IN')}</div>
          </div>
        </div>
        <div class="bc-footer">
          <div>
            <div class="bc-amount">₹${Number(b.totalAmount || 0).toLocaleString('en-IN')}</div>
            <div class="bc-ref">Ref: ${b.bookingRef || '—'}</div>
          </div>
          <button class="bc-btn-view" onclick="alert('Booking ref: ${b.bookingRef}\\nTour: ${b.tourTitle}\\nDate: ${new Date(b.travelDate).toDateString()}\\nStatus: ${b.status}')">View details</button>
        </div>
      </div>
    `;
    list.appendChild(card);
  });

  const totalTour = bookings.reduce((s, b) => s + Number(b.totalAmount || 0), 0);
  window._totalTour = totalTour;
  updateSpentStat();
}

/* ── Stat helpers ─────────────────────────────────────────────── */
let _upcomingHotel = 0, _upcomingTour = 0;
function updateUpcomingStat(n, type) {
  if (type === 'hotel') _upcomingHotel = n;
  if (type === 'tour') _upcomingTour = n;
  document.getElementById('stat-upcoming').textContent = _upcomingHotel + _upcomingTour;
}
function updateSpentStat() {
  const total = (window._totalHotel || 0) + (window._totalTour || 0);
  document.getElementById('stat-spent').textContent =
    total ? '₹' + total.toLocaleString('en-IN') : '₹0';
}

/* ══════════════════════════════════════════════════════════════
   EDIT PROFILE MODAL
══════════════════════════════════════════════════════════════ */
function openEditModal() {
  const user = Auth.getUser();
  if (user) {
    document.getElementById('m-name').value = user.name || '';
    document.getElementById('m-email').value = user.email || '';
    document.getElementById('m-phone').value = user.phone || '';
  }
  hideMsg('m-error'); hideMsg('m-success');
  document.getElementById('edit-modal-backdrop').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}
function closeEditModal() {
  document.getElementById('edit-modal-backdrop').style.display = 'none';
  document.body.style.overflow = '';
}

function setupProfileForm() {
  // Inline profile form (Settings tab)
  document.getElementById('btn-save-profile').addEventListener('click', () => {
    saveProfile('upd-name', 'upd-email', 'upd-phone', 'upd-error', 'upd-success', 'save-txt', 'save-spin');
  });

  // Modal save button
  document.getElementById('btn-modal-save').addEventListener('click', () => {
    saveProfile('m-name', 'm-email', 'm-phone', 'm-error', 'm-success', 'm-save-txt', 'm-spin', true);
  });

  // Close modal on backdrop click
  document.getElementById('edit-modal-backdrop').addEventListener('click', e => {
    if (e.target === document.getElementById('edit-modal-backdrop')) closeEditModal();
  });
}

async function saveProfile(nameId, emailId, phoneId, errId, succId, txtId, spinId, isModal = false) {
  const name = document.getElementById(nameId).value.trim();
  const email = document.getElementById(emailId).value.trim();
  const phone = document.getElementById(phoneId).value.trim();

  hideMsg(errId); hideMsg(succId);

  if (!name) { showMsg(errId, 'Full name is required.'); markErr(nameId); return; }
  if (!email) { showMsg(errId, 'Email address is required.'); markErr(emailId); return; }

  setLoading(txtId, spinId, true);
  try {
    const res = await Auth.authFetch(`${API}/users/updateMe`, {
      method: 'PUT',
      body: JSON.stringify({ name, email, phone }),
    });
    const data = await res.json();

    if (!res.ok) { showMsg(errId, data.message || 'Update failed.'); return; }

    // Update localStorage with new info
    const current = Auth.getUser();
    Auth.saveSession(Auth.getToken(), { ...current, name, email, phone });
    Auth.updateNavbar();
    populateProfile();

    showMsg(succId, 'Profile updated successfully!');
    showToast('Profile updated', 'success');
    if (isModal) setTimeout(closeEditModal, 1400);

  } catch (err) {
    showMsg(errId, 'Cannot connect to server.');
  } finally {
    setLoading(txtId, spinId, false);
  }
}

/* ══════════════════════════════════════════════════════════════
   PASSWORD MODAL
══════════════════════════════════════════════════════════════ */
function openPwModal() {
  ['mp-current', 'mp-new', 'mp-confirm'].forEach(id => {
    document.getElementById(id).value = '';
  });
  hideMsg('mp-error'); hideMsg('mp-success');
  document.getElementById('pw-modal-backdrop').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}
function closePwModal() {
  document.getElementById('pw-modal-backdrop').style.display = 'none';
  document.body.style.overflow = '';
}

function checkMpStrength(v) {
  const wrap = document.getElementById('mp-strength-wrap');
  const bar = document.getElementById('mp-strength-bar');
  const lbl = document.getElementById('mp-strength-lbl');
  if (!v) { wrap.style.display = 'none'; return; }
  wrap.style.display = 'flex';
  let score = 0;
  if (v.length >= 8) score++;
  if (/[A-Z]/.test(v)) score++;
  if (/[0-9]/.test(v)) score++;
  if (/[^A-Za-z0-9]/.test(v)) score++;
  const map = [
    { w: '25%', bg: '#E24B4A', lbl: 'Weak' },
    { w: '50%', bg: '#EF9F27', lbl: 'Fair' },
    { w: '75%', bg: '#1D9E75', lbl: 'Good' },
    { w: '100%', bg: '#085041', lbl: 'Strong' },
  ];
  const s = map[score - 1] || map[0];
  bar.style.cssText = `width:${s.w};background:${s.bg};height:3px;border-radius:3px;`;
  lbl.textContent = s.lbl;
  lbl.style.color = s.bg;
}

function setupPasswordModal() {
  document.getElementById('btn-mp-save').addEventListener('click', changePassword);
  document.getElementById('pw-modal-backdrop').addEventListener('click', e => {
    if (e.target === document.getElementById('pw-modal-backdrop')) closePwModal();
  });

  // Also wire the inline settings-tab password form
  document.getElementById('btn-change-pw-submit')?.addEventListener('click', () => {
    changePasswordInline();
  });
  document.getElementById('pw-new')?.addEventListener('input', function () {
    checkPwStrength(this.value, 'pw-strength-wrap', 'pw-strength-bar', 'pw-strength-lbl');
  });
}

async function changePassword() {
  const current = document.getElementById('mp-current').value;
  const newPw = document.getElementById('mp-new').value;
  const confirm = document.getElementById('mp-confirm').value;

  hideMsg('mp-error'); hideMsg('mp-success');

  if (!current) { showMsg('mp-error', 'Please enter your current password.'); markErr('mp-current'); return; }
  if (!newPw || newPw.length < 8) { showMsg('mp-error', 'New password must be at least 8 characters.'); markErr('mp-new'); return; }
  if (newPw !== confirm) { showMsg('mp-error', 'Passwords do not match.'); markErr('mp-confirm'); return; }

  setLoading('mp-txt', 'mp-spin', true);
  try {
    const res = await Auth.authFetch(`${API}/users/updatePassword`, {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword: current, newPassword: newPw, newConfirmPassword: confirm }),
    });
    const data = await res.json();

    if (!res.ok) { showMsg('mp-error', data.message || 'Password change failed.'); return; }

    showMsg('mp-success', 'Password updated successfully!');
    showToast('Password changed', 'success');
    ['mp-current', 'mp-new', 'mp-confirm'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('mp-strength-wrap').style.display = 'none';
    setTimeout(closePwModal, 1600);

  } catch {
    showMsg('mp-error', 'Cannot connect to server.');
  } finally {
    setLoading('mp-txt', 'mp-spin', false);
  }
}

async function changePasswordInline() {
  const current = document.getElementById('pw-current').value;
  const newPw = document.getElementById('pw-new').value;
  const confirm = document.getElementById('pw-confirm').value;

  hideMsg('pw-error'); hideMsg('pw-success');

  if (!current) { showMsg('pw-error', 'Please enter your current password.'); markErr('pw-current'); return; }
  if (!newPw || newPw.length < 8) { showMsg('pw-error', 'New password must be at least 8 characters.'); markErr('pw-new'); return; }
  if (newPw !== confirm) { showMsg('pw-error', 'Passwords do not match.'); markErr('pw-confirm'); return; }

  setLoading('pw-txt', 'pw-spin', true);
  try {
    const res = await Auth.authFetch(`${API}/users/updatePassword`, {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword: current, newPassword: newPw, newConfirmPassword: confirm }),
    });
    const data = await res.json();
    if (!res.ok) { showMsg('pw-error', data.message || 'Password change failed.'); return; }
    showMsg('pw-success', 'Password updated!');
    showToast('Password changed', 'success');
    ['pw-current', 'pw-new', 'pw-confirm'].forEach(id => document.getElementById(id).value = '');
  } catch {
    showMsg('pw-error', 'Cannot connect to server.');
  } finally {
    setLoading('pw-txt', 'pw-spin', false);
  }
}

function checkPwStrength(v, wrapId, barId, lblId) {
  const wrap = document.getElementById(wrapId);
  const bar = document.getElementById(barId);
  const lbl = document.getElementById(lblId);
  if (!wrap || !bar || !lbl) return;
  if (!v) { wrap.style.display = 'none'; return; }
  wrap.style.display = 'flex';
  let score = 0;
  if (v.length >= 8) score++;
  if (/[A-Z]/.test(v)) score++;
  if (/[0-9]/.test(v)) score++;
  if (/[^A-Za-z0-9]/.test(v)) score++;
  const map = [
    { w: '25%', bg: '#E24B4A', lbl: 'Weak' },
    { w: '50%', bg: '#EF9F27', lbl: 'Fair' },
    { w: '75%', bg: '#1D9E75', lbl: 'Good' },
    { w: '100%', bg: '#085041', lbl: 'Strong' },
  ];
  const s = map[score - 1] || map[0];
  bar.style.cssText = `width:${s.w};background:${s.bg};height:3px;border-radius:3px;transition:width .3s,background .3s;`;
  lbl.textContent = s.lbl;
  lbl.style.color = s.bg;
}

/* ══════════════════════════════════════════════════════════════
   DELETE ACCOUNT
══════════════════════════════════════════════════════════════ */
function confirmDelete() {
  const yes = window.confirm(
    'Are you sure you want to delete your account?\n\nThis cannot be undone. All your bookings and data will be permanently removed.'
  );
  if (!yes) return;
  Auth.authFetch(`${API}/users/deleteMe`, { method: 'DELETE' })
    .then(() => Auth.logout())
    .catch(() => Auth.logout());
}

/* ══════════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════════ */
function showMsg(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
}
function hideMsg(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}
function markErr(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('err');
  el.addEventListener('input', () => el.classList.remove('err'), { once: true });
}
function setLoading(txtId, spinId, on) {
  document.getElementById(txtId).style.display = on ? 'none' : 'inline';
  document.getElementById(spinId).style.display = on ? 'block' : 'none';
}
function toggleSfPw(id) {
  const el = document.getElementById(id);
  if (el) el.type = el.type === 'password' ? 'text' : 'password';
}

let _toastTimer;
function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast${type ? ' ' + type : ''}`;
  t.style.display = 'block';
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => { t.style.display = 'none'; }, 3000);
}

// Expose toggleSfPw globally (called from inline onclick in HTML)
window.toggleSfPw = toggleSfPw;
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.openPwModal = openPwModal;
window.closePwModal = closePwModal;
window.checkMpStrength = checkMpStrength;
window.confirmDelete = confirmDelete;


const navLogout = document.getElementById('nav-logout');
navLogout.addEventListener('click', (evt) => {
  Auth.logout();
})

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
const dasboardli = document.getElementById('nav-dashboard');
const logoutli = document.getElementById('nav-logout');

if (!Auth.isLoggedIn()) {
  dasboardli.innerHTML = `<a style="text-decoration: none; color: inherit;" href="/login">Login</a>`
  logoutli.innerHTML = `<a style="text-decoration: none; color: inherit;" href="/login?mode=signup">Signup</a>`
}