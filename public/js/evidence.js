/*
 * EVIDENCE — draws a pair's notes as a 4K UHD (3840 × 2160) PNG and downloads it.
 * Uses the same fonts as the site: Baloo 2 for titles, Poppins for text.
 */
(function () {
  "use strict";

  var W = 1920, H = 1080, SCALE = 2;   // drawn at 1920×1080, exported at 3840×2160
  var TITLE = '"Baloo 2", sans-serif';
  var BODY = '"Poppins", sans-serif';
  var C = {
    bg: "#f6f1e9", surface: "#fffdf9", ink: "#1f2a2e", muted: "#5d6a6e",
    line: "#e3d9ca", primary: "#1f5e63", accent: "#d9642b", accentSoft: "#fbe6d9"
  };

  function loadFonts() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    return Promise.all([
      document.fonts.load("800 64px " + TITLE),
      document.fonts.load("700 30px " + TITLE),
      document.fonts.load("400 24px " + BODY),
      document.fonts.load("600 24px " + BODY)
    ]).catch(function () {});
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // Splits text into lines that fit maxWidth, keeping the students' line breaks.
  function wrap(ctx, text, maxWidth) {
    var lines = [];
    String(text).replace(/\r/g, "").split("\n").forEach(function (para) {
      var words = para.split(/\s+/).filter(Boolean);
      if (!words.length) { lines.push(""); return; }
      var line = "";
      words.forEach(function (word) {
        var test = line ? line + " " + word : word;
        if (ctx.measureText(test).width <= maxWidth) { line = test; return; }
        if (line) lines.push(line);
        // A single word longer than the box: break it by characters.
        line = "";
        word.split("").forEach(function (ch) {
          if (ctx.measureText(line + ch).width > maxWidth && line) { lines.push(line); line = ""; }
          line += ch;
        });
      });
      lines.push(line);
    });
    while (lines.length && lines[lines.length - 1] === "") lines.pop();
    return lines;
  }

  function drawBox(ctx, box, size) {
    var pad = 28;
    roundRect(ctx, box.x, box.y, box.w, box.h, 22);
    ctx.fillStyle = box.tint ? C.accentSoft : C.surface;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = box.tint ? C.accent : C.line;
    ctx.stroke();

    ctx.textBaseline = "top";
    ctx.fillStyle = box.tint ? C.accent : C.primary;
    ctx.font = "700 30px " + TITLE;
    ctx.fillText(box.label, box.x + pad, box.y + pad - 4);

    ctx.fillStyle = C.ink;
    ctx.font = (box.tint ? "600 " : "400 ") + size + "px " + BODY;
    var lh = Math.round(size * 1.5);
    box.lines.forEach(function (l, i) {
      ctx.fillText(l, box.x + pad, box.y + pad + 50 + i * lh);
    });
  }

  // Largest text size (≤ 36px) at which every box's text fits.
  function fit(ctx, boxes) {
    for (var size = 36; size >= 11; size--) {
      var ok = boxes.every(function (b) {
        ctx.font = (b.tint ? "600 " : "400 ") + size + "px " + BODY;
        b.lines = wrap(ctx, b.text, b.w - 56);
        return 28 + 50 + b.lines.length * Math.round(size * 1.5) + 24 <= b.h;
      });
      if (ok) return size;
    }
    return 11;
  }

  function render(data) {
    var canvas = document.createElement("canvas");
    canvas.width = W * SCALE;
    canvas.height = H * SCALE;
    var ctx = canvas.getContext("2d");
    ctx.scale(SCALE, SCALE);

    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = data.twist ? C.accent : C.primary;
    ctx.fillRect(0, 0, W, 14);

    var M = 72;
    ctx.textBaseline = "top";

    // Card number badge
    ctx.fillStyle = C.primary;
    ctx.beginPath();
    ctx.arc(M + 48, 72 + 48, 48, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "800 60px " + TITLE;
    ctx.textAlign = "center";
    ctx.fillText(String(data.id), M + 48, 72 + 18);
    ctx.textAlign = "left";

    var tx = M + 128;
    ctx.fillStyle = C.accent;
    ctx.font = "600 20px " + BODY;
    ctx.fillText("LIFE-STAGE DILEMMAS  ·  MYSTERY CARD " + data.id, tx, 62);
    ctx.fillStyle = C.ink;
    ctx.font = "800 60px " + TITLE;
    ctx.fillText(data.title, tx, 88);
    ctx.fillStyle = C.muted;
    ctx.font = "400 24px " + BODY;
    ctx.fillText(data.theme, tx, 166);

    // Names and date, top right
    ctx.textAlign = "right";
    ctx.fillStyle = C.muted;
    ctx.font = "600 20px " + BODY;
    ctx.fillText(data.names ? "STUDENTS" : "", W - M, 62);
    ctx.fillStyle = C.ink;
    ctx.font = "700 32px " + TITLE;
    var names = data.names || "";
    while (names && ctx.measureText(names).width > 640) names = names.slice(0, -2) + "…";
    ctx.fillText(names, W - M, 88);
    ctx.fillStyle = C.muted;
    ctx.font = "400 22px " + BODY;
    ctx.fillText(data.date, W - M, 166);
    ctx.textAlign = "left";

    // Note boxes
    var top = 236, bottom = H - 76, gap = 28;
    // The pair that challenges a card usually has no notes for its first part.
    var ownNotes = ["problem", "solutions", "decision"].some(function (k) {
      return (data.notes[k] || "").trim() !== "";
    });
    var showOwn = !data.twist || ownNotes;
    var rows = data.twist && showOwn ? 2 : 1;
    var rowH = (bottom - top - gap * (rows - 1)) / rows;
    var colW = (W - 2 * M - gap * 2) / 3;
    var boxes = [];
    function add(row, col, label, text, tint) {
      boxes.push({
        x: M + col * (colW + gap), y: top + row * (rowH + gap),
        w: colW, h: rowH, label: label, text: text || "", tint: tint
      });
    }
    if (showOwn) {
      add(0, 0, "1. The problem", data.notes.problem);
      add(0, 1, "2. Two possible solutions", data.notes.solutions);
      add(0, 2, "3. Our decision and why", data.notes.decision);
    }
    if (data.twist) {
      var row = showOwn ? 1 : 0;
      add(row, 0, "⚡ Unexpected Complication",
        showOwn ? "Challenge: " + data.twist.challenge
                : data.twist.text.join("\n") + "\n\nChallenge: " + data.twist.challenge, true);
      add(row, 1, "Does their solution still work?", data.notes.rethink);
      add(row, 2, "Our new recommendation and why", data.notes.final);
    }
    var size = fit(ctx, boxes);
    boxes.forEach(function (b) { drawBox(ctx, b, size); });

    // Footer
    ctx.fillStyle = C.muted;
    ctx.font = "400 18px " + BODY;
    ctx.textBaseline = "alphabetic";
    ctx.fillText("Life-Stage Dilemmas: What Would You Do?", M, H - 32);
    ctx.textAlign = "right";
    ctx.fillText(location.host, W - M, H - 32);
    ctx.textAlign = "left";

    return canvas;
  }

  function slug(text) {
    return String(text).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function save(canvas, filename) {
    return new Promise(function (resolve, reject) {
      canvas.toBlob(function (blob) {
        if (!blob) return reject(new Error("PNG failed"));
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
        resolve();
      }, "image/png");
    });
  }

  window.Evidence = {
    // data: { id, title, theme, names, notes, twist?: { challenge } }
    download: function (data) {
      return loadFonts().then(function () {
        data.date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
        var canvas = render(data);
        var name = "card-" + data.id + "-" + slug(data.title) + (data.twist ? "-complication" : "") +
          (data.names ? "-" + slug(data.names) : "") + ".png";
        return save(canvas, name);
      });
    },
    render: render
  };
})();
