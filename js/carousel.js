// Photo carousel on the About page.
// Works with any number of slides: add another <li class="carousel__slide"> in the HTML
// and the dots and arrows update on their own.

document.querySelectorAll("[data-carousel]").forEach((carousel) => {
  const track = carousel.querySelector(".carousel__track");
  const slides = Array.from(track.children);
  const prevButton = carousel.querySelector(".carousel__arrow--prev");
  const nextButton = carousel.querySelector(".carousel__arrow--next");
  const dotsList = carousel.querySelector(".carousel__dots");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // One photo: nothing to slide between
  if (slides.length < 2) {
    carousel.classList.add("carousel--single");
    return;
  }

  // Build one dot per slide
  const dots = slides.map((slide, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "carousel__dot";
    dot.setAttribute("aria-label", `Show photo ${index + 1} of ${slides.length}`);
    dot.addEventListener("click", () => goTo(index));
    dotsList.appendChild(dot);
    return dot;
  });

  function currentIndex() {
    return Math.round(track.scrollLeft / track.clientWidth);
  }

  function goTo(index) {
    // Wrap around at either end
    const target = (index + slides.length) % slides.length;
    track.scrollTo({ left: target * track.clientWidth, behavior: reduceMotion ? "auto" : "smooth" });
    setActiveDot(target); // update straight away instead of waiting for the scroll to finish
  }

  function setActiveDot(active) {
    dots.forEach((dot, index) => dot.setAttribute("aria-current", index === active ? "true" : "false"));
  }

  function updateDots() {
    setActiveDot(currentIndex());
  }

  prevButton.addEventListener("click", () => goTo(currentIndex() - 1));
  nextButton.addEventListener("click", () => goTo(currentIndex() + 1));
  track.addEventListener("scroll", updateDots, { passive: true });

  // Left and right arrow keys when the carousel has focus
  carousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") goTo(currentIndex() - 1);
    if (event.key === "ArrowRight") goTo(currentIndex() + 1);
  });

  // Drag with a mouse (touch screens already swipe natively)
  let startX = 0;
  let startScroll = 0;
  let dragging = false;

  track.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "mouse") return;
    dragging = true;
    startX = event.clientX;
    startScroll = track.scrollLeft;
    track.classList.add("is-dragging");
    track.setPointerCapture(event.pointerId);
  });

  track.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    track.scrollLeft = startScroll - (event.clientX - startX);
  });

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    track.classList.remove("is-dragging");
    goTo(currentIndex());
  }

  track.addEventListener("pointerup", endDrag);
  track.addEventListener("pointercancel", endDrag);

  updateDots();
});
