import type { Agent } from "./agent";
import type { Overlay } from "./overlay";
import { clamp, inView, linear, pageRect, rand, sleep, viewRect } from "./util";

/*
  Every action here produces a real piece of the page:
    frame  the dragged-out box is exactly the element's box, and becomes it
    carry  the element itself is dragged into its slot
    type   each keystroke reveals the element's real text
  Nothing is drawn that doesn't end up on the page.
*/

export type Kind = "frame" | "carry" | "type";

/** How many cursors a part needs. Only long text is shared. */
export function crewSize(el: HTMLElement, kind: Kind): number {
  return kind === "type" ? clamp(Math.ceil(chars(el).length / 90), 1, 3) : 1;
}

export function run(kind: Kind, el: HTMLElement, crew: Agent[], ov: Overlay): Promise<void> {
  if (kind === "frame") return frame(el, crew[0], ov);
  if (kind === "carry") return carry(el, crew[0]);
  return type(el, crew);
}

/** Mark a part as built and let listeners (counters etc.) react. */
export function place(el: HTMLElement) {
  el.classList.add("placed");
  el.dispatchEvent(new CustomEvent("assembled", { bubbles: true }));
}

/* FRAME: drag a box from the element's top-left to its bottom-right; the element fills it. */
async function frame(el: HTMLElement, a: Agent, ov: Overlay) {
  const r = pageRect(el);
  a.cursor = "arrow";
  await a.moveTo(r.x, r.y);
  a.cursor = "cross";
  await sleep(rand(180, 320));
  a.pressed = true;
  const m = ov.rect(r.x, r.y, 0, 0);
  const sync = () => {
    m.w = a.x - r.x; m.h = a.y - r.y;
    m.label = `${Math.round(Math.abs(m.w))} × ${Math.round(Math.abs(m.h))}`;
  };
  await a.moveTo(r.x + r.w, r.y + r.h, { dur: clamp(Math.hypot(r.w, r.h) * 2.4, 900, 2400), curve: 0, onUpdate: sync });
  m.w = r.w; m.h = r.h;
  await sleep(rand(150, 260));
  place(el);
  a.pressed = false;
  a.cursor = "arrow";
  ov.fade(m, 120);
  await sleep(200);
}

/* CARRY: the element appears beside its slot, gets grabbed and dropped into place. */
async function carry(el: HTMLElement, a: Agent) {
  el.style.transform = "";
  const r = pageRect(el);
  const v = viewRect();
  const reach = clamp(r.w + 100, 120, 320);
  // Start beside the slot; keep the pickup on screen only when the slot itself is on screen.
  let sx = r.w > v.w - 32 ? r.x : clamp(r.x + rand(-1, 1) * reach, v.x + 8, v.x + v.w - r.w - 8);
  let sy = r.y + (Math.random() < 0.5 ? -1 : 1) * rand(60, 170);
  if (inView(r)) sy = clamp(sy, v.y + 70, Math.max(v.y + 70, v.y + v.h - r.h - 50));
  else sx = clamp(sx, 8, Math.max(8, document.documentElement.clientWidth - r.w - 8));
  const g = { x: r.w * rand(0.3, 0.7), y: r.h * rand(0.35, 0.65) };
  const set = (ox: number, oy: number) => { el.style.transform = `translate(${ox}px, ${oy}px)`; };

  a.cursor = "arrow";
  await a.moveTo(sx + g.x, sy + g.y);
  set(sx - r.x, sy - r.y);
  el.classList.add("lifted");
  a.cursor = "grabbing";
  await sleep(rand(200, 350));
  a.pressed = true;
  await a.moveTo(r.x + g.x, r.y + g.y, {
    dur: clamp(Math.hypot(sx - r.x, sy - r.y) * 3 + 500, 1000, 2400),
    curve: rand(-0.12, 0.12),
    onUpdate: () => set(a.x - g.x - r.x, a.y - g.y - r.y),
  });
  el.style.transform = "";
  el.classList.remove("lifted");
  place(el);
  a.pressed = false;
  await sleep(rand(150, 300));
  a.cursor = "arrow";
}

/* TYPE: each cursor takes a run of characters and types it, moving along as the caret. */
export function chars(el: HTMLElement): HTMLElement[] {
  return Array.from(el.querySelectorAll<HTMLElement>(".ch"));
}

async function type(el: HTMLElement, crew: Agent[]) {
  const cs = chars(el).filter((c) => !c.classList.contains("on"));
  if (cs.length) {
    const rects = cs.map((c) => pageRect(c));
    const chunk = Math.ceil(cs.length / crew.length);
    await Promise.all(
      crew.map(async (a, i) => {
        const s = i * chunk, e = Math.min(cs.length, s + chunk);
        if (s >= e) return;
        const r0 = rects[s];
        a.cursor = "arrow";
        await a.moveTo(r0.x, r0.y + r0.h / 2);
        a.cursor = "text";
        await sleep(rand(200, 380));
        for (let j = s; j < e; j++) {
          const r = rects[j];
          await a.moveTo(r.x + r.w, r.y + r.h / 2, { dur: clamp(r.w * 3, 55, 95), curve: 0, ease: linear });
          reveal(cs[j], a.color);
        }
        a.cursor = "arrow";
      }),
    );
  }
  place(el);
}

function reveal(c: HTMLElement, color: string) {
  c.style.color = color;
  c.classList.add("on");
  sleep(700).then(() => { c.style.color = ""; });
}

/** Wrap every visible character of a type part in a span (screen readers get the plain text). */
export function splitText(el: HTMLElement) {
  const plain = (el.textContent ?? "").replace(/\s+/g, " ").trim();
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  for (const n of nodes) {
    const frag = document.createDocumentFragment();
    for (const ch of n.data) {
      if (/\s/.test(ch)) { frag.append(ch); continue; }
      const s = document.createElement("span");
      s.className = "ch";
      s.setAttribute("aria-hidden", "true");
      s.textContent = ch;
      frag.append(s);
    }
    n.replaceWith(frag);
  }
  const sr = document.createElement("span");
  sr.className = "sr-only";
  sr.textContent = plain;
  el.prepend(sr);
}
