/* ============================================================
   PADDOCK PULSE — shared interactivity
   Features:
   1. Dark / light theme toggle (persisted)
   2. Live countdown to next race
   3. Filterable driver / team / gallery grids
   4. Contact form validation
   ============================================================ */

(function () {
  "use strict";

  /* ---------- 1. THEME TOGGLE ---------- */
  function initTheme() {
    const root = document.documentElement;
    const stored = localStorage.getItem("pp-theme");
    if (stored) root.setAttribute("data-theme", stored);

    const toggles = document.querySelectorAll(".theme-toggle");
    function syncIcon() {
      const isLight = root.getAttribute("data-theme") === "light";
      toggles.forEach((btn) => {
        btn.innerHTML = isLight ? "&#9728;" : "&#9789;"; // sun / moon
        btn.setAttribute(
          "aria-label",
          isLight ? "Switch to dark mode" : "Switch to light mode"
        );
      });
    }
    syncIcon();

    toggles.forEach((btn) => {
      btn.addEventListener("click", () => {
        const current = root.getAttribute("data-theme") === "light" ? "light" : "dark";
        const next = current === "light" ? "dark" : "light";
        root.setAttribute("data-theme", next);
        localStorage.setItem("pp-theme", next);
        syncIcon();
      });
    });
  }

  /* ---------- 2. LIVE COUNTDOWN ---------- */
  function initCountdown() {
    const el = document.querySelector("[data-countdown]");
    if (!el) return;

    const targetDate = new Date(el.getAttribute("data-countdown"));
    const dEl = el.querySelector("[data-days]");
    const hEl = el.querySelector("[data-hours]");
    const mEl = el.querySelector("[data-mins]");
    const sEl = el.querySelector("[data-secs]");
    const doneLabel = el.getAttribute("data-done-label") || "Lights out!";

    function pad(n) {
      return String(n).padStart(2, "0");
    }

    function tick() {
      const now = new Date();
      let diff = targetDate.getTime() - now.getTime();

      if (diff <= 0) {
        el.innerHTML =
          '<div class="unit"><span class="num text-mono">&#127937;</span><span class="lbl">' +
          doneLabel +
          "</span></div>";
        clearInterval(timer);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      diff -= days * 1000 * 60 * 60 * 24;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      diff -= hours * 1000 * 60 * 60;
      const mins = Math.floor(diff / (1000 * 60));
      diff -= mins * 1000 * 60;
      const secs = Math.floor(diff / 1000);

      if (dEl) dEl.textContent = pad(days);
      if (hEl) hEl.textContent = pad(hours);
      if (mEl) mEl.textContent = pad(mins);
      if (sEl) sEl.textContent = pad(secs);
    }

    tick();
    const timer = setInterval(tick, 1000);
  }

  /* ---------- 3. FILTERABLE GRIDS ---------- */
  function initFilters() {
    const bars = document.querySelectorAll("[data-filter-bar]");
    bars.forEach((bar) => {
      const gridSelector = bar.getAttribute("data-filter-bar");
      const grid = document.querySelector(gridSelector);
      if (!grid) return;
      const items = grid.querySelectorAll("[data-filter-key]");
      const chips = bar.querySelectorAll(".chip");

      chips.forEach((chip) => {
        chip.addEventListener("click", () => {
          chips.forEach((c) => c.classList.remove("active"));
          chip.classList.add("active");
          const value = chip.getAttribute("data-filter-value");

          items.forEach((item) => {
            const key = item.getAttribute("data-filter-key");
            const show = value === "all" || key === value;
            item.style.display = show ? "" : "none";
          });
        });
      });
    });
  }

  /* ---------- 4. CONTACT FORM VALIDATION ---------- */
  function initContactForm() {
    const form = document.querySelector("#contactForm");
    if (!form) return;

    const successBox = document.querySelector("#formSuccess");

    function setState(field, valid, message) {
      field.classList.toggle("is-invalid", !valid);
      field.classList.toggle("is-valid", valid);
      const feedback = field.parentElement.querySelector(".invalid-feedback");
      if (feedback && message) feedback.textContent = message;
    }

    function validateName(field) {
      const ok = field.value.trim().length >= 2;
      setState(field, ok, "Please enter your full name (2+ characters).");
      return ok;
    }

    function validateEmail(field) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const ok = re.test(field.value.trim());
      setState(field, ok, "Please enter a valid email address.");
      return ok;
    }

    function validateSubject(field) {
      const ok = field.value.trim() !== "";
      setState(field, ok, "Please choose a topic.");
      return ok;
    }

    function validateMessage(field) {
      const ok = field.value.trim().length >= 15;
      setState(field, ok, "Your message should be at least 15 characters.");
      return ok;
    }

    const nameField = form.querySelector("#cfName");
    const emailField = form.querySelector("#cfEmail");
    const subjectField = form.querySelector("#cfSubject");
    const messageField = form.querySelector("#cfMessage");

    nameField.addEventListener("input", () => validateName(nameField));
    emailField.addEventListener("input", () => validateEmail(emailField));
    subjectField.addEventListener("change", () => validateSubject(subjectField));
    messageField.addEventListener("input", () => validateMessage(messageField));

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const validations = [
        validateName(nameField),
        validateEmail(emailField),
        validateSubject(subjectField),
        validateMessage(messageField),
      ];

      if (validations.every(Boolean)) {
        form.classList.add("d-none");
        if (successBox) {
          successBox.classList.remove("d-none");
          successBox.focus();
        }
      } else {
        const firstInvalid = form.querySelector(".is-invalid");
        if (firstInvalid) firstInvalid.focus();
      }
    });
  }

  /* ---------- INIT ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initCountdown();
    initFilters();
    initContactForm();

    // set current year in footer
    document.querySelectorAll("[data-year]").forEach((el) => {
      el.textContent = new Date().getFullYear();
    });
  });
})();