/* Tapsys — animation layer (~1.2KB, no dependencies)
   Safety model: nothing is ever hidden unless this script hides it, and the
   reveal-everything failsafe is registered BEFORE any element gets the .rv
   (hidden) class. If this script errors or never runs, the page stays 100%
   visible and static. */
(function () {
  "use strict";
  document.documentElement.classList.add("js");
  var rm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 1 — failsafe FIRST: no matter what happens below, reveal everything at 5s */
  setTimeout(function () {
    document.querySelectorAll(".rv").forEach(function (el) { el.classList.add("rv-in"); });
  }, 5000);

  try {
    /* header elevation on scroll */
    var hdr = document.querySelector("header.site");
    if (hdr) {
      var onScroll = function () { hdr.classList.toggle("scrolled", window.scrollY > 10); };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }

    /* scroll reveal — only when supported and the user hasn't asked for reduced motion */
    var RV = ".card, .product, article.post, .team figure, details.faq, .vfacade, .info-list li, .paychips li, .prose h2, .prose table, .prose blockquote, .prose ol";
    if (!rm && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("rv-in"); io.unobserve(e.target); }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
      document.querySelectorAll(RV).forEach(function (el) {
        el.classList.add("rv");
        var sibs = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
        el.style.setProperty("--rvd", Math.min(Math.max(sibs, 0), 5) * 70 + "ms");
        io.observe(el);
      });
    }

    /* logo marquee — duplicate content once for a seamless CSS loop */
    if (!rm) {
      document.querySelectorAll(".marquee").forEach(function (m) {
        var track = document.createElement("div");
        track.className = "m-track";
        while (m.firstChild) track.appendChild(m.firstChild);
        m.appendChild(track);
        track.innerHTML += track.innerHTML;
      });
    }
  } catch (e) { /* any failure falls through to the failsafe reveals at 5s */ }
})();
