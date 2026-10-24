/* Soft click on every link and button, site-wide; a chime for the "reach out" actions
   (copy email, resume download, LinkedIn). Always on; there is no mute control. */
(function () {
  var VOLUME = 0.3;
  var ctx = null;

  function audio() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function click() {
    var c = audio();
    if (!c) return;
    var t = c.currentTime, o = c.createOscillator(), g = c.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(1500, t);
    o.frequency.exponentialRampToValueAtTime(900, t + 0.03);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.6 * VOLUME, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + 0.06);
  }

  /* Two-note chime (A5 + E6). Used only where the visitor stays on the page, so it's never cut off. */
  function chime() {
    var c = audio();
    if (!c) return;
    var t = c.currentTime;
    [[880, 0.45], [1320, 0.25]].forEach(function (n) {
      var o = c.createOscillator(), g = c.createGain();
      o.type = "sine";
      o.frequency.value = n[0];
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(n[1] * VOLUME, t + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
      o.connect(g).connect(c.destination);
      o.start(t);
      o.stop(t + 0.5);
    });
  }

  /* Browsers keep audio locked until the first tap or click; unlock it then (needed on iPhone) */
  ["pointerdown", "touchend", "keydown"].forEach(function (ev) {
    document.addEventListener(ev, audio, { once: true, capture: true, passive: true });
  });

  var CHIME = "[data-copy], a[download], a[href*='linkedin.com']";
  var CLICKABLE = "a[href], button, [role='button'], summary, label, input, select, [onclick], [data-zoom]";
  function play(t) { t.matches(CHIME) ? chime() : click(); }
  function target(el) { return el && el.closest ? el.closest(CLICKABLE) : null; }

  /* pointerdown fires before navigation starts, so the 40 ms click isn't cut off */
  document.addEventListener("pointerdown", function (e) {
    var t = e.button === 0 && target(e.target);
    if (t) play(t);
  }, true);
  document.addEventListener("keydown", function (e) {
    var t = (e.key === "Enter" || e.key === " ") && target(document.activeElement);
    if (t) play(t);
  }, true);
})();
