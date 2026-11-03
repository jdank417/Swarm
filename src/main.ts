import "./style.css";
import { renderProjects } from "./content";
import { Assembler } from "./engine/assembler";
import { orb, projectVisual } from "./visuals";

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = <T extends Element = HTMLElement>(s: string) => document.querySelector<T>(s)!;

renderProjects($("#projects"));
orb($<HTMLCanvasElement>("#orb"));
document.querySelectorAll<HTMLCanvasElement>("canvas[data-visual]").forEach(projectVisual);

// Count-up for stat numbers once their tile is placed.
document.addEventListener("assembled", (e) => {
  (e.target as HTMLElement).querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
    const end = Number(el.dataset.count), suffix = el.dataset.suffix ?? "";
    const t0 = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / 900);
      el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))) + (k === 1 ? suffix : "");
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
});

const swarm = new Assembler($<HTMLCanvasElement>("#swarm"), innerWidth < 700 ? 36 : 64);
swarm.prepare(document);

if (reduce) {
  swarm.finishAll(document);
  $("#hud").hidden = true;
} else {
  document.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => (el.textContent = "0"));
  const dots = [...document.querySelectorAll<HTMLElement>(".hud-dots i")];
  const hA = $("#hud-agents"), hP = $("#hud-parts"), hS = $("#hud-status");
  swarm.onStats = ({ agents, busy, done, total }) => {
    hA.textContent = `${agents} agents · ${busy} working`;
    hP.textContent = `${done} / ${total} parts`;
    hS.textContent = busy ? "assembling" : done === total ? "complete" : "idle";
    const on = Math.round((done / total) * dots.length);
    dots.forEach((d, i) => d.classList.toggle("on", i < on));
  };
  // Wait for web fonts so character positions are measured on final glyphs.
  Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]).then(() => {
    swarm.start();
    swarm.observe(document);
  });
}
