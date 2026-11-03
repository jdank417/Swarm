/* =========================================================
   Projects — edit this list to update the Work section.
   ========================================================= */
const PROJECTS = [
  {
    kicker: "Biometric authentication",
    title: "HumanAuth",
    desc: "Full-stack liveness and identity verification using real-time face and hand landmark detection. Flask API with MediaPipe models and an Angular client with live landmark visualization.",
    tags: ["Python", "Flask", "MediaPipe", "Angular", "TypeScript"],
    link: "https://github.com/Dexteritize/HumanAuth",
    visual: "mesh",
  },
  {
    kicker: "Sailing software",
    title: "Regatta Positioning System",
    desc: "Tracking and positioning for sailboat racing. Boats, marks and courses on a live operational view.",
    tags: ["Real-time", "Geospatial", "Web"],
    link: "https://github.com/jdank417/RPS",
    visual: "radar",
  },
  {
    kicker: "Applied ML",
    title: "Sailing LLM",
    desc: "A Flan-T5 language model fine-tuned on sailing knowledge to answer domain questions.",
    tags: ["Python", "Transformers", "Fine-tuning"],
    link: "https://github.com/jdank417/Flan-t5-sailing-JasonDank",
    visual: "bars",
  },
  {
    kicker: "Forecasting",
    title: "Market Predictions",
    desc: "Deep learning experiments for forecasting stock market movement from historical price data.",
    tags: ["Python", "Deep Learning", "Time series"],
    link: "https://github.com/jdank417/Deep-Learning-for-Stock-Market-Predictions",
    visual: "line",
  },
];

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

/* ---------- render projects ---------- */
const projWrap = $("#projects");
PROJECTS.forEach((p) => {
  const el = document.createElement("article");
  el.className = "project build";
  el.dataset.agents = "16";
  el.innerHTML = `
    <div class="p-copy">
      <div class="p-kicker">${p.kicker}</div>
      <h3 class="p-title glitch" data-scramble>${p.title}</h3>
      <p class="p-desc" data-scramble>${p.desc}</p>
      <ul class="p-tags">${p.tags.map((t) => `<li>${t}</li>`).join("")}</ul>
      <a class="p-link" href="${p.link}" target="_blank" rel="noopener">View ${p.title} ↗</a>
    </div>
    <div class="p-visual wire">
      <span class="live-badge"><i class="dot live"></i>LIVE</span>
      <canvas data-visual="${p.visual}"></canvas>
    </div>`;
  projWrap.appendChild(el);
});

/* ---------- text scramble ---------- */
const GLYPHS = "!<>-_\\/[]{}=+*^?#$%&01";
function scramble(el) {
  if (reduceMotion || el.dataset.done) return;
  el.dataset.done = 1;
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push({ n: walker.currentNode, t: walker.currentNode.textContent });
  const total = nodes.reduce((a, b) => a + b.t.length, 0);
  const dur = Math.min(900, 250 + total * 4);
  const start = performance.now();
  (function tick(now) {
    const k = Math.min(1, (now - start) / dur);
    let budget = Math.floor(k * total);
    nodes.forEach(({ n, t }) => {
      const keep = Math.max(0, Math.min(t.length, budget));
      budget -= t.length;
      n.textContent = t.slice(0, keep) + [...t.slice(keep)].map((c) => (c === " " || c === "\n" ? c : Math.random() < 0.5 ? GLYPHS[(Math.random() * GLYPHS.length) | 0] : c)).join("");
    });
    if (k < 1) requestAnimationFrame(tick);
    else nodes.forEach(({ n, t }) => (n.textContent = t));
  })(start);
}

/* ---------- agent swarm ---------- */
const swarm = $("#swarm");
const sctx = swarm.getContext("2d");
const COLORS = ["#7cc4ff", "#ff7ab6", "#ffd166", "#5ef2b0", "#b69cff", "#ff8f5a", "#ffffff"];
let agents = [];
let DPR = 1;
function sizeSwarm() {
  DPR = Math.min(2, devicePixelRatio || 1);
  swarm.width = innerWidth * DPR;
  swarm.height = innerHeight * DPR;
}
sizeSwarm();
addEventListener("resize", sizeSwarm);

function spawnAgents(count, rect) {
  for (let i = 0; i < count; i++) {
    const edge = Math.random() * 4 | 0;
    const x = edge === 0 ? -20 : edge === 1 ? innerWidth + 20 : Math.random() * innerWidth;
    const y = edge === 2 ? -20 : edge === 3 ? innerHeight + 20 : Math.random() * innerHeight;
    agents.push({
      x, y,
      tx: rect.left + Math.random() * rect.width,
      ty: rect.top + Math.random() * rect.height,
      vx: 0, vy: 0,
      c: COLORS[(Math.random() * COLORS.length) | 0],
      life: 0,
      hop: 0,
      rect,
      trail: [],
    });
  }
}

function drawCursor(x, y, ang, c, a) {
  sctx.save();
  sctx.globalAlpha = a;
  sctx.translate(x, y);
  sctx.rotate(ang);
  sctx.beginPath();
  sctx.moveTo(0, 0);
  sctx.lineTo(0, 14);
  sctx.lineTo(3.6, 10.6);
  sctx.lineTo(6.4, 16);
  sctx.lineTo(8.4, 15);
  sctx.lineTo(5.8, 9.8);
  sctx.lineTo(10.6, 9.8);
  sctx.closePath();
  sctx.fillStyle = c;
  sctx.fill();
  sctx.lineWidth = 1;
  sctx.strokeStyle = "rgba(0,0,0,.6)";
  sctx.stroke();
  sctx.restore();
}

function stepSwarm() {
  sctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  sctx.clearRect(0, 0, innerWidth, innerHeight);
  agents = agents.filter((a) => a.life < 220);
  for (const a of agents) {
    a.life++;
    // hop to a new spot inside the target a few times, then leave
    if (a.life > 170) { a.tx = a.x + (a.x - innerWidth / 2) * 2; a.ty = a.y - 400; }
    else if (Math.hypot(a.tx - a.x, a.ty - a.y) < 6 && a.hop < 3) {
      a.hop++;
      a.tx = a.rect.left + Math.random() * a.rect.width;
      a.ty = a.rect.top + Math.random() * a.rect.height;
    }
    const dx = a.tx - a.x, dy = a.ty - a.y;
    a.vx = a.vx * 0.82 + dx * 0.028;
    a.vy = a.vy * 0.82 + dy * 0.028;
    a.x += a.vx; a.y += a.vy;
    a.trail.push([a.x, a.y]);
    if (a.trail.length > 6) a.trail.shift();
    const alpha = a.life < 20 ? a.life / 20 : a.life > 190 ? (220 - a.life) / 30 : 1;
    // motion trail
    for (let i = 0; i < a.trail.length - 1; i++) {
      const [px, py] = a.trail[i];
      drawCursor(px, py, -0.35, a.c, alpha * (i / a.trail.length) * 0.35);
    }
    drawCursor(a.x, a.y, -0.35 + Math.max(-0.5, Math.min(0.5, a.vx * 0.03)), a.c, alpha);
  }
  hud();
  requestAnimationFrame(stepSwarm);
}

/* ---------- HUD ---------- */
const builds = $$(".build");
let builtCount = 0;
function hud() {
  $("#hud-agents").textContent = `${agents.length} agents`;
  $("#hud-layers").textContent = `${builtCount} / ${builds.length} layers`;
  $("#hud-status").textContent = agents.length ? "building" : builtCount === builds.length ? "complete" : "idle";
  const dots = $$(".hud-dots i");
  const on = Math.round((builtCount / builds.length) * dots.length);
  dots.forEach((d, i) => d.classList.toggle("on", i < on));
}

/* ---------- section build-in ---------- */
function buildSection(sec) {
  if (sec.classList.contains("building") || sec.classList.contains("built")) return;
  const rect = sec.getBoundingClientRect();
  const r = { left: Math.max(0, rect.left), top: Math.max(0, rect.top), width: Math.min(innerWidth, rect.width), height: Math.min(innerHeight - Math.max(0, rect.top), rect.height) };
  if (!reduceMotion) spawnAgents(+sec.dataset.agents || 12, r);
  setTimeout(() => {
    sec.classList.add("building");
    if (sec.matches("[data-scramble]")) scramble(sec);
    $$("[data-scramble]", sec).forEach(scramble);
    $$("[data-count]", sec).forEach(countUp);
  }, reduceMotion ? 0 : 450);
  setTimeout(() => {
    sec.classList.replace("building", "built");
    builtCount++;
  }, reduceMotion ? 0 : 1600);
}

function countUp(el) {
  const end = +el.dataset.count;
  const t0 = performance.now();
  (function f(t) {
    const k = Math.min(1, (t - t0) / 900);
    el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))) + (k === 1 && end >= 10 ? "+" : "");
    if (k < 1) requestAnimationFrame(f);
  })(t0);
}

const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) { buildSection(e.target); io.unobserve(e.target); }
  });
}, { threshold: 0.25 });

/* ---------- hero orb: rotating wireframe ---------- */
function makeOrb() {
  const c = $("#orb"), ctx = c.getContext("2d");
  const t = (1 + Math.sqrt(5)) / 2;
  let V = [[-1,t,0],[1,t,0],[-1,-t,0],[1,-t,0],[0,-1,t],[0,1,t],[0,-1,-t],[0,1,-t],[t,0,-1],[t,0,1],[-t,0,-1],[-t,0,1]];
  V = V.map((v) => { const l = Math.hypot(...v); return v.map((x) => x / l); });
  const E = [];
  for (let i = 0; i < V.length; i++) for (let j = i + 1; j < V.length; j++) {
    const d = Math.hypot(V[i][0]-V[j][0], V[i][1]-V[j][1], V[i][2]-V[j][2]);
    if (d < 1.1) E.push([i, j]);
  }
  function frame(time) {
    const w = c.clientWidth, h = c.clientHeight;
    if (c.width !== w * DPR || c.height !== h * DPR) { c.width = w * DPR; c.height = h * DPR; }
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const a = time * 0.00035, b = time * 0.00022;
    const R = Math.min(w, h) * 0.34;
    const P = V.map(([x, y, z]) => {
      let X = x * Math.cos(a) - z * Math.sin(a), Z = x * Math.sin(a) + z * Math.cos(a);
      let Y = y * Math.cos(b) - Z * Math.sin(b); Z = y * Math.sin(b) + Z * Math.cos(b);
      const s = 1 / (2.6 - Z);
      return [w / 2 + X * R * s * 2.2, h / 2 + Y * R * s * 2.2, Z];
    });
    // grid rings
    ctx.strokeStyle = "rgba(42,108,255,.14)";
    for (let k = 1; k <= 3; k++) { ctx.beginPath(); ctx.arc(w/2, h/2, R * 0.5 * k, 0, Math.PI * 2); ctx.stroke(); }
    for (const [i, j] of E) {
      const z = (P[i][2] + P[j][2]) / 2;
      ctx.strokeStyle = `rgba(90,150,255,${0.35 + z * 0.4})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(P[i][0], P[i][1]); ctx.lineTo(P[j][0], P[j][1]); ctx.stroke();
    }
    P.forEach(([x, y, z], i) => {
      ctx.fillStyle = i % 3 === 0 ? "#ffb020" : "#2a6cff";
      ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.arc(x, y, 3.5 + z * 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    });
    if (!reduceMotion) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ---------- project visuals ---------- */
function makeVisual(c) {
  const ctx = c.getContext("2d");
  const kind = c.dataset.visual;
  const seed = [...Array(24)].map(() => Math.random());
  function frame(time) {
    const w = c.clientWidth, h = c.clientHeight;
    if (c.width !== w * DPR || c.height !== h * DPR) { c.width = w * DPR; c.height = h * DPR; }
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const t = time / 1000;
    // background grid
    ctx.strokeStyle = "rgba(42,108,255,.12)";
    for (let x = 0; x < w; x += 24) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y < h; y += 24) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    ctx.strokeStyle = "#2a6cff"; ctx.fillStyle = "#2a6cff"; ctx.lineWidth = 1.5;

    if (kind === "radar") {
      const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.42;
      for (let k = 1; k <= 4; k++) { ctx.strokeRect(cx - R * k / 4, cy - R * k / 4, R * k / 2, R * k / 2); }
      const ang = t * 1.2;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ang) * R, cy + Math.sin(ang) * R); ctx.stroke();
      seed.slice(0, 7).forEach((s, i) => {
        const a = s * 6.28 + t * 0.15 * (i % 2 ? 1 : -1), r = R * (0.25 + seed[i + 8] * 0.7);
        const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
        ctx.fillStyle = i === 0 ? "#ffb020" : "#7cc4ff";
        ctx.beginPath(); ctx.moveTo(x, y - 6); ctx.lineTo(x + 4, y + 4); ctx.lineTo(x - 4, y + 4); ctx.fill();
      });
    } else if (kind === "mesh") {
      const cx = w / 2, cy = h / 2;
      const pts = [...Array(36)].map((_, i) => {
        const a = (i / 36) * Math.PI * 2;
        const r = Math.min(w, h) * (0.3 + 0.03 * Math.sin(i * 3 + t * 2));
        return [cx + Math.cos(a) * r * 0.8, cy + Math.sin(a) * r];
      });
      ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.stroke();
      [[-0.12, -0.08], [0.12, -0.08], [0, 0.04], [-0.08, 0.14], [0.08, 0.14], [0, 0.16]].forEach(([ox, oy]) => {
        const x = cx + ox * w, y = cy + oy * h;
        ctx.fillStyle = "#5ef2b0"; ctx.beginPath(); ctx.arc(x, y, 3, 0, 7); ctx.fill();
        ctx.strokeStyle = "rgba(94,242,176,.35)"; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke();
      });
      const sy = cy + Math.sin(t * 1.5) * h * 0.35;
      ctx.strokeStyle = "rgba(255,59,59,.8)"; ctx.beginPath(); ctx.moveTo(w * 0.15, sy); ctx.lineTo(w * 0.85, sy); ctx.stroke();
    } else if (kind === "bars") {
      const n = 14, bw = (w * 0.8) / n;
      for (let i = 0; i < n; i++) {
        const v = 0.2 + 0.7 * Math.abs(Math.sin(seed[i] * 6 + t * (0.6 + seed[i])));
        ctx.fillStyle = i % 5 === 0 ? "#ffb020" : "rgba(42,108,255,.85)";
        ctx.fillRect(w * 0.1 + i * bw + 3, h * 0.85 - v * h * 0.65, bw - 6, v * h * 0.65);
      }
    } else {
      ctx.beginPath();
      for (let x = 0; x <= w; x += 4) {
        const k = x / w;
        const y = h * 0.55 - Math.sin(k * 9 + t) * h * 0.12 - Math.sin(k * 23 + t * 2) * h * 0.04 - k * h * 0.2;
        x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
      ctx.strokeStyle = "#ffb020"; ctx.setLineDash([4, 6]);
      ctx.beginPath(); ctx.moveTo(w * 0.72, 0); ctx.lineTo(w * 0.72, h); ctx.stroke(); ctx.setLineDash([]);
    }
    if (!reduceMotion) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ---------- boot ---------- */
function boot() {
  makeOrb();
  $$("canvas[data-visual]").forEach(makeVisual);
  if (!reduceMotion) requestAnimationFrame(stepSwarm);
  const tile = $(".boot-tile").getBoundingClientRect();
  if (!reduceMotion) spawnAgents(10, { left: tile.left - 40, top: tile.top - 40, width: tile.width + 80, height: tile.height + 80 });
  setTimeout(() => {
    $("#boot").classList.add("done");
    $("#scanline").classList.add("run");
    builds.forEach((b) => io.observe(b));
  }, reduceMotion ? 0 : 1300);
}
boot();
