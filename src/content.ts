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

/** Other public repos shown in the "More on GitHub" index. Names and links only. */
export const REPOS = [
  "Lime", "CodeWit", "GroceryBarcodeScanner", "HotTracks", "CrimsonBoard", "HUIT_BOT",
  "StockAnalysisPlatformV2", "InternshipGetter", "OperationPickle", "Gitme", "DankNotch", "Remote_Monitering",
];

/** Tools that appear in the projects above. */
export const STACK: { group: string; items: string[] }[] = [
  { group: "Languages", items: ["Python", "TypeScript", "JavaScript", "HTML", "CSS"] },
  { group: "Frameworks", items: ["Flask", "Angular", "Vite"] },
  { group: "ML & Vision", items: ["MediaPipe", "Transformers", "Flan-T5", "Deep learning"] },
  { group: "Tooling", items: ["Git", "GitHub Actions", "GitHub Pages", "REST APIs"] },
];

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const chip = (t: string) => `<li class="chip" data-part="rect"><span data-part="text">${esc(t)}</span></li>`;

export function renderProjects(host: HTMLElement) {
  host.innerHTML = PROJECTS.map((p, i) => `
    <section class="sec" data-assemble="project.${slug(p.title)}">
      <div class="wrap project${i % 2 ? " flip" : ""}">
        <i class="vl l" data-part="line"></i><i class="vl r" data-part="line"></i><i class="vl mid" data-part="line"></i>
        <div class="p-copy">
          <p class="kicker mono" data-part="text">${String(i + 1).padStart(2, "0")} · ${esc(p.kicker)}</p>
          <h3 class="p-title" data-part="text">${esc(p.title)}</h3>
          <p class="p-desc" data-part="text">${esc(p.desc)}</p>
          <ul class="chips" data-dup>${p.tags.map(chip).join("")}</ul>
          <a class="p-link mono" data-part="text" href="${esc(p.link)}" target="_blank" rel="noopener">View on GitHub →</a>
        </div>
        <div class="p-visual" data-part="rect"><canvas data-visual="${p.visual}"></canvas></div>
      </div>
      <i class="hl" data-part="line"></i>
    </section>`).join("");
}

export function renderTerm(host: HTMLElement) {
  host.innerHTML = PROJECTS.map((p) => `
    <div class="row" data-part="rect">
      <b class="mono" data-part="text">${esc(slug(p.title))}</b>
      <span class="mono" data-part="text">${esc(p.tags.slice(0, 3).join(" · ").toLowerCase())}</span>
    </div>`).join("");
}

export function renderStrip(host: HTMLElement) {
  host.innerHTML = ["Python", "TypeScript", "Flask", "Angular", "MediaPipe", "Transformers", "Vite", "GitHub Actions"].map(chip).join("");
}

export function renderStack(host: HTMLElement) {
  host.innerHTML = STACK.map((g) => `
    <article class="card" data-part="rect">
      <h3 data-part="text">${esc(g.group)}</h3>
      <ul class="chips" data-dup>${g.items.map(chip).join("")}</ul>
    </article>`).join("");
}

export function renderRepos(host: HTMLElement) {
  host.innerHTML = REPOS.map((name) => `
    <a class="repo" data-part="rect" href="https://github.com/jdank417/${encodeURIComponent(name)}" target="_blank" rel="noopener">
      <span class="r-owner mono" data-part="text">jdank417 /</span>
      <span class="r-name" data-part="text">${esc(name)}</span>
    </a>`).join("");
}
