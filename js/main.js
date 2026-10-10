// Small shared scripts used on every page (e.g. mobile nav).

// Autoplaying videos: if the visitor has asked their device to reduce motion,
// stop the video and show play controls so they can start it themselves.
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (prefersReducedMotion) {
  document.querySelectorAll("video[autoplay]").forEach((video) => {
    video.removeAttribute("autoplay");
    video.pause();
    video.controls = true;
  });
}

// Links to a section on the page you're already on (e.g. "Work" on the home page)
// scroll there with a visible, eased animation instead of snapping.
// "/" and "/index.html" count as the same page.
function samePath(a, b) {
  return a.replace(/index\.html$/, "") === b.replace(/index\.html$/, "");
}

// Starts slow, speeds up, then slows down again
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

let scrollFrame = null;

function glideTo(target) {
  const startY = window.scrollY;
  const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
  const endY = Math.max(0, target.getBoundingClientRect().top + startY - margin);
  const distance = endY - startY;

  cancelAnimationFrame(scrollFrame);

  // Longer scrolls take longer, but never less than 0.5s or more than 1.2s
  const duration = Math.min(1200, Math.max(500, Math.abs(distance) * 0.65));
  const startTime = performance.now();

  function step(now) {
    const progress = Math.min(1, (now - startTime) / duration);
    // "instant" so the page's CSS smooth-scrolling doesn't add a second animation on top
    window.scrollTo({ top: startY + distance * easeInOutCubic(progress), behavior: "instant" });
    if (progress < 1) scrollFrame = requestAnimationFrame(step);
  }

  scrollFrame = requestAnimationFrame(step);
}

// If the visitor scrolls with the wheel or touch mid-glide, let them take over
["wheel", "touchstart"].forEach((type) =>
  window.addEventListener(type, () => cancelAnimationFrame(scrollFrame), { passive: true })
);

document.querySelectorAll('a[href*="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const url = new URL(link.href);
    if (url.origin !== location.origin || !samePath(url.pathname, location.pathname) || !url.hash) return;

    const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!target) return;

    event.preventDefault();
    if (prefersReducedMotion) {
      target.scrollIntoView({ block: "start" });
    } else {
      glideTo(target);
    }
    history.pushState(null, "", url.hash); // keep the #work in the address bar
  });
});
