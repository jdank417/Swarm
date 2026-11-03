import { Agent } from "./agent";
import { Overlay, type Mark } from "./overlay";
import { crewSize, place, run, splitText, type Kind } from "./tasks";
import { easeOut, inView, pageRect, rand, viewRect } from "./util";

interface Comp { el: HTMLElement; jobs: Job[]; mark: Mark }
interface Job { el: HTMLElement; kind: Kind; parent: Job | null; state: "wait" | "run" | "done"; comp: Comp }

export interface Stats { agents: number; busy: number; done: number; total: number }

/**
 * Owns the swarm. Components marked [data-assemble] are queued when they
 * scroll into view; each [data-part] inside becomes a job that waits for its
 * enclosing part, then gets the nearest free cursors.
 */
export class Assembler {
  readonly agents: Agent[] = [];
  private jobs: Job[] = [];
  private overlay: Overlay;
  private mouse = { x: -1e4, y: -1e4 };
  private fleeing = new Map<Agent, number>();
  private frame = 0;
  private done = 0;
  private total = 0;
  onStats?: (s: Stats) => void;

  constructor(canvas: HTMLCanvasElement, count: number) {
    this.overlay = new Overlay(canvas);
    for (let i = 0; i < count; i++) {
      const edge = i % 4;
      const x = edge === 0 ? -30 : edge === 1 ? innerWidth + 30 : rand(0, innerWidth);
      const y = (edge === 2 ? -30 : edge === 3 ? innerHeight + 30 : rand(0, innerHeight)) + scrollY;
      this.agents.push(new Agent(i + 1, x, y));
    }
    addEventListener("pointermove", (e) => { this.mouse = { x: e.clientX + scrollX, y: e.clientY + scrollY }; });
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
      this.wander(now);
      for (const a of this.agents) if (!a.attached) a.update(now);
      for (const a of this.agents) if (a.attached) a.update(now);
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
    const r = pageRect(el);
    const comp: Comp = {
      el, jobs: [],
      mark: this.overlay.rect(r.x - 8, r.y - 8, r.w + 16, r.h + 16, {
        dashed: true, label: el.dataset.assemble, color: "rgba(42,108,255,0.6)",
      }),
    };
    const parts = [...(el.matches("[data-part]") ? [el] : []), ...el.querySelectorAll<HTMLElement>("[data-part]")];
    const byEl = new Map<HTMLElement, Job>();
    for (const p of parts) {
      const anc = p.parentElement?.closest<HTMLElement>("[data-part]");
      const job: Job = { el: p, kind: p.dataset.part as Kind, parent: (anc && byEl.get(anc)) || null, state: "wait", comp };
      byEl.set(p, job);
      comp.jobs.push(job);
      this.jobs.push(job);
    }
    if (!parts.length) this.overlay.fade(comp.mark, 400);
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
      const idle = this.agents.filter((a) => !a.busy);
      if (!idle.length) break;
      const need = crewSize(j.el, j.kind);
      if (idle.length < need) continue;
      const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
      idle.sort((a, b) => Math.hypot(a.x - cx, a.y - cy) - Math.hypot(b.x - cx, b.y - cy));
      const crew = idle.slice(0, need);
      for (const a of crew) { a.busy = true; a.halt(); this.fleeing.delete(a); }
      j.state = "run";
      started++;
      run(j.kind, j.el, crew, this.overlay)
        .catch((err) => { console.error(err); place(j.el); })
        .finally(() => {
          j.state = "done";
          this.done++;
          for (const a of crew) { a.busy = false; a.pressed = false; a.detach(); }
          if (j.comp.jobs.every((x) => x.state === "done")) {
            this.overlay.fade(j.comp.mark, 250, 600);
            this.jobs = this.jobs.filter((x) => x.comp !== j.comp);
          }
        });
    }
  }

  /** Free cursors roam the viewport, follow you as you scroll, and dodge your pointer. */
  private wander(now: number) {
    const v = viewRect();
    const off = (p: { y: number }) => p.y < v.y - 40 || p.y > v.y + v.h + 40;
    for (const a of this.agents) {
      if (a.busy) continue;
      const fleeEnd = this.fleeing.get(a);
      if (fleeEnd && now < fleeEnd) continue;
      if (Math.hypot(a.x - this.mouse.x, a.y - this.mouse.y) < 70) {
        const ang = Math.atan2(a.y - this.mouse.y, a.x - this.mouse.x) + rand(-0.5, 0.5);
        a.moveTo(a.x + Math.cos(ang) * 150, a.y + Math.sin(ang) * 150, { dur: 420, ease: easeOut, curve: 0 }, true);
        this.fleeing.set(a, now + 420);
        continue;
      }
      const t = a.idleTarget;
      if (a.still || (t && off(t))) {
        const far = off(a);
        a.moveTo(
          rand(v.x + 20, v.x + v.w - 20),
          rand(v.y + 70, v.y + v.h - 50),
          { dur: far ? rand(450, 900) : rand(1300, 2800), curve: rand(-0.4, 0.4) },
          true,
        );
      }
    }
  }
}
