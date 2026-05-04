/* ============================================================
   AI AGENT NEURAL NETWORK — Full Page Animated Background
   Nodes + pulsing connections + data packets + hex grid + scan
============================================================ */
(function () {
  var canvas = document.getElementById("ai-canvas");
  var ctx = canvas.getContext("2d");
  var W, H, nodes, packets, glyphs;
  var mouse = { x: -9999, y: -9999 };
  var frame = 0;
  var GLYPH_CHARS = [
    "01",
    "10",
    "AI",
    ">>",
    "{}",
    "//",
    "λ",
    "Σ",
    "∂",
    "◈",
    "▲",
    "◉",
    "∞",
    "⊕",
    "::",
  ];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function rand(a, b) {
    return a + Math.random() * (b - a);
  }

  function initNodes() {
    nodes = [];
    var count = Math.min(70, Math.floor((W * H) / 14000));
    for (var i = 0; i < count; i++) {
      var depth = rand(0.25, 1.0);
      nodes.push({
        x: rand(0, W),
        y: rand(0, H),
        vx: rand(-0.22, 0.22) * depth,
        vy: rand(-0.14, 0.14) * depth,
        r: rand(1.5, 4) * depth,
        depth: depth,
        pulse: rand(0, Math.PI * 2),
        pspd: rand(0.012, 0.032),
        ring: Math.random() > 0.65,
        hex: Math.random() > 0.8,
        color:
          Math.random() > 0.55
            ? "#f97316"
            : Math.random() > 0.5
              ? "#f59e0b"
              : "#c2410c",
      });
    }
  }

  function initPackets() {
    packets = [];
  }

  function spawnPacket(a, b) {
    if (packets.length > 35) return;
    packets.push({
      ax: a.x,
      ay: a.y,
      bx: b.x,
      by: b.y,
      t: 0,
      spd: rand(0.006, 0.018),
      color: Math.random() > 0.5 ? "#f97316" : "#f59e0b",
      size: rand(2, 3.5),
    });
  }

  function initGlyphs() {
    glyphs = [];
    for (var i = 0; i < 20; i++) {
      glyphs.push({
        x: rand(0, W),
        y: rand(0, H),
        vx: rand(-0.06, 0.06),
        vy: rand(-0.05, 0.05),
        char: GLYPH_CHARS[Math.floor(Math.random() * GLYPH_CHARS.length)],
        alpha: rand(0.04, 0.13),
        size: rand(10, 20),
        depth: rand(0.2, 0.7),
      });
    }
  }

  // Hex grid drawn once to an offscreen canvas for performance
  var hexCanvas, hexCtx;
  function buildHexGrid() {
    hexCanvas = document.createElement("canvas");
    hexCanvas.width = W;
    hexCanvas.height = H;
    hexCtx = hexCanvas.getContext("2d");
    hexCtx.strokeStyle = "rgba(249,115,22,0.028)";
    hexCtx.lineWidth = 0.7;
    var size = 55;
    var cols = Math.ceil(W / (size * 1.732)) + 2;
    var rows = Math.ceil(H / (size * 1.5)) + 2;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var cx = c * size * 1.732 + (r % 2) * size * 0.866;
        var cy = r * size * 1.5;
        hexCtx.beginPath();
        for (var s = 0; s < 6; s++) {
          var ang = (Math.PI / 3) * s - Math.PI / 6;
          var px = cx + size * 0.9 * Math.cos(ang);
          var py = cy + size * 0.9 * Math.sin(ang);
          s === 0 ? hexCtx.moveTo(px, py) : hexCtx.lineTo(px, py);
        }
        hexCtx.closePath();
        hexCtx.stroke();
      }
    }
  }

  var scanY = 0;

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // hex grid background
    if (hexCanvas) ctx.drawImage(hexCanvas, 0, 0);

    // scan line sweep
    scanY = (scanY + 0.5) % H;
    var sg = ctx.createLinearGradient(0, scanY - 70, 0, scanY + 12);
    sg.addColorStop(0, "rgba(249,115,22,0)");
    sg.addColorStop(0.85, "rgba(249,115,22,0.045)");
    sg.addColorStop(1, "rgba(249,115,22,0)");
    ctx.fillStyle = sg;
    ctx.fillRect(0, scanY - 70, W, 82);

    // connections
    for (var i = 0; i < nodes.length; i++) {
      for (var j = i + 1; j < nodes.length; j++) {
        var a = nodes[i],
          b = nodes[j];
        var dx = a.x - b.x,
          dy = a.y - b.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var maxD = 170 * ((a.depth + b.depth) * 0.5);
        if (dist < maxD) {
          var alpha = (1 - dist / maxD) * 0.17 * ((a.depth + b.depth) * 0.5);
          // mouse proximity boost
          var mx = mouse.x - (a.x + b.x) * 0.5,
            my = mouse.y - (a.y + b.y) * 0.5;
          var md = Math.sqrt(mx * mx + my * my);
          if (md < 240) alpha += (1 - md / 240) * 0.28;
          alpha = Math.min(alpha, 0.6);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = "rgba(249,115,22," + alpha + ")";
          ctx.lineWidth = 0.55 * ((a.depth + b.depth) * 0.5);
          ctx.stroke();
          // packet spawn
          if (frame % 45 === 0 && Math.random() < 0.003) spawnPacket(a, b);
        }
      }
    }

    // glyphs
    for (var i = 0; i < glyphs.length; i++) {
      var g = glyphs[i];
      ctx.font = g.size + "px monospace";
      ctx.fillStyle = "rgba(249,115,22," + g.alpha + ")";
      ctx.fillText(g.char, g.x, g.y);
      g.x += g.vx;
      g.y += g.vy;
      if (g.x < -40) g.x = W + 40;
      if (g.x > W + 40) g.x = -40;
      if (g.y < -40) g.y = H + 40;
      if (g.y > H + 40) g.y = -40;
    }

    // packets
    for (var i = packets.length - 1; i >= 0; i--) {
      var p = packets[i];
      p.t += p.spd;
      if (p.t >= 1) {
        packets.splice(i, 1);
        continue;
      }
      var px = p.ax + (p.bx - p.ax) * p.t;
      var py = p.ay + (p.by - p.ay) * p.t;
      // trail
      for (var tr = 0; tr < 7; tr++) {
        var bt = Math.max(0, p.t - p.spd * tr * 3.5);
        var tx = p.ax + (p.bx - p.ax) * bt;
        var ty = p.ay + (p.by - p.ay) * bt;
        ctx.beginPath();
        ctx.arc(tx, ty, p.size * (1 - tr / 7) * 0.85, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = (1 - tr / 7) * 0.65;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      // head
      ctx.beginPath();
      ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.globalAlpha = 0.92;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // nodes
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      n.pulse += n.pspd;
      var pr = Math.sin(n.pulse) * 0.5 + 0.5;
      var ndx = mouse.x - n.x,
        ndy = mouse.y - n.y;
      var nd = Math.sqrt(ndx * ndx + ndy * ndy);
      var mb = nd < 200 ? (1 - nd / 200) * 1.8 : 0;

      // outer pulse ring
      if (n.ring) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * (2.8 + pr * 1.8), 0, Math.PI * 2);
        ctx.strokeStyle =
          "rgba(249,115,22," +
          ((0.055 + pr * 0.055) * n.depth + mb * 0.12) +
          ")";
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }
      // hex node shape
      if (n.hex) {
        ctx.beginPath();
        for (var s = 0; s < 6; s++) {
          var ang = (Math.PI / 3) * s;
          var hx = n.x + n.r * (1.8 + mb * 0.5) * Math.cos(ang);
          var hy = n.y + n.r * (1.8 + mb * 0.5) * Math.sin(ang);
          s === 0 ? ctx.moveTo(hx, hy) : ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.strokeStyle =
          "rgba(249,115,22," + (0.25 * n.depth + mb * 0.2) + ")";
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
      // glow
      var grad = ctx.createRadialGradient(
        n.x,
        n.y,
        0,
        n.x,
        n.y,
        n.r * (2.5 + mb),
      );
      grad.addColorStop(
        0,
        "rgba(249,115,22," + ((0.38 + pr * 0.42) * n.depth + mb * 0.3) + ")",
      );
      grad.addColorStop(1, "rgba(249,115,22,0)");
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * (2.5 + mb), 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      // core
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = n.color;
      ctx.globalAlpha = (0.65 + pr * 0.35) * n.depth + mb * 0.2;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    frame++;
  }

  function update() {
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      // subtle mouse attraction
      var dx = mouse.x - n.x,
        dy = mouse.y - n.y;
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d < 320 && d > 1) {
        n.vx += (dx / d) * 0.0018 * n.depth;
        n.vy += (dy / d) * 0.0018 * n.depth;
      }
      n.vx *= 0.999;
      n.vy *= 0.999;
      var spd = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
      if (spd > 0.38) {
        n.vx = (n.vx / spd) * 0.38;
        n.vy = (n.vy / spd) * 0.38;
      }
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < -20) n.x = W + 20;
      if (n.x > W + 20) n.x = -20;
      if (n.y < -20) n.y = H + 20;
      if (n.y > H + 20) n.y = -20;
    }
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  window.addEventListener("resize", function () {
    resize();
    buildHexGrid();
    initNodes();
    initGlyphs();
  });
  window.addEventListener("mousemove", function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener("mouseleave", function () {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  resize();
  buildHexGrid();
  initNodes();
  initPackets();
  initGlyphs();
  loop();
})();

/* ===== 3D TILT ===== */
document
  .querySelectorAll(".sbox,.expcard,.wcard,.bcard,.lcard")
  .forEach(function (el) {
    el.addEventListener("mousemove", function (e) {
      var r = el.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform =
        "perspective(700px) rotateX(" +
        -y * 9 +
        "deg) rotateY(" +
        x * 9 +
        "deg) translateY(-6px)";
      el.style.transition = "transform 0.08s ease";
    });
    el.addEventListener("mouseleave", function () {
      el.style.transform = "";
      el.style.transition = "transform 0.4s ease";
    });
  });

/* ===== MOBILE MENU ===== */
var mbtn = document.getElementById("mbtn");
var sb = document.getElementById("sidebar");
mbtn.addEventListener("click", function () {
  sb.classList.toggle("open");
  var ic = mbtn.querySelector("i");
  ic.className = sb.classList.contains("open") ? "fas fa-times" : "fas fa-bars";
});
document.querySelectorAll(".snav a").forEach(function (a) {
  a.addEventListener("click", function () {
    sb.classList.remove("open");
    mbtn.querySelector("i").className = "fas fa-bars";
  });
});

/* ===== SMOOTH SCROLL ===== */
document.querySelectorAll('a[href^="#"]').forEach(function (a) {
  a.addEventListener("click", function (e) {
    e.preventDefault();
    var t = document.querySelector(a.getAttribute("href"));
    if (t) t.scrollIntoView({ behavior: "smooth" });
  });
});

/* ===== SCROLL TOP + ACTIVE NAV ===== */
var stbtn = document.getElementById("stbtn");
window.addEventListener("scroll", function () {
  stbtn.classList.toggle("vis", window.scrollY > 300);
  var secs = document.querySelectorAll("section[id]"),
    cur = "";
  secs.forEach(function (s) {
    if (window.scrollY >= s.offsetTop - 230) cur = s.id;
  });
  document.querySelectorAll(".snav a").forEach(function (a) {
    a.classList.toggle("active", a.getAttribute("href") === "#" + cur);
  });
});
stbtn.addEventListener("click", function () {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ===== NAME LETTER SWAP ===== */
var newL = ["R", "a", "m", "a", "k"];
var lets = document.querySelectorAll(".letter");
function swapL() {
  lets.forEach(function (el, i) {
    setTimeout(function () {
      el.classList.add("hidden");
      setTimeout(function () {
        el.textContent = newL[i];
        el.classList.remove("hidden");
      }, 450);
    }, i * 420);
  });
}
setTimeout(swapL, 1800);
