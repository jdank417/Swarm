import { clamp, easeInOut, rand } from "./util";

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
  idle: boolean;
}

const COLORS = ["#7cc4ff", "#ff7ab6", "#ffd166", "#5ef2b0", "#b69cff", "#ff8f5a", "#f2f3f5", "#6ee7ff"];

/** One cursor in the swarm. Positions are in page coordinates. */
export class Agent {
  x: number;
  y: number;
  readonly id: number;
  readonly color: string;
  readonly name: string;
  busy = false;
  pressed = false;
  vx = 0;
  vy = 0;
  trail: { x: number; y: number }[] = [];
  private tw: Tween | null = null;
  private leader: Agent | null = null;
  private off = { x: 0, y: 0 };

  constructor(id: number, x: number, y: number) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.color = COLORS[id % COLORS.length];
    this.name = "a" + String(id).padStart(2, "0");
  }

  get attached() { return this.leader !== null; }
  get idleTarget() { return this.tw?.idle ? { x: this.tw.tx, y: this.tw.ty } : null; }
  get still() { return !this.tw && !this.leader; }

  moveTo(tx: number, ty: number, o: MoveOpts = {}, idle = false): Promise<void> {
    this.tw?.resolve();
    const dx = tx - this.x, dy = ty - this.y;
    const d = Math.hypot(dx, dy);
    const dur = o.dur ?? clamp(d * 0.85 + 140, 160, 1100);
    const curve = o.curve ?? rand(-0.22, 0.22);
    const cx = (this.x + tx) / 2 - dy * curve;
    const cy = (this.y + ty) / 2 + dx * curve;
    return new Promise((resolve) => {
      this.tw = {
        fx: this.x, fy: this.y, cx, cy, tx, ty,
        t0: performance.now(), dur,
        ease: o.ease ?? easeInOut,
        onUpdate: o.onUpdate,
        resolve, idle,
      };
    });
  }

  /** Stop any idle wandering so a task can take over. */
  halt() {
    if (this.tw?.idle) { this.tw.resolve(); this.tw = null; }
  }

  /** Ride along with another agent (e.g. two hands carrying one card). */
  attach(leader: Agent) {
    this.leader = leader;
    this.off = { x: this.x - leader.x, y: this.y - leader.y };
  }
  detach() { this.leader = null; }

  update(now: number) {
    const px = this.x, py = this.y;
    if (this.leader) {
      this.x = this.leader.x + this.off.x;
      this.y = this.leader.y + this.off.y;
    } else if (this.tw) {
      const w = this.tw;
      const k = clamp((now - w.t0) / w.dur, 0, 1);
      const t = w.ease(k), u = 1 - t;
      this.x = u * u * w.fx + 2 * u * t * w.cx + t * t * w.tx;
      this.y = u * u * w.fy + 2 * u * t * w.cy + t * t * w.ty;
      w.onUpdate?.();
      if (k >= 1) { this.tw = null; w.resolve(); }
    }
    this.vx = this.x - px;
    this.vy = this.y - py;
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 5) this.trail.shift();
  }
}
