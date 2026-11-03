import type { Agent, Role } from "./agent";
import { inView, pageRect } from "./util";

/**
 *  line  a hairline, dragged from one end to the other
 *  rect  a box: dragged out as a grey placeholder, then filled with its real style
 *  text  a text box is dragged out and the text typed into it
 *  dup   a repeated item: alt-drag a copy of the first item, then retype its text
 */
export type Kind = "line" | "rect" | "text" | "dup";

export interface Task {
  el: HTMLElement;
  kind: Kind;
  deps: Task[];
  /** For dup: the item being copied. */
  source?: HTMLElement;
  section: Section;
  state: "wait" | "claimed" | "done";
  readySince?: number;
}

export interface Section { el: HTMLElement; tasks: Task[] }

const ROLE_FOR: Record<Kind, Role> = { line: "layout", rect: "layout", text: "copy", dup: "build" };

export class Board {
  readonly sections: Section[] = [];
  done = 0;
  total = 0;

  addSection(el: HTMLElement) {
    const section: Section = { el, tasks: [] };
    // Parts inside a duplicated item are handled by that item's dup task.
    const parts = [...el.querySelectorAll<HTMLElement>("[data-part]")]
      .filter((p) => !p.parentElement?.closest('[data-part="dup"]'));
    const byEl = new Map<HTMLElement, Task>();
    for (const p of parts) {
      const t: Task = { el: p, kind: p.dataset.part as Kind, deps: [], section, state: "wait" };
      const anc = p.parentElement?.closest<HTMLElement>("[data-part]");
      const parent = anc && byEl.get(anc);
      if (parent) t.deps.push(parent);
      byEl.set(p, t);
      section.tasks.push(t);
    }
    // A dup waits for its source item and everything inside it.
    for (const t of section.tasks) {
      if (t.kind !== "dup") continue;
      const group = t.el.parentElement!;
      const src = group.firstElementChild as HTMLElement;
      t.source = src;
      for (const o of section.tasks) if (o.el === src || src.contains(o.el)) t.deps.push(o);
    }
    this.sections.push(section);
  }

  claim(agent: Agent, now: number): Task | null {
    const ready: Task[] = [];
    for (const s of this.sections) for (const t of s.tasks) {
      if (t.state !== "wait" || t.deps.some((d) => d.state !== "done")) continue;
      t.readySince ??= now;
      ready.push(t);
    }
    if (!ready.length) return null;
    const mine = ready.filter((t) => ROLE_FOR[t.kind] === agent.role);
    const pool = mine.length ? mine : ready.filter((t) => now - (t.readySince ?? now) > 900);
    if (!pool.length) return null;
    const score = (t: Task) => {
      const r = pageRect(t.kind === "dup" && t.source ? t.source : t.el);
      return Math.hypot(r.x + r.w / 2 - agent.x, r.y + r.h / 2 - agent.y) + (inView(pageRect(t.el), 80) ? 0 : 6000);
    };
    pool.sort((a, b) => score(a) - score(b));
    pool[0].state = "claimed";
    return pool[0];
  }

  complete(t: Task) {
    t.state = "done";
    this.done++;
  }
}
