(function () {
  "use strict";

  var NOTES_KEY = "lsd-notes-v1";
  var scenarios = window.SCENARIOS || [];

  // ---- State (kept for this browser tab only) -----------------------------
  var notes = loadNotes();      // { "1": { problem: "...", ... }, ... }
  var unlocked = {};            // { "1": { title, text } } — in memory only
  var currentId = null;

  function loadNotes() {
    try {
      return JSON.parse(sessionStorage.getItem(NOTES_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function saveNotes() {
    try {
      sessionStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    } catch (e) { /* storage unavailable: notes still live in memory */ }
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
        a.appendChild(badge);
      }
      grid.appendChild(a);
    });
  }

  // ---- Scenario & complication ---------------------------------------------
  function fillNotes(view, id) {
    var n = notes[id] || {};
    $$("textarea[data-note]", view).forEach(function (ta) {
      ta.value = n[ta.getAttribute("data-note")] || "";
    });
  }

  function renderScenario(s) {
    var view = $("#view-scenario");
    bind(view, "num", s.id);
    bind(view, "theme", s.theme);
    bind(view, "title", s.title);
    bind(view, "narrative", s.narrative);
    fillNotes(view, String(s.id));
    resetGate();
  }

  function renderTwist(s, data) {
    var view = $("#view-twist");
    bind(view, "num", s.id);
    bind(view, "twistTitle", s.title);
    bind(view, "twistText", data.text);
    bind(view, "challenge", data.challenge);
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
    var btn = e.target.closest("[data-nav]");
    if (!btn) return;
    e.preventDefault();
    var target = btn.getAttribute("data-nav");
    if (target === "home") location.hash = "#/";
    if (target === "scenario" && currentId) location.hash = "#/card/" + currentId;
  });

  document.addEventListener("input", function (e) {
    var ta = e.target;
    if (!ta.matches || !ta.matches("textarea[data-note]") || !currentId) return;
    notes[currentId] = notes[currentId] || {};
    notes[currentId][ta.getAttribute("data-note")] = ta.value;
    saveNotes();
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
