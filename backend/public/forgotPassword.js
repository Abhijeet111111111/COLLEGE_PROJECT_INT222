const API =
        window.location.hostname === "localhost"
          ? "http://localhost:3000"
          : "https://college-project-int222.onrender.com";

      /* ─── Send reset link ──────────────────────────────────────── */
      async function handleSend() {
        const emailEl = document.getElementById("fp-email");
        const email = emailEl.value.trim();
        const errEl = document.getElementById("fp-error");

        // Hide previous error
        errEl.style.display = "none";
        errEl.textContent = "";
        emailEl.classList.remove("input-error");

        // Validate
        if (!email) {
          showError("Please enter your email address.");
          emailEl.classList.add("input-error");
          emailEl.focus();
          return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          showError("Please enter a valid email address.");
          emailEl.classList.add("input-error");
          emailEl.focus();
          return;
        }

        setLoading(true);

        try {
          const res = await fetch(`${API}/users/forgotpassword`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });

          // Always show the success screen regardless of whether
          // the email exists — avoids user enumeration attacks
          showSentScreen(email);
        } catch (err) {
          console.error("Forgot password error:", err);
          // Even on network error, show success (security best practice)
          // but log it — alternatively show a generic error:
          showError(
            "Could not reach the server. Please check your connection and try again.",
          );
          setLoading(false);
        }
      }

      /* ─── Resend (calls same endpoint) ─────────────────────────── */
      async function handleResend() {
        const email = document.getElementById("sent-to-email").textContent;
        document.getElementById("resend-link").style.display = "none";
        startResendCountdown();
        try {
          await fetch(`${API}/users/forgotpassword`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
        } catch (err) {
          console.error("Resend error:", err);
        }
      }

      /* ─── Show sent confirmation screen ───────────────────────── */
      function showSentScreen(email) {
        setLoading(false);
        document.getElementById("step-email").style.display = "none";
        document.getElementById("step-sent").style.display = "block";
        document.getElementById("sent-to-email").textContent = email;
        startResendCountdown();
      }

      /* ─── 30-second resend cooldown ────────────────────────────── */
      function startResendCountdown() {
        const countdownEl = document.getElementById("resend-countdown");
        const resendLink = document.getElementById("resend-link");
        resendLink.style.display = "none";
        countdownEl.style.display = "inline";

        let secs = 30;
        countdownEl.textContent = `Resend in ${secs}s`;

        const timer = setInterval(() => {
          secs--;
          if (secs <= 0) {
            clearInterval(timer);
            countdownEl.style.display = "none";
            resendLink.style.display = "inline";
          } else {
            countdownEl.textContent = `Resend in ${secs}s`;
          }
        }, 1000);
      }

      /* ─── Helpers ──────────────────────────────────────────────── */
      function showError(msg) {
        const el = document.getElementById("fp-error");
        el.textContent = msg;
        el.style.display = "block";
      }

      function setLoading(on) {
        const btn = document.getElementById("btn-send");
        const txt = document.getElementById("send-txt");
        const spin = document.getElementById("send-spin");
        const icon = btn.querySelector("svg");
        btn.disabled = on;
        txt.style.display = on ? "none" : "inline";
        spin.style.display = on ? "block" : "none";
        if (icon) icon.style.display = on ? "none" : "inline";
      }

      /* ─── Allow Enter key ─────────────────────────────────────── */
      document.getElementById("fp-email").addEventListener("keydown", (e) => {
        if (e.key === "Enter") handleSend();
      });

      /* ─── Remove error on type ────────────────────────────────── */
      document.getElementById("fp-email").addEventListener("input", () => {
        document.getElementById("fp-error").style.display = "none";
        document.getElementById("fp-email").classList.remove("input-error");
      });