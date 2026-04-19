/**
 * WanderSmart — Theme Toggle
 * Applies the saved theme (light / dark) immediately on load and
 * provides a toggleTheme() function used by the navbar button.
 *
 * Attach to HTML via:  <script src="/theme.js"></script>
 * Place it BEFORE any visible content (or at least in <head>) to
 * prevent a flash of the wrong theme.
 */

(function applyThemeEarly() {
  const saved = localStorage.getItem('wandersmart-theme') || 'dark';
  if (saved === 'light') {
    document.documentElement.classList.add('light-mode');
  } else {
    document.documentElement.classList.remove('light-mode');
  }
})();

/** Toggle between light and dark mode */
function toggleTheme() {
  const isLight = document.documentElement.classList.toggle('light-mode');
  localStorage.setItem('wandersmart-theme', isLight ? 'light' : 'dark');
  _updateToggleBtn();
}

/** Sync the button icon to the current theme (no native tooltip) */
function _updateToggleBtn() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  const isLight = document.documentElement.classList.contains('light-mode');
  btn.innerHTML = isLight ? '🌙' : '☀️';
  // Remove native browser tooltip entirely; keep only aria-label for screen readers
  btn.removeAttribute('title');
  btn.setAttribute('aria-label', isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode');
}

/** Run once DOM is ready */
document.addEventListener('DOMContentLoaded', _updateToggleBtn);
