  /**
   * tours.js
   * - GET /api/tours  → render tour cards
   * - GET /api/guides → render guide cards
   * - Booking dialog → client details → payment → loading → success/error
   */

const navLogout = document.getElementById('nav-logout');
  navLogout.addEventListener('click',(evt)=>{
    Auth.logout();
  })
  const API = window.location.hostname === "localhost"
  ? "http://localhost:3000"
  : "https://college-project-int222.onrender.com";


  /* ─── State ──────────────────────────────────────────────────── */
  let allTours = [];
  let activeCat = "all";
  let selectedTour = null;
  let activePayMethod = "card";
  let travellersCount = 1;

  /* ─── DOM refs ───────────────────────────────────────────────── */
  const tourGrid = document.getElementById("tour-grid");
  const guidesSection = document.getElementById("guides-section");
  const guidesRow = document.getElementById("guides-row");
  const loadingState = document.getElementById("loading-state");
  const errorState = document.getElementById("error-state");
  const backdrop = document.getElementById("dialog-backdrop");
  const loadingOv = document.getElementById("loading-overlay");
  const successOv = document.getElementById("success-overlay");
  const errorPopup = document.getElementById("error-popup");

  /* ══════════════════════════════════════════════════════════════
   1.  DATA FETCHING
══════════════════════════════════════════════════════════════ */

  async function fetchTours(category = "all") {
    showLoading(true);
    try {
      const url =
        category === "all"
          ? `${API}/tours/alltours`
          : `${API}/tours/alltours?category=${encodeURIComponent(category)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      allTours = data.tours || [];
      renderTours(allTours);
    } catch (err) {
      console.error("Tour fetch failed:", err);
      loadingState.style.display = "none";
      errorState.style.display = "block";
    } finally {
      showLoading(false);
    }
  }

  async function fetchGuides() {
    try {
      const res = await fetch(`${API}/guides`);
      if (!res.ok) return;
      const data = await res.json();
      renderGuides(data.guides || []);
    } catch (err) {
      console.error("Guide fetch failed:", err);
    }
  }

  function showLoading(show) {
    loadingState.style.display = show ? "block" : "none";
  }

  /* ══════════════════════════════════════════════════════════════
   2.  RENDER TOURS
══════════════════════════════════════════════════════════════ */

  function renderTours(tours) {
    tourGrid.innerHTML = "";
    if (!tours.length) {
      tourGrid.innerHTML =
        '<div class="state-box">No tours found in this category.</div>';
      return;
    }
    tours.forEach((tour) => tourGrid.appendChild(buildTourCard(tour)));
  }

  function buildTourCard(tour) {
    const card = document.createElement("div");
    card.className = "tour-card";
    card.dataset.id = tour.id;

    /* ── Thumb ─────────────────────────────────────────────────── */
    const thumb = document.createElement("div");
    thumb.className = "tour-thumb";
    thumb.style.background = tour.thumb_color || "#B5D4F4";

    const badge = document.createElement("span");
    badge.className = "tour-badge";
    badge.textContent = tour.category;

    const metaPill = document.createElement("div");
    metaPill.className = "tour-meta-pill";

    const dur = document.createElement("span");
    dur.className = "tour-duration";
    dur.textContent = `${tour.days} Days · ${tour.nights} Nights`;

    const rat = document.createElement("span");
    rat.className = "tour-rating";
    rat.textContent = `★ ${tour.rating.toFixed(1)}`;

    metaPill.appendChild(dur);
    metaPill.appendChild(rat);
    thumb.appendChild(badge);
    thumb.appendChild(metaPill);

    /* ── Body ──────────────────────────────────────────────────── */
    const body = document.createElement("div");
    body.className = "tour-body";

    const title = document.createElement("div");
    title.className = "tour-title";
    title.textContent = tour.title;

    const desc = document.createElement("div");
    desc.className = "tour-desc";
    desc.textContent = tour.description;

    /* Itinerary days */
    const daysRow = document.createElement("div");
    daysRow.className = "tour-days";
    tour.itinerary.forEach((it) => {
      const dayEl = document.createElement("div");
      dayEl.className = "tour-day";
      dayEl.innerHTML = `<span class="day-label">${it.day}</span><span class="day-place">${it.place}</span>`;
      daysRow.appendChild(dayEl);
    });

    /* Footer */
    const footer = document.createElement("div");
    footer.className = "tour-footer";

    const priceWrap = document.createElement("div");
    priceWrap.innerHTML = `
    <div class="tour-price">₹${tour.price.toLocaleString("en-IN")}</div>
    <div class="price-sub">per person</div>
  `;

    const bookBtn = document.createElement("button");
    bookBtn.className = "btn-book-tour";
    bookBtn.textContent = "Book Tour";
    bookBtn.addEventListener("click", (e) => {
      const map = {
        "f-name": "name",
        "f-email": "email",
        "f-phone": "phone",
      };
      e.stopPropagation();
      if (Auth.isLoggedIn()) {
        Auth.prefillForm(map);
        openDialog(tour);
      } else {
        Auth.requireAuth();
      }
    });

    footer.appendChild(priceWrap);
    footer.appendChild(bookBtn);

    body.appendChild(title);
    body.appendChild(desc);
    body.appendChild(daysRow);
    body.appendChild(footer);

    card.appendChild(thumb);
    card.appendChild(body);

    return card;
  }

  /* ══════════════════════════════════════════════════════════════
   3.  RENDER GUIDES
══════════════════════════════════════════════════════════════ */

  function renderGuides(guides) {
    guidesRow.innerHTML = "";
    guides.forEach((g) => {
      const card = document.createElement("div");
      card.className = "guide-card";
      card.innerHTML = `
      <div class="guide-avatar" style="background:${g.color}">${g.initials}</div>
      <div>
        <div class="guide-name">${g.name}</div>
        <div class="guide-lang">${g.languages} · ${g.specialty}</div>
        <div class="guide-rating">★ ${g.rating} · ${g.tours} tours</div>
      </div>
    `;
      guidesRow.appendChild(card);
    });
    guidesSection.style.display = "block";
  }

  /* ══════════════════════════════════════════════════════════════
   4.  CATEGORY FILTER CHIPS
══════════════════════════════════════════════════════════════ */

  document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document
        .querySelectorAll(".chip")
        .forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      activeCat = chip.dataset.cat;
      fetchTours(activeCat);
    });
  });

  /* ══════════════════════════════════════════════════════════════
   5.  BOOKING DIALOG — OPEN / CLOSE
══════════════════════════════════════════════════════════════ */

  function openDialog(tour) {
    selectedTour = tour;
    travellersCount = 1;

    // Reset to step 1
    showStep(1);

    // Populate header
    document.getElementById("dialog-tour-name").textContent = tour.title;
    document.getElementById("dialog-tour-meta").textContent =
      `${tour.days} Days · ${tour.nights} Nights · ₹${tour.price.toLocaleString("en-IN")} per person`;

    updateTotal();

    // Clear previous field errors
    clearErrors();

    backdrop.style.display = "flex";
    document.body.style.overflow = "hidden";
  }

  function closeDialog() {
    backdrop.style.display = "none";
    document.body.style.overflow = "";
    selectedTour = null;
  }

  function showStep(n) {
    document.getElementById("step-1").style.display =
      n === 1 ? "block" : "none";
    document.getElementById("step-2").style.display =
      n === 2 ? "block" : "none";

    document.getElementById("step-ind-1").classList.toggle("active", n === 1);
    document.getElementById("step-ind-2").classList.toggle("active", n === 2);
  }

  /* Close buttons */
  document
    .getElementById("dialog-close")
    .addEventListener("click", closeDialog);
  document
    .getElementById("dialog-close-2")
    .addEventListener("click", closeDialog);

  /* Close on backdrop click */
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) closeDialog();
  });

  /* Update total when travellers changes */
  document
    .getElementById("f-travellers")
    .addEventListener("change", function () {
      travellersCount = this.value === "5+" ? 5 : Number(this.value) || 1;
      updateTotal();
    });

  function updateTotal() {
    if (!selectedTour) return;
    const total = selectedTour.price * travellersCount;
    document.getElementById("total-preview").textContent =
      `Total: ₹${total.toLocaleString("en-IN")}`;
  }

  /* ══════════════════════════════════════════════════════════════
   6.  STEP 1 → STEP 2  (validate client details)
══════════════════════════════════════════════════════════════ */

  document.getElementById("btn-next").addEventListener("click", () => {
    const name = document.getElementById("f-name").value.trim();
    const email = document.getElementById("f-email").value.trim();
    const phone = document.getElementById("f-phone").value.trim();
    const trav = document.getElementById("f-travellers").value;
    const date = document.getElementById("f-date").value;

    const missing = [];
    if (!name) {
      missing.push("Full name");
      markError("f-name");
    }
    if (!email) {
      missing.push("Email address");
      markError("f-email");
    }
    if (!phone) {
      missing.push("Phone number");
      markError("f-phone");
    }
    if (!trav) {
      missing.push("Number of travellers");
      markError("f-travellers");
    }
    if (!date) {
      missing.push("Travel date");
      markError("f-date");
    }

    if (missing.length) {
      showErrorPopup(
        `You missed something... Please fill in: ${missing.join(", ")}.`,
      );
      return;
    }

    /* Populate payment summary */
    travellersCount = trav === "5+" ? 5 : Number(trav);
    const total = selectedTour.price * travellersCount;
    document.getElementById("pay-summary").textContent =
      `${selectedTour.title} · ${trav} ${Number(trav) === 1 ? "person" : "people"} · ₹${total.toLocaleString("en-IN")}`;
    document.getElementById("pay-btn-amt").textContent =
      `₹${total.toLocaleString("en-IN")}`;

    clearErrors();
    showStep(2);
  });

  /* ══════════════════════════════════════════════════════════════
   7.  PAYMENT METHOD TABS
══════════════════════════════════════════════════════════════ */

  document.querySelectorAll(".pay-method").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".pay-method")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activePayMethod = btn.dataset.method;

      document.getElementById("pay-card-form").style.display =
        activePayMethod === "card" ? "grid" : "none";
      document.getElementById("pay-upi-form").style.display =
        activePayMethod === "upi" ? "grid" : "none";
      document.getElementById("pay-net-form").style.display =
        activePayMethod === "netbanking" ? "grid" : "none";
    });
  });

  /* Card number auto-format */
  document.getElementById("p-cardnum").addEventListener("input", function () {
    let v = this.value.replace(/\D/g, "").substring(0, 16);
    this.value = v.replace(/(.{4})/g, "$1  ").trim();
  });

  /* Expiry auto-format */
  document.getElementById("p-expiry").addEventListener("input", function () {
    let v = this.value.replace(/\D/g, "").substring(0, 4);
    if (v.length >= 3) v = v.substring(0, 2) + " / " + v.substring(2);
    this.value = v;
  });

  /* Back button */
  document
    .getElementById("btn-back")
    .addEventListener("click", () => showStep(1));

  /* ══════════════════════════════════════════════════════════════
   8.  SUBMIT PAYMENT → LOADING → SUCCESS
══════════════════════════════════════════════════════════════ */

  document.getElementById("btn-pay").addEventListener("click", () => {
    const missing = [];

    if (activePayMethod === "card") {
      const cn = document.getElementById("p-cardname").value.trim();
      const num = document.getElementById("p-cardnum").value.replace(/\s/g, "");
      const exp = document.getElementById("p-expiry").value.trim();
      const cvv = document.getElementById("p-cvv").value.trim();
      if (!cn) {
        missing.push("Name on card");
        markError("p-cardname");
      }
      if (num.length < 15) {
        missing.push("Card number");
        markError("p-cardnum");
      }
      if (exp.length < 4) {
        missing.push("Expiry date");
        markError("p-expiry");
      }
      if (cvv.length < 3) {
        missing.push("CVV");
        markError("p-cvv");
      }
    } else if (activePayMethod === "upi") {
      const upi = document.getElementById("p-upi").value.trim();
      if (!upi || !upi.includes("@")) {
        missing.push("Valid UPI ID");
        markError("p-upi");
      }
    } else if (activePayMethod === "netbanking") {
      const bank = document.getElementById("p-bank").value;
      if (!bank) {
        missing.push("Bank selection");
        markError("p-bank");
      }
    }

    if (missing.length) {
      showErrorPopup(
        `You missed something... Please fill in: ${missing.join(", ")}.`,
      );
      return;
    }

    /* Close dialog, show loading 
    closeDialog();
    loadingOv.style.display = "flex";
    document.body.style.overflow = "hidden";   

    setTimeout(() => {
      loadingOv.style.display = "none";
      showSuccess();
    }, 2000);
      */

    submitTourBooking();
  });

  async function submitTourBooking() {
    const name = document.getElementById("f-name").value.trim();
    const email = document.getElementById("f-email").value.trim();
    const phone = document.getElementById("f-phone").value.trim();
    const travellers = document.getElementById("f-travellers").value;
    const travelDate = document.getElementById("f-date").value;
    const notes = document.getElementById("f-notes").value.trim();
    const bookingRef =
      "WS" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const totalAmount =
      selectedTour.price * (travellers === "5+" ? 5 : Number(travellers) || 1);
    const payload = {
      bookingRef,
      tourId: selectedTour.id,
      tourTitle: selectedTour.title,
      tourCategory: selectedTour.category,
      days: selectedTour.days,
      nights: selectedTour.nights,
      pricePerPerson: selectedTour.price,
      totalAmount,
      travellers,
      travelDate,
      paymentMethod: activePayMethod,
      traveller: {
        name,
        email,
        phone,
        requests: notes || null,
      },
      bookedAt: new Date().toISOString(),
    };

    /* Close dialog → show loading spinner */

    try {
      const res = await fetch(`${API}/tours/${selectedTour._id}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Booking API error:", err.message || res.status);
      } else {
        const data = await res.json();
        console.log("Booking saved:", data.bookingRef);
      }
    } catch (err) {
      console.error(err);
      /* Still show success — payment was dummy, booking ref is local */
    }
    closeDialog();
    loadingOv.style.display = "flex";
    document.body.style.overflow = "hidden";
    /* Show success after 2s regardless (payment is demo) */
    setTimeout(() => {
      loadingOv.style.display = "none";
      showSuccess(bookingRef, name, email, totalAmount);
    }, 2000);
  }

  /* ══════════════════════════════════════════════════════════════
   9.  SUCCESS POPUP
══════════════════════════════════════════════════════════════ */

  function showSuccess() {
    const ref = "WS" + Math.random().toString(36).substring(2, 8).toUpperCase();
    document.getElementById("booking-ref").textContent = ref;

    const name = document.getElementById("f-name").value.trim();
    const email = document.getElementById("f-email").value.trim();
    document.getElementById("success-msg").textContent =
      `Hey ${name.split(" ")[0]}! Your adventure is confirmed. A confirmation has been sent to ${email}.`;

    successOv.style.display = "flex";
  }

  document.getElementById("btn-done").addEventListener("click", () => {
    successOv.style.display = "none";
    document.body.style.overflow = "";
    /* Reset form fields for next booking */
    [
      "f-name",
      "f-email",
      "f-phone",
      "f-date",
      "f-notes",
      "p-cardname",
      "p-cardnum",
      "p-expiry",
      "p-cvv",
      "p-upi",
    ].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });
    document.getElementById("f-travellers").value = "";
    document.getElementById("p-bank").value = "";
  });

  /* ══════════════════════════════════════════════════════════════
   10.  ERROR POPUP
══════════════════════════════════════════════════════════════ */

  function showErrorPopup(msg) {
    document.getElementById("error-popup-msg").textContent = msg;
    errorPopup.style.display = "flex";
  }

  document.getElementById("btn-dismiss").addEventListener("click", () => {
    errorPopup.style.display = "none";
  });

  /* ══════════════════════════════════════════════════════════════
   11.  FIELD ERROR HELPERS
══════════════════════════════════════════════════════════════ */

  function markError(id) {
    const el = document.getElementById(id);
    if (el) {
      el.classList.add("error-field");
      el.addEventListener("input", () => el.classList.remove("error-field"), {
        once: true,
      });
    }
  }

  function clearErrors() {
    document
      .querySelectorAll(".error-field")
      .forEach((el) => el.classList.remove("error-field"));
  }

  /* ══════════════════════════════════════════════════════════════
   12.  INIT — fetch on page load
══════════════════════════════════════════════════════════════ */
  // const toursLink = document.getElementById("tours-link");
  // toursLink.classList.add("active-link");

  window.addEventListener("DOMContentLoaded", () => {
    fetchTours("all");
    fetchGuides();
  });
   
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

if(!Auth.isLoggedIn()){
  dasboardli.innerHTML = `<a style="text-decoration: none; color: inherit;" href="/login">Login</a>`
  logoutli.innerHTML = `<a style="text-decoration: none; color: inherit;" href="/login?mode=signup">Signup</a>`
}
const el = document.querySelectorAll('.nav__item')[2];
el.classList.add('currNavItem')
