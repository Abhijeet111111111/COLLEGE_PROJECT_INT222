      // ── Hamburger menu toggle ───────────────────────────────────
      const navToggle = document.getElementById('navbar-toggle');
      const navItems  = document.getElementById('nav-items');
      navToggle.addEventListener('click', () => {
        navItems.classList.toggle('active');
        navToggle.classList.toggle('active');
      });
      document.querySelectorAll('.nav__item').forEach(item => {
        item.addEventListener('click', () => {
          navItems.classList.remove('active');
          navToggle.classList.remove('active');
        });
      });
      document.addEventListener('click', (e) => {
        if (!e.target.closest('#navbar')) {
          navItems.classList.remove('active');
          navToggle.classList.remove('active');
        }
      });

      // ── Nav logout / dashboard swap ─────
      const navLogout = document.getElementById('nav-logout');
      navLogout.addEventListener('click', () => Auth.logout());

      const dasboardli = document.getElementById('nav-dashboard');
      const logoutli   = document.getElementById('nav-logout');
      if (!Auth.isLoggedIn()) {
        dasboardli.innerHTML = `<a style="text-decoration: none; color: inherit;" href="/login">Login</a>`;
        logoutli.innerHTML   = `<a style="text-decoration: none; color: inherit;" href="/login?mode=signup">Signup</a>`;
      }