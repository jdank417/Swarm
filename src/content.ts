/* =========================================================
   Projects — edit this list to update the Work section.
   visual: "mesh" | "radar" | "bars" | "line"
   ========================================================= */
export interface Project {
  kicker: string;
  title: string;
  desc: string;
  tags: string[];
  link: string;
  visual: "mesh" | "radar" | "bars" | "line";
}

export const PROJECTS: Project[] = [
  {
    kicker: "Biometric authentication",
    title: "HumanAuth",
    desc: "Full-stack liveness and identity verification using real-time face and hand landmark detection. Flask API with MediaPipe models and an Angular client with live landmark visualization.",
    tags: ["Python", "Flask", "MediaPipe", "Angular", "TypeScript"],
    link: "https://github.com/Dexteritize/HumanAuth",
    visual: "mesh",
  },
  {
    kicker: "Sailing software",
    title: "Regatta Positioning System",
    desc: "Tracking and positioning for sailboat racing. Boats, marks and courses on a live operational view.",
    tags: ["Real-time", "Geospatial", "Web"],
    link: "https://github.com/jdank417/RPS",
    visual: "radar",
  },
  {
    kicker: "Applied ML",
    title: "Sailing LLM",
    desc: "A Flan-T5 language model fine-tuned on sailing knowledge to answer domain questions.",
    tags: ["Python", "Transformers", "Fine-tuning"],
    link: "https://github.com/jdank417/Flan-t5-sailing-JasonDank",
    visual: "bars",
  },
  {
    kicker: "Forecasting",
    title: "Market Predictions",
    desc: "Deep learning experiments for forecasting stock market movement from historical price data.",
    tags: ["Python", "Deep Learning", "Time series"],
    link: "https://github.com/jdank417/Deep-Learning-for-Stock-Market-Predictions",
    visual: "line",
  },
];

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function renderProjects(host: HTMLElement) {
  host.innerHTML = PROJECTS.map((p) => `
    <article class="project" data-assemble="project.${slug(p.title)}">
      <div class="p-copy">
        <div class="p-kicker" data-part="type">${esc(p.kicker)}</div>
        <h3 class="p-title" data-part="type">${esc(p.title)}</h3>
        <p class="p-desc" data-part="type">${esc(p.desc)}</p>
        <ul class="p-tags">${p.tags.map((t) => `<li data-part="carry">${esc(t)}</li>`).join("")}</ul>
        <a class="p-link" data-part="carry" href="${esc(p.link)}" target="_blank" rel="noopener">View ${esc(p.title)} ↗</a>
      </div>
      <div class="p-visual" data-part="frame">
        <span class="live-badge"><i class="dot live"></i>LIVE</span>
        <canvas data-visual="${p.visual}"></canvas>
      </div>
    </article>`).join("");
}
