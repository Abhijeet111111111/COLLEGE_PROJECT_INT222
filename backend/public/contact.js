const API =
    window.location.hostname === "localhost"
        ? "http://localhost:3000"
        : "https://college-project-int222.onrender.com";

/* ── Error helpers ─────────────────────────────────────── */
function showError(msg) {
    const el = document.getElementById("c-error");
    el.textContent = msg;
    el.style.display = "block";
}
function clearError() {
    const el = document.getElementById("c-error");
    el.style.display = "none";
    el.textContent = "";
    document.querySelectorAll(".form-input").forEach(i => i.classList.remove("input-error"));
}
function markErr(id) {
    const el = document.getElementById(id);
    if (el) {
        el.classList.add("input-error");
        el.addEventListener("input", () => el.classList.remove("input-error"), { once: true });
    }
}

/* ── Loading state ─────────────────────────────────────── */
function setLoading(on) {
    document.getElementById("c-btn-text").style.display = on ? "none" : "inline";
    document.getElementById("c-spinner").style.display = on ? "block" : "none";
    document.getElementById("btn-contact").disabled = on;
}

/* ── Reset form ────────────────────────────────────────── */
function resetForm() {
    document.getElementById("contact-success").style.display = "none";
    document.getElementById("contact-form-wrap").style.display = "block";
    ["c-name", "c-phone", "c-email", "c-subject", "c-message"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });
    clearError();
}

/* ── Submit handler ────────────────────────────────────── */
async function handleContact() {
    clearError();

    const name = document.getElementById("c-name").value.trim();
    const phone = document.getElementById("c-phone").value.trim();
    const email = document.getElementById("c-email").value.trim();
    const subject = document.getElementById("c-subject").value;
    const message = document.getElementById("c-message").value.trim();

    if (!name) { markErr("c-name"); showError("Please enter your full name."); return; }
    if (!email) { markErr("c-email"); showError("Please enter your email address."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        markErr("c-email"); showError("Please enter a valid email address."); return;
    }
    if (!subject) { markErr("c-subject"); showError("Please select a subject."); return; }
    if (!message) { markErr("c-message"); showError("Please enter your message."); return; }
    if (message.length < 10) { markErr("c-message"); showError("Message must be at least 10 characters."); return; }

    setLoading(true);
    try {
        const res = await fetch(`${API}/contact`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, phone, email, subject, message }),
        });
        const data = await res.json();

        if (!res.ok) {
            showError(data.message || "Failed to send message. Please try again.");
            return;
        }

        /* Show success state */
        document.getElementById("contact-form-wrap").style.display = "none";
        document.getElementById("contact-success").style.display = "block";
    } catch (err) {
        console.error("Contact error:", err);
        showError("Cannot connect to server. Please try again later.");
    } finally {
        setLoading(false);
    }
}

/* ── Allow Enter in fields (not textarea) ──────────────── */
document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    if (document.activeElement?.id === "c-message") return; // allow newline in textarea
    handleContact();
});