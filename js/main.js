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
