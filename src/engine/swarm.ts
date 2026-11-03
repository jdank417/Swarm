import { Agent, type Role } from "./agent";
import { describe, perform, place, scout, splitText } from "./actions";
import { Board } from "./board";
import { clamp, rand, sleep } from "./util";

const NAMES = ["Ada", "Bix", "Cleo", "Dex", "Echo", "Fern", "Gus", "Hana", "Ivo", "Juno", "Kai", "Lumi", "Milo", "Nova",
  "Orin", "Pip", "Quill", "Rex", "Sol", "Tess", "Uma", "Vex", "Wren", "Xan", "Yuki", "Zed", "Ash", "Bo", "Cy", "Dot"];
const COLORS = ["#7cc4ff", "#ff7ab6", "#ffd166", "#5ef2b0", "#b69cff", "#ff8f5a", "#6ee7ff", "#c3f73a", "#f78fb3", "#9aa7ff"];
const ROLES: Role[] = ["layout", "copy", "build"];

export interface Stats { agents: number; working: number; done: number; total: number }

export class Swarm {
  readonly agents: Agent[] = [];
  readonly board = new Board();
  private pointer: { x: number; y: number } | null = null;
  private feedEl: HTMLOListElement;
  onStats?: (s: Stats) => void;

  constructor(layer: HTMLElement, feed: HTMLOListElement, count: number) {
    this.feedEl = feed;
    for (let i = 0; i < count; i++) {
      const edge = i % 4;
      const x = edge === 0 ? -20 : edge === 1 ? innerWidth + 20 : rand(0, innerWidth);
      const y = (edge === 2 ? -20 : edge === 3 ? innerHeight + 20 : rand(0, innerHeight)) + scrollY;
      const a = new Agent(layer, i + 1, NAMES[i % NAMES.length], ROLES[i % 3], COLORS[i % COLORS.length], x, y);
      a.vx = (innerWidth / 2 - x) * 0.006;
      a.vy = (innerHeight / 2 + scrollY - y) * 0.006;
      this.agents.push(a);
    }
    addEventListener("pointermove", (e) => {
      if (e.pointerType === "mouse") this.pointer = { x: e.clientX, y: e.clientY };
    });
    document.documentElement.addEventListener("mouseleave", () => { this.pointer = null; });
  }

  prepare(root: ParentNode) {
    document.documentElement.classList.add("asm");
    root.querySelectorAll<HTMLElement>('[data-part="type"]').forEach(splitText);
    this.board.total = root.querySelectorAll("[data-part]").length;
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
      { threshold: 0.15, rootMargin: "0px 0px -6% 0px" },
    );
    root.querySelectorAll("[data-assemble]").forEach((c) => io.observe(c));
  }

  start() {
    for (const a of this.agents) this.live(a);
    const loop = (now: number) => {
      for (const a of this.agents) a.step(now);
      this.flock(now);
      for (const a of this.agents) a.transmit(now);
      this.onStats?.({
        agents: this.agents.length,
        working: this.agents.filter((a) => a.busy).length,
        done: this.board.done,
        total: this.board.total,
      });
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  /** Each agent runs its own loop: look at the board, claim something, do it. */
  private async live(a: Agent) {
    await sleep(rand(300, 1500));
    for (;;) {
      await sleep(rand(180, 520));
      const section = this.board.claimPlanning(a);
      if (section) {
        a.busy = true;
        this.log(a, `scouting ${section.name}`);
        await scout(a, section);
        section.planned = true;
        this.log(a, `planned ${section.name} · ${section.tasks.length} tasks`);
        this.release(a);
        continue;
      }
      const task = this.board.claimTask(a, performance.now());
      if (!task) continue;
      a.busy = true;
      const label = describe(task);
      try {
        await perform(a, task);
      } catch (err) {
        console.error(err);
        place(task.el);
      }
      this.board.complete(task);
      this.log(a, `✓ ${label}`);
      this.release(a);
    }
  }

  private release(a: Agent) {
    a.busy = false;
    a.say(null);
    a.cursor = "arrow";
  }

  private log(a: Agent, text: string) {
    const li = document.createElement("li");
    li.innerHTML = `<b style="color:${a.color}">${a.name}</b> <i>${a.role}</i> <span></span>`;
    li.lastElementChild!.textContent = text;
    this.feedEl.prepend(li);
    while (this.feedEl.children.length > 7) this.feedEl.lastElementChild!.remove();
  }

  /**
   * Idle agents flock in a tight, slow cluster around the mouse (or a roaming
   * point on touch screens) until there's work for them.
   */
  private flock(now: number) {
    const free = this.agents.filter((a) => !a.busy && !a.moving);
    if (!free.length) return;
    const t = now / 1000;
    const goal = this.pointer
      ? { x: this.pointer.x + scrollX, y: this.pointer.y + scrollY }
      : { x: scrollX + innerWidth * (0.5 + 0.3 * Math.sin(t * 0.31)), y: scrollY + innerHeight * (0.5 + 0.28 * Math.sin(t * 0.47 + 1)) };
    const swirl = Math.sin(t * 0.08);
    for (const a of free) {
      let n = 0, cx = 0, cy = 0, ax = 0, ay = 0, sx = 0, sy = 0;
      for (const b of free) {
        if (b === a) continue;
        const dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy;
        if (d2 > 60 * 60) continue;
        n++; cx += b.x; cy += b.y; ax += b.vx; ay += b.vy;
        if (d2 < 18 * 18 && d2 > 0.01) { sx -= dx / d2; sy -= dy / d2; }
      }
      let fx = sx * 2.5, fy = sy * 2.5;
      if (n) {
        fx += (cx / n - a.x) * 0.003 + (ax / n - a.vx) * 0.04;
        fy += (cy / n - a.y) * 0.003 + (ay / n - a.vy) * 0.04;
      }
      const dx = goal.x - a.x, dy = goal.y - a.y, d = Math.hypot(dx, dy) || 1;
      const ring = 22 + (a.id % 6) * 7;
      const pull = clamp((d - ring) * 0.0016, -0.06, 0.22);
      fx += (dx / d) * pull + (-dy / d) * 0.035 * swirl;
      fy += (dy / d) * pull + (dx / d) * 0.035 * swirl;
      a.vx = a.vx * 0.93 + fx + rand(-0.015, 0.015);
      a.vy = a.vy * 0.93 + fy + rand(-0.015, 0.015);
      const sp = Math.hypot(a.vx, a.vy);
      const max = (d > 400 ? 6 : 2.6) * a.agility;
      if (sp > max) { a.vx *= max / sp; a.vy *= max / sp; }
      a.x += a.vx;
      a.y += a.vy;
    }
  }
}
