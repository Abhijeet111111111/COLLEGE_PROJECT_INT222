 const API =
        window.location.hostname === "localhost"
          ? "http://localhost:3000"
          : "https://college-project-int222.onrender.com";

      /* ── Read return URL from query string ─────────────────── */
      const params = new URLSearchParams(window.location.search);
      const returnUrl = params.get("returnUrl") || "/";
      const initMode = params.get("mode") || "login";

      /* ── Tab switch ────────────────────────────────────────── */
      function switchTab(tab) {
        const isLogin = tab === "login";
        document
          .getElementById("tab-login")
          .classList.toggle("active", isLogin);
        document
          .getElementById("tab-signup")
          .classList.toggle("active", !isLogin);
        document.getElementById("form-login").style.display = isLogin
          ? "block"
          : "none";
        document.getElementById("form-signup").style.display = isLogin
          ? "none"
          : "block";
        clearErrors();
      }

      /* ── Password visibility toggle ─────────────────────── */
      function togglePw(inputId, btn) {
        const input = document.getElementById(inputId);
        const show = input.type === "password";
        input.type = show ? "text" : "password";
        btn.style.opacity = show ? "1" : "0.5";
      }

      /* ── Password strength meter ─────────────────────────── */
      document
        .getElementById("s-password")
        .addEventListener("input", function () {
          const v = this.value;
          const strengthEl = document.getElementById("pw-strength");
          const barEl = document.getElementById("pw-bar");
          const labelEl = document.getElementById("pw-label");
          if (!v) {
            strengthEl.style.display = "none";
            return;
          }
          strengthEl.style.display = "flex";

          let score = 0;
          if (v.length >= 8) score++;
          if (/[A-Z]/.test(v)) score++;
          if (/[0-9]/.test(v)) score++;
          if (/[^A-Za-z0-9]/.test(v)) score++;

          const map = [
            { w: "25%", bg: "#E24B4A", lbl: "Weak" },
            { w: "50%", bg: "#EF9F27", lbl: "Fair" },
            { w: "75%", bg: "#1D9E75", lbl: "Good" },
            { w: "100%", bg: "#085041", lbl: "Strong" },
          ];
          const s = map[score - 1] || map[0];
          barEl.style.width = s.w;
          barEl.style.background = s.bg;
          labelEl.textContent = s.lbl;
          labelEl.style.color = s.bg;
        });

      /* ── Error helpers ────────────────────────────────────── */
      function showError(id, msg) {
        const el = document.getElementById(id);
        el.textContent = msg;
        el.style.display = "block";
      }
      function clearErrors() {
        ["l-error", "s-error"].forEach((id) => {
          const el = document.getElementById(id);
          el.style.display = "none";
          el.textContent = "";
        });
        document
          .querySelectorAll(".form-input")
          .forEach((i) => i.classList.remove("input-error"));
      }
      function markInputError(id) {
        const el = document.getElementById(id);
        if (el) {
          el.classList.add("input-error");
          el.addEventListener(
            "input",
            () => el.classList.remove("input-error"),
            { once: true },
          );
        }
      }

      /* ── Loading state ────────────────────────────────────── */
      function setLoading(prefix, loading) {
        document.getElementById(`${prefix}-btn-text`).style.display = loading
          ? "none"
          : "inline";
        document.getElementById(`${prefix}-spinner`).style.display = loading
          ? "block"
          : "none";
        document.getElementById(
          `btn-${prefix === "l" ? "login" : "signup"}`,
        ).disabled = loading;
      }

      /* ── LOGIN ────────────────────────────────────────────── */
      async function handleLogin() {
        clearErrors();
        const email = document.getElementById("l-email").value.trim();
        const password = document.getElementById("l-password").value;

        if (!email) {
          markInputError("l-email");
          showError("l-error", "Please enter your email.");
          return;
        }
        if (!password) {
          markInputError("l-password");
          showError("l-error", "Please enter your password.");
          return;
        }

        setLoading("l", true);
        try {
          const res = await fetch(`${API}/user/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          const data = await res.json();

          if (!res.ok) {
            showError(
              "l-error",
              data.message || "Login failed. Check your credentials.",
            );
            markInputError("l-email");
            markInputError("l-password");
            return;
          }

          /* Save token + user, redirect */
          Auth.saveSession(data.token, data.user);
          window.location.href = returnUrl;
        } catch (err) {
          console.error("Login error:", err);
          showError(
            "l-error",
            "Cannot connect to server. Is the backend running?",
          );
        } finally {
          setLoading("l", false);
        }
      }

      /* ── SIGNUP ───────────────────────────────────────────── */
      async function handleSignup() {
        clearErrors();
        const name = document.getElementById("s-name").value.trim();
        const phone = document.getElementById("s-phone").value.trim();
        const email = document.getElementById("s-email").value.trim();
        const password = document.getElementById("s-password").value;
        const confirmPassword = document.getElementById("s-confirm").value;
        const terms = document.getElementById("s-terms").checked;

        /* Validate */
        if (!name) {
          markInputError("s-name");
          showError("s-error", "Please enter your full name.");
          return;
        }
        if (!email) {
          markInputError("s-email");
          showError("s-error", "Please enter your email address.");
          return;
        }
        if (!password) {
          markInputError("s-password");
          showError("s-error", "Please create a password.");
          return;
        }
        if (password.length < 8) {
          markInputError("s-password");
          showError("s-error", "Password must be at least 8 characters.");
          return;
        }
        if (password !== confirmPassword) {
          markInputError("s-confirm");
          showError("s-error", "Passwords do not match.");
          return;
        }
        if (!terms) {
          showError(
            "s-error",
            "Please accept the Terms of Service to continue.",
          );
          return;
        }

        setLoading("s", true);
        try {
          const res = await fetch(`${API}/user/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name,
              email,
              phone,
              password,
              confirmPassword,
            }),
          });
          const data = await res.json();
          console.log(data);
          if (!res.ok) {
            showError(
              "s-error",
              data.message || "Signup failed. Please try again.",
            );
            if (data.field) markInputError(`s-${data.field}`);
            return;
          }

          /* Save session, redirect */
          Auth.saveSession(data.token, data.user);
          window.location.href = returnUrl;
        } catch (err) {
          console.error("Signup error:", err);
          showError(
            "s-error",
            "Cannot connect to server. Is the backend running?",
          );
        } finally {
          setLoading("s", false);
        }
      }

      /* ── Allow Enter key to submit ────────────────────────── */
      document.addEventListener("keydown", (e) => {
        if (e.key !== "Enter") return;
        const isLoginVisible =
          document.getElementById("form-login").style.display !== "none";
        const isSignupVisible =
          document.getElementById("form-signup").style.display !== "none";
        if (isLoginVisible) handleLogin();
        if (isSignupVisible) handleSignup();
      });

      /* ── Init: read ?mode= from URL ───────────────────────── */
      document.addEventListener("DOMContentLoaded", () => {
        switchTab(initMode);
        /* If already logged in, skip the page */
        if (Auth.isLoggedIn()) window.location.href = returnUrl;
      });