/* Pop on every link and button, site-wide; a chime for the "reach out" actions
   (copy email, resume download, LinkedIn). Off by default; visitor opts in with the speaker toggle. */
(function () {
  var KEY = "byjill-sound", VOLUME = 0.3;
  var btn = document.querySelector(".sound-toggle");
  var ctx = null, on = false;
  try { on = localStorage.getItem(KEY) === "on"; } catch (e) {}

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
    /* Pop: a quick downward pitch drop, 700 -> 180 Hz over ~90 ms */
    o.frequency.setValueAtTime(700, t);
    o.frequency.exponentialRampToValueAtTime(180, t + 0.09);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.8 * VOLUME, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + 0.12);
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

  var CHIME = "[data-copy], a[download], a[href*='linkedin.com']";
  function play(t) { t.matches(CHIME) ? chime() : click(); }

  function render() {
    if (!btn) return;
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.setAttribute("aria-label", on ? "Turn sound off" : "Turn sound on");
    btn.title = on ? "Sound on" : "Sound off";
  }

  if (btn) {
    btn.hidden = false;
    render();
    btn.addEventListener("click", function () {
      on = !on;
      try { localStorage.setItem(KEY, on ? "on" : "off"); } catch (e) {}
      render();
      if (on) click(); /* confirms the setting and unlocks audio on iOS */
    });
  }

  /* Every clickable thing on the page: links, buttons, form controls, image zoom triggers.
     pointerdown fires before navigation starts, so the 40 ms click isn't cut off. */
  var CLICKABLE = "a[href], button, [role='button'], summary, label, input, select, [onclick], [data-zoom]";
  function target(el) {
    var t = el && el.closest ? el.closest(CLICKABLE) : null;
    return t && t !== btn ? t : null; /* the toggle plays its own confirmation */
  }
  document.addEventListener("pointerdown", function (e) {
    var t = on && e.button === 0 && target(e.target);
    if (t) play(t);
  }, true);
  document.addEventListener("keydown", function (e) {
    var t = on && (e.key === "Enter" || e.key === " ") && target(document.activeElement);
    if (t) play(t);
  }, true);
})();
