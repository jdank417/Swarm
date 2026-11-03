import type { Rect } from "./util";

/**
 * Construction aids drawn in page coordinates: selection boxes, alignment
 * guides, and the set of rects currently being worked on (shown on the rulers).
 */
export class Overlay {
  readonly active = new Set<Rect>();
  constructor(readonly layer: HTMLElement) {}

  box(cls: string, color: string): HTMLDivElement {
    const b = document.createElement("div");
    b.className = cls;
    b.style.setProperty("--c", color);
    this.layer.appendChild(b);
    return b;
  }

  static place(el: HTMLElement, x: number, y: number, w: number, h: number) {
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.width = `${Math.max(0, w)}px`;
    el.style.height = `${Math.max(0, h)}px`;
  }

  /** Dotted blue guides through a point, across the page width / viewport height. */
  guides(x: number, y: number): () => void {
    const h = this.box("guide h", "");
    const v = this.box("guide v", "");
    h.style.top = `${y}px`;
    v.style.left = `${x}px`;
    v.style.top = `${scrollY}px`;
    v.style.height = `${innerHeight}px`;
    return () => { h.classList.add("out"); v.classList.add("out"); setTimeout(() => { h.remove(); v.remove(); }, 300); };
  }

  fadeOut(el: HTMLElement, ms = 300) {
    el.classList.add("out");
    setTimeout(() => el.remove(), ms);
  }
}
