export type Rect = { x: number; y: number; w: number; h: number };

export const rand = (a: number, b: number) => a + Math.random() * (b - a);
export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export const pick = <T>(arr: T[]) => arr[(Math.random() * arr.length) | 0];

export const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
export const linear = (t: number) => t;

/** Element rect in page (document) coordinates. */
export function pageRect(el: Element): Rect {
  const r = el.getBoundingClientRect();
  return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height };
}

/** Current viewport in page coordinates. */
export function viewRect(): Rect {
  return { x: scrollX, y: scrollY, w: innerWidth, h: innerHeight };
}

export function inView(r: Rect, margin = 0): boolean {
  const v = viewRect();
  return r.y + r.h > v.y - margin && r.y < v.y + v.h + margin;
}

export const sleep = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));
