import type { Agent } from "./agent";
import { clamp } from "./util";

export interface Mark {
  kind: "rect" | "guide";
  x: number; y: number; w: number; h: number;
  color: string;
  label?: string;
  handles?: boolean;
  dashed?: boolean;
  fill?: boolean;
  fadeAt?: number;
  fadeDur: number;
}

const BLUE = "#2a6cff";
const GUIDE = "#ff3b8a";

/** Fixed full-screen canvas that draws the swarm and its construction marks. */
export class Overlay {
  readonly marks = new Set<Mark>();
  private ctx: CanvasRenderingContext2D;
  private dpr = 1;

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext("2d")!;
    this.resize();
    addEventListener("resize", () => this.resize());
  }

  private resize() {
    this.dpr = Math.min(2, devicePixelRatio || 1);
    this.canvas.width = innerWidth * this.dpr;
    this.canvas.height = innerHeight * this.dpr;
  }

  rect(x: number, y: number, w: number, h: number, o: Partial<Mark> = {}): Mark {
    const m: Mark = { kind: "rect", x, y, w, h, color: BLUE, fadeDur: 450, ...o };
    this.marks.add(m);
    return m;
  }

  /** A smart-guide line that flashes briefly. */
  guide(x1: number, y1: number, x2: number, y2: number, ms = 450) {
    const m: Mark = { kind: "guide", x: x1, y: y1, w: x2 - x1, h: y2 - y1, color: GUIDE, fadeDur: 300 };
    this.marks.add(m);
    this.fade(m, ms);
  }

  fade(m: Mark, delay = 0, dur?: number) {
    m.fadeAt = performance.now() + delay;
    if (dur) m.fadeDur = dur;
  }

  draw(agents: Agent[], now: number) {
    const c = this.ctx;
    const sx = scrollX, sy = scrollY;
    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    c.clearRect(0, 0, innerWidth, innerHeight);

    for (const m of this.marks) {
      let a = 1;
      if (m.fadeAt !== undefined && now > m.fadeAt) {
        a = 1 - (now - m.fadeAt) / m.fadeDur;
        if (a <= 0) { this.marks.delete(m); continue; }
      }
      const x = m.x - sx, y = m.y - sy;
      if (y > innerHeight + 40 || y + Math.max(m.h, 0) < -40) continue;
      c.globalAlpha = a;
      if (m.kind === "guide") {
        c.strokeStyle = m.color;
        c.lineWidth = 1;
        c.setLineDash([3, 3]);
        c.beginPath(); c.moveTo(x, y); c.lineTo(x + m.w, y + m.h); c.stroke();
        c.setLineDash([]);
        continue;
      }
      const w = m.w, h = m.h;
      if (m.fill) { c.fillStyle = "rgba(42,108,255,0.08)"; c.fillRect(x, y, w, h); }
      c.strokeStyle = m.color;
      c.lineWidth = 1;
      if (m.dashed) c.setLineDash([5, 4]);
      c.strokeRect(Math.round(x) + 0.5, Math.round(y) + 0.5, Math.round(w), Math.round(h));
      c.setLineDash([]);
      if (m.handles) {
        c.fillStyle = "#fff";
        for (const [hx, hy] of [[x, y], [x + w, y], [x, y + h], [x + w, y + h]]) {
          c.fillRect(hx - 3, hy - 3, 6, 6);
          c.strokeRect(hx - 3 + 0.5, hy - 3 + 0.5, 6, 6);
        }
      }
      if (m.label) {
        c.font = "600 10px 'JetBrains Mono', monospace";
        const tw = c.measureText(m.label).width + 10;
        const lx = Math.max(2, m.dashed ? x : x + w / 2 - tw / 2);
        const ly = m.dashed ? y - 17 : y + h + 6;
        c.fillStyle = m.color;
        c.fillRect(lx, ly, tw, 15);
        c.fillStyle = "#fff";
        c.fillText(m.label, lx + 5, ly + 11);
      }
    }
    c.globalAlpha = 1;

    for (const ag of agents) {
      const x = ag.x - sx, y = ag.y - sy;
      if (y < -30 || y > innerHeight + 30 || x < -30 || x > innerWidth + 30) continue;
      const tilt = clamp(ag.vx * 0.04, -0.4, 0.4) - 0.3;
      for (let i = 0; i < ag.trail.length - 1; i++) {
        const t = ag.trail[i];
        cursor(c, t.x - sx, t.y - sy, tilt, ag.color, (i / ag.trail.length) * 0.25, 1);
      }
      if (ag.pressed) {
        c.strokeStyle = ag.color;
        c.globalAlpha = 0.6;
        c.beginPath(); c.arc(x, y, 7, 0, Math.PI * 2); c.stroke();
        c.globalAlpha = 1;
      }
      cursor(c, x, y, tilt, ag.color, 1, ag.pressed ? 0.86 : 1);
      if (ag.busy && ag.pressed) {
        c.font = "600 9px 'JetBrains Mono', monospace";
        const tw = c.measureText(ag.name).width + 8;
        c.fillStyle = ag.color;
        c.fillRect(x + 12, y + 14, tw, 13);
        c.fillStyle = "#0b0c0f";
        c.fillText(ag.name, x + 16, y + 24);
      }
    }
  }
}

function cursor(c: CanvasRenderingContext2D, x: number, y: number, ang: number, color: string, alpha: number, scale: number) {
  c.save();
  c.globalAlpha = alpha;
  c.translate(x, y);
  c.rotate(ang);
  c.scale(scale, scale);
  c.beginPath();
  c.moveTo(0, 0);
  c.lineTo(0, 15);
  c.lineTo(3.8, 11.3);
  c.lineTo(6.6, 17);
  c.lineTo(8.8, 16);
  c.lineTo(6.1, 10.4);
  c.lineTo(11.2, 10.4);
  c.closePath();
  c.fillStyle = color;
  c.fill();
  c.lineWidth = 1;
  c.strokeStyle = "rgba(0,0,0,0.65)";
  c.stroke();
  c.restore();
}
