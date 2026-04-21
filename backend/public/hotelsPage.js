  /**
   * hotels.js
   * Collects all filter inputs → POST /api/hotels/search → renders results
   */
  const navLogout = document.getElementById("nav-logout");
  navLogout.addEventListener("click", (evt) => {
    Auth.logout();
  });

  const API_BASE =
    window.location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://college-project-int222.onrender.com";

  // ── Colour map for hotel thumbs ──────────────────────────────────
  const THUMB_COLORS = {
    H001: "thumb-teal",
    H002: "thumb-amber",
    H003: "thumb-coral",
    H004: "thumb-teal",
    H005: "thumb-teal",
    H006: "thumb-teal",
    H007: "thumb-blue",
    H008: "thumb-blue",
    H009: "thumb-purple",
    H010: "thumb-blue",
    H011: "thumb-teal",
    H012: "thumb-amber",
  };

  // ── Tag style map ────────────────────────────────────────────────
  const TAG_CLASS = {
    "Eco-Certified": "htag-eco",
    "Hidden Gem": "htag-gem",
    "Best Value": "htag-val",
    "Hot Deal": "htag-hot",
  };

  // ── State ────────────────────────────────────────────────────────
  let selectedStars = []; // array of star numbers (1-5)
  let currentResults = []; // last results from server

  // ── DOM refs ─────────────────────────────────────────────────────
  const hotelList = document.getElementById("hotel-list");
  const resultCount = document.getElementById("result-count");
  const loadingEl = document.getElementById("loading");
  const errorBox = document.getElementById("error-box");
  const errorMsg = document.getElementById("error-msg");
  const noResults = document.getElementById("no-results");
  const priceRange = document.getElementById("price-range");
  const priceDisplay = document.getElementById("price-display");
  const sortSelect = document.getElementById("sort-select");
  const cardTpl = document.getElementById("hotel-card-tpl");

  // ── Price slider live update ──────────────────────────────────────
  priceRange.addEventListener("input", () => {
    priceDisplay.textContent =
      "₹" + Number(priceRange.value).toLocaleString("en-IN");
  });

  // ── Star buttons toggle ───────────────────────────────────────────
  document.querySelectorAll(".star-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const star = Number(btn.dataset.star);
      if (selectedStars.includes(star)) {
        selectedStars = selectedStars.filter((s) => s !== star);
        btn.classList.remove("active");
      } else {
        selectedStars.push(star);
        btn.classList.add("active");
      }
    });
  });

  // ── Sort change → re-sort without re-fetching ────────────────────
  sortSelect.addEventListener("change", () => {
    if (currentResults.length) renderHotels(sortResults(currentResults));
  });

  // ── Collect all filter values → return payload object ────────────
  function collectFilters() {
    const tags = [];
    if (document.getElementById("f-eco").checked) tags.push("Eco-Certified");
    if (document.getElementById("f-gem").checked) tags.push("Hidden Gem");
    if (document.getElementById("f-deal").checked) tags.push("Hot Deal");

    const amenities = [];
    if (document.getElementById("a-wifi").checked) amenities.push("WiFi");
    if (document.getElementById("a-breakfast").checked)
      amenities.push("Breakfast");
    if (document.getElementById("a-parking").checked) amenities.push("Parking");
    if (document.getElementById("a-gym").checked) amenities.push("Gym");
    if (document.getElementById("a-spa").checked) amenities.push("Spa");

    return {
      destination:
        document.getElementById("search-destination").value.trim() || null,
      checkIn: document.getElementById("search-checkin").value || null,
      checkOut: document.getElementById("search-checkout").value || null,
      guests: Number(document.getElementById("search-guests").value) || null,
      maxPrice: Number(priceRange.value),
      freeCancellation: document.getElementById("f-cancel").checked || null,
      poolIncluded: document.getElementById("f-pool").checked || null,
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
    console.log(filters);
    try {
      const res = await fetch(`${API_BASE}/hotels/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        `${currentResults.length} hotel${currentResults.length !== 1 ? "s" : ""} found` +
        (filters.destination ? ` in ${filters.destination}` : "");
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
      if (sortBy === "price_asc") return a.pricePerNight - b.pricePerNight;
      if (sortBy === "price_desc") return b.pricePerNight - a.pricePerNight;
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "eco_score") return b.ecoScore - a.ecoScore;
      // best_value: sort by rating / (price/1000) ratio
      return (
        b.rating / (b.pricePerNight / 1000) -
        a.rating / (a.pricePerNight / 1000)
      );
    });
    return sorted;
  }

  // ── Render hotel cards ────────────────────────────────────────────
  function renderHotels(hotels) {
    hotelList.innerHTML = "";

    if (!hotels.length) {
      noResults.style.display = "block";
      return;
    }
    noResults.style.display = "none";

    hotels.forEach((hotel) => {
      const card = cardTpl.content.cloneNode(true);
      const el = card.querySelector(".hotel-card");

      // Thumb colour
      const thumb = card.querySelector(".thumb-placeholder");
      //thumb.classList.add(THUMB_COLORS[hotel.id] || "thumb-teal");
      thumb.style.backgoundImage = `url(${hotel.images[0]})`;

      thumb.style.backgroundImage = `url(${hotel.images[0]})`;
      thumb.style.backgroundSize = "cover";
      thumb.style.backgroundPosition = "center";
      // Name & rating
      card.querySelector(".hotel-name").textContent = hotel.name;
      card.querySelector(".hotel-rating").textContent =
        `★ ${hotel.rating.toFixed(1)}`;

      // Location & reviews
      card.querySelector(".hotel-loc").textContent =
        `${hotel.location.city}, ${hotel.location.state} · ${hotel.location.distanceFromCenter} · ${hotel.reviews.toLocaleString("en-IN")} reviews`;

      // Tags
      const tagsEl = card.querySelector(".hotel-tags");
      hotel.tags.slice(0, 4).forEach((tag) => {
        const span = document.createElement("span");
        span.className = "htag " + (TAG_CLASS[tag] || "");
        span.textContent = tag;
        tagsEl.appendChild(span);
      });

      // Amenities
      const amenEl = card.querySelector(".hotel-amenities");
      hotel.amenities.slice(0, 5).forEach((am) => {
        const div = document.createElement("div");
        div.className = "amen-item";
        div.innerHTML = `<span class="amen-dot"></span>${am}`;
        amenEl.appendChild(div);
      });

      // Eco score leaves
      const leavesEl = card.querySelector(".eco-leaves");
      for (let i = 1; i <= 5; i++) {
        const leaf = document.createElement("div");
        leaf.className = "leaf" + (i > hotel.ecoScore ? " empty" : "");
        leavesEl.appendChild(leaf);
      }
      card.querySelector(".eco-label").textContent =
        `Eco score ${hotel.ecoScore}/5`;

      // Price
      card.querySelector(".hotel-price").textContent =
        "₹" + hotel.pricePerNight.toLocaleString("en-IN");
      card.querySelector(".hotel-price-sub").textContent =
        "per night" + (hotel.freeCancellation ? " · free cancel" : "");

      // Book button
      card.querySelector(".btn-book").addEventListener("click", (e) => {
        e.stopPropagation();
        openHotelDialog(hotel._id);
      });

      // Card click → detail view
      el.addEventListener("click", () => {
        // Replace with your dialog/detail page logic
        console.log("Hotel selected:", hotel.id, hotel.name);
      });

      hotelList.appendChild(card);
    });
  }

  // ── UI helpers ────────────────────────────────────────────────────
  function showLoading(show) {
    loadingEl.style.display = show ? "block" : "none";
    if (show) hotelList.innerHTML = "";
  }
  function showError(show, msg = "") {
    errorBox.style.display = show ? "block" : "none";
    if (msg) errorMsg.textContent = msg;
  }

  // ── Reset filters ─────────────────────────────────────────────────
  document.getElementById("reset-filters").addEventListener("click", () => {
    // Uncheck all checkboxes
    document
      .querySelectorAll('.sf-check input[type="checkbox"]')
      .forEach((cb) => (cb.checked = false));
    // Reset price
    priceRange.value = 8000;
    priceDisplay.textContent = "₹8,000";
    // Reset stars
    selectedStars = [];
    document
      .querySelectorAll(".star-btn")
      .forEach((b) => b.classList.remove("active"));
    // Reset search fields
    document.getElementById("search-destination").value = "";
    document.getElementById("search-checkin").value = "";
    document.getElementById("search-checkout").value = "";
    document.getElementById("search-guests").value = "";
    // Re-fetch with clean filters
    fetchHotels(collectFilters());
  });

  // ── Apply filters button ──────────────────────────────────────────
  document.getElementById("apply-filters").addEventListener("click", () => {
    console.log(collectFilters());
    fetchHotels(collectFilters());
  });

  // ── Search button ─────────────────────────────────────────────────
  document.getElementById("search-btn").addEventListener("click", () => {
    console.log(collectFilters());
    fetchHotels(collectFilters());
  });

  // const hotelLink = document.getElementById("hotelsLink");
  // hotelLink.classList.add("active-link");

  // ── Auto-fetch on page load ───────────────────────────────────────
  window.addEventListener("DOMContentLoaded", async () => {
    fetchHotels(collectFilters());
    // const fetchedData = await fetch(`${API_BASE}/api/hotels`);
    // const body = await fetchedData.json();
    // renderHotels(body.hotels);
    // showLoading(false);
    // showError(false);
  });

  /**
   * hotel-dialog.js
   * ─────────────────────────────────────────────────────────────────
   * Usage: call  openHotelDialog(hotelId)  from any card click.
   *
   * Depends on:  hotel-dialog.html  (injected into page)
   *              hotel-dialog.css
   *
   * API calls:
   *   GET  /api/hotels/:id          → load hotel detail
   *   POST /api/hotels/:id/book     → submit booking → save to hotelGuests.json
   * ─────────────────────────────────────────────────────────────────
   */

  const HD_API =
    window.location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://college-project-int222.onrender.com";

  /* Default fallback thumb */
  function getThumb(hotel) {
    const colors = {
      Heritage: "#f4a843",
      Nature: "#9FE1CB",
      Luxury: "#CECBF6",
      Beach: "#B5D4F4",
      Wellness: "#9FE1CB",
      Wildlife: "#FAC775",
      Adventure: "#B5D4F4",
      Budget: "#C0DD97",
    };
    const bg = "#B5D4F4";
    return `<div style="width:100%;height:100%;backgroundImage:url(${hotel.images[0]});background-size:contain;background-repeat:no-repeat;background-position:center"></div>`;
  }

  /* ── Tag badge class helper ────────────────────────────────────── */
  function tagClass(tag) {
    if (tag.toLowerCase().includes("eco")) return "hd-tag-eco";
    if (tag.toLowerCase().includes("hidden")) return "hd-tag-gem";
    if (tag.toLowerCase().includes("value")) return "hd-tag-val";
    return "";
  }
  function badgeClass(tag) {
    if (tag.toLowerCase().includes("eco")) return "hd-badge-eco";
    if (tag.toLowerCase().includes("hidden")) return "hd-badge-gem";
    if (tag.toLowerCase().includes("value")) return "hd-badge-val";
    if (tag.toLowerCase().includes("deal")) return "hd-badge-hot";
    return "hd-badge-default";
  }

  /* ════════════════════════════════════════════════════════════════
   STATE
════════════════════════════════════════════════════════════════ */
  let _hotel = null; // current hotel object
  let _step = 1; // current dialog step
  let _payMethod = "card"; // active payment tab
  let _nights = 1; // computed from dates

  /* ════════════════════════════════════════════════════════════════
   OPEN DIALOG — call this from any hotel card click
════════════════════════════════════════════════════════════════ */
  async function openHotelDialog(hotelId) {
    _hotel = null;
    _step = 1;

    /* Show backdrop + skeleton */
    document.getElementById("hd-backdrop").style.display = "flex";
    document.getElementById("hd-skeleton").style.display = "block";
    document.getElementById("hd-content").style.display = "none";
    document.body.style.overflow = "hidden";

    /* Scroll dialog to top */
    document.getElementById("hd-dialog").scrollTop = 0;

    try {
      const res = await fetch(`${HD_API}/hotels/hotel/${hotelId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      _hotel = await res.json();
      _populateStep1(_hotel);
      document.getElementById("hd-skeleton").style.display = "none";
      document.getElementById("hd-content").style.display = "block";
      const thumbnail = document.getElementById("hd-thumb");
      thumbnail.style.backgroundImage = `url(${_hotel.images[0]})`;
      thumbnail.style.backgroundSize = "contain";
      thumbnail.style.backgroundRepeat = "no-repeat";
      thumbnail.style.backgroundPosition = "center";

      _goStep(1);
    } catch (err) {
      console.error("Hotel fetch failed:", err);
      document.getElementById("hd-skeleton").innerHTML =
        '<div style="padding:32px 24px;color:#F09595;font-size:14px;">Failed to load hotel details. Please try again.</div>';
    }
  }

  /* ── Populate step 1 ───────────────────────────────────────────── */
  function _populateStep1(h) {
    /* Thumb */
    document.getElementById("hd-thumb").innerHTML = getThumb(h);

    /* Badges */
    const badgesEl = document.getElementById("hd-thumb-badges");
    badgesEl.innerHTML = "";
    (h.tags || []).slice(0, 3).forEach((tag) => {
      const s = document.createElement("span");
      s.className = `hd-badge ${badgeClass(tag)}`;
      s.textContent = tag;
      badgesEl.appendChild(s);
    });

    /* Title, location, rating */
    document.getElementById("hd-name").textContent = h.name;
    document.getElementById("hd-loc").textContent =
      `${h.location.address} · ${h.location.distanceFromCenter} from centre`;
    document.getElementById("hd-rating").textContent =
      `★ ${h.rating.toFixed(1)}`;
    document.getElementById("hd-reviews").textContent =
      `${h.reviews.toLocaleString()} reviews`;

    /* Description */
    document.getElementById("hd-desc").textContent = h.description;

    /* Quick stats */
    const statsEl = document.getElementById("hd-stats");
    statsEl.innerHTML = "";
    const stats = [
      { lbl: "Category", val: h.category },
      { lbl: "Stars", val: "★".repeat(h.stars) },
      {
        lbl: "Price / night",
        val: `₹${h.pricePerNight.toLocaleString()}`,
        cls: "green",
      },
    ];
    stats.forEach((s) => {
      const card = document.createElement("div");
      card.className = "hd-stat-card";
      card.innerHTML = `<div class="hd-stat-lbl">${s.lbl}</div>
                      <div class="hd-stat-val ${s.cls || ""}">${s.val}</div>`;
      statsEl.appendChild(card);
    });

    /* Tags */
    const tagsEl = document.getElementById("hd-tags");
    tagsEl.innerHTML = "";
    (h.tags || []).forEach((tag) => {
      const s = document.createElement("span");
      s.className = `hd-tag ${tagClass(tag)}`;
      s.textContent = tag;
      tagsEl.appendChild(s);
    });

    /* Amenities */
    const amenEl = document.getElementById("hd-amenities");
    amenEl.innerHTML = "";
    (h.amenities || []).forEach((am) => {
      const d = document.createElement("div");
      d.className = "hd-amen";
      d.innerHTML = `<span class="hd-amen-dot"></span>${am}`;
      amenEl.appendChild(d);
    });

    /* Eco score */
    const ecoEl = document.getElementById("hd-eco-row");
    ecoEl.innerHTML = "";
    for (let i = 1; i <= 5; i++) {
      const l = document.createElement("span");
      l.className = "hd-leaf" + (i > h.ecoScore ? " empty" : "");
      ecoEl.appendChild(l);
    }
    const ecoLbl = document.createElement("span");
    ecoLbl.className = "hd-eco-lbl";
    ecoLbl.textContent = `${h.ecoScore}/5 eco rating`;
    ecoEl.appendChild(ecoLbl);

    /* Price */
    document.getElementById("hd-price").textContent =
      `₹${h.pricePerNight.toLocaleString()}`;
    document.getElementById("hd-price-sub").textContent =
      `per night${h.freeCancellation ? " · free cancellation" : ""}`;

    /* Pre-fill form hotel name */
    document.getElementById("hd-form-hotel-name").textContent = h.name;
    document.getElementById("hd-form-hotel-sub").textContent =
      `${h.location.city}, ${h.location.state} · ₹${h.pricePerNight.toLocaleString()} / night`;
  }

  /* ════════════════════════════════════════════════════════════════
   STEP NAVIGATION
════════════════════════════════════════════════════════════════ */
  function _goStep(n) {
    _step = n;
    document.getElementById("hd-step-1").style.display =
      n === 1 ? "block" : "none";
    document.getElementById("hd-step-2").style.display =
      n === 2 ? "block" : "none";
    document.getElementById("hd-step-3").style.display =
      n === 3 ? "block" : "none";

    [1, 2, 3].forEach((i) => {
      const pill = document.getElementById(`hd-step-pill-${i}`);
      pill.classList.toggle("active", i === n);
      pill.classList.toggle("done", i < n);
    });

    document.getElementById("hd-dialog").scrollTop = 0;
  }

  function _closeDialog() {
    document.getElementById("hd-backdrop").style.display = "none";
    document.body.style.overflow = "";
  }

  /* ════════════════════════════════════════════════════════════════
   TOTAL CALCULATION
════════════════════════════════════════════════════════════════ */
  function _recalcTotal() {
    if (!_hotel) return;
    const ci = document.getElementById("hg-checkin").value;
    const co = document.getElementById("hg-checkout").value;
    if (ci && co && co > ci) {
      const ms = new Date(co) - new Date(ci);
      _nights = Math.max(1, Math.round(ms / 86400000));
    } else {
      _nights = 1;
    }
    const total = _hotel.pricePerNight * _nights;
    document.getElementById("hd-total-preview").textContent =
      `${_nights} night${_nights > 1 ? "s" : ""} · ₹${total.toLocaleString()}`;
    return total;
  }

  /* ════════════════════════════════════════════════════════════════
   VALIDATION HELPERS
════════════════════════════════════════════════════════════════ */
  function _markErr(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add("hd-error");
    el.addEventListener("input", () => el.classList.remove("hd-error"), {
      once: true,
    });
    el.addEventListener("change", () => el.classList.remove("hd-error"), {
      once: true,
    });
  }
  function _clearErr() {
    document
      .querySelectorAll(".hd-error")
      .forEach((e) => e.classList.remove("hd-error"));
  }
  function _showErr(msg) {
    document.getElementById("hd-err-msg").textContent = msg;
    document.getElementById("hd-err-overlay").style.display = "flex";
  }

  /* ════════════════════════════════════════════════════════════════
   STEP 1 → STEP 2
════════════════════════════════════════════════════════════════ */
  function _validateStep2() {
    const fields = [
      {
        id: "hg-name",
        label: "Full name",
        val: () => document.getElementById("hg-name").value.trim(),
      },
      {
        id: "hg-email",
        label: "Email address",
        val: () => document.getElementById("hg-email").value.trim(),
      },
      {
        id: "hg-phone",
        label: "Phone number",
        val: () => document.getElementById("hg-phone").value.trim(),
      },
      {
        id: "hg-guests",
        label: "Number of guests",
        val: () => document.getElementById("hg-guests").value,
      },
      {
        id: "hg-checkin",
        label: "Check-in date",
        val: () => document.getElementById("hg-checkin").value,
      },
      {
        id: "hg-checkout",
        label: "Check-out date",
        val: () => document.getElementById("hg-checkout").value,
      },
    ];
    const missing = fields.filter((f) => !f.val());
    if (missing.length) {
      missing.forEach((f) => _markErr(f.id));
      _showErr(
        `You missed something... Please fill in: ${missing.map((f) => f.label).join(", ")}.`,
      );
      return false;
    }
    const ci = document.getElementById("hg-checkin").value;
    const co = document.getElementById("hg-checkout").value;
    if (co <= ci) {
      _markErr("hg-checkout");
      _showErr("Check-out date must be after check-in date.");
      return false;
    }
    return true;
  }

  /* ════════════════════════════════════════════════════════════════
   STEP 2 → STEP 3
════════════════════════════════════════════════════════════════ */
  function _prepStep3() {
    const total = _recalcTotal();
    const guests = document.getElementById("hg-guests").value;
    document.getElementById("hd-pay-summary").textContent =
      `${_hotel.name} · ${_nights} night${_nights > 1 ? "s" : ""} · ${guests} guest${guests !== "1" ? "s" : ""} · ₹${total.toLocaleString()}`;
    document.getElementById("hd-pay-btn-amt").textContent =
      `₹${total.toLocaleString()}`;
  }

  /* ════════════════════════════════════════════════════════════════
   PAYMENT VALIDATION
════════════════════════════════════════════════════════════════ */
  function _validatePayment() {
    if (_payMethod === "card") {
      const checks = [
        {
          id: "hp-name",
          label: "Name on card",
          ok: () => !!document.getElementById("hp-name").value.trim(),
        },
        {
          id: "hp-num",
          label: "Card number",
          ok: () =>
            document.getElementById("hp-num").value.replace(/\s/g, "").length >=
            15,
        },
        {
          id: "hp-expiry",
          label: "Expiry date",
          ok: () =>
            document.getElementById("hp-expiry").value.trim().length >= 4,
        },
        {
          id: "hp-cvv",
          label: "CVV",
          ok: () => document.getElementById("hp-cvv").value.trim().length >= 3,
        },
      ];
      const missing = checks.filter((c) => !c.ok());
      if (missing.length) {
        missing.forEach((c) => _markErr(c.id));
        _showErr(
          `You missed something... Please fill in: ${missing.map((c) => c.label).join(", ")}.`,
        );
        return false;
      }
    } else if (_payMethod === "upi") {
      const upi = document.getElementById("hp-upi").value.trim();
      if (!upi || !upi.includes("@")) {
        _markErr("hp-upi");
        _showErr("Please enter a valid UPI ID (e.g. yourname@upi).");
        return false;
      }
    } else if (_payMethod === "netbanking") {
      if (!document.getElementById("hp-bank").value) {
        _markErr("hp-bank");
        _showErr("You missed something... Please select your bank.");
        return false;
      }
    }
    return true;
  }

  /* ════════════════════════════════════════════════════════════════
   SUBMIT BOOKING — POST to backend
════════════════════════════════════════════════════════════════ */
  async function _submitBooking() {
    const total = _recalcTotal();
    const ref = "WS" + Math.random().toString(36).substring(2, 8).toUpperCase();

    const payload = {
      bookingRef: ref,
      hotelId: _hotel.id,
      hotelName: _hotel.name,
      city: _hotel.location.city,
      state: _hotel.location.state,
      pricePerNight: _hotel.pricePerNight,
      nights: _nights,
      totalAmount: total,
      guest: {
        name: document.getElementById("hg-name").value.trim(),
        email: document.getElementById("hg-email").value.trim(),
        phone: document.getElementById("hg-phone").value.trim(),
        guests: document.getElementById("hg-guests").value,
        checkIn: document.getElementById("hg-checkin").value,
        checkOut: document.getElementById("hg-checkout").value,
        requests: document.getElementById("hg-requests").value.trim() || null,
      },
      paymentMethod: _payMethod,
      bookedAt: new Date().toISOString(),
    };

    /* Close dialog, show loading */
    _closeDialog();
    document.getElementById("hd-loading-overlay").style.display = "flex";
    document.body.style.overflow = "hidden";

    try {
      const res = await fetch(`${HD_API}/hotels/${_hotel._id}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      /* Regardless of response we show success for demo (payment is dummy) */
      if (!res.ok) console.warn("Booking API returned", res.status);
      const data = await res.json().catch(() => ({}));
      const finalRef = data.bookingRef || payload.bookingRef;

      setTimeout(() => {
        document.getElementById("hd-loading-overlay").style.display = "none";
        _showSuccess(payload, finalRef);
      }, 2000);
    } catch (err) {
      console.error("Booking POST failed:", err);
      setTimeout(() => {
        document.getElementById("hd-loading-overlay").style.display = "none";
        _showSuccess(payload, payload.bookingRef); // still show success (demo mode)
      }, 2000);
    }
  }

  /* ════════════════════════════════════════════════════════════════
   SUCCESS ANIMATION
════════════════════════════════════════════════════════════════ */
  function _showSuccess(p, ref) {
    const firstName = p.guest.name.split(" ")[0];
    document.getElementById("hd-success-hotel").textContent = p.hotelName;
    document.getElementById("hd-success-msg").textContent =
      `Hey ${firstName}! Your stay is confirmed. A confirmation has been sent to ${p.guest.email}.`;
    document.getElementById("hd-success-meta").textContent =
      `${p.guest.checkIn}  →  ${p.guest.checkOut} · ${p.nights} night${p.nights > 1 ? "s" : ""} · ₹${p.totalAmount.toLocaleString()}`;
    document.getElementById("hd-success-ref").textContent = ref;
    document.getElementById("hd-success-overlay").style.display = "flex";
  }

  /* ════════════════════════════════════════════════════════════════
   RESET FORM
════════════════════════════════════════════════════════════════ */
  function _resetForm() {
    [
      "hg-name",
      "hg-email",
      "hg-phone",
      "hg-requests",
      "hp-name",
      "hp-num",
      "hp-expiry",
      "hp-cvv",
      "hp-upi",
    ].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });
    ["hg-guests", "hp-bank"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });
    document.getElementById("hg-checkin").value = "";
    document.getElementById("hg-checkout").value = "";
    _clearErr();
    _payMethod = "card";
    document
      .querySelectorAll(".hd-pay-tab")
      .forEach((b) => b.classList.remove("active"));
    document
      .querySelector('.hd-pay-tab[data-method="card"]')
      .classList.add("active");
    document.getElementById("hd-card-form").style.display = "grid";
    document.getElementById("hd-upi-form").style.display = "none";
    document.getElementById("hd-net-form").style.display = "none";
    document.getElementById("hd-total-preview").textContent =
      `1 night · ₹${_hotel?.pricePerNight?.toLocaleString() || "–"}`;
  }

  /* ════════════════════════════════════════════════════════════════
   EVENT LISTENERS — set up once on DOM ready
════════════════════════════════════════════════════════════════ */
  document.addEventListener("DOMContentLoaded", () => {
    /* ── Close / backdrop ─────────────────────────────────────── */
    document.getElementById("hd-close").addEventListener("click", _closeDialog);
    document
      .getElementById("hd-close-2")
      .addEventListener("click", _closeDialog);
    document
      .getElementById("hd-close-3")
      .addEventListener("click", _closeDialog);
    document.getElementById("hd-backdrop").addEventListener("click", (e) => {
      if (e.target === document.getElementById("hd-backdrop")) _closeDialog();
    });

    /* ── Step 1 → Book Now ────────────────────────────────────── */
    document.getElementById("hd-btn-book").addEventListener("click", () => {
      const map = {
        "hg-name": "name",
        "hg-email": "email",
        "hg-phone": "phone",
      };
      Auth.requireAuth(() => {});
      _resetForm();
      _goStep(2);
      Auth.prefillForm(map);
    });

    /* ── Date change → recalc total ───────────────────────────── */
    document
      .getElementById("hg-checkin")
      .addEventListener("change", _recalcTotal);
    document
      .getElementById("hg-checkout")
      .addEventListener("change", _recalcTotal);

    /* ── Step 2 → Next ────────────────────────────────────────── */
    document.getElementById("hd-next-2").addEventListener("click", () => {
      if (!_validateStep2()) return;
      _clearErr();
      _prepStep3();
      _goStep(3);
    });

    /* ── Step 3 → Back ────────────────────────────────────────── */
    document
      .getElementById("hd-back-1")
      .addEventListener("click", () => _goStep(1));
    document
      .getElementById("hd-back-2")
      .addEventListener("click", () => _goStep(2));

    /* ── Payment method tabs ──────────────────────────────────── */
    document.querySelectorAll(".hd-pay-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        document
          .querySelectorAll(".hd-pay-tab")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        _payMethod = btn.dataset.method;
        document.getElementById("hd-card-form").style.display =
          _payMethod === "card" ? "grid" : "none";
        document.getElementById("hd-upi-form").style.display =
          _payMethod === "upi" ? "grid" : "none";
        document.getElementById("hd-net-form").style.display =
          _payMethod === "netbanking" ? "grid" : "none";
      });
    });

    /* Card number auto-format */
    document.getElementById("hp-num").addEventListener("input", function () {
      let v = this.value.replace(/\D/g, "").substring(0, 16);
      this.value = v.replace(/(.{4})/g, "$1  ").trim();
    });
    /* Expiry auto-format */
    document.getElementById("hp-expiry").addEventListener("input", function () {
      let v = this.value.replace(/\D/g, "").substring(0, 4);
      if (v.length >= 3) v = v.substring(0, 2) + " / " + v.substring(2);
      this.value = v;
    });

    /* ── Confirm & Pay ────────────────────────────────────────── */
    document.getElementById("hd-btn-pay").addEventListener("click", () => {
      if (!_validatePayment()) return;
      _clearErr();
      _submitBooking();
    });

    /* ── Error popup dismiss ──────────────────────────────────── */
    document.getElementById("hd-btn-fix").addEventListener("click", () => {
      document.getElementById("hd-err-overlay").style.display = "none";
    });

    /* ── Success done ─────────────────────────────────────────── */
    document.getElementById("hd-btn-done").addEventListener("click", () => {
      document.getElementById("hd-success-overlay").style.display = "none";
      document.body.style.overflow = "";
      _hotel = null;
    });

    /* Escape key closes dialog */
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        _closeDialog();
        document.getElementById("hd-err-overlay").style.display = "none";
        document.getElementById("hd-success-overlay").style.display = "none";
      }
    });
  });

  const navToggle = document.getElementById("navbar-toggle");
  const navItems = document.getElementById("nav-items");

  navToggle.addEventListener("click", () => {
    navItems.classList.toggle("active");
    navToggle.classList.toggle("active");
  });

  // Close menu when a link is clicked
  document.querySelectorAll(".nav__item").forEach((item) => {
    item.addEventListener("click", () => {
      navItems.classList.remove("active");
      navToggle.classList.remove("active");
    });
  });

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#navbar")) {
      navItems.classList.remove("active");
      navToggle.classList.remove("active");
    }
  });
  const dasboardli = document.getElementById("nav-dashboard");
  const logoutli = document.getElementById("nav-logout");

  if (!Auth.isLoggedIn()) {
    dasboardli.innerHTML = `<a style="text-decoration: none; color: inherit;" href="/login">Login</a>`;
    logoutli.innerHTML = `<a style="text-decoration: none; color: inherit;" href="/login?mode=signup">Signup</a>`;
  }
  console.log(Auth.isLoggedIn());
  if (!Auth.isLoggedIn()) {
    document.getElementById("hd-btn-book").innerText = "Login To Book";
  }
  const el = document.querySelectorAll(".nav__item")[1];
  el.classList.add("currNavItem");