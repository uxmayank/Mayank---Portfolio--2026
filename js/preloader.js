// Home page preloader (Figma 405:17006).
//
// The word "Mynk" starts as thin outlines. An orange dot pops in at the top left and hops
// from letter to letter. Each time it lands, the letter dips down a few pixels (as if the dot
// had hit it) and springs back while a black fill pours into it from the top. After the "k",
// the dot swings round to the end of the word to become the full stop, the word slides a little
// to the left to make room, and then the whole screen slides up to reveal the page.
//
// The motion is built with GSAP (js/vendor/gsap.min.js). It is only downloaded when the
// preloader is actually going to play.
//
// This file is loaded in the <head> (not at the end of <body>) on purpose: it has to add the
// "has-preloader" class to <html> BEFORE the page is first drawn, otherwise visitors would see
// a flash of the page behind the preloader.

(function () {
  // ---- Settings you can tweak ----
  const SPEED = 1.4;           // 1 = timing as designed here; higher = faster overall (about 4.5s in total at 1.4)
  const DIP_PX = 10;           // how far a letter is pushed down when the dot lands (8–12 looks right)
  const EXIT_DELAY_S = 0.35;   // pause on the finished "Mynk." before the screen slides away
  const MAX_WAIT_MS = 5000;    // never keep visitors waiting longer than this for a slow page
  const FAILSAFE_MS = 14000;   // if anything goes wrong, always remove the preloader by now

  // ---- Positions, measured from the Figma frames (all in the SVG's own units; the SVG is 1120 wide) ----
  const DOT_W = 91.52;
  const DOT_H = 79.64;
  const START = { x: -147.5, y: -93 };      // frame 2: where the dot first appears (its top-left corner)
  const FINAL = { x: 1122.5, y: 239.2 };    // frame 7: where the full stop ends up, measured from the word's own left edge
  const WORD_SLIDE = -40;                   // frame 7: the word (with the dot) slides 40 units left
  // For each letter: the middle of where the dot lands, and the y of the flat top it lands on.
  const LETTERS = [
    { id: "m", centerX: 50.3,  top: 27.34 },
    { id: "y", centerX: 422.3, top: 85.42 },
    { id: "n", centerX: 658.3, top: 85.42 },
    { id: "k", centerX: 918.3, top: 0.5 },
  ];
  const SVG_WIDTH = 1120.35;

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

  // ---- 2. Get everything ready, then play ----
  // Load GSAP now, in parallel with the rest of the page
  const gsapLoaded = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "js/vendor/gsap.min.js"; // relative to index.html
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });

  const domReady = new Promise((resolve) => {
    if (document.readyState !== "loading") resolve();
    else document.addEventListener("DOMContentLoaded", resolve);
  });

  // The two small labels use the site font, so wait for it (but not forever)
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  const fontsOrTimeout = Promise.race([fontsReady, new Promise((resolve) => setTimeout(resolve, 2500))]);

  let pageLoaded = document.readyState === "complete";
  window.addEventListener("load", () => { pageLoaded = true; });

  Promise.all([gsapLoaded, domReady, fontsOrTimeout]).then(play).catch(finish);

  // ---- 3. The animation ----
  function play() {
    const preloader = document.querySelector(".preloader");
    const page = document.querySelector(".page");
    const svg = preloader && preloader.querySelector(".preloader__word");
    const dot = preloader && preloader.querySelector(".preloader__dot");
    const composition = preloader && preloader.querySelector(".preloader__composition");
    if (!svg || !dot || !composition || !window.gsap) return finish();

    // Keep keyboard focus and screen readers out of the page while it's covered
    if (page) page.inert = true;

    const letters = LETTERS.map((letter) => {
      const group = preloader.querySelector(`.preloader__letter[data-letter="${letter.id}"]`);
      const clip = preloader.querySelector(`#preloader-clip-${letter.id} rect`);
      return {
        ...letter,
        group,
        outline: group.querySelector(".preloader__outline"),
        clip,
        fullHeight: parseFloat(clip.dataset.fullHeight),
        // where the dot's top-left corner is when it rests on this letter
        landing: { x: letter.centerX - DOT_W / 2, y: letter.top - DOT_H },
      };
    });
    const labels = preloader.querySelectorAll(".preloader__label");

    // Screen pixels per SVG unit, so the dip is a real 10px on screen (and never tiny on a phone)
    const unit = svg.getBoundingClientRect().width / SVG_WIDTH;
    const dip = Math.max(DIP_PX, 6 / unit);

    const tl = gsap.timeline();
    tl.timeScale(SPEED);

    // Starting states
    gsap.set(dot, { x: START.x, y: START.y, transformOrigin: "50% 50%" });

    // Intro: the outlined letters and the two labels fade in
    tl.fromTo(letters.map((l) => l.outline), { opacity: 0 }, { opacity: 1, duration: 0.6, stagger: 0.08, ease: "power1.out" }, 0);
    tl.fromTo(labels, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: "power2.out" }, 0.1);

    // The dot pops in at the top left
    tl.fromTo(dot, { opacity: 1, scale: 0 }, { scale: 1, duration: 0.5, ease: "back.out(2.2)" }, 0.25);

    // Hop from one point to another along an arc. "progress" eases from 0 to 1; the dot's height
    // follows a parabola on top of the straight line between the two points.
    function hop(from, to, arcHeight, startAt, duration) {
      const progress = { p: 0 };
      tl.to(progress, {
        p: 1,
        duration,
        ease: "power1.inOut",
        onUpdate() {
          const p = progress.p;
          gsap.set(dot, {
            x: from.x + (to.x - from.x) * p,
            y: from.y + (to.y - from.y) * p - arcHeight * 4 * p * (1 - p),
          });
        },
      }, startAt);
    }

    // For each letter: hop there, hit it (letter and dot dip together), fill it, spring back
    let cursor = 0.6;        // time the next hop starts (in timeline seconds)
    let from = START;
    const hopDurations = [0.6, 0.46, 0.4, 0.4];
    const IMPACT_S = 0.09;   // how long the dip takes
    const REST_S = 0.04;     // tiny pause at the bottom of the dip, so the hit reads clearly

    letters.forEach((letter, i) => {
      const dx = Math.abs(letter.landing.x - from.x);
      const arc = Math.min(110, Math.max(55, dx * 0.3));
      hop(from, letter.landing, arc, cursor, hopDurations[i]);

      const hitAt = cursor + hopDurations[i];

      // The hit: letter and dot are pushed down together
      tl.to(letter.group, { y: dip, duration: IMPACT_S, ease: "power2.out" }, hitAt);
      tl.to(dot, { y: letter.landing.y + dip, duration: IMPACT_S, ease: "power2.out" }, hitAt);

      // The black fill pours into the letter from the top, smoothly
      tl.to(letter.clip, { attr: { height: letter.fullHeight }, duration: 0.8, ease: "power2.out" }, hitAt);

      // The dot leaves, and the letter springs back up with a little bounce
      const leaveAt = hitAt + IMPACT_S + REST_S;
      tl.to(letter.group, { y: 0, duration: 0.7, ease: "elastic.out(1, 0.45)" }, leaveAt);

      from = { x: letter.landing.x, y: letter.landing.y + dip };
      cursor = leaveAt;
    });

    // Finale: the dot swings round the right side of the "k" down to the baseline,
    // and the word slides left to make room for it
    const finalDuration = 1.0;
    const control = { x: FINAL.x + 30, y: from.y - 60 };   // pulls the path up and out to the right
    const finalProgress = { p: 0 };
    tl.to(finalProgress, {
      p: 1,
      duration: finalDuration,
      ease: "power2.inOut",
      onUpdate() {
        const p = finalProgress.p;
        const a = (1 - p) * (1 - p);
        const b = 2 * (1 - p) * p;
        const c = p * p;
        gsap.set(dot, {
          x: a * from.x + b * control.x + c * FINAL.x,
          y: a * from.y + b * control.y + c * FINAL.y,
        });
      },
    }, cursor);

    tl.to(composition, { x: WORD_SLIDE, duration: 0.85, ease: "power3.inOut" }, cursor + 0.2);

    // The dot lands: a quick squash, then it settles
    const landedAt = cursor + finalDuration;
    tl.to(dot, { scaleX: 1.07, scaleY: 0.88, transformOrigin: "50% 100%", duration: 0.09, ease: "power2.out" }, landedAt);
    tl.to(dot, { scaleX: 1, scaleY: 1, duration: 0.6, ease: "elastic.out(1, 0.4)" }, landedAt + 0.09);

    // Start leaving as soon as the dot has landed (the springy settle carries on during the exit)
    tl.call(leave, null, landedAt + 0.3);

    // ---- 4. Leave ----
    function leave() {
      // Wait for the page to finish loading (but not forever), then slide the screen up
      const waitStarted = performance.now();
      (function checkReady() {
        if (pageLoaded || performance.now() - waitStarted >= MAX_WAIT_MS) {
          gsap.to(preloader, { yPercent: -100, duration: 0.9, delay: EXIT_DELAY_S, ease: "power4.inOut", onComplete: finish });
        } else {
          setTimeout(checkReady, 100);
        }
      })();
    }
  }
})();
