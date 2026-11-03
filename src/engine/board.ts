import type { Agent, Role } from "./agent";
import { inView, pageRect } from "./util";

export type Kind = "frame" | "carry" | "type";

export interface Task {
  el: HTMLElement;
  kind: Kind;
  parent: Task | null;
  section: Section;
  state: "wait" | "claimed" | "done";
  readySince?: number;
}

export interface Section {
  el: HTMLElement;
  name: string;
  tasks: Task[];
  planned: boolean;
  planner?: Agent;
}

const ROLE_FOR: Record<Kind, Role> = { frame: "layout", type: "copy", carry: "build" };

/**
 * Shared task board. A section's tasks are posted once an agent has scouted
 * it; agents then claim tasks themselves, preferring their own specialty and
 * helping with anything else that has been waiting a while.
 */
export class Board {
  readonly sections: Section[] = [];
  done = 0;
  total = 0;

  addSection(el: HTMLElement) {
    const section: Section = { el, name: el.dataset.assemble ?? "section", tasks: [], planned: false };
    const parts = [...(el.matches("[data-part]") ? [el] : []), ...el.querySelectorAll<HTMLElement>("[data-part]")];
    const byEl = new Map<HTMLElement, Task>();
    for (const p of parts) {
      const anc = p.parentElement?.closest<HTMLElement>("[data-part]");
      const t: Task = { el: p, kind: p.dataset.part as Kind, parent: (anc && byEl.get(anc)) || null, section, state: "wait" };
      byEl.set(p, t);
      section.tasks.push(t);
    }
    this.sections.push(section);
  }

  /** A section waiting for a scout, visible ones first. */
  claimPlanning(agent: Agent): Section | null {
    const open = this.sections.filter((s) => !s.planned && !s.planner);
    if (!open.length) return null;
    open.sort((a, b) => Number(inView(pageRect(b.el))) - Number(inView(pageRect(a.el))));
    open[0].planner = agent;
    return open[0];
  }

  claimTask(agent: Agent, now: number): Task | null {
    const ready: Task[] = [];
    for (const s of this.sections) {
      if (!s.planned) continue;
      for (const t of s.tasks) {
        if (t.state !== "wait" || (t.parent && t.parent.state !== "done")) continue;
        t.readySince ??= now;
        ready.push(t);
      }
    }
    if (!ready.length) return null;
    const mine = ready.filter((t) => ROLE_FOR[t.kind] === agent.role);
    const pool = mine.length ? mine : ready.filter((t) => now - (t.readySince ?? now) > 1400);
    if (!pool.length) return null;
    const score = (t: Task) => {
      const r = pageRect(t.el);
      const d = Math.hypot(r.x + r.w / 2 - agent.x, r.y + r.h / 2 - agent.y);
      return d + (inView(r, 100) ? 0 : 5000);
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
