import "./style.css";
import { render } from "./pages";
import { Swarm } from "./engine/swarm";

// Always start at the top so the swarm builds the page from the beginning.
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
if (!location.hash) scrollTo(0, 0);

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
render(document.getElementById("app")!);

const swarm = new Swarm(
  document.getElementById("agents")!,
  [document.getElementById("ruler-top") as HTMLCanvasElement, document.getElementById("ruler-left") as HTMLCanvasElement],
  innerWidth < 700 ? 16 : 28,
);
swarm.prepare(document);

const logo = document.getElementById("intro-logo");
if (reduce) {
  swarm.finishAll(document);
  logo?.remove();
} else {
  // Wait for web fonts so character positions are measured on final glyphs.
  Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]).then(() => {
    swarm.observe(document);
    swarm.start(logo, 1100);
  });
}
