/**
 * auth.js  —  WanderSmart shared auth utility
 * ─────────────────────────────────────────────
 * Include this as the FIRST script on every page:
 *   <script src="auth.js"></script>
 *
 * Exposes:
 *   Auth.getUser()          → { id, name, email, phone } | null
 *   Auth.getToken()         → JWT string | null
 *   Auth.isLoggedIn()       → boolean
 *   Auth.saveSession(token, user) → saves to localStorage
 *   Auth.logout()           → clears session, redirects to login
 *   Auth.requireAuth(cb)    → redirects to login if not logged in, else calls cb
 *   Auth.prefillForm(map)   → fills form inputs with user data
 *   Auth.updateNavbar()     → swaps nav between logged-in / logged-out state
 */

const Auth = (() => {
    const TOKEN_KEY = 'ws_token';
    const USER_KEY = 'ws_user';
    const API = window.location.hostname === "localhost"
        ? "http://localhost:3000"
        : "https://college-project-int222.onrender.com";

    /* ── Storage ─────────────────────────────────────────────── */
    function getToken() {
        return localStorage.getItem(TOKEN_KEY);
    }

    function getUser() {
        try {
            const raw = localStorage.getItem(USER_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch { return null; }
    }

    function isLoggedIn() {
        const token = getToken();
        const user = getUser();
        if (!token || !user) return false;

        // Optionally check JWT expiry without a library
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.exp && Date.now() / 1000 > payload.exp) {
                _clear();
                return false;
            }
        } catch { /* non-standard JWT, trust it */ }

        return true;
    }

    function saveSession(token, user) {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    function _clear() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    }

    function logout() {
        _clear();
        updateNavbar();
        window.location.href = '/user/logout';
    }

    /* ── Auth guard ──────────────────────────────────────────── */
    // Call this before opening any booking dialog.
    // If not logged in → redirect to login page with a return URL.
    // If logged in     → call the callback immediately.
    function requireAuth(callback, returnUrl) {
        if (isLoggedIn()) {
            callback();
        } else {
            const ret = returnUrl || window.location.href;
            window.location.href = `/login?returnUrl=${encodeURIComponent(ret)}`;
        }
    }

    /* ── Pre-fill booking form with user data ────────────────── */
    // map = { 'form-field-id': 'userProperty' }
    // e.g. { 'hg-name': 'name', 'hg-email': 'email', 'hg-phone': 'phone' }
    function prefillForm(map) {
        const user = getUser();
        if (!user) return;
        Object.entries(map).forEach(([id, prop]) => {
            const el = document.getElementById(id);
            console.log(el)
            if (el && user[prop] && !el.value) {
                el.value = user[prop];
                console.log(el.value)
            }
        });
    }

    /* ── Navbar rendering ────────────────────────────────────── */
    function updateNavbar() {
        const user = getUser();
        const loggedIn = isLoggedIn();

        // ── Avatar / user pill (right side of navbar) ──────────
        const avatarSlot = document.getElementById('nav-auth-slot');
        if (!avatarSlot) return;

        if (loggedIn && user) {
            const initials = user.name
                ? user.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()
                : '?';

            avatarSlot.innerHTML = `
        <div class="nav-user-pill" id="nav-user-pill">
          <div class="nav-avatar">${initials}</div>
          <span class="nav-user-name">${user.name.split(' ')[0]}</span>
          <svg class="nav-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="nav-dropdown" id="nav-dropdown">
          <div class="nav-dd-user">
            <div class="nav-dd-name">${user.name}</div>
            <div class="nav-dd-email">${user.email}</div>
          </div>
          <a class="nav-dd-item" href="/dashboard">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.2"/><rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.2"/><rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.2"/><rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.2"/></svg>
            My Dashboard
          </a>
          <a class="nav-dd-item" href="/dashboard#bookings">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="2" width="12" height="10" rx="1.5" stroke="currentColor" stroke-width="1.2"/><path d="M1 5h12" stroke="currentColor" stroke-width="1.2"/><path d="M4 1v2M10 1v2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
            My Bookings
          </a>
          <div class="nav-dd-divider"></div>
          <button class="nav-dd-item nav-dd-logout" id="nav-logout-btn">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 7h8M10 4l3 3-3 3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 2H2a1 1 0 00-1 1v8a1 1 0 001 1h6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
            Log out
          </button>
        </div>
      `;

            // Toggle dropdown
            const pill = document.getElementById('nav-user-pill');
            const dropdown = document.getElementById('nav-dropdown');
            pill.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('open');
            });
            document.addEventListener('click', () => dropdown.classList.remove('open'));
            document.getElementById('nav-logout-btn').addEventListener('click', logout);

        } else {
            avatarSlot.innerHTML = `
        <a class="nav-btn-ghost" href="/login">Log in</a>
        <a class="nav-btn-primary" href="/login?mode=signup">Sign up</a>
      `;
        }

        // ── Dashboard link — hide if not logged in ──────────────
        const dashLink = document.getElementById('nav-dashboard-link');
        if (dashLink) {
            dashLink.style.display = loggedIn ? '' : 'none';
        }
    }

    /* ── API helper with auth header ─────────────────────────── */
    async function authFetch(url, options = {}) {
        const token = getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        };
        return fetch(url, { ...options, headers });
    }

    return {
        getToken, getUser, isLoggedIn, saveSession, logout,
        requireAuth, prefillForm, updateNavbar, authFetch, API
    };
})();

// Run navbar update on every page as soon as this script loads
document.addEventListener('DOMContentLoaded', () => Auth.updateNavbar());