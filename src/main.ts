import "./style.css";
import { renderProjects, renderRepos, renderStack } from "./content";
import { Swarm } from "./engine/swarm";
import { orb, projectVisual } from "./visuals";

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = <T extends Element = HTMLElement>(s: string) => document.querySelector<T>(s)!;

renderProjects($("#projects"));
renderStack($("#stack-grid"));
renderRepos($("#repo-grid"));
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

const small = innerWidth < 700;
const swarm = new Swarm($("#agents"), $<HTMLOListElement>("#feed-log"), small ? 14 : 28);
swarm.prepare(document);

if (reduce) {
  swarm.finishAll(document);
  $("#feed").hidden = true;
} else {
  document.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => (el.textContent = "0"));
  const fA = $("#feed-agents"), fP = $("#feed-parts");
  swarm.onStats = ({ agents, working, done, total }) => {
    fA.textContent = `${agents} agents · ${working} working`;
    fP.textContent = `${done}/${total} built`;
  };
  // Wait for web fonts so character positions are measured on final glyphs.
  Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]).then(() => {
    swarm.observe(document);
    swarm.start();
  });
}
