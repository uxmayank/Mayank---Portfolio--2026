// Cal.com booking calendar inside the orange "Have a product…" card on the home page.
// This is Cal.com's official inline embed code: it loads Cal.com's script and draws the
// calendar into the element with id="my-cal-inline-30min" in index.html.

(function (C, A, L) {
  let p = function (a, ar) { a.q.push(ar); };
  let d = C.document;
  C.Cal = C.Cal || function () {
    let cal = C.Cal;
    let ar = arguments;
    if (!cal.loaded) {
      cal.ns = {};
      cal.q = cal.q || [];
      d.head.appendChild(d.createElement("script")).src = A;
      cal.loaded = true;
    }
    if (ar[0] === L) {
      const api = function () { p(api, arguments); };
      const namespace = ar[1];
      api.q = api.q || [];
      if (typeof namespace === "string") {
        cal.ns[namespace] = cal.ns[namespace] || api;
        p(cal.ns[namespace], ar);
        p(cal, ["initNamespace", namespace]);
      } else p(cal, ar);
      return;
    }
    p(cal, ar);
  };
})(window, "https://app.cal.com/embed/embed.js", "init");

Cal("init", "30min", { origin: "https://app.cal.com" });
Cal.config = Cal.config || {};
Cal.config.forwardQueryParams = true;

// Month view on desktop; a simpler list of time slots on small screens
Cal.ns["30min"]("inline", {
  elementOrSelector: "#my-cal-inline-30min",
  config: { layout: "month_view", useSlotsViewOnSmallScreen: "true" },
  calLink: "mayank-pal-jch24p/30min",
});

Cal.ns["30min"]("ui", { hideEventTypeDetails: false, layout: "month_view" });
