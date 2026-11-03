import "./style.css";
import { render, type Page } from "./pages";
import { Swarm } from "./engine/swarm";

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const page = (document.body.dataset.page ?? "home") as Page;
render(page, document.getElementById("app")!);

const small = innerWidth < 700;
const swarm = new Swarm(
  document.getElementById("agents")!,
  [document.getElementById("ruler-top") as HTMLCanvasElement, document.getElementById("ruler-left") as HTMLCanvasElement],
  small ? 14 : 24,
);
swarm.prepare(document);

const logo = document.getElementById("intro-logo");
if (reduce) {
  swarm.finishAll(document);
  logo?.remove();
} else {
  // A full intro on the first page of a visit, a quick one after that.
  let seen = false;
  try { seen = sessionStorage.getItem("swarm-intro") === "1"; sessionStorage.setItem("swarm-intro", "1"); } catch { /* storage blocked */ }
  // Wait for web fonts so character positions are measured on final glyphs.
  Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]).then(() => {
    swarm.observe(document);
    swarm.start(logo, seen ? 350 : 1100);
  });
}
