import type { Agent } from "./agent";
import type { Overlay } from "./overlay";
import { clamp, easeInOut, linear, pageRect, rand, sleep, viewRect } from "./util";

export type Kind = "frame" | "carry" | "type";

const size = (m: { w: number; h: number }) => `${Math.round(m.w)} × ${Math.round(m.h)}`;

/** How many cursors a part needs. */
export function crewSize(el: HTMLElement, kind: Kind): number {
  const r = el.getBoundingClientRect();
  if (kind === "type") return clamp(Math.ceil(chars(el).length / 38), 1, 6);
  if (kind === "carry") return r.width > 240 ? 2 : 1;
  return r.width * r.height > 60000 ? 2 : 1;
}

export function run(kind: Kind, el: HTMLElement, crew: Agent[], ov: Overlay): Promise<void> {
  if (kind === "frame") return frame(el, crew, ov);
  if (kind === "carry") return carry(el, crew, ov);
  return type(el, crew, ov);
}

/** Mark a part as built and let listeners (counters etc.) react. */
export function place(el: HTMLElement) {
  el.classList.add("placed");
  el.dispatchEvent(new CustomEvent("assembled", { bubbles: true }));
}

/* ---------------------------------------------------------------
   FRAME — drag out a selection box, then the element materializes.
   With two cursors, both press at one point and pull opposite corners.
   --------------------------------------------------------------- */
async function frame(el: HTMLElement, crew: Agent[], ov: Overlay) {
  const r = pageRect(el);
  const [a, b] = crew;
  const dur = clamp(Math.hypot(r.w, r.h) * 0.8, 380, 900);

  if (b) {
    const cx = r.x + r.w * rand(0.35, 0.65);
    const cy = r.y + r.h * rand(0.35, 0.65);
    await Promise.all([a.moveTo(cx, cy), b.moveTo(cx + 1, cy + 1)]);
    a.pressed = b.pressed = true;
    const m = ov.rect(cx, cy, 0, 0, { handles: true, fill: true });
    const sync = () => {
      m.x = Math.min(a.x, b.x); m.y = Math.min(a.y, b.y);
      m.w = Math.abs(a.x - b.x); m.h = Math.abs(a.y - b.y);
      m.label = size(m);
    };
    await Promise.all([
      a.moveTo(r.x, r.y, { dur, curve: 0, onUpdate: sync }),
      b.moveTo(r.x + r.w, r.y + r.h, { dur, curve: 0, onUpdate: sync }),
    ]);
    sync();
    place(el);
    a.pressed = b.pressed = false;
    ov.fade(m, 300, 500);
  } else {
    await a.moveTo(r.x, r.y);
    a.pressed = true;
    const m = ov.rect(r.x, r.y, 0, 0, { handles: true, fill: true });
    const sync = () => { m.w = a.x - r.x; m.h = a.y - r.y; m.label = size(m); };
    await a.moveTo(r.x + r.w, r.y + r.h, { dur, curve: 0, onUpdate: sync });
    sync();
    place(el);
    a.pressed = false;
    ov.fade(m, 300, 500);
  }
  await sleep(120);
}

/* ---------------------------------------------------------------
   CARRY — the piece appears somewhere nearby, cursors grab it and
   drag it into its slot, where snap guides flash.
   --------------------------------------------------------------- */
async function carry(el: HTMLElement, crew: Agent[], ov: Overlay) {
  el.style.transform = "";
  const r = pageRect(el);
  const v = viewRect();
  const reach = clamp(r.w * 1.2 + 120, 140, 380);
  const sx = r.w > v.w - 32 ? r.x : clamp(r.x + rand(-1, 1) * reach, v.x + 8, v.x + v.w - r.w - 8);
  const sy = clamp(r.y + (Math.random() < 0.5 ? -1 : 1) * rand(70, 200), v.y + 70, Math.max(v.y + 70, v.y + v.h - r.h - 50));
  const [a, b] = crew;
  const g = { x: r.w * (b ? rand(0.18, 0.35) : rand(0.3, 0.7)), y: r.h * rand(0.35, 0.65) };

  await Promise.all([
    a.moveTo(sx + g.x, sy + g.y),
    b?.moveTo(sx + r.w * rand(0.65, 0.82), sy + r.h * rand(0.35, 0.65)),
  ]);

  // Materialize at the pickup spot and grab it.
  const set = (ox: number, oy: number) => { el.style.transform = `translate(${ox}px, ${oy}px)`; };
  set(sx - r.x, sy - r.y);
  el.classList.add("lifted");
  const sel = ov.rect(sx, sy, r.w, r.h, { handles: true });
  a.pressed = true;
  if (b) { b.pressed = true; b.attach(a); }
  await sleep(140);

  const dist = Math.hypot(sx - r.x, sy - r.y);
  await a.moveTo(r.x + g.x, r.y + g.y, {
    dur: clamp(dist * 1.1 + 220, 380, 950),
    curve: rand(-0.15, 0.15),
    ease: easeInOut,
    onUpdate: () => {
      const ox = a.x - g.x - r.x, oy = a.y - g.y - r.y;
      set(ox, oy);
      sel.x = r.x + ox; sel.y = r.y + oy;
    },
  });

  el.style.transform = "";
  el.classList.remove("lifted");
  place(el);
  sel.x = r.x; sel.y = r.y;
  ov.fade(sel, 150, 400);
  const vv = viewRect();
  ov.guide(vv.x, r.y, vv.x + vv.w, r.y);
  ov.guide(r.x, r.y - 80, r.x, r.y + r.h + 80);
  a.pressed = false;
  if (b) { b.detach(); b.pressed = false; }
  await sleep(100);
}

/* ---------------------------------------------------------------
   TYPE — the text is split into characters; each cursor takes a
   run of characters and types it, the cursor acting as the caret.
   --------------------------------------------------------------- */
export function chars(el: HTMLElement): HTMLElement[] {
  return Array.from(el.querySelectorAll<HTMLElement>(".ch"));
}

async function type(el: HTMLElement, crew: Agent[], ov: Overlay) {
  const cs = chars(el).filter((c) => !c.classList.contains("on"));
  if (cs.length) {
    const rects = cs.map((c) => pageRect(c));
    const chunk = Math.ceil(cs.length / crew.length);
    await Promise.all(
      crew.map(async (a, i) => {
        const s = i * chunk, e = Math.min(cs.length, s + chunk);
        if (s >= e) return;
        const r0 = rects[s];
        await a.moveTo(r0.x, r0.y + r0.h * 0.78);
        a.pressed = true;
        for (let j = s; j < e; j++) {
          const r = rects[j];
          await a.moveTo(r.x + r.w, r.y + r.h * 0.78, { dur: clamp(r.w * 1.1, 12, 34), curve: 0, ease: linear });
          reveal(cs[j]);
        }
        a.pressed = false;
      }),
    );
  }
  const r = pageRect(el);
  ov.fade(ov.rect(r.x - 3, r.y - 2, r.w + 6, r.h + 4), 120, 450);
  place(el);
}

function reveal(c: HTMLElement) {
  c.classList.add("on", "hot");
  setTimeout(() => c.classList.remove("hot"), 200);
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
