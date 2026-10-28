(function () {
  "use strict";

  var SAVE_KEY = "lsd-autosave-v1";
  var KEEP_FOR_MS = 12 * 60 * 60 * 1000;   // autosave is kept 12 hours after the last change
  var STEP_NOTES = { 1: "problem", 2: "solutions", 3: "decision" };
  var scenarios = window.SCENARIOS || [];

  // ---- State (autosaved on this device, so closing the tab loses nothing) --
  var saved = loadSaved();
  var notes = saved.notes;      // { "1": { problem: "...", ... }, ... }
  var unlocked = saved.unlocked; // { "1": { text, challenge } }
  var steps = {};               // { "1": 2 } — open task step per card
  var highlightOn = false;
  var currentId = null;
  var lastNote = null;          // last note box the students typed in

  function loadSaved() {
    var empty = { notes: {}, unlocked: {} };
    try {
      var data = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (!data || Date.now() - data.savedAt > KEEP_FOR_MS) {
        localStorage.removeItem(SAVE_KEY);
        return empty;
      }
      return { notes: data.notes || {}, unlocked: data.unlocked || {} };
    } catch (e) {
      return empty;
    }
  }

  function saveNotes() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        savedAt: Date.now(), notes: notes, unlocked: unlocked
      }));
    } catch (e) { /* storage unavailable: notes still live in memory */ }
  }

  function clearAll() {
    if (!window.confirm("Delete all notes on this device? This cannot be undone.")) return;
    notes = {};
    unlocked = {};
    steps = {};
    try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* nothing saved */ }
    if (location.hash === "#/" || !location.hash) route();
    else location.hash = "#/";
  }

  function hasNotes(id) {
    var n = notes[id];
    if (!n) return false;
    return Object.keys(n).some(function (k) { return n[k].trim() !== ""; });
  }

  // ---- Helpers -------------------------------------------------------------
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  function findScenario(id) {
    return scenarios.find(function (s) { return String(s.id) === String(id); });
  }

  function renderParagraphs(el, paragraphs) {
    el.textContent = "";
    (paragraphs || []).forEach(function (p) {
      var node = document.createElement("p");
      node.textContent = p;
      el.appendChild(node);
    });
  }

  function bind(view, key, value) {
    $$('[data-bind="' + key + '"]', view).forEach(function (el) {
      if (Array.isArray(value)) renderParagraphs(el, value);
      else el.textContent = value;
    });
  }

  // ---- Grammar highlight ---------------------------------------------------
  // Wraps the hand-picked grammar examples of a scenario in <mark> elements.
  function renderNarrative(el, s) {
    if (!highlightOn || !s.grammar) return renderParagraphs(el, s.narrative);
    var targets = s.grammar.slice().sort(function (a, b) { return b.text.length - a.text.length; });
    el.textContent = "";
    s.narrative.forEach(function (para) {
      var p = document.createElement("p");
      var rest = para;
      while (rest) {
        var best = null;
        targets.forEach(function (t) {
          var i = rest.indexOf(t.text);
          if (i !== -1 && (!best || i < best.i)) best = { i: i, t: t };
        });
        if (!best) { p.appendChild(document.createTextNode(rest)); break; }
        p.appendChild(document.createTextNode(rest.slice(0, best.i)));
        var mark = document.createElement("mark");
        mark.className = "g g-" + best.t.type;
        mark.textContent = best.t.text;
        p.appendChild(mark);
        rest = rest.slice(best.i + best.t.text.length);
      }
      el.appendChild(p);
    });
  }

  function setHighlight(on) {
    highlightOn = on;
    var view = $("#view-scenario");
    var btn = $("[data-highlight]", view);
    btn.setAttribute("aria-pressed", String(on));
    $("span", btn).textContent = on ? "Hide grammar" : "Highlight grammar";
    $("[data-legend]", view).hidden = !on;
    var s = findScenario(currentId);
    if (s) renderNarrative($('[data-bind="narrative"]', view), s);
  }

  // ---- Practice timer ------------------------------------------------------
  var TIMER_SECONDS = 120;
  var timer = { left: TIMER_SECONDS, id: null };

  function drawTimer() {
    var m = Math.floor(timer.left / 60);
    var sec = String(timer.left % 60).padStart(2, "0");
    var box = $("[data-timer]");
    $("[data-timer-time]", box).textContent = timer.left === 0 ? "Time's up!" : m + ":" + sec;
    $("[data-timer-toggle]", box).textContent = timer.id ? "❚❚ Pause" : (timer.left === TIMER_SECONDS ? "▶ Start" : "▶ Continue");
    box.classList.toggle("is-low", timer.left > 0 && timer.left <= 30);
    box.classList.toggle("is-done", timer.left === 0);
  }

  function chime() {
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      var ctx = new Ctx();
      [523.25, 659.25, 783.99].forEach(function (f, i) {
        var o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + i * 0.2;
        o.frequency.value = f;
        g.gain.setValueAtTime(0.25, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
        o.connect(g); g.connect(ctx.destination);
        o.start(t); o.stop(t + 0.7);
      });
    } catch (e) { /* no audio available */ }
  }

  function pauseTimer() {
    clearInterval(timer.id);
    timer.id = null;
  }

  function toggleTimer() {
    if (timer.id) { pauseTimer(); return drawTimer(); }
    if (timer.left === 0) timer.left = TIMER_SECONDS;
    timer.id = setInterval(function () {
      timer.left--;
      if (timer.left <= 0) { timer.left = 0; pauseTimer(); chime(); }
      drawTimer();
    }, 1000);
    drawTimer();
  }

  function resetTimer() {
    pauseTimer();
    timer.left = TIMER_SECONDS;
    drawTimer();
  }

  // ---- Task steps ----------------------------------------------------------
  function showStep(n) {
    var view = $("#view-scenario");
    steps[currentId] = n;
    $$(".step-tab", view).forEach(function (tab) {
      var k = Number(tab.getAttribute("data-step"));
      var note = STEP_NOTES[k] && (notes[currentId] || {})[STEP_NOTES[k]];
      tab.setAttribute("aria-selected", String(k === n));
      tab.tabIndex = k === n ? 0 : -1;
      tab.classList.toggle("is-done", !!(note && note.trim()));
    });
    $$(".step-panel", view).forEach(function (p) {
      p.hidden = Number(p.getAttribute("data-panel")) !== n;
    });
    $('[data-step-move="-1"]', view).disabled = n === 1;
    $('[data-step-move="1"]', view).hidden = n === 4;
  }

  // ---- Speaking Support: tap a phrase to add it to the notes ---------------
  function noteTarget(view) {
    var open = $(".step-panel:not([hidden]) textarea", view);
    if (open) return open;
    if (lastNote && view.contains(lastNote)) return lastNote;
    return $("textarea[data-note]", view);
  }

  function insertPhrase(btn) {
    var view = btn.closest(".view");
    var ta = noteTarget(view);
    if (!ta) return;
    // Only the first part goes in: "We believe… because…" → "We believe "
    var text = btn.textContent.split("…")[0].trim();
    var value = ta.value;
    if (value && !/\s$/.test(value)) value += " ";
    ta.value = value + text + " ";
    ta.dispatchEvent(new Event("input", { bubbles: true }));
    ta.focus();
    ta.setSelectionRange(ta.value.length, ta.value.length);
    btn.classList.add("is-added");
    setTimeout(function () { btn.classList.remove("is-added"); }, 700);
  }

  // ---- Home ----------------------------------------------------------------
  function renderHome() {
    var grid = $("#card-grid");
    grid.textContent = "";
    scenarios.forEach(function (s) {
      var a = document.createElement("a");
      a.className = "mystery-card";
      a.href = "#/card/" + s.id;
      a.setAttribute("aria-label", "Open mystery card " + s.id);

      var num = document.createElement("span");
      num.className = "mc-num";
      num.textContent = s.id;

      var label = document.createElement("span");
      label.className = "mc-label";
      label.textContent = "Mystery card";

      a.appendChild(label);
      a.appendChild(num);

      if (hasNotes(String(s.id)) || unlocked[s.id]) {
        var badge = document.createElement("span");
        badge.className = "mc-badge";
        badge.textContent = unlocked[s.id] ? "Complication opened" : "Notes saved";
        badge.setAttribute("data-short", unlocked[s.id] ? "⚡" : "✓");   // shown on small phones
        a.appendChild(badge);
      }
      grid.appendChild(a);
    });
  }

  // ---- Scenario & complication ---------------------------------------------
  function fillNotes(view, id) {
    var n = notes[id] || {};
    $$("[data-note]", view).forEach(function (ta) {
      ta.value = n[ta.getAttribute("data-note")] || "";
    });
    updateDownload(view);
  }

  // ---- Evidence download ---------------------------------------------------
  // The download button unlocks once every box in that view is filled in.
  function updateDownload(view) {
    var btn = $("[data-download]", view);
    if (!btn) return;
    var empty = $$("textarea[data-note]", view).filter(function (ta) { return ta.value.trim() === ""; });
    btn.disabled = empty.length > 0;
    var hint = "";
    if (empty.length && view.id === "view-scenario") {
      var missing = empty.map(function (ta) { return ta.closest(".step-panel").getAttribute("data-panel"); });
      hint = "Complete step" + (missing.length > 1 ? "s " : " ") +
        missing.join(", ").replace(/, (\d)$/, " and $1") + " to download your notes.";
    } else if (empty.length) {
      hint = "Complete both boxes to download your notes.";
    }
    $("[data-download-hint]", view).textContent = hint;
  }

  function downloadEvidence(btn) {
    var s = findScenario(currentId);
    var n = notes[currentId] || {};
    var twist = btn.getAttribute("data-download") === "twist" ? unlocked[currentId] : null;
    var hint = $("[data-download-hint]", btn.closest(".view"));
    btn.disabled = true;
    hint.textContent = "Creating your image…";
    window.Evidence.download({
      id: s.id, title: s.title, theme: s.theme,
      names: (n.names || "").trim(), notes: n, twist: twist
    }).then(function () {
      hint.textContent = "Downloaded!";
    }).catch(function () {
      hint.textContent = "Sorry, the image could not be created. Please try again.";
    }).finally(function () { btn.disabled = false; });
  }

  function renderScenario(s) {
    var view = $("#view-scenario");
    bind(view, "num", s.id);
    bind(view, "theme", s.theme);
    bind(view, "title", s.title);
    setHighlight(highlightOn);
    fillNotes(view, String(s.id));
    $$("details.support", view).forEach(function (d) { d.open = false; });
    showStep(steps[currentId] || 1);
    resetTimer();
    resetGate();
  }

  function renderTwist(s, data) {
    var view = $("#view-twist");
    bind(view, "num", s.id);
    bind(view, "twistTitle", s.title);
    bind(view, "twistText", data.text);
    bind(view, "challenge", data.challenge);
    $$("details.support", view).forEach(function (d) { d.open = false; });
    fillNotes(view, String(s.id));
  }

  function resetGate() {
    var form = $("#gate-form");
    form.hidden = true;
    form.reset();
    $("#gate-msg").textContent = "";
    $("#gate-msg").className = "gate-msg";
    $("#open-gate").hidden = false;
    $("#open-gate").textContent = unlocked[currentId]
      ? "⚡ View Unexpected Complication"
      : "⚡ Unexpected Complication";
  }

  // ---- Router --------------------------------------------------------------
  function show(viewId) {
    $$(".view").forEach(function (v) { v.hidden = v.id !== viewId; });
    window.scrollTo(0, 0);
    $("#main").focus({ preventScroll: true });
  }

  function route() {
    var hash = location.hash || "#/";
    var m = hash.match(/^#\/card\/(\d+)(\/complication)?$/);
    var s = m && findScenario(m[1]);

    pauseTimer();
    lastNote = null;

    if (!s) {
      currentId = null;
      renderHome();
      show("view-home");
      document.title = "Life-Stage Dilemmas: What Would You Do?";
      return;
    }

    currentId = String(s.id);
    if (m[2]) {
      if (!unlocked[currentId]) {
        // Complication not unlocked yet: go back to the scenario.
        location.replace("#/card/" + currentId);
        return;
      }
      renderTwist(s, unlocked[currentId]);
      show("view-twist");
      document.title = "Card " + s.id + " · Complication · Life-Stage Dilemmas";
    } else {
      renderScenario(s);
      show("view-scenario");
      document.title = "Card " + s.id + " · Life-Stage Dilemmas";
    }
  }

  // ---- Events --------------------------------------------------------------
  document.addEventListener("click", function (e) {
    var el;
    if ((el = e.target.closest("[data-nav]"))) {
      e.preventDefault();
      var target = el.getAttribute("data-nav");
      if (target === "home") location.hash = "#/";
      if (target === "scenario" && currentId) location.hash = "#/card/" + currentId;
    } else if ((el = e.target.closest("[data-download]"))) {
      if (!el.disabled) downloadEvidence(el);
    } else if ((el = e.target.closest("[data-highlight]"))) {
      setHighlight(!highlightOn);
    } else if ((el = e.target.closest(".step-tab"))) {
      showStep(Number(el.getAttribute("data-step")));
    } else if ((el = e.target.closest("[data-step-move]"))) {
      var next = (steps[currentId] || 1) + Number(el.getAttribute("data-step-move"));
      showStep(Math.min(4, Math.max(1, next)));
      $(".stepper", el.closest(".tasks")).scrollIntoView({ block: "nearest", behavior: "smooth" });
    } else if ((el = e.target.closest(".phrase"))) {
      insertPhrase(el);
    } else if ((el = e.target.closest("[data-timer-toggle]"))) {
      toggleTimer();
    } else if (e.target.closest("[data-timer-reset]")) {
      resetTimer();
    } else if (e.target.closest("[data-clear-all]")) {
      clearAll();
    }
  });

  // Arrow keys move between the step tabs.
  $(".stepper").addEventListener("keydown", function (e) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    var n = (steps[currentId] || 1) + (e.key === "ArrowRight" ? 1 : -1);
    if (n < 1 || n > 4) return;
    showStep(n);
    $('.step-tab[data-step="' + n + '"]').focus();
  });

  ["focusin", "pointerdown"].forEach(function (type) {
    document.addEventListener(type, function (e) {
      if (e.target.matches && e.target.matches("textarea[data-note]")) lastNote = e.target;
    });
  });

  document.addEventListener("input", function (e) {
    var ta = e.target;
    if (!ta.matches || !ta.matches("[data-note]") || !currentId) return;
    notes[currentId] = notes[currentId] || {};
    notes[currentId][ta.getAttribute("data-note")] = ta.value;
    saveNotes();
    var view = ta.closest(".view");
    updateDownload(view);
    if (view.id === "view-scenario") showStep(steps[currentId] || 1);
  });

  $("#open-gate").addEventListener("click", function () {
    if (unlocked[currentId]) {
      location.hash = "#/card/" + currentId + "/complication";
      return;
    }
    this.hidden = true;
    $("#gate-form").hidden = false;
    $("#passcode").focus();
  });

  $("#gate-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var input = $("#passcode");
    var msg = $("#gate-msg");
    var submit = $('button[type="submit"]', this);
    var id = currentId;

    submit.disabled = true;
    msg.className = "gate-msg";
    msg.textContent = "Checking…";

    fetch("/api/complication", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: Number(id), passcode: input.value })
    })
      .then(function (r) {
        if (r.status === 401) throw new Error("wrong");
        if (!r.ok) throw new Error("server");
        return r.json();
      })
      .then(function (data) {
        unlocked[id] = data;
        saveNotes();
        input.value = "";
        location.hash = "#/card/" + id + "/complication";
      })
      .catch(function (err) {
        msg.className = "gate-msg is-error";
        msg.textContent = err.message === "wrong"
          ? "That passcode is not correct. Ask your teacher."
          : "Something went wrong. Please try again.";
        input.select();
      })
      .finally(function () { submit.disabled = false; });
  });

  window.addEventListener("hashchange", route);
  route();
})();
