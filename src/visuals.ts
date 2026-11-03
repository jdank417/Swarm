const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const dpr = () => Math.min(2, devicePixelRatio || 1);

function animate(c: HTMLCanvasElement, draw: (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => void) {
  const ctx = c.getContext("2d")!;
  const frame = (time: number) => {
    const w = c.clientWidth, h = c.clientHeight, d = dpr();
    if (c.width !== Math.round(w * d) || c.height !== Math.round(h * d)) { c.width = Math.round(w * d); c.height = Math.round(h * d); }
    ctx.setTransform(d, 0, 0, d, 0, 0);
    ctx.clearRect(0, 0, w, h);
    draw(ctx, w, h, time / 1000);
    if (!reduce) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

/** Hero: a rotating wireframe icosahedron. */
export function orb(c: HTMLCanvasElement) {
  const g = (1 + Math.sqrt(5)) / 2;
  const V = [[-1, g, 0], [1, g, 0], [-1, -g, 0], [1, -g, 0], [0, -1, g], [0, 1, g], [0, -1, -g], [0, 1, -g], [g, 0, -1], [g, 0, 1], [-g, 0, -1], [-g, 0, 1]]
    .map((v) => { const l = Math.hypot(...v); return v.map((x) => x / l); });
  const E: [number, number][] = [];
  for (let i = 0; i < V.length; i++) for (let j = i + 1; j < V.length; j++) {
    if (Math.hypot(V[i][0] - V[j][0], V[i][1] - V[j][1], V[i][2] - V[j][2]) < 1.1) E.push([i, j]);
  }
  animate(c, (ctx, w, h, t) => {
    const a = t * 0.35, b = t * 0.22, R = Math.min(w, h) * 0.34;
    const P = V.map(([x, y, z]) => {
      const X = x * Math.cos(a) - z * Math.sin(a);
      let Z = x * Math.sin(a) + z * Math.cos(a);
      const Y = y * Math.cos(b) - Z * Math.sin(b);
      Z = y * Math.sin(b) + Z * Math.cos(b);
      const s = 2.2 / (2.6 - Z);
      return [w / 2 + X * R * s, h / 2 + Y * R * s, Z];
    });
    ctx.strokeStyle = "rgba(17,19,23,.08)";
    for (let k = 1; k <= 3; k++) { ctx.beginPath(); ctx.arc(w / 2, h / 2, R * 0.5 * k, 0, Math.PI * 2); ctx.stroke(); }
    ctx.lineWidth = 1.4;
    for (const [i, j] of E) {
      ctx.strokeStyle = `rgba(90,150,255,${0.35 + ((P[i][2] + P[j][2]) / 2) * 0.4})`;
      ctx.beginPath(); ctx.moveTo(P[i][0], P[i][1]); ctx.lineTo(P[j][0], P[j][1]); ctx.stroke();
    }
    P.forEach(([x, y, z], i) => {
      ctx.fillStyle = i % 3 === 0 ? "#ff7a1a" : "#2a6cff";
      ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.arc(x, y, 3.5 + z * 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    });
  });
}

/** Small animated diagram for each project card. */
export function projectVisual(c: HTMLCanvasElement) {
  const kind = c.dataset.visual;
  const seed = Array.from({ length: 24 }, () => Math.random());
  animate(c, (ctx, w, h, t) => {
    ctx.strokeStyle = "rgba(17,19,23,.06)";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 24) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y < h; y += 24) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    ctx.strokeStyle = "#2a6cff"; ctx.lineWidth = 1.5;

    if (kind === "radar") {
      const cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.42;
      for (let k = 1; k <= 4; k++) ctx.strokeRect(cx - (R * k) / 4, cy - (R * k) / 4, (R * k) / 2, (R * k) / 2);
      const ang = t * 1.2;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ang) * R, cy + Math.sin(ang) * R); ctx.stroke();
      seed.slice(0, 7).forEach((s, i) => {
        const a = s * 6.28 + t * 0.15 * (i % 2 ? 1 : -1), r = R * (0.25 + seed[i + 8] * 0.7);
        const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
        ctx.fillStyle = i === 0 ? "#ff7a1a" : "#2a6cff";
        ctx.beginPath(); ctx.moveTo(x, y - 6); ctx.lineTo(x + 4, y + 4); ctx.lineTo(x - 4, y + 4); ctx.fill();
      });
    } else if (kind === "mesh") {
      const cx = w / 2, cy = h / 2;
      ctx.beginPath();
      for (let i = 0; i <= 36; i++) {
        const a = (i / 36) * Math.PI * 2;
        const r = Math.min(w, h) * (0.3 + 0.03 * Math.sin(i * 3 + t * 2));
        const x = cx + Math.cos(a) * r * 0.8, y = cy + Math.sin(a) * r;
        if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
      }
      ctx.stroke();
      for (const [ox, oy] of [[-0.12, -0.08], [0.12, -0.08], [0, 0.04], [-0.08, 0.14], [0.08, 0.14], [0, 0.16]]) {
        const x = cx + ox * w, y = cy + oy * h;
        ctx.strokeStyle = "rgba(18,184,134,.45)"; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke();
        ctx.fillStyle = "#12b886"; ctx.beginPath(); ctx.arc(x, y, 3, 0, 7); ctx.fill();
      }
      const sy = cy + Math.sin(t * 1.5) * h * 0.35;
      ctx.strokeStyle = "rgba(255,77,109,.85)"; ctx.beginPath(); ctx.moveTo(w * 0.15, sy); ctx.lineTo(w * 0.85, sy); ctx.stroke();
    } else if (kind === "bars") {
      const n = 14, bw = (w * 0.8) / n;
      for (let i = 0; i < n; i++) {
        const v = 0.2 + 0.7 * Math.abs(Math.sin(seed[i] * 6 + t * (0.6 + seed[i])));
        ctx.fillStyle = i % 5 === 0 ? "#ff7a1a" : "rgba(42,108,255,.85)";
        ctx.fillRect(w * 0.1 + i * bw + 3, h * 0.85 - v * h * 0.65, bw - 6, v * h * 0.65);
      }
    } else {
      ctx.beginPath();
      for (let x = 0; x <= w; x += 4) {
        const k = x / w;
        const y = h * 0.55 - Math.sin(k * 9 + t) * h * 0.12 - Math.sin(k * 23 + t * 2) * h * 0.04 - k * h * 0.2;
        if (x) ctx.lineTo(x, y); else ctx.moveTo(x, y);
      }
      ctx.stroke();
      ctx.strokeStyle = "#ff7a1a"; ctx.setLineDash([4, 6]);
      ctx.beginPath(); ctx.moveTo(w * 0.72, 0); ctx.lineTo(w * 0.72, h); ctx.stroke(); ctx.setLineDash([]);
    }
  });
}
