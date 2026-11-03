import { clamp, rand } from "./util";

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export type CursorKind = "arrow" | "cross" | "text" | "copy";
export type Role = "layout" | "copy" | "build";

export interface MoveOpts {
  dur?: number;
  curve?: number;
  ease?: (t: number) => number;
}

interface Tween {
  fx: number; fy: number; cx: number; cy: number; tx: number; ty: number;
  t0: number; dur: number; ease: (t: number) => number; resolve: () => void;
}

// Pointer glyph: a small arrow with its tip at (0,0), pointing right; rotated to the heading.
const GLYPHS = `
<svg class="g g-arrow" width="16" height="16" viewBox="-14 -8 16 16"><path d="M0 0 L-12.5 -6 L-9.2 0 L-12.5 6 Z"/></svg>
<svg class="g g-copy" width="22" height="22" viewBox="-14 -8 22 22"><path d="M0 0 L-12.5 -6 L-9.2 0 L-12.5 6 Z"/><path class="plus" d="M3 6h6M6 3v6"/></svg>
<svg class="g g-cross" width="20" height="20" viewBox="-10 -10 20 20"><path class="o" d="M-7 0H7M0-7V7"/><path class="s" d="M-7 0H7M0-7V7"/></svg>
<svg class="g g-text" width="12" height="20" viewBox="-6 -10 12 20"><path class="o" d="M-3.5-8h2.5m2 0h2.5M0-7V7M-3.5 8h2.5m2 0h2.5"/><path class="s" d="M-3.5-8h2.5m2 0h2.5M0-7V7M-3.5 8h2.5m2 0h2.5"/></svg>`;

/**
 * One AI agent and its cursor. Moves are short, eased flights sized to the
 * distance; the cursor is redrawn from the agent's position every frame.
 */
export class Agent {
  x: number; y: number;
  vx = 0; vy = 0;
  private lx: number; private ly: number;
  busy = false;
  readonly agility = rand(0.85, 1.2);
  readonly el: HTMLDivElement;
  private heading = rand(0, Math.PI * 2);
  private tw: Tween | null = null;
  private followers = new Set<(x: number, y: number) => void>();

  constructor(layer: HTMLElement, readonly id: number, readonly role: Role, readonly color: string, x: number, y: number) {
    this.x = this.lx = x;
    this.y = this.ly = y;
    const el = document.createElement("div");
    el.className = "agent";
    el.dataset.cursor = "arrow";
    el.style.setProperty("--c", color);
    el.innerHTML = GLYPHS;
    layer.appendChild(el);
    this.el = el;
    this.sync();
  }

  get moving() { return this.tw !== null; }
  set cursor(kind: CursorKind) { this.el.dataset.cursor = kind; }

  follow(fn: (x: number, y: number) => void) {
    this.followers.add(fn);
    fn(this.x, this.y);
    return () => this.followers.delete(fn);
  }

  moveTo(tx: number, ty: number, o: MoveOpts = {}): Promise<void> {
    this.tw?.resolve();
    const dx = tx - this.x, dy = ty - this.y;
    const d = Math.hypot(dx, dy);
    const dur = o.dur ?? clamp(110 + d * 0.38, 140, 520);
    const curve = o.curve ?? rand(-0.1, 0.1);
    let cx = (this.x + tx) / 2 - dy * curve;
    let cy = (this.y + ty) / 2 + dx * curve;
    const sp = Math.hypot(this.vx, this.vy);
    if (sp > 0.5 && o.curve !== 0) {
      const k = Math.min(d * 0.4, sp * 18);
      cx = cx * 0.5 + (this.x + (this.vx / sp) * k) * 0.5;
      cy = cy * 0.5 + (this.y + (this.vy / sp) * k) * 0.5;
    }
    return new Promise((resolve) => {
      this.tw = { fx: this.x, fy: this.y, cx, cy, tx, ty, t0: performance.now(), dur, ease: o.ease ?? easeInOutCubic, resolve };
    });
  }

  step(now: number) {
    const w = this.tw;
    if (!w) return;
    const px = this.x, py = this.y;
    const k = clamp((now - w.t0) / w.dur, 0, 1);
    const t = w.ease(k), u = 1 - t;
    this.x = u * u * w.fx + 2 * u * t * w.cx + t * t * w.tx;
    this.y = u * u * w.fy + 2 * u * t * w.cy + t * t * w.ty;
    this.vx = this.x - px;
    this.vy = this.y - py;
    if (k >= 1) { this.tw = null; w.resolve(); }
  }

  /** Draw the cursor where the agent is, turning it toward its direction of travel. */
  sync() {
    const x = this.x, y = this.y;
    const mx = x - this.lx, my = y - this.ly;
    if (mx * mx + my * my > 0.25) {
      // Turn smoothly toward the direction of travel.
      let diff = Math.atan2(my, mx) - this.heading;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      this.heading += diff * 0.25;
    }
    this.lx = x;
    this.ly = y;
    this.el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    this.el.style.setProperty("--rot", `${this.heading}rad`);
    for (const f of this.followers) f(x, y);
  }
}
