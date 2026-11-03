import { PerfectCursor } from "perfect-cursors";
import { clamp, easeInOut, rand, sleep } from "./util";

export type CursorKind = "arrow" | "cross" | "text" | "grab" | "grabbing";
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

const GLYPHS = `
<svg class="g g-arrow" width="20" height="22" viewBox="0 0 20 22"><path d="M1 1 L1 16.5 L5 12.6 L7.9 18.8 L10.4 17.7 L7.6 11.6 L13 11.6 Z"/></svg>
<svg class="g g-cross" width="22" height="22" viewBox="-11 -11 22 22"><path class="o" d="M-8 0H8M0-8V8"/><path d="M-8 0H8M0-8V8"/></svg>
<svg class="g g-text" width="14" height="22" viewBox="-7 -11 14 22"><path class="o" d="M-4-9h3m2 0h3M0-8V8M-4 9h3m2 0h3"/><path d="M-4-9h3m2 0h3M0-8V8M-4 9h3m2 0h3"/></svg>
<svg class="g g-grab" width="22" height="22" viewBox="-11 -11 22 22"><rect x="-6" y="-9" width="2.8" height="9" rx="1.4"/><rect x="-3" y="-9" width="2.8" height="9" rx="1.4"/><rect x="0" y="-9" width="2.8" height="9" rx="1.4"/><rect x="3" y="-9" width="2.8" height="9" rx="1.4"/><rect x="-10" y="-1" width="4.5" height="6" rx="2.2"/><rect x="-7" y="-3" width="13.5" height="10" rx="4"/></svg>
<svg class="g g-grabbing" width="22" height="22" viewBox="-11 -11 22 22"><rect x="-6" y="-6" width="2.8" height="6" rx="1.4"/><rect x="-3" y="-6" width="2.8" height="6" rx="1.4"/><rect x="0" y="-6" width="2.8" height="6" rx="1.4"/><rect x="3" y="-6" width="2.8" height="6" rx="1.4"/><rect x="-10" y="-1" width="4.5" height="6" rx="2.2"/><rect x="-7" y="-3" width="13.5" height="10" rx="4"/></svg>`;

/**
 * One AI agent. It has a "brain" position that it moves itself, and a body
 * (the cursor you see) that it only updates by sending position samples every
 * 45-85 ms, like a remote collaborator over the network. perfect-cursors
 * interpolates those samples along a spline, so the visible cursor trails the
 * brain slightly and moves the way real multiplayer cursors do.
 */
export class Agent {
  x: number; y: number;
  vx = 0; vy = 0;
  /** Where the visible cursor is right now (page coordinates). */
  dx: number; dy: number;
  busy = false;
  readonly agility = rand(0.85, 1.2);
  readonly el: HTMLDivElement;
  private statusEl: HTMLSpanElement;
  private tw: Tween | null = null;
  private pc: PerfectCursor;
  private nextSend = 0;
  private followers = new Set<(x: number, y: number) => void>();

  constructor(
    layer: HTMLElement,
    readonly id: number,
    readonly name: string,
    readonly role: Role,
    readonly color: string,
    x: number, y: number,
  ) {
    this.x = this.dx = x;
    this.y = this.dy = y;
    const el = document.createElement("div");
    el.className = "agent";
    el.dataset.cursor = "arrow";
    el.style.setProperty("--c", color);
    el.innerHTML = `${GLYPHS}<span class="atag"><b>${name}</b><span class="st"></span></span>`;
    layer.appendChild(el);
    this.el = el;
    this.statusEl = el.querySelector(".st")!;
    this.pc = new PerfectCursor(([px, py]) => this.render(px, py));
    this.pc.addPoint([x, y]);
  }

  get moving() { return this.tw !== null; }

  set cursor(kind: CursorKind) { this.el.dataset.cursor = kind; }

  /** Show what the agent is doing in its name tag; null hides the tag. */
  say(text: string | null, thinking = false) {
    this.statusEl.textContent = text ?? "";
    this.el.classList.toggle("working", text !== null);
    this.el.classList.toggle("thinking", thinking);
  }

  /** Run a callback with the visible cursor position every time it moves. */
  follow(fn: (x: number, y: number) => void) {
    this.followers.add(fn);
    fn(this.dx, this.dy);
    return () => this.followers.delete(fn);
  }

  /** Resolve once the visible cursor has caught up with the brain. */
  async settle(max = 400) {
    const t0 = performance.now();
    while (Math.hypot(this.dx - this.x, this.dy - this.y) > 1 && performance.now() - t0 < max) await sleep(16);
  }

  moveTo(tx: number, ty: number, o: MoveOpts = {}): Promise<void> {
    this.tw?.resolve();
    const dx = tx - this.x, dy = ty - this.y;
    const d = Math.hypot(dx, dy);
    const dur = o.dur ?? clamp(d * 1.1 + 350, 420, 1500);
    const curve = o.curve ?? rand(-0.14, 0.14);
    let cx = (this.x + tx) / 2 - dy * curve;
    let cy = (this.y + ty) / 2 + dx * curve;
    const sp = Math.hypot(this.vx, this.vy);
    if (sp > 0.5 && o.curve !== 0) {
      const k = Math.min(d * 0.4, sp * 18);
      cx = cx * 0.5 + (this.x + (this.vx / sp) * k) * 0.5;
      cy = cy * 0.5 + (this.y + (this.vy / sp) * k) * 0.5;
    }
    return new Promise((resolve) => {
      this.tw = { fx: this.x, fy: this.y, cx, cy, tx, ty, t0: performance.now(), dur, ease: o.ease ?? easeInOut, resolve };
    });
  }

  /** Advance the brain's own movement. */
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

  /** Send a position sample to the visible cursor at a network-like rate. */
  transmit(now: number) {
    if (now < this.nextSend) return;
    this.nextSend = now + rand(45, 85);
    this.pc.addPoint([this.x, this.y]);
  }

  private render(x: number, y: number) {
    this.dx = x;
    this.dy = y;
    this.el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    for (const f of this.followers) f(x, y);
  }
}
