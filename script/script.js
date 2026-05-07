/* ============================================================
   AI AGENT NEURAL NETWORK — Enhanced with Modern 3D Effects
============================================================ */
(function () {
  var canvas = document.getElementById("ai-canvas");
  var ctx = canvas.getContext("2d");
  var W, H, nodes, packets, glyphs;
  var mouse = { x: -9999, y: -9999 };
  var frame = 0;
  var GLYPH_CHARS = ["01","10","AI",">>","{}","//","λ","Σ","∂","◈","▲","◉","∞","⊕","::","</>");

  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  function rand(a, b) { return a + Math.random() * (b - a); }

  function initNodes() {
    nodes = [];
    var count = Math.min(65, Math.floor((W * H) / 16000));
    for (var i = 0; i < count; i++) {
      var depth = rand(0.2, 1.0);
      nodes.push({
        x: rand(0, W), y: rand(0, H),
        vx: rand(-0.2, 0.2) * depth, vy: rand(-0.12, 0.12) * depth,
        r: rand(1.5, 3.5) * depth, depth: depth,
        pulse: rand(0, Math.PI * 2), pspd: rand(0.01, 0.03),
        ring: Math.random() > 0.65, hex: Math.random() > 0.8,
        color: Math.random() > 0.55 ? "#f97316" : Math.random() > 0.5 ? "#f59e0b" : "#c2410c",
      });
    }
  }

  function initPackets() { packets = []; }

  function spawnPacket(a, b) {
    if (packets.length > 30) return;
    packets.push({ ax: a.x, ay: a.y, bx: b.x, by: b.y, t: 0, spd: rand(0.005, 0.016), color: Math.random() > 0.5 ? "#f97316" : "#f59e0b", size: rand(2, 3.5) });
  }

  function initGlyphs() {
    glyphs = [];
    for (var i = 0; i < 18; i++) {
      glyphs.push({ x: rand(0, W), y: rand(0, H), vx: rand(-0.05, 0.05), vy: rand(-0.04, 0.04), char: GLYPH_CHARS[Math.floor(Math.random() * GLYPH_CHARS.length)], alpha: rand(0.03, 0.1), size: rand(10, 20), depth: rand(0.2, 0.7) });
    }
  }

  var hexCanvas, hexCtx;
  function buildHexGrid() {
    hexCanvas = document.createElement("canvas"); hexCanvas.width = W; hexCanvas.height = H;
    hexCtx = hexCanvas.getContext("2d");
    hexCtx.strokeStyle = "rgba(249,115,22,0.025)"; hexCtx.lineWidth = 0.6;
    var size = 60, cols = Math.ceil(W / (size * 1.732)) + 2, rows = Math.ceil(H / (size * 1.5)) + 2;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var cx = c * size * 1.732 + (r % 2) * size * 0.866, cy = r * size * 1.5;
        hexCtx.beginPath();
        for (var s = 0; s < 6; s++) {
          var ang = (Math.PI / 3) * s - Math.PI / 6;
          var px = cx + size * 0.88 * Math.cos(ang), py = cy + size * 0.88 * Math.sin(ang);
          s === 0 ? hexCtx.moveTo(px, py) : hexCtx.lineTo(px, py);
        }
        hexCtx.closePath(); hexCtx.stroke();
      }
    }
  }

  var scanY = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    if (hexCanvas) ctx.drawImage(hexCanvas, 0, 0);

    // scan line
    scanY = (scanY + 0.45) % H;
    var sg = ctx.createLinearGradient(0, scanY - 80, 0, scanY + 15);
    sg.addColorStop(0, "rgba(249,115,22,0)"); sg.addColorStop(0.85, "rgba(249,115,22,0.04)"); sg.addColorStop(1, "rgba(249,115,22,0)");
    ctx.fillStyle = sg; ctx.fillRect(0, scanY - 80, W, 95);

    // connections
    for (var i = 0; i < nodes.length; i++) {
      for (var j = i + 1; j < nodes.length; j++) {
        var a = nodes[i], b = nodes[j];
        var dx = a.x - b.x, dy = a.y - b.y, dist = Math.sqrt(dx * dx + dy * dy);
        var maxD = 160 * ((a.depth + b.depth) * 0.5);
        if (dist < maxD) {
          var alpha = (1 - dist / maxD) * 0.15 * ((a.depth + b.depth) * 0.5);
          var mx = mouse.x - (a.x + b.x) * 0.5, my = mouse.y - (a.y + b.y) * 0.5;
          var md = Math.sqrt(mx * mx + my * my);
          if (md < 220) alpha += (1 - md / 220) * 0.32;
          alpha = Math.min(alpha, 0.65);
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = "rgba(249,115,22," + alpha + ")";
          ctx.lineWidth = 0.5 * ((a.depth + b.depth) * 0.5); ctx.stroke();
          if (frame % 50 === 0 && Math.random() < 0.003) spawnPacket(a, b);
        }
      }
    }

    // glyphs
    for (var i = 0; i < glyphs.length; i++) {
      var g = glyphs[i];
      ctx.font = g.size + "px monospace"; ctx.fillStyle = "rgba(249,115,22," + g.alpha + ")";
      ctx.fillText(g.char, g.x, g.y);
      g.x += g.vx; g.y += g.vy;
      if (g.x < -40) g.x = W + 40; if (g.x > W + 40) g.x = -40;
      if (g.y < -40) g.y = H + 40; if (g.y > H + 40) g.y = -40;
    }

    // packets
    for (var i = packets.length - 1; i >= 0; i--) {
      var p = packets[i]; p.t += p.spd;
      if (p.t >= 1) { packets.splice(i, 1); continue; }
      var px = p.ax + (p.bx - p.ax) * p.t, py = p.ay + (p.by - p.ay) * p.t;
      for (var tr = 0; tr < 8; tr++) {
        var bt = Math.max(0, p.t - p.spd * tr * 3.5);
        var tx = p.ax + (p.bx - p.ax) * bt, ty = p.ay + (p.by - p.ay) * bt;
        ctx.beginPath(); ctx.arc(tx, ty, p.size * (1 - tr / 8) * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = p.color; ctx.globalAlpha = (1 - tr / 8) * 0.6; ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.beginPath(); ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff"; ctx.globalAlpha = 0.9; ctx.fill(); ctx.globalAlpha = 1;
    }

    // nodes
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i]; n.pulse += n.pspd;
      var pr = Math.sin(n.pulse) * 0.5 + 0.5;
      var ndx = mouse.x - n.x, ndy = mouse.y - n.y;
      var nd = Math.sqrt(ndx * ndx + ndy * ndy);
      var mb = nd < 200 ? (1 - nd / 200) * 2.0 : 0;
      if (n.ring) {
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r * (3 + pr * 2), 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(249,115,22," + ((0.05 + pr * 0.05) * n.depth + mb * 0.1) + ")";
        ctx.lineWidth = 0.7; ctx.stroke();
      }
      if (n.hex) {
        ctx.beginPath();
        for (var s = 0; s < 6; s++) {
          var ang = (Math.PI / 3) * s;
          var hx = n.x + n.r * (1.9 + mb * 0.5) * Math.cos(ang);
          var hy = n.y + n.r * (1.9 + mb * 0.5) * Math.sin(ang);
          s === 0 ? ctx.moveTo(hx, hy) : ctx.lineTo(hx, hy);
        }
        ctx.closePath(); ctx.strokeStyle = "rgba(249,115,22," + (0.22 * n.depth + mb * 0.2) + ")";
        ctx.lineWidth = 0.8; ctx.stroke();
      }
      var grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * (2.8 + mb));
      grad.addColorStop(0, "rgba(249,115,22," + ((0.4 + pr * 0.45) * n.depth + mb * 0.3) + ")");
      grad.addColorStop(1, "rgba(249,115,22,0)");
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r * (2.8 + mb), 0, Math.PI * 2);
      ctx.fillStyle = grad; ctx.fill();
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = n.color; ctx.globalAlpha = (0.65 + pr * 0.35) * n.depth + mb * 0.2;
      ctx.fill(); ctx.globalAlpha = 1;
    }
    frame++;
  }

  function update() {
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      var dx = mouse.x - n.x, dy = mouse.y - n.y, d = Math.sqrt(dx * dx + dy * dy);
      if (d < 300 && d > 1) { n.vx += (dx / d) * 0.002 * n.depth; n.vy += (dy / d) * 0.002 * n.depth; }
      n.vx *= 0.999; n.vy *= 0.999;
      var spd = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
      if (spd > 0.35) { n.vx = (n.vx / spd) * 0.35; n.vy = (n.vy / spd) * 0.35; }
      n.x += n.vx; n.y += n.vy;
      if (n.x < -20) n.x = W + 20; if (n.x > W + 20) n.x = -20;
      if (n.y < -20) n.y = H + 20; if (n.y > H + 20) n.y = -20;
    }
  }

  function loop() { update(); draw(); requestAnimationFrame(loop); }

  window.addEventListener("resize", function () { resize(); buildHexGrid(); initNodes(); initGlyphs(); });
  window.addEventListener("mousemove", function (e) { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener("mouseleave", function () { mouse.x = -9999; mouse.y = -9999; });

  resize(); buildHexGrid(); initNodes(); initPackets(); initGlyphs(); loop();
})();

/* ===== CUSTOM CURSOR (overlay, default cursor still visible) ===== */
(function () {
  var dot = document.querySelector(".cursor-dot");
  var ring = document.querySelector(".cursor-ring");
  if (!dot || !ring) return;

  var mx = 0, my = 0, rx = 0, ry = 0;
  var visible = false;

  window.addEventListener("mousemove", function (e) {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + "px"; dot.style.top = my + "px";
    if (!visible) {
      dot.style.opacity = "1"; ring.style.opacity = "1"; visible = true;
    }
  });
  window.addEventListener("mouseleave", function () {
    dot.style.opacity = "0"; ring.style.opacity = "0"; visible = false;
  });

  function lerp(a, b, t) { return a + (b - a) * t; }
  function animRing() {
    rx = lerp(rx, mx, 0.13); ry = lerp(ry, my, 0.13);
    ring.style.left = rx + "px"; ring.style.top = ry + "px";
    requestAnimationFrame(animRing);
  }
  dot.style.opacity = "0"; ring.style.opacity = "0";
  animRing();

  var hoverEls = document.querySelectorAll("a, button, .sbox, .expcard, .wcard, .bcard, .lcard, .hcard, #mbtn, #stbtn");
  hoverEls.forEach(function (el) {
    el.addEventListener("mouseenter", function () { document.body.classList.add("cursor-hover"); });
    el.addEventListener("mouseleave", function () { document.body.classList.remove("cursor-hover"); });
  });
})();

/* ===== 3D TILT with deeper perspective ===== */
document.querySelectorAll(".sbox-inner,.expcard,.wcard,.bcard,.lcard,.hcard,.tcard").forEach(function (el) {
  el.addEventListener("mousemove", function (e) {
    var r = el.getBoundingClientRect();
    var x = (e.clientX - r.left) / r.width - 0.5;
    var y = (e.clientY - r.top) / r.height - 0.5;
    var intensity = el.classList.contains("hcard") ? 12 : el.classList.contains("tcard") ? 6 : 9;
    el.style.transform = "perspective(800px) rotateX(" + (-y * intensity) + "deg) rotateY(" + (x * intensity) + "deg) translateZ(10px) translateY(-6px)";
    el.style.transition = "transform 0.06s ease";

    // dynamic shine
    var shinePct = (x + 0.5) * 100;
    el.style.backgroundImage = "radial-gradient(circle at " + shinePct + "% " + ((y + 0.5) * 100) + "%, rgba(249,115,22,0.06), transparent 60%)";
  });
  el.addEventListener("mouseleave", function () {
    el.style.transform = "";
    el.style.transition = "transform 0.45s ease";
    el.style.backgroundImage = "";
  });
});

/* ===== SCROLL REVEAL ===== */
(function () {
  var revealEls = document.querySelectorAll(".titem,.expcard,.wcard,.bcard,.sbox,.lcard,.arow,.cdetail");
  revealEls.forEach(function (el, i) {
    el.classList.add("reveal");
    el.style.transitionDelay = (i % 6 * 0.08) + "s";
  });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(function (el) { observer.observe(el); });
})();

/* ===== MOBILE MENU ===== */
var mbtn = document.getElementById("mbtn");
var sb = document.getElementById("sidebar");
var overlay = document.getElementById("sidebar-overlay");

function openSidebar() {
  sb.classList.add("open");
  overlay.classList.add("active");
  mbtn.querySelector("i").className = "fas fa-times";
  requestAnimationFrame(function () {
    overlay.classList.add("visible");
  });
  document.body.style.overflow = "hidden";
}

function closeSidebar() {
  sb.classList.remove("open");
  overlay.classList.remove("visible");
  mbtn.querySelector("i").className = "fas fa-bars";
  document.body.style.overflow = "";
  setTimeout(function () { overlay.classList.remove("active"); }, 350);
}

mbtn.addEventListener("click", function () {
  sb.classList.contains("open") ? closeSidebar() : openSidebar();
});

overlay.addEventListener("click", closeSidebar);

document.querySelectorAll(".snav a").forEach(function (a) {
  a.addEventListener("click", function () { closeSidebar(); });
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
  stbtn.classList.toggle("vis", window.scrollY > 400);
  var secs = document.querySelectorAll("section[id]"), cur = "";
  secs.forEach(function (s) { if (window.scrollY >= s.offsetTop - 260) cur = s.id; });
  document.querySelectorAll(".snav a").forEach(function (a) {
    a.classList.toggle("active", a.getAttribute("href") === "#" + cur);
  });
});
stbtn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });

/* ===== NAME LETTER SWAP ===== */
var newL = ["R", "a", "m", "a", "k"];
var lets = document.querySelectorAll(".letter");

function swapL() {
  lets.forEach(function (el, i) {
    setTimeout(function () {
      el.style.transform = "translateY(-14px) rotateX(90deg)";
      el.style.opacity = "0";
      el.style.transition = "transform 0.4s ease, opacity 0.4s ease";
      setTimeout(function () {
        el.textContent = newL[i];
        el.style.transform = "translateY(0) rotateX(0deg)";
        el.style.opacity = "1";
      }, 420);
    }, i * 100);
  });
}
setTimeout(swapL, 1800);

/* ===== HERO CARD PARALLAX on scroll ===== */
window.addEventListener("scroll", function () {
  var scrolled = window.scrollY;
  var heroCards = document.querySelector(".hero-cards");
  if (heroCards) {
    heroCards.style.transform = "translateY(" + scrolled * 0.15 + "px)";
  }
});

/* ===== TYPING EFFECT for subtitle ===== */
(function () {
  var roles = ["Tech Operational Analyst", "Frontend Developer", "IT Support Specialist", "Web Technologies Expert"];
  var idx = 0, charIdx = 0, deleting = false;
  var utitle = document.querySelector(".utitle");
  if (!utitle) return;

  function type() {
    var current = roles[idx];
    if (!deleting) {
      utitle.textContent = current.slice(0, charIdx + 1);
      charIdx++;
      if (charIdx === current.length) { deleting = true; setTimeout(type, 2000); return; }
    } else {
      utitle.textContent = current.slice(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) { deleting = false; idx = (idx + 1) % roles.length; }
    }
    setTimeout(type, deleting ? 50 : 80);
  }
  setTimeout(type, 2500);
})();

/* ===== COUNTER ANIMATION ===== */
(function () {
  function animateCounter(el) {
    var target = parseInt(el.textContent);
    var start = 0;
    var duration = 1500;
    var startTime = null;
    var suffix = el.textContent.replace(/[0-9]/g, "");

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(ease * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll(".snum, .hcard-num").forEach(function (el) {
    observer.observe(el);
  });
})();