import type { Agent } from "./agent";
import type { Section, Task } from "./board";
import { clamp, linear, pageRect, rand, sleep, viewRect, inView } from "./util";

/*
  What an agent actually does. Every action produces a real piece of the page:
    frame  drags out a box exactly the element's size; the element fills it
    carry  brings the element itself in and drops it in its slot
    type   streams the element's real text in, token by token, like an LLM
*/

export function place(el: HTMLElement) {
  el.classList.add("placed");
  el.dispatchEvent(new CustomEvent("assembled", { bubbles: true }));
}

/** Short human-readable description of a task for status tags and the feed. */
export function describe(t: Task): string {
  const text = t.el.dataset.label ?? t.el.querySelector(".sr-only")?.textContent ?? words(t.el);
  const short = text.length > 22 ? text.slice(0, 21) + "…" : text;
  if (t.kind === "type") return `writing "${short}"`;
  if (t.kind === "carry") return `placing "${short}"`;
  const r = t.el.getBoundingClientRect();
  const what = t.el.classList.contains("card") ? "card" : t.el.classList.contains("repo") ? "repo card" : "panel";
  return `framing ${what} ${Math.round(r.width)}×${Math.round(r.height)}`;
}

/** Text of an element with a space between separate text nodes and at line breaks. */
function words(el: HTMLElement): string {
  const out: string[] = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  while (walker.nextNode()) {
    const n = walker.currentNode;
    if (n.nodeType === Node.TEXT_NODE) out.push(n.textContent ?? "");
    else if ((n as Element).tagName === "BR") out.push(" ");
    else out.push(" ");
  }
  return out.join("").replace(/\s+/g, " ").trim();
}

/** Pause to "think" before acting, already drifting toward the job. */
async function think(a: Agent, label: string, el: HTMLElement) {
  a.say(label, true);
  const r = pageRect(el);
  const k = rand(0.15, 0.3);
  await a.moveTo(a.x + (r.x + r.w / 2 - a.x) * k, a.y + (r.y + r.h / 2 - a.y) * k, { dur: rand(500, 1100) });
  a.say(label);
}

/* SCOUT: look over a newly visible section, then post its tasks to the board. */
export async function scout(a: Agent, s: Section) {
  const r = pageRect(s.el);
  const v = viewRect();
  const top = clamp(r.y + 24, v.y + 80, v.y + v.h - 120);
  const bottom = clamp(r.y + r.h - 24, top + 40, v.y + v.h - 80);
  a.cursor = "arrow";
  a.say(`scouting ${s.name}`, true);
  await a.moveTo(r.x + 20, top);
  await a.moveTo(r.x + r.w - 20, top + (bottom - top) * 0.35, { dur: clamp(r.w * 1.1, 600, 1300) });
  await a.moveTo(r.x + r.w * 0.4, bottom, { dur: 700 });
  a.say(`planned ${s.tasks.length} tasks`);
  await sleep(500);
}

export async function perform(a: Agent, t: Task) {
  const label = describe(t);
  await think(a, label, t.el);
  if (t.kind === "frame") await frame(a, t.el, label);
  else if (t.kind === "carry") await carry(a, t.el);
  else await type(a, t.el);
  a.cursor = "arrow";
}

async function frame(a: Agent, el: HTMLElement, label: string) {
  const r = pageRect(el);
  const layer = a.el.parentElement!;
  a.cursor = "arrow";
  await a.moveTo(r.x, r.y);
  await a.settle();
  a.cursor = "cross";
  await sleep(rand(150, 280));

  const box = document.createElement("div");
  box.className = "sel";
  box.style.setProperty("--c", a.color);
  box.innerHTML = `<span class="sel-dim"></span>`;
  const dim = box.firstElementChild as HTMLElement;
  layer.appendChild(box);
  const stop = a.follow((x, y) => {
    const w = Math.max(0, x - r.x), h = Math.max(0, y - r.y);
    box.style.left = `${r.x}px`;
    box.style.top = `${r.y}px`;
    box.style.width = `${w}px`;
    box.style.height = `${h}px`;
    dim.textContent = `${Math.round(w)} × ${Math.round(h)}`;
  });
  await a.moveTo(r.x + r.w, r.y + r.h, { dur: clamp(Math.hypot(r.w, r.h) * 1.7, 700, 1900), curve: 0 });
  await a.settle();
  stop();
  box.style.width = `${r.w}px`;
  box.style.height = `${r.h}px`;
  dim.textContent = label.replace(/^framing \S+( card)? /, "");
  await sleep(rand(120, 220));
  place(el);
  box.classList.add("out");
  setTimeout(() => box.remove(), 400);
  a.cursor = "arrow";
}

async function carry(a: Agent, el: HTMLElement) {
  el.style.transform = "";
  const r = pageRect(el);
  const v = viewRect();
  const reach = clamp(r.w + 90, 110, 300);
  let sx = r.w > v.w - 32 ? r.x : clamp(r.x + rand(-1, 1) * reach, v.x + 8, v.x + v.w - r.w - 8);
  let sy = r.y + (Math.random() < 0.5 ? -1 : 1) * rand(50, 150);
  if (inView(r)) sy = clamp(sy, v.y + 70, Math.max(v.y + 70, v.y + v.h - r.h - 50));
  else sx = clamp(sx, 8, Math.max(8, document.documentElement.clientWidth - r.w - 8));
  const g = { x: r.w * rand(0.3, 0.7), y: r.h * rand(0.35, 0.65) };

  a.cursor = "arrow";
  await a.moveTo(sx + g.x, sy + g.y);
  await a.settle();
  // The piece appears under the cursor and is carried by the visible cursor.
  el.classList.add("lifted");
  const stop = a.follow((x, y) => { el.style.transform = `translate(${x - g.x - r.x}px, ${y - g.y - r.y}px)`; });
  a.cursor = "grab";
  await sleep(rand(160, 280));
  a.cursor = "grabbing";
  await a.moveTo(r.x + g.x, r.y + g.y, { dur: clamp(Math.hypot(sx - r.x, sy - r.y) * 2 + 450, 800, 1800), curve: rand(-0.1, 0.1) });
  await a.settle();
  stop();
  el.style.transform = "";
  el.classList.remove("lifted");
  place(el);
  a.cursor = "grab";
  await sleep(rand(120, 220));
}

export function chars(el: HTMLElement): HTMLElement[] {
  return Array.from(el.querySelectorAll<HTMLElement>(".ch"));
}

async function type(a: Agent, el: HTMLElement) {
  const cs = chars(el).filter((c) => !c.classList.contains("on"));
  if (cs.length) {
    const rects = cs.map((c) => pageRect(c));
    // Group characters into 2-5 character tokens, breaking at gaps and line wraps.
    const tokens: number[][] = [];
    let cur: number[] = [];
    let len = (2 + Math.random() * 4) | 0;
    for (let i = 0; i < cs.length; i++) {
      const prev = rects[i - 1];
      const gap = prev && (rects[i].x - (prev.x + prev.w) > 2 || rects[i].y > prev.y + prev.h / 2);
      if (cur.length && (cur.length >= len || gap)) { tokens.push(cur); cur = []; len = (2 + Math.random() * 4) | 0; }
      cur.push(i);
    }
    if (cur.length) tokens.push(cur);

    const r0 = rects[0];
    a.cursor = "arrow";
    await a.moveTo(r0.x, r0.y + r0.h / 2);
    await a.settle();
    a.cursor = "text";
    await sleep(rand(150, 260));
    for (const tok of tokens) {
      for (const i of tok) reveal(cs[i], a.color);
      const last = rects[tok[tok.length - 1]];
      await a.moveTo(last.x + last.w + 1, last.y + last.h / 2, { dur: rand(45, 95), curve: 0, ease: linear });
      if (Math.random() < 0.06) await sleep(rand(120, 300));
    }
  }
  place(el);
}

function reveal(c: HTMLElement, color: string) {
  c.style.color = color;
  c.classList.add("on");
  sleep(900).then(() => { c.style.color = ""; });
}

/** Wrap every visible character of a type part in a span (screen readers get the plain text). */
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
