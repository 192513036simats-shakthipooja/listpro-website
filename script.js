/* ============================================================
   Infinity Business Services — FILE 3 of 3: script.js  (the behaviour of the site)

   ★★★ MOST IMPORTANT SETTING — EDIT THIS FIRST ★★★
   Put YOUR real WhatsApp business number below.
   Rules:
     - Use digits only (no +, spaces, or dashes)
     - Start with the country code. For India that is 91.
     - Example: if your number is 98765 43210, write "919876543210"
   ============================================================ */
const BUSINESS_WHATSAPP_NUMBER = "919999999999"; // <-- PLACEHOLDER: replace with your real number
const BUSINESS_NAME = "Infinity Business Services"; // <-- used inside the enquiry message

/* This is TRUE while the placeholder number above is unchanged.
   While it is true, the site will NOT open WhatsApp (so no stranger gets a message).
   The enquiry message is still shown and can be copied. */
const IS_PLACEHOLDER = (BUSINESS_WHATSAPP_NUMBER === "919999999999");

/* Everything below runs after the page has loaded. */
document.addEventListener("DOMContentLoaded", function () {

  // Tell the CSS that JavaScript is working (enables the fade-in animations)
  document.documentElement.classList.add("js");

  /* ---------- 1. MOBILE MENU ---------- */
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");

  function closeMenu() {
    navMenu.classList.remove("open");
    navToggle.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
  }

  navToggle.addEventListener("click", function () {
    const isOpen = navMenu.classList.toggle("open");
    navToggle.classList.toggle("open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });

  // Close the menu after tapping any link inside it
  navMenu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  // Close the menu with the Escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  /* ---------- 2. NAVBAR SHADOW + ACTIVE LINK HIGHLIGHT ---------- */
  const navbar = document.getElementById("navbar");
  const navLinks = document.querySelectorAll(".nav-link");
  const sectionIds = ["home", "services", "how-it-works", "pricing", "about", "contact"];

  function onScroll() {
    // Add a subtle shadow once the page is scrolled
    navbar.classList.toggle("scrolled", window.scrollY > 10);

    // Work out which section is currently on screen
    let currentId = "home";
    sectionIds.forEach(function (id) {
      const section = document.getElementById(id);
      if (section && section.getBoundingClientRect().top <= 120) {
        currentId = id;
      }
    });

    navLinks.forEach(function (link) {
      link.classList.toggle("active", link.getAttribute("href") === "#" + currentId);
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 3. FADE-IN ANIMATION WHEN SCROLLING ---------- */
  const revealItems = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target); // animate only once
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(function (item) { observer.observe(item); });
  } else {
    // Very old browsers: just show everything
    revealItems.forEach(function (item) { item.classList.add("visible"); });
  }

  /* ---------- 4. FALLBACK FOR IMAGES THAT FAIL TO LOAD ---------- */
  // If you add a real <img> and the file is missing, show a neat placeholder instead.
  function showImageFallback(img) {
    const placeholder = document.createElement("div");
    placeholder.className = "img-fallback";
    placeholder.setAttribute("role", "img");
    placeholder.setAttribute("aria-label", img.alt || "Image unavailable");
    placeholder.innerHTML = "<span>🖼️</span><span>" + (img.alt || "Image unavailable") + "</span>";
    if (img.parentNode) img.parentNode.replaceChild(placeholder, img);
  }

  document.querySelectorAll("img").forEach(function (img) {
    img.addEventListener("error", function () { showImageFallback(img); });
    // Handle images that already failed before this script ran
    if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) {
      showImageFallback(img);
    }
  });

  /* ---------- 5. FOOTER YEAR ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- 6. QUOTE FORM: VALIDATION + WHATSAPP MESSAGE ---------- */
  const form = document.getElementById("quoteForm");
  const statusEl = document.getElementById("formStatus");
  const previewBox = document.getElementById("preview");
  const previewText = document.getElementById("previewText");
  const waLink = document.getElementById("waLink");
  const copyBtn = document.getElementById("copyBtn");

  // Show or clear an error under a field
  function setError(fieldId, message) {
    const errorEl = document.getElementById(fieldId + "Error");
    if (errorEl) errorEl.textContent = message;
    const input = document.getElementById(fieldId);
    const wrapper = input ? input.closest(".field") : (errorEl ? errorEl.closest(".field") : null);
    if (wrapper) wrapper.classList.toggle("invalid", message !== "");
  }

  // Return the values of all ticked checkboxes with a given name
  function getChecked(name) {
    return Array.from(form.querySelectorAll('input[name="' + name + '"]:checked'))
      .map(function (box) { return box.value; });
  }

  // Check every field. Returns true only if everything is OK.
  function validateForm() {
    let valid = true;

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const whatsapp = document.getElementById("whatsapp").value.trim();
    const productsRaw = document.getElementById("products").value.trim();

    // Name
    if (name.length < 2) { setError("name", "Please enter your name."); valid = false; }
    else { setError("name", ""); }

    // Business name is optional, so just clear any message
    setError("business", "");

    // Email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailPattern.test(email)) { setError("email", "Please enter a valid email address."); valid = false; }
    else { setError("email", ""); }

    // WhatsApp number: accept 10 digits, or with 91 / +91 in front
    const digits = whatsapp.replace(/[\s\-()+]/g, "");
    const phonePattern = /^(91)?[6-9]\d{9}$/;
    if (!phonePattern.test(digits)) {
      setError("whatsapp", "Enter a valid 10-digit Indian mobile number.");
      valid = false;
    } else { setError("whatsapp", ""); }

    // Marketplace (at least one)
    if (getChecked("marketplace").length === 0) {
      setError("marketplace", "Please choose at least one marketplace.");
      valid = false;
    } else { setError("marketplace", ""); }

    // Number of products (whole number, 1 or more)
    const productsNum = Number(productsRaw);
    if (productsRaw === "" || !Number.isInteger(productsNum) || productsNum < 1) {
      setError("products", "Please enter a number of 1 or more.");
      valid = false;
    } else { setError("products", ""); }

    // Services (at least one)
    if (getChecked("services").length === 0) {
      setError("services", "Please choose at least one service.");
      valid = false;
    } else { setError("services", ""); }

    return valid;
  }

  // Turn the form answers into a neat, readable message
  function buildMessage() {
    const digits = document.getElementById("whatsapp").value.replace(/[\s\-()+]/g, "");
    const customerNumber = digits.length === 10 ? "+91 " + digits : "+" + digits;
    const business = document.getElementById("business").value.trim() || "Not provided";
    const details = document.getElementById("details").value.trim() || "None";

    return [
      "Hello " + BUSINESS_NAME + "! I would like a quote.",
      "",
      "*Name:* " + document.getElementById("name").value.trim(),
      "*Business:* " + business,
      "*Email:* " + document.getElementById("email").value.trim(),
      "*WhatsApp:* " + customerNumber,
      "*Marketplace(s):* " + getChecked("marketplace").join(", "),
      "*Approx. products:* " + document.getElementById("products").value.trim(),
      "*Services needed:* " + getChecked("services").join(", "),
      "*Additional details:* " + details,
      "",
      "Please let me know the next steps. Thank you!"
    ].join("\n");
  }

  // Clear an error as soon as the visitor fixes the field
  ["name", "email", "whatsapp", "products"].forEach(function (id) {
    const input = document.getElementById(id);
    input.addEventListener("input", function () { setError(id, ""); });
  });
  form.querySelectorAll('input[type="checkbox"]').forEach(function (box) {
    box.addEventListener("change", function () {
      if (getChecked(box.name).length) setError(box.name, "");
    });
  });

  // When the form is submitted
  form.addEventListener("submit", function (event) {
    event.preventDefault(); // stop the page from reloading

    statusEl.className = "form-status";
    statusEl.textContent = "";

    if (!validateForm()) {
      statusEl.classList.add("bad");
      statusEl.textContent = "Please fix the highlighted fields and try again.";
      previewBox.hidden = true;
      // Jump to the first problem so the visitor sees it
      const firstBad = form.querySelector(".field.invalid");
      if (firstBad) firstBad.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const message = buildMessage();
    const url = "https://wa.me/" + BUSINESS_WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);

    // Show the message so the visitor can read / copy it
    previewText.textContent = message;
    waLink.href = url;
    waLink.hidden = IS_PLACEHOLDER; // hide the button until a real number is set
    previewBox.hidden = false;

    statusEl.classList.add("ok");

    if (IS_PLACEHOLDER) {
      // Placeholder number: do not open WhatsApp. Let the visitor copy the message instead.
      statusEl.textContent = "Your enquiry message is ready below. WhatsApp will open automatically once the business number is added. For now, use 'Copy message'.";
      previewBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
      return;
    }

    statusEl.textContent = "Your enquiry is ready. WhatsApp is opening. Press Send there to contact us. Nothing has been sent yet.";

    // Open WhatsApp in a new tab
    const opened = window.open(url, "_blank", "noopener");
    if (!opened) {
      statusEl.textContent = "Your enquiry is ready. If WhatsApp did not open, use the 'Open WhatsApp' button below.";
    }
  });

  // "Copy message" button
  copyBtn.addEventListener("click", function () {
    const text = previewText.textContent;
    const done = function () {
      copyBtn.textContent = "Copied ✓";
      setTimeout(function () { copyBtn.textContent = "Copy message"; }, 2000);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(fallbackCopy);
    } else {
      fallbackCopy();
    }

    // Older-browser way of copying
    function fallbackCopy() {
      const area = document.createElement("textarea");
      area.value = text;
      document.body.appendChild(area);
      area.select();
      try { document.execCommand("copy"); done(); } catch (e) { /* ignore */ }
      document.body.removeChild(area);
    }
  });

  /* ---------- 7. SERVICE CARD LINKS TICK THE MATCHING MARKETPLACE ---------- */
  // Clicking "Request a Meesho quote" (etc.) pre-selects that marketplace in the form.
  document.querySelectorAll("[data-marketplace]").forEach(function (link) {
    link.addEventListener("click", function () {
      const box = form.querySelector('input[name="marketplace"][value="' + link.dataset.marketplace + '"]');
      if (box) { box.checked = true; setError("marketplace", ""); }
    });
  });

  /* ---------- 8. CONTACT WHATSAPP LINK (uses the number set at the top) ---------- */
  const contactWa = document.getElementById("contactWhatsapp");
  if (contactWa && !IS_PLACEHOLDER) {
    const n = BUSINESS_WHATSAPP_NUMBER;
    contactWa.href = "https://wa.me/" + n;
    contactWa.target = "_blank";
    contactWa.rel = "noopener";
    contactWa.classList.remove("placeholder");
    // Show Indian numbers as +91 XXXXX XXXXX, anything else as +digits
    contactWa.textContent = (n.length === 12 && n.indexOf("91") === 0)
      ? "+91 " + n.slice(2, 7) + " " + n.slice(7)
      : "+" + n;
  }

});
