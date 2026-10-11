// Home page preloader: "Mynk." wordmark that animates in, holds, then slides away.
//
// This file is loaded in the <head> (not at the end of <body>) on purpose: it has to
// add the "has-preloader" class to <html> BEFORE the page is first drawn, otherwise
// visitors would see a flash of the page behind the preloader.

(function () {
  const HOLD_MS = 2000;      // how long the animation plays before the exit can start
  const MAX_WAIT_MS = 5000;  // never keep visitors waiting longer than this for slow loading
  const FAILSAFE_MS = 9000;  // if anything goes wrong, always remove the preloader by now

  // ---- 1. Decide whether to show it ----
  // Show on a first visit and on reload. Skip it when someone clicks "Home" from another
  // page of the site, or uses the back button, and for people who prefer reduced motion.
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const navigation = performance.getEntriesByType("navigation")[0];
  const navigationType = navigation ? navigation.type : "navigate";

  let cameFromThisSite = false;
  try {
    cameFromThisSite = !!document.referrer && new URL(document.referrer).origin === location.origin;
  } catch (error) {
    cameFromThisSite = false;
  }

  const shouldShow = !reduceMotion && (navigationType === "reload" || (navigationType === "navigate" && !cameFromThisSite));
  if (!shouldShow) return;

  const root = document.documentElement;
  root.classList.add("has-preloader");

  // Failsafe first, before anything else can fail
  const failsafe = setTimeout(finish, FAILSAFE_MS);

  let finished = false;

  function finish() {
    if (finished) return;
    finished = true;
    clearTimeout(failsafe);
    root.classList.remove("has-preloader");
    const preloader = document.querySelector(".preloader");
    if (preloader) preloader.remove();
    const page = document.querySelector(".page");
    if (page) page.inert = false;
  }

  // ---- 2. Run it ----
  document.addEventListener("DOMContentLoaded", () => {
    const preloader = document.querySelector(".preloader");
    const page = document.querySelector(".page");
    if (!preloader) return finish();

    // Keep keyboard focus and screen readers out of the page while it's covered
    if (page) page.inert = true;

    let pageLoaded = document.readyState === "complete";
    window.addEventListener("load", () => { pageLoaded = true; });

    // Wait for the fonts so the wordmark never flashes in a fallback font (but not forever)
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    const fontsOrTimeout = Promise.race([fontsReady, new Promise((resolve) => setTimeout(resolve, 2500))]);

    fontsOrTimeout.then(() => {
      const startedAt = performance.now();
      preloader.classList.add("is-playing");

      // Leave once the animation has had its time AND the page has loaded (or we've waited long enough)
      (function checkReady() {
        const elapsed = performance.now() - startedAt;
        if (elapsed >= HOLD_MS && (pageLoaded || elapsed >= MAX_WAIT_MS)) {
          preloader.classList.add("is-leaving");
          preloader.addEventListener("animationend", (event) => {
            if (event.animationName === "preloader-exit") finish();
          });
        } else {
          setTimeout(checkReady, 100);
        }
      })();
    });
  });
})();
