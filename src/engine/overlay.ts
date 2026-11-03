import type { Agent, CursorKind } from "./agent";

/** A selection box being dragged out for a real element. */
export interface Mark {
  x: number; y: number; w: number; h: number;
  label?: string;
  handles?: boolean;
  fadeAt?: number;
  fadeDur: number;
}

const BLUE = "#2a6cff";

/** Fixed full-screen canvas that draws the cursors and the boxes they drag. */
export class Overlay {
  readonly marks = new Set<Mark>();
  private ctx: CanvasRenderingContext2D;
  private dpr = 1;

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext("2d")!;
    this.resize();
    addEventListener("resize", () => this.resize());
  }

  private resize() {
    this.dpr = Math.min(2, devicePixelRatio || 1);
    this.canvas.width = innerWidth * this.dpr;
    this.canvas.height = innerHeight * this.dpr;
  }

  rect(x: number, y: number, w: number, h: number, o: Partial<Mark> = {}): Mark {
    const m: Mark = { x, y, w, h, fadeDur: 400, ...o };
    this.marks.add(m);
    return m;
  }

  fade(m: Mark, delay = 0) { m.fadeAt = performance.now() + delay; }

  draw(agents: Agent[], now: number) {
    const c = this.ctx;
    const sx = scrollX, sy = scrollY;
    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    c.clearRect(0, 0, innerWidth, innerHeight);

    for (const m of this.marks) {
      let a = 1;
      if (m.fadeAt !== undefined && now > m.fadeAt) {
        a = 1 - (now - m.fadeAt) / m.fadeDur;
        if (a <= 0) { this.marks.delete(m); continue; }
      }
      const x = Math.min(m.x, m.x + m.w) - sx, y = Math.min(m.y, m.y + m.h) - sy;
      const w = Math.abs(m.w), h = Math.abs(m.h);
      if (y > innerHeight + 40 || y + h < -40) continue;
      c.globalAlpha = a;
      c.fillStyle = "rgba(42,108,255,0.08)";
      c.fillRect(x, y, w, h);
      c.strokeStyle = BLUE;
      c.lineWidth = 1;
      c.strokeRect(Math.round(x) + 0.5, Math.round(y) + 0.5, Math.round(w), Math.round(h));
      if (m.handles) {
        c.fillStyle = "#fff";
        for (const [hx, hy] of [[x, y], [x + w, y], [x, y + h], [x + w, y + h]]) {
          c.fillRect(hx - 3, hy - 3, 6, 6);
          c.strokeRect(hx - 2.5, hy - 2.5, 6, 6);
        }
      }
      if (m.label) {
        c.font = "600 10px 'JetBrains Mono', monospace";
        const tw = c.measureText(m.label).width + 10;
        const lx = Math.max(2, x + w / 2 - tw / 2), ly = y + h + 6;
        c.fillStyle = BLUE;
        c.fillRect(lx, ly, tw, 15);
        c.fillStyle = "#fff";
        c.fillText(m.label, lx + 5, ly + 11);
      }
    }
    c.globalAlpha = 1;

    for (const ag of agents) {
      const x = ag.x - sx, y = ag.y - sy;
      if (y < -30 || y > innerHeight + 30 || x < -30 || x > innerWidth + 30) continue;
      drawCursor(c, ag.cursor, x, y, ag.color);
    }
  }
}

/* Cursor glyphs, each drawn with its hotspot at (x, y). */
function drawCursor(c: CanvasRenderingContext2D, kind: CursorKind, x: number, y: number, color: string) {
  c.save();
  c.translate(Math.round(x), Math.round(y));
  c.lineJoin = "round";
  if (kind === "arrow") {
    c.beginPath();
    c.moveTo(0, 0); c.lineTo(0, 15); c.lineTo(3.8, 11.3); c.lineTo(6.6, 17);
    c.lineTo(8.8, 16); c.lineTo(6.1, 10.4); c.lineTo(11.2, 10.4); c.closePath();
    c.fillStyle = color; c.fill();
    c.lineWidth = 1.2; c.strokeStyle = "rgba(0,0,0,0.7)"; c.stroke();
  } else if (kind === "cross") {
    const line = (w: number, s: string) => {
      c.lineWidth = w; c.strokeStyle = s;
      c.beginPath(); c.moveTo(-8, 0); c.lineTo(8, 0); c.moveTo(0, -8); c.lineTo(0, 8); c.stroke();
    };
    line(3.2, "rgba(0,0,0,0.75)"); line(1.4, color);
  } else if (kind === "text") {
    const beam = (w: number, s: string) => {
      c.lineWidth = w; c.strokeStyle = s;
      c.beginPath();
      c.moveTo(-3.5, -8); c.lineTo(-1, -8); c.moveTo(1, -8); c.lineTo(3.5, -8);
      c.moveTo(0, -7); c.lineTo(0, 7);
      c.moveTo(-3.5, 8); c.lineTo(-1, 8); c.moveTo(1, 8); c.lineTo(3.5, 8);
      c.stroke();
    };
    beam(3.2, "rgba(0,0,0,0.75)"); beam(1.4, color);
  } else {
    // open (grab) or closed (grabbing) hand
    const open = kind === "grab";
    c.fillStyle = color; c.strokeStyle = "rgba(0,0,0,0.7)"; c.lineWidth = 1.1;
    const fingerH = open ? 7 : 3;
    for (let i = 0; i < 4; i++) {
      c.beginPath();
      c.roundRect(-6 + i * 3.2, -4 - fingerH, 3, fingerH + 4, 1.5);
      c.fill(); c.stroke();
    }
    c.beginPath(); c.roundRect(-7, -3, 13, 10, 4); c.fill(); c.stroke();
    c.beginPath(); c.roundRect(-10, open ? -3 : -1, 4, 6, 2); c.fill(); c.stroke();
  }
  c.restore();
}
