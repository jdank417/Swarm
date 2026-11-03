import "./style.css";
import { renderProjects, renderRepos, renderStack, renderStrip, renderTerm } from "./content";
import { Swarm } from "./engine/swarm";
import { projectVisual } from "./visuals";

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = <T extends Element = HTMLElement>(s: string) => document.querySelector<T>(s)!;

renderTerm($("#term-rows"));
renderStrip($("#strip-chips"));
renderProjects($("#projects"));
renderStack($("#stack-grid"));
renderRepos($("#repo-grid"));
document.querySelectorAll<HTMLCanvasElement>("canvas[data-visual]").forEach(projectVisual);

const small = innerWidth < 700;
const swarm = new Swarm($("#agents"), [$<HTMLCanvasElement>("#ruler-top"), $<HTMLCanvasElement>("#ruler-left")], small ? 14 : 24);
swarm.prepare(document);

if (reduce) {
  swarm.finishAll(document);
  $("#intro-logo").remove();
} else {
  // Wait for web fonts so character positions are measured on final glyphs.
  Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]).then(() => {
    swarm.observe(document);
    swarm.start(document.getElementById("intro-logo"));
  });
}
