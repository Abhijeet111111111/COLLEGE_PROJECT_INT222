 const API =
        window.location.hostname === "localhost"
          ? "http://localhost:3000"
          : "https://college-project-int222.onrender.com";

      /* ── Extract token from URL ─────────────────────────────────── */
      // URL format: /users/resetpassword/:token
      // Works for both  ?token=xxx  and  /resetpassword/TOKEN_VALUE
      function getToken() {
        // Try path segment first: last part of the URL path
        const segments = window.location.pathname.split("/").filter(Boolean);
        const last = segments[segments.length - 1];
        // If last segment is "resetpassword" there's no token in path
        if (last && last !== "resetpassword") {
          return last;
        }
        // Fall back to query string ?token=xxx
        return new URLSearchParams(window.location.search).get("token");
      }

      const token = getToken();

      /* ── On load: verify token exists (basic check) ────────────── */
      window.addEventListener("DOMContentLoaded", () => {
        document.getElementById("state-loading").style.display = "block";

        if (!token) {
          showState("invalid");
          return;
        }

        // Optional: call GET /users/resetpassword/:token to verify token server-side
        // If you don't have that endpoint yet, just show the form:
        verifyToken(token);
      });

      async function verifyToken(tok) {
        try {
          // If your backend has a verify endpoint, use it:
          // const res = await fetch(`${API}/users/resetpassword/${tok}`);
          // if (!res.ok) { showState('invalid'); return; }

          // Otherwise just show the form — the PATCH will fail if token is invalid
          showState("form");
        } catch {
          showState("form"); // show form, let PATCH report the error
        }
      }

      function showState(state) {
        ["loading", "invalid", "form", "success"].forEach((s) => {
          document.getElementById(`state-${s}`).style.display =
            s === state ? "block" : "none";
        });
      }

      /* ── Password rules ────────────────────────────────────────── */
      const rules = {
        length: (v) => v.length >= 8,
        upper: (v) => /[A-Z]/.test(v),
        number: (v) => /[0-9]/.test(v),
        special: (v) => /[^A-Za-z0-9]/.test(v),
      };

      function onPasswordInput(v) {
        // Show/hide strength row
        const strengthEl = document.getElementById("pw-strength");
        strengthEl.style.display = v ? "flex" : "none";

        // Update each rule
        let passed = 0;
        Object.entries(rules).forEach(([key, fn]) => {
          const met = fn(v);
          if (met) passed++;
          document.getElementById(`rule-${key}`).classList.toggle("met", met);
        });

        // Update strength bar
        const fill = document.getElementById("pw-fill");
        const label = document.getElementById("pw-label");
        const map = [
          { w: "25%", bg: "#E24B4A", lbl: "Weak" },
          { w: "50%", bg: "#EF9F27", lbl: "Fair" },
          { w: "75%", bg: "#1D9E75", lbl: "Good" },
          { w: "100%", bg: "#085041", lbl: "Strong" },
        ];
        const s = map[passed - 1] || { w: "0%", bg: "transparent", lbl: "" };
        fill.style.width = v ? s.w : "0%";
        fill.style.background = s.bg;
        label.textContent = v ? s.lbl : "";
        label.style.color = s.bg;

        // Re-check confirm match
        onConfirmInput(document.getElementById("rp-confirm").value);
      }

      function onConfirmInput(confirmVal) {
        const pwVal = document.getElementById("rp-new").value;
        const indicator = document.getElementById("match-indicator");

        if (!confirmVal) {
          indicator.textContent = "";
          indicator.className = "match-indicator";
          return;
        }
        if (pwVal === confirmVal) {
          indicator.className = "match-indicator match";
          indicator.innerHTML = `<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5.5" fill="#0d2e22" stroke="#1D9E75" stroke-width="1"/><path d="M4 6.5l2 2 3-3" stroke="#1D9E75" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg> Passwords match`;
        } else {
          indicator.className = "match-indicator no-match";
          indicator.innerHTML = `<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5.5" fill="#2e1010" stroke="#E24B4A" stroke-width="1"/><path d="M4.5 4.5l4 4M8.5 4.5l-4 4" stroke="#E24B4A" stroke-width="1.3" stroke-linecap="round"/></svg> Passwords do not match`;
        }
      }

      /* ── Submit reset ──────────────────────────────────────────── */
      async function handleReset() {
        const newPw = document.getElementById("rp-new").value;
        const confirm = document.getElementById("rp-confirm").value;
        const errEl = document.getElementById("rp-error");

        // Clear errors
        errEl.style.display = "none";
        errEl.textContent = "";
        document.getElementById("rp-new").classList.remove("input-error");
        document.getElementById("rp-confirm").classList.remove("input-error");

        // Validate
        if (!newPw) {
          showError("Please enter a new password.");
          document.getElementById("rp-new").classList.add("input-error");
          document.getElementById("rp-new").focus();
          return;
        }

        const failedRules = Object.entries(rules)
          .filter(([, fn]) => !fn(newPw))
          .map(([key]) => key);

        if (failedRules.length) {
          showError(
            "Your password doesn't meet all the requirements. Please check the rules below.",
          );
          document.getElementById("rp-new").classList.add("input-error");
          return;
        }

        if (!confirm) {
          showError("Please confirm your new password.");
          document.getElementById("rp-confirm").classList.add("input-error");
          document.getElementById("rp-confirm").focus();
          return;
        }

        if (newPw !== confirm) {
          showError("Passwords do not match. Please try again.");
          document.getElementById("rp-confirm").classList.add("input-error");
          document.getElementById("rp-confirm").focus();
          return;
        }

        setLoading(true);

        try {
          const res = await fetch(`${API}/users/resetpassword/${token}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password: newPw, confirmPassword: confirm }),
          });

          const data = await res.json().catch(() => ({}));

          if (!res.ok) {
            // Handle common backend errors
            if (
              res.status === 400 &&
              data.message?.toLowerCase().includes("expired")
            ) {
              showState("invalid");
              return;
            }
            if (
              res.status === 400 &&
              data.message?.toLowerCase().includes("invalid")
            ) {
              showState("invalid");
              return;
            }
            showError(
              data.message || "Something went wrong. Please try again.",
            );
            return;
          }

          // ── Success ──────────────────────────────────────────────
          showState("success");
          startRedirectCountdown();
        } catch (err) {
          console.error("Reset password error:", err);
          showError(
            "Cannot connect to the server. Please check your connection and try again.",
          );
        } finally {
          setLoading(false);
        }
      }

      /* ── Auto-redirect after success ───────────────────────────── */
      function startRedirectCountdown() {
        const fillEl = document.getElementById("redirect-fill");
        const countEl = document.getElementById("redirect-count");
        const total = 3000; // 3 seconds
        const step = 50; // update every 50ms
        let elapsed = 0;

        const timer = setInterval(() => {
          elapsed += step;
          const pct = Math.min(100, (elapsed / total) * 100);
          fillEl.style.width = pct + "%";
          const remaining = Math.ceil((total - elapsed) / 1000);
          countEl.textContent = remaining > 0 ? `${remaining}s` : "…";

          if (elapsed >= total) {
            clearInterval(timer);
            goToLogin();
          }
        }, step);
      }

      function goToLogin() {
        window.location.href = "/login";
      }

      /* ── Helpers ────────────────────────────────────────────────── */
      function showError(msg) {
        const el = document.getElementById("rp-error");
        el.textContent = msg;
        el.style.display = "block";
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }

      function setLoading(on) {
        const btn = document.getElementById("btn-reset");
        const txt = document.getElementById("reset-txt");
        const spin = document.getElementById("reset-spin");
        const icon = btn.querySelector("svg");
        btn.disabled = on;
        txt.style.display = on ? "none" : "inline";
        spin.style.display = on ? "block" : "none";
        if (icon) icon.style.display = on ? "none" : "inline";
      }

      function togglePw(id) {
        const el = document.getElementById(id);
        el.type = el.type === "password" ? "text" : "password";
      }

      /* ── Enter key ──────────────────────────────────────────────── */
      document.addEventListener("keydown", (e) => {
        if (
          e.key === "Enter" &&
          document.getElementById("state-form").style.display !== "none"
        ) {
          handleReset();
        }
      });