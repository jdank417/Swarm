import type { Agent } from "./agent";
import type { Task } from "./board";
import { Overlay } from "./overlay";
import { clamp, linear, pageRect, rand, sleep, type Rect } from "./util";

/*
  The design-tool gestures agents use. Each one produces a real element of the
  page in place: the overlay drawn during the gesture sits exactly where the
  element appears, and is removed the moment the element takes over.
*/

export function place(el: HTMLElement) {
  el.classList.add("placed");
  el.dispatchEvent(new CustomEvent("assembled", { bubbles: true }));
}

export async function perform(a: Agent, t: Task, ov: Overlay) {
  const r = pageRect(t.kind === "dup" && t.source ? t.source : t.el);
  // A brief pause to "decide", already drifting toward the job.
  const k = rand(0.1, 0.25);
  await a.moveTo(a.x + (r.x + r.w / 2 - a.x) * k, a.y + (r.y + r.h / 2 - a.y) * k, { dur: rand(160, 420) });
  if (t.kind === "line") await line(a, t.el, ov);
  else if (t.kind === "rect") await rect(a, t.el, ov);
  else if (t.kind === "text") await text(a, t.el, ov);
  else await dup(a, t, ov);
  a.cursor = "arrow";
}

/* LINE: drag a hairline from one end to the other. */
async function line(a: Agent, el: HTMLElement, ov: Overlay) {
  const r = pageRect(el);
  const horiz = r.w >= r.h;
  a.cursor = "arrow";
  await a.moveTo(r.x, r.y);
  await a.settle();
  a.cursor = "cross";
  await sleep(rand(80, 160));
  const b = ov.box(`lbox ${horiz ? "h" : "v"}`, a.color);
  ov.active.add(r);
  const stop = a.follow((x, y) => {
    if (horiz) Overlay.place(b, r.x, r.y, clamp(x - r.x, 0, r.w), 1);
    else Overlay.place(b, r.x, r.y, 1, clamp(y - r.y, 0, r.h));
  });
  const len = horiz ? r.w : r.h;
  await a.moveTo(horiz ? r.x + r.w : r.x, horiz ? r.y : r.y + r.h, { dur: clamp(len * 0.7, 380, 1500), curve: 0 });
  await a.settle();
  stop();
  place(el);
  ov.active.delete(r);
  ov.fadeOut(b, 250);
}

/* RECT: drag out a grey placeholder, then fill it with the element's real style. */
async function rect(a: Agent, el: HTMLElement, ov: Overlay) {
  const r = pageRect(el);
  a.cursor = "arrow";
  await a.moveTo(r.x, r.y);
  await a.settle();
  a.cursor = "cross";
  await sleep(rand(80, 160));
  const b = ov.box("rbox", a.color);
  b.innerHTML = `<span class="dim"></span>`;
  const dim = b.firstElementChild as HTMLElement;
  ov.active.add(r);
  const unguide = ov.guides(r.x, r.y);
  const stop = a.follow((x, y) => {
    const w = clamp(x - r.x, 0, r.w + 40), h = clamp(y - r.y, 0, r.h + 40);
    Overlay.place(b, r.x, r.y, w, h);
    dim.textContent = `${Math.round(w)} × ${Math.round(h)}`;
  });
  await a.moveTo(r.x + r.w, r.y + r.h, { dur: clamp(Math.hypot(r.w, r.h) * 1.1, 450, 1300), curve: 0 });
  await a.settle();
  stop();
  Overlay.place(b, r.x, r.y, r.w, r.h);
  dim.textContent = `${Math.round(r.w)} × ${Math.round(r.h)}`;
  await sleep(rand(80, 160));

  // Fill: the placeholder takes on the element's background, radius and border.
  const cs = getComputedStyle(el);
  const bw = parseFloat(cs.borderTopWidth) || 0;
  b.classList.add("fill");
  b.style.background = cs.backgroundColor;
  b.style.borderRadius = cs.borderRadius;
  b.style.boxShadow = bw ? `inset 0 0 0 ${bw}px ${cs.borderTopColor}` : "none";
  a.cursor = "arrow";
  await sleep(280);
  place(el);
  ov.active.delete(r);
  unguide();
  ov.fadeOut(b, 120);
}

/* TEXT: drag out a text box around exactly where the text goes, then type it. */
async function text(a: Agent, el: HTMLElement, ov: Overlay) {
  const cs = chars(el).filter((c) => !c.classList.contains("on"));
  const rects = cs.map((c) => pageRect(c));
  const r = union(rects) ?? pageRect(el);
  a.cursor = "arrow";
  await a.moveTo(r.x, r.y);
  await a.settle();
  a.cursor = "text";
  await sleep(rand(60, 140));
  const b = ov.box("tbox", a.color);
  ov.active.add(r);
  const unguide = ov.guides(r.x, r.y);
  const stop = a.follow((x, y) => Overlay.place(b, r.x, r.y, clamp(x - r.x, 0, r.w), clamp(y - r.y, 0, r.h)));
  await a.moveTo(r.x + r.w, r.y + r.h, { dur: clamp(Math.hypot(r.w, r.h) * 0.8, 320, 900), curve: 0 });
  await a.settle();
  stop();
  Overlay.place(b, r.x, r.y, r.w, r.h);
  await typeChars(a, cs, rects);
  place(el);
  ov.active.delete(r);
  unguide();
  ov.fadeOut(b, 250);
}

/* DUP: alt-drag a copy of the first item into this slot, then retype its text. */
async function dup(a: Agent, t: Task, ov: Overlay) {
  const src = t.source!, el = t.el;
  const s = pageRect(src), d = pageRect(el);
  const g = { x: s.w * rand(0.35, 0.65), y: s.h * rand(0.35, 0.65) };
  a.cursor = "arrow";
  await a.moveTo(s.x + g.x, s.y + g.y);
  await a.settle();
  a.cursor = "copy";
  await sleep(rand(120, 220));

  // The copy lives next to the original so it keeps the same styling.
  const parent = el.parentElement!;
  const pr = pageRect(parent);
  const ghost = src.cloneNode(true) as HTMLElement;
  ghost.classList.add("ghost");
  ghost.setAttribute("aria-hidden", "true");
  ghost.removeAttribute("id");
  ghost.querySelectorAll("[id]").forEach((n) => n.removeAttribute("id"));
  Object.assign(ghost.style, {
    position: "absolute", margin: "0", left: `${s.x - pr.x - parent.clientLeft}px`, top: `${s.y - pr.y - parent.clientTop}px`,
    width: `${s.w}px`, height: `${s.h}px`,
  });
  parent.appendChild(ghost);
  const badge = ov.box("dupbadge", a.color);
  ov.active.add(d);
  const stop = a.follow((x, y) => {
    const ox = x - (s.x + g.x), oy = y - (s.y + g.y);
    ghost.style.transform = `translate(${ox}px, ${oy}px)`;
    badge.style.left = `${s.x + ox + s.w + 4}px`;
    badge.style.top = `${s.y + oy - 10}px`;
    badge.textContent = `${Math.round(Math.hypot(ox, oy))}`;
  });
  await a.moveTo(d.x + g.x, d.y + g.y, { dur: clamp(Math.hypot(d.x - s.x, d.y - s.y) * 1.2 + 300, 500, 1500) });
  await a.settle();
  stop();
  ghost.style.transform = `translate(${d.x - s.x}px, ${d.y - s.y}px)`;
  ghost.style.width = `${d.w}px`;
  ghost.style.height = `${d.h}px`;
  ghost.classList.add("dropped");
  ov.fadeOut(badge, 200);
  place(el);
  a.cursor = "arrow";

  // Retype each copied text with this item's own text.
  const rootIsText = el.dataset.origPart === "text";
  const targets = [...(rootIsText ? [el] : []), ...el.querySelectorAll<HTMLElement>('[data-part="text"]')];
  const olds = targets.map((tt) => resolvePath(ghost, pathOf(el, tt)));
  if (!rootIsText) {
    // Only the copied text stays visible over the new item until it's retyped.
    ghost.style.visibility = "hidden";
    for (const o of olds) if (o) o.style.visibility = "visible";
  }
  for (let i = 0; i < targets.length; i++) await retype(a, olds[i], targets[i], ov);
  ov.active.delete(d);
  ghost.remove();
}

async function retype(a: Agent, old: HTMLElement | null, el: HTMLElement, ov: Overlay) {
  const cs = chars(el);
  const rects = cs.map((c) => pageRect(c));
  const r = union(rects) ?? pageRect(el);
  const o = old ? pageRect(old) : r;
  a.cursor = "text";
  await a.moveTo(o.x + o.w + 1, o.y + o.h / 2);
  await a.settle();
  if (old) {
    old.classList.add("selecting");
    await sleep(rand(260, 420));
    old.style.visibility = "hidden";
  }
  const b = ov.box("tbox", a.color);
  Overlay.place(b, r.x, r.y, r.w, r.h);
  await typeChars(a, cs, rects);
  place(el);
  ov.fadeOut(b, 250);
}

/* Typing: characters arrive in small bursts, the I-beam riding at the end. */
async function typeChars(a: Agent, cs: HTMLElement[], rects: Rect[]) {
  if (!cs.length) return;
  const r0 = rects[0];
  await a.moveTo(r0.x, r0.y + r0.h / 2, { dur: 160, curve: 0 });
  let i = 0;
  while (i < cs.length) {
    const n = Math.min(cs.length - i, 1 + ((Math.random() * 3) | 0));
    for (let j = 0; j < n; j++) reveal(cs[i + j], a.color);
    i += n;
    const last = rects[i - 1];
    await a.moveTo(last.x + last.w + 1, last.y + last.h / 2, { dur: rand(30, 70), curve: 0, ease: linear });
  }
}

function reveal(c: HTMLElement, color: string) {
  c.style.color = color;
  c.classList.add("on");
  sleep(700).then(() => { c.style.color = ""; });
}

export function chars(el: HTMLElement): HTMLElement[] {
  return Array.from(el.querySelectorAll<HTMLElement>(".ch"));
}

function union(rs: Rect[]): Rect | null {
  if (!rs.length) return null;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const r of rs) { x0 = Math.min(x0, r.x); y0 = Math.min(y0, r.y); x1 = Math.max(x1, r.x + r.w); y1 = Math.max(y1, r.y + r.h); }
  return { x: x0 - 2, y: y0 - 1, w: x1 - x0 + 4, h: y1 - y0 + 2 };
}

function pathOf(root: Element, node: Element): number[] {
  const path: number[] = [];
  for (let n: Element | null = node; n && n !== root; n = n.parentElement) {
    path.unshift([...n.parentElement!.children].indexOf(n));
  }
  return path;
}

function resolvePath(root: Element, path: number[]): HTMLElement | null {
  let n: Element | undefined = root;
  for (const i of path) n = n?.children[i];
  return (n as HTMLElement) ?? null;
}

/** Text of an element with spaces between separate text nodes and at line breaks. */
export function words(el: HTMLElement): string {
  const out: string[] = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  while (walker.nextNode()) {
    const n = walker.currentNode;
    out.push(n.nodeType === Node.TEXT_NODE ? n.textContent ?? "" : " ");
  }
  return out.join("").replace(/\s+/g, " ").trim();
}

/** Wrap every visible character of a text part in a span (screen readers get the plain text). */
export function splitText(el: HTMLElement) {
  const plain = words(el);
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
