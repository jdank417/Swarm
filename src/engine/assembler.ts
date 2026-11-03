import { Agent } from "./agent";
import { Overlay } from "./overlay";
import { crewSize, place, run, splitText, type Kind } from "./tasks";
import { clamp, inView, pageRect, rand } from "./util";

interface Job { el: HTMLElement; kind: Kind; parent: Job | null; state: "wait" | "run" | "done" }

export interface Stats { agents: number; busy: number; done: number; total: number }

/**
 * Owns the swarm. Components marked [data-assemble] are queued when they
 * scroll into view; each [data-part] inside becomes a job that waits for its
 * enclosing part, then goes to the nearest free cursors. Free cursors flock
 * around the mouse like starlings.
 */
export class Assembler {
  readonly agents: Agent[] = [];
  private jobs: Job[] = [];
  private overlay: Overlay;
  private pointer: { x: number; y: number } | null = null;
  private frame = 0;
  private done = 0;
  private total = 0;
  onStats?: (s: Stats) => void;

  constructor(canvas: HTMLCanvasElement, count: number) {
    this.overlay = new Overlay(canvas);
    for (let i = 0; i < count; i++) {
      const edge = i % 4;
      const x = edge === 0 ? -20 : edge === 1 ? innerWidth + 20 : rand(0, innerWidth);
      const y = (edge === 2 ? -20 : edge === 3 ? innerHeight + 20 : rand(0, innerHeight)) + scrollY;
      const a = new Agent(i + 1, x, y);
      a.vx = (innerWidth / 2 - x) * 0.01;
      a.vy = (innerHeight / 2 + scrollY - y) * 0.01;
      this.agents.push(a);
    }
    addEventListener("pointermove", (e) => {
      if (e.pointerType === "mouse") this.pointer = { x: e.clientX, y: e.clientY };
    });
    document.documentElement.addEventListener("mouseleave", () => { this.pointer = null; });
  }

  /** Hide every part and split text into characters. */
  prepare(root: ParentNode) {
    document.documentElement.classList.add("asm");
    root.querySelectorAll<HTMLElement>('[data-part="type"]').forEach(splitText);
    this.total = root.querySelectorAll("[data-part]").length;
  }

  /** Skip the animation entirely (reduced motion). */
  finishAll(root: ParentNode) {
    root.querySelectorAll<HTMLElement>(".ch").forEach((c) => c.classList.add("on"));
    root.querySelectorAll<HTMLElement>("[data-part]").forEach(place);
  }

  observe(root: ParentNode) {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        this.enqueue(e.target as HTMLElement);
      }),
      { threshold: 0.15, rootMargin: "0px 0px -6% 0px" },
    );
    root.querySelectorAll("[data-assemble]").forEach((c) => io.observe(c));
  }

  start() {
    const loop = (now: number) => {
      if (this.frame++ % 3 === 0) this.schedule();
      for (const a of this.agents) a.update(now);
      this.flock(now);
      this.overlay.draw(this.agents, now);
      this.onStats?.({
        agents: this.agents.length,
        busy: this.agents.filter((a) => a.busy).length,
        done: this.done,
        total: this.total,
      });
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  private enqueue(el: HTMLElement) {
    const parts = [...(el.matches("[data-part]") ? [el] : []), ...el.querySelectorAll<HTMLElement>("[data-part]")];
    const byEl = new Map<HTMLElement, Job>();
    for (const p of parts) {
      const anc = p.parentElement?.closest<HTMLElement>("[data-part]");
      const job: Job = { el: p, kind: p.dataset.part as Kind, parent: (anc && byEl.get(anc)) || null, state: "wait" };
      byEl.set(p, job);
      this.jobs.push(job);
    }
  }

  private schedule() {
    const ready = this.jobs.filter((j) => j.state === "wait" && (!j.parent || j.parent.state === "done"));
    if (!ready.length) return;
    const scored = ready
      .map((j) => ({ j, r: pageRect(j.el) }))
      .sort((a, b) => Number(inView(b.r, 100)) - Number(inView(a.r, 100)));

    let started = 0;
    for (const { j, r } of scored) {
      if (started >= 6) break;
      const free = this.agents.filter((a) => !a.busy);
      if (!free.length) break;
      const need = crewSize(j.el, j.kind);
      if (free.length < need) continue;
      const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
      free.sort((a, b) => Math.hypot(a.x - cx, a.y - cy) - Math.hypot(b.x - cx, b.y - cy));
      const crew = free.slice(0, need);
      for (const a of crew) a.busy = true;
      j.state = "run";
      started++;
      run(j.kind, j.el, crew, this.overlay)
        .catch((err) => { console.error(err); place(j.el); })
        .finally(() => {
          j.state = "done";
          this.done++;
          for (const a of crew) { a.busy = false; a.pressed = false; a.cursor = "arrow"; }
          this.jobs = this.jobs.filter((x) => x.state !== "done");
        });
    }
  }

  /**
   * Boids: separation, alignment and cohesion between free cursors, plus a pull
   * toward a ring around the mouse with a slowly reversing swirl. With no mouse
   * (touch, or pointer outside the window) the flock follows a roaming point.
   */
  private flock(now: number) {
    const free = this.agents.filter((a) => !a.busy && !a.moving);
    if (!free.length) return;
    const t = now / 1000;
    const goal = this.pointer
      ? { x: this.pointer.x + scrollX, y: this.pointer.y + scrollY }
      : {
          x: scrollX + innerWidth * (0.5 + 0.3 * Math.sin(t * 0.31)),
          y: scrollY + innerHeight * (0.5 + 0.28 * Math.sin(t * 0.47 + 1)),
        };
    const swirl = Math.sin(t * 0.21);

    for (const a of free) {
      let n = 0, cx = 0, cy = 0, ax = 0, ay = 0, sx = 0, sy = 0;
      for (const b of free) {
        if (b === a) continue;
        const dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy;
        if (d2 > 80 * 80) continue;
        n++; cx += b.x; cy += b.y; ax += b.vx; ay += b.vy;
        if (d2 < 24 * 24 && d2 > 0.01) { sx -= dx / d2; sy -= dy / d2; }
      }
      let fx = sx * 9, fy = sy * 9;
      if (n) {
        fx += (cx / n - a.x) * 0.002 + (ax / n - a.vx) * 0.05;
        fy += (cy / n - a.y) * 0.002 + (ay / n - a.vy) * 0.05;
      }
      const dx = goal.x - a.x, dy = goal.y - a.y, d = Math.hypot(dx, dy) || 1;
      const ring = 60 + (a.id % 6) * 16;
      const pull = clamp((d - ring) * 0.004, -0.25, 0.7);
      fx += (dx / d) * pull + (-dy / d) * 0.14 * swirl;
      fy += (dy / d) * pull + (dx / d) * 0.14 * swirl;
      fx += rand(-0.06, 0.06);
      fy += rand(-0.06, 0.06);

      a.vx += fx;
      a.vy += fy;
      const sp = Math.hypot(a.vx, a.vy);
      const max = (d > 500 ? 13 : 6.5) * a.agility;
      if (sp > max) { a.vx *= max / sp; a.vy *= max / sp; }
      else if (sp < 1) { a.vx *= 1.2; a.vy *= 1.2; }
      a.x += a.vx;
      a.y += a.vy;
    }
  }
}
