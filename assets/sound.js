/* Soft click on case study tiles. Off by default; visitor opts in with the speaker toggle. */
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
    o.frequency.setValueAtTime(1500, t);
    o.frequency.exponentialRampToValueAtTime(900, t + 0.03);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.6 * VOLUME, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + 0.06);
  }

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

  /* pointerdown fires before navigation starts, so the 40 ms click isn't cut off */
  document.querySelectorAll("a.card").forEach(function (a) {
    a.addEventListener("pointerdown", function (e) { if (on && e.button === 0) click(); });
    a.addEventListener("keydown", function (e) { if (on && e.key === "Enter") click(); });
  });
})();
