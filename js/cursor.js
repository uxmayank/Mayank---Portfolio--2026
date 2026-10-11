// Orange dot that follows the mouse on every page.
// It trails the pointer slightly (easing) so it feels smooth, and grows over links and buttons.
// Touch devices and people who prefer reduced motion get the normal cursor only.

(function () {
  const hasMouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!hasMouse || reduceMotion) return;

  const OFFSET = { x: 28, y: 28 }; // how far the dot sits from the pointer (right and below)
  const FOLLOW = 0.2; // 0–1: how much of the gap to the mouse is closed each frame (lower = lazier)

  const dot = document.createElement("div");
  dot.className = "cursor";
  dot.setAttribute("aria-hidden", "true");
  document.body.appendChild(dot);
  document.documentElement.classList.add("has-cursor");

  let mouseX = 0;
  let mouseY = 0;
  let x = 0;
  let y = 0;
  let running = false;

  function frame() {
    x += (mouseX - x) * FOLLOW;
    y += (mouseY - y) * FOLLOW;
    dot.style.transform = `translate(${x}px, ${y}px)`;

    // Stop the loop once the dot has caught up, so it uses no CPU while the mouse is still
    if (Math.abs(mouseX - x) > 0.1 || Math.abs(mouseY - y) > 0.1) {
      requestAnimationFrame(frame);
    } else {
      running = false;
    }
  }

  window.addEventListener("mousemove", (event) => {
    mouseX = event.clientX + OFFSET.x;
    mouseY = event.clientY + OFFSET.y;
    if (!dot.classList.contains("is-visible")) {
      x = mouseX; // first move: appear right under the pointer
      y = mouseY;
      dot.classList.add("is-visible");
    }
    if (!running) {
      running = true;
      requestAnimationFrame(frame);
    }
  }, { passive: true });

  // Grow over anything clickable, and vanish over cards that have their own hover effect
  document.addEventListener("mouseover", (event) => {
    const overCard = !!event.target.closest(".work-card--link");
    dot.classList.toggle("is-hidden", overCard);
    dot.classList.toggle("is-active", !overCard && !!event.target.closest("a, button, summary, [role='button']"));
  });

  // Hide only when the mouse really leaves the window. Moving onto an embedded frame (the Cal.com
  // calendar) also looks like "no element on the other side", so check the pointer is at the window edge.
  document.addEventListener("mouseout", (event) => {
    if (event.relatedTarget) return;
    const atEdge = event.clientX <= 0 || event.clientY <= 0 ||
      event.clientX >= window.innerWidth - 1 || event.clientY >= window.innerHeight - 1;
    if (atEdge) dot.classList.remove("is-visible");
  });
})();
