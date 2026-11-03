import { Agent, type Role } from "./agent";
import { perform, place, splitText } from "./actions";
import { Board } from "./board";
import { Overlay } from "./overlay";
import { Rulers } from "./rulers";
import { clamp, rand, sleep } from "./util";

const COLORS = ["#2a6cff", "#ff4d6d", "#ffb020", "#12b886", "#8b5cf6", "#ff7a1a", "#06b6d4", "#e64980", "#4c6ef5", "#40c057"];
const ROLES: Role[] = ["layout", "copy", "build"];

export interface Stats { agents: number; working: number; done: number; total: number }

export class Swarm {
  readonly agents: Agent[] = [];
  readonly board = new Board();
  private overlay: Overlay;
  private rulers: Rulers | null;
  private pointer: { x: number; y: number } | null = null;
  private intro: { x: number; y: number } | null = null;
  onStats?: (s: Stats) => void;

  constructor(layer: HTMLElement, rulers: [HTMLCanvasElement, HTMLCanvasElement] | null, count: number) {
    this.overlay = new Overlay(layer);
    this.rulers = rulers ? new Rulers(rulers[0], rulers[1]) : null;
    const cx = innerWidth / 2, cy = innerHeight / 2 + scrollY;
    for (let i = 0; i < count; i++) {
      // Start evenly spaced on a ring around the logo.
      const ang = (i / count) * Math.PI * 2;
      const a = new Agent(layer, i + 1, ROLES[i % 3], COLORS[i % COLORS.length], cx + Math.cos(ang) * 90, cy + Math.sin(ang) * 90);
      a.vx = -Math.sin(ang) * 2;
      a.vy = Math.cos(ang) * 2;
      this.agents.push(a);
    }
    addEventListener("pointermove", (e) => {
      if (e.pointerType === "mouse") this.pointer = { x: e.clientX, y: e.clientY };
    });
    document.documentElement.addEventListener("mouseleave", () => { this.pointer = null; });
  }

  /** Hide every part, split text into characters, and turn repeated items into duplicates. */
  prepare(root: ParentNode) {
    document.documentElement.classList.add("asm");
    root.querySelectorAll<HTMLElement>("[data-dup]").forEach((group) => {
      [...group.children].slice(1).forEach((item) => {
        const el = item as HTMLElement;
        el.dataset.origPart = el.dataset.part ?? "";
        el.dataset.part = "dup";
      });
    });
    root.querySelectorAll<HTMLElement>('[data-part="text"], [data-orig-part="text"]').forEach(splitText);
    this.board.total = root.querySelectorAll("[data-part]").length
      - root.querySelectorAll('[data-part="dup"] [data-part]').length;
  }

  finishAll(root: ParentNode) {
    root.querySelectorAll<HTMLElement>(".ch").forEach((c) => c.classList.add("on"));
    root.querySelectorAll<HTMLElement>("[data-part]").forEach(place);
  }

  observe(root: ParentNode) {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        this.board.addSection(e.target as HTMLElement);
      }),
      { threshold: 0.12, rootMargin: "0px 0px -5% 0px" },
    );
    root.querySelectorAll("[data-assemble]").forEach((c) => io.observe(c));
  }

  /** Orbit the logo for a moment, then start work. */
  async start(logo: HTMLElement | null, introMs = 1600) {
    if (logo) {
      const r = logo.getBoundingClientRect();
      this.intro = { x: r.left + r.width / 2 + scrollX, y: r.top + r.height / 2 + scrollY };
    }
    const loop = (now: number) => {
      for (const a of this.agents) a.step(now);
      this.flock(now);
      for (const a of this.agents) a.transmit(now);
      this.rulers?.draw(this.overlay.active, this.pointer);
      this.onStats?.({
        agents: this.agents.length,
        working: this.agents.filter((a) => a.busy).length,
        done: this.board.done,
        total: this.board.total,
      });
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    await sleep(introMs);
    logo?.classList.add("out");
    this.intro = null;
    for (const a of this.agents) this.live(a);
  }

  /** Each agent runs its own loop: check the board, claim a task, do it. */
  private async live(a: Agent) {
    await sleep(rand(0, 700));
    for (;;) {
      const task = this.board.claim(a, performance.now());
      if (!task) { await sleep(rand(160, 420)); continue; }
      a.busy = true;
      try {
        await perform(a, task, this.overlay);
      } catch (err) {
        console.error(err);
        place(task.el);
      }
      this.board.complete(task);
      a.busy = false;
      a.cursor = "arrow";
      await sleep(rand(40, 160));
    }
  }

  /**
   * Free agents flock: separation, alignment and cohesion, plus a pull toward
   * a ring around the goal: the logo during the intro, then your mouse (or a
   * roaming point on touch screens).
   */
  private flock(now: number) {
    const free = this.agents.filter((a) => !a.busy && !a.moving);
    if (!free.length) return;
    const t = now / 1000;
    const goal = this.intro
      ?? (this.pointer
        ? { x: this.pointer.x + scrollX, y: this.pointer.y + scrollY }
        : { x: scrollX + innerWidth * (0.5 + 0.3 * Math.sin(t * 0.31)), y: scrollY + innerHeight * (0.5 + 0.28 * Math.sin(t * 0.47 + 1)) });
    const orbit = this.intro !== null;
    const swirl = orbit ? 1 : Math.sin(t * 0.08);
    for (const a of free) {
      let n = 0, cx = 0, cy = 0, ax = 0, ay = 0, sx = 0, sy = 0;
      for (const b of free) {
        if (b === a) continue;
        const dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy;
        if (d2 > 60 * 60) continue;
        n++; cx += b.x; cy += b.y; ax += b.vx; ay += b.vy;
        if (d2 < 16 * 16 && d2 > 0.01) { sx -= dx / d2; sy -= dy / d2; }
      }
      let fx = sx * 2.5, fy = sy * 2.5;
      if (n && !orbit) {
        fx += (cx / n - a.x) * 0.003 + (ax / n - a.vx) * 0.04;
        fy += (cy / n - a.y) * 0.003 + (ay / n - a.vy) * 0.04;
      }
      const dx = goal.x - a.x, dy = goal.y - a.y, d = Math.hypot(dx, dy) || 1;
      const ring = orbit ? 85 : 22 + (a.id % 6) * 7;
      const pull = clamp((d - ring) * (orbit ? 0.01 : 0.0016), -0.2, 0.22);
      const spin = orbit ? 0.18 : 0.035;
      fx += (dx / d) * pull + (-dy / d) * spin * swirl;
      fy += (dy / d) * pull + (dx / d) * spin * swirl;
      a.vx = a.vx * 0.93 + fx + rand(-0.015, 0.015);
      a.vy = a.vy * 0.93 + fy + rand(-0.015, 0.015);
      const sp = Math.hypot(a.vx, a.vy);
      const max = (orbit ? 3.4 : d > 400 ? 6 : 2.6) * a.agility;
      if (sp > max) { a.vx *= max / sp; a.vy *= max / sp; }
      a.x += a.vx;
      a.y += a.vy;
    }
  }
}
