import type { Rect } from "./util";

/**
 * Pixel rulers along the top and left edges, like a design tool. Ranges that
 * agents are currently working on light up in blue.
 */
export class Rulers {
  private top: CanvasRenderingContext2D;
  private left: CanvasRenderingContext2D;
  private dpr = 1;

  constructor(private topEl: HTMLCanvasElement, private leftEl: HTMLCanvasElement, readonly size = 18) {
    this.top = topEl.getContext("2d")!;
    this.left = leftEl.getContext("2d")!;
    this.resize();
    addEventListener("resize", () => this.resize());
  }

  private resize() {
    this.dpr = Math.min(2, devicePixelRatio || 1);
    this.topEl.width = innerWidth * this.dpr;
    this.topEl.height = this.size * this.dpr;
    this.leftEl.width = this.size * this.dpr;
    this.leftEl.height = innerHeight * this.dpr;
  }

  draw(active: Iterable<Rect>, pointer: { x: number; y: number } | null) {
    const s = this.size, sx = scrollX, sy = scrollY;
    const W = innerWidth, H = innerHeight;

    for (const [c, len, horiz] of [[this.top, W, true], [this.left, H, false]] as const) {
      c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      c.fillStyle = "#1b1d21";
      c.fillRect(0, 0, horiz ? len : s, horiz ? s : len);
      // Active ranges
      c.fillStyle = "rgba(42,108,255,0.32)";
      for (const r of active) {
        if (horiz) c.fillRect(r.x - sx, 0, r.w, s);
        else c.fillRect(0, r.y - sy, s, r.h);
      }
      // Ticks every 10px, labels every 100px (page coordinates)
      const off = horiz ? sx : sy;
      c.strokeStyle = "rgba(255,255,255,0.22)";
      c.fillStyle = "rgba(255,255,255,0.45)";
      c.font = "9px 'JetBrains Mono', monospace";
      c.lineWidth = 1;
      c.beginPath();
      for (let v = Math.floor(off / 10) * 10; v < off + len; v += 10) {
        const p = Math.round(v - off) + 0.5;
        const t = v % 100 === 0 ? s * 0.6 : v % 50 === 0 ? s * 0.4 : s * 0.22;
        if (horiz) { c.moveTo(p, s); c.lineTo(p, s - t); } else { c.moveTo(s, p); c.lineTo(s - t, p); }
        if (v % 100 === 0) {
          if (horiz) c.fillText(String(v), p + 3, 9);
          else { c.save(); c.translate(9, p + 3); c.rotate(-Math.PI / 2); c.fillText(String(v), -c.measureText(String(v)).width - 2, 0); c.restore(); }
        }
      }
      c.stroke();
      if (pointer) {
        c.fillStyle = "#ff5a4e";
        if (horiz) c.fillRect(pointer.x, 0, 1, s); else c.fillRect(0, pointer.y, s, 1);
      }
      c.fillStyle = "#1b1d21";
      c.fillRect(0, 0, s, s);
    }
  }
}
