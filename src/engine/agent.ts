import { clamp, easeInOut, rand } from "./util";

export type CursorKind = "arrow" | "cross" | "text" | "grab" | "grabbing";

export interface MoveOpts {
  /** Duration in ms. Defaults to a distance-based value. */
  dur?: number;
  /** Path bend as a fraction of distance. 0 = straight line. */
  curve?: number;
  ease?: (t: number) => number;
  /** Called every frame while moving, after the position updates. */
  onUpdate?: () => void;
}

interface Tween {
  fx: number; fy: number;
  cx: number; cy: number;
  tx: number; ty: number;
  t0: number; dur: number;
  ease: (t: number) => number;
  onUpdate?: () => void;
  resolve: () => void;
}

const COLORS = ["#7cc4ff", "#ff7ab6", "#ffd166", "#5ef2b0", "#b69cff", "#ff8f5a", "#f2f3f5", "#6ee7ff"];

/**
 * One cursor in the swarm. Positions are in page coordinates.
 * While it has a task it follows tweens; otherwise the assembler flocks it.
 */
export class Agent {
  x: number;
  y: number;
  vx = 0;
  vy = 0;
  readonly id: number;
  readonly color: string;
  /** Per-agent speed multiplier so the flock isn't uniform. */
  readonly agility = rand(0.85, 1.2);
  busy = false;
  pressed = false;
  cursor: CursorKind = "arrow";
  private tw: Tween | null = null;

  constructor(id: number, x: number, y: number) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.color = COLORS[id % COLORS.length];
  }

  get moving() { return this.tw !== null; }

  moveTo(tx: number, ty: number, o: MoveOpts = {}): Promise<void> {
    this.tw?.resolve();
    const dx = tx - this.x, dy = ty - this.y;
    const d = Math.hypot(dx, dy);
    const dur = o.dur ?? clamp(d * 1.3 + 400, 450, 1700);
    const curve = o.curve ?? rand(-0.12, 0.12);
    // Bend the path, and lean the start along current velocity so leaving the flock is smooth.
    let cx = (this.x + tx) / 2 - dy * curve;
    let cy = (this.y + ty) / 2 + dx * curve;
    const sp = Math.hypot(this.vx, this.vy);
    if (sp > 0.5 && o.curve !== 0) {
      const k = Math.min(d * 0.4, sp * 18);
      cx = cx * 0.5 + (this.x + (this.vx / sp) * k) * 0.5;
      cy = cy * 0.5 + (this.y + (this.vy / sp) * k) * 0.5;
    }
    return new Promise((resolve) => {
      this.tw = {
        fx: this.x, fy: this.y, cx, cy, tx, ty,
        t0: performance.now(), dur,
        ease: o.ease ?? easeInOut,
        onUpdate: o.onUpdate,
        resolve,
      };
    });
  }

  /** Advance the current tween. Flocking motion is integrated by the assembler. */
  update(now: number) {
    const w = this.tw;
    if (!w) return;
    const px = this.x, py = this.y;
    const k = clamp((now - w.t0) / w.dur, 0, 1);
    const t = w.ease(k), u = 1 - t;
    this.x = u * u * w.fx + 2 * u * t * w.cx + t * t * w.tx;
    this.y = u * u * w.fy + 2 * u * t * w.cy + t * t * w.ty;
    this.vx = this.x - px;
    this.vy = this.y - py;
    w.onUpdate?.();
    if (k >= 1) { this.tw = null; w.resolve(); }
  }
}
