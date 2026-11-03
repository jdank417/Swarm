import { aboutParagraphs, contactBlurb, featuredIds, focusAreas, heroBadges, heroIntro, now, recommendations, stats, ticker } from "./data/home";
import { courses, honors, minors, school } from "./data/education";
import { leadership } from "./data/leadership";
import { projects, type Project } from "./data/projects";
import { certifications as sailCerts, clubs, highlights as sailHighlights, racing } from "./data/sailing";
import { EMAIL, GITHUB_URL, LINKEDIN_URL } from "./data/site";
import { skillGroups } from "./data/skills";
import { experiences } from "./data/work";
import { btn, bullets, chips, esc, section } from "./ui";

export type Page = "home" | "projects" | "project" | "work" | "about" | "sailing";

const NAV: [Page, string, string][] = [
  ["projects", "Projects", "projects.html"],
  ["work", "Experience", "work.html"],
  ["about", "About", "about.html"],
  ["sailing", "Sailing", "sailing.html"],
];

const CAT: Record<string, string> = { ml: "machine learning", web: "web", apple: "ios / macos", automation: "automation" };
const asset = (src: string) => src.replace(/^\//, "");
const plain = (s: string) => s.replace(/\s+—\s+.*$/, "");

export function nav(page: Page) {
  const links = NAV.map(([id, label, href]) =>
    `<a href="${href}" data-part="text"${id === page || (page === "project" && id === "projects") ? ' class="on"' : ""}>${label}</a>`).join("");
  return `
  <header class="sec" data-assemble="nav">
    <div class="wrap nav">
      <i class="vl l" data-part="line"></i><i class="vl r" data-part="line"></i>
      <a class="brand" href="./"><span class="logo" data-part="rect"><b>JD</b></span><span data-part="text">Jason Dank</span></a>
      <nav class="links" data-dup>${links}</nav>
      ${btn("Contact", "#contact", "dark")}
    </div>
    <i class="hl" data-part="line"></i>
  </header>`;
}

/**
 * Phone and tablet navigation: a menu button fixed to the corner, so it's
 * reachable from anywhere on the page, opening a full-screen list of pages.
 * It's interface chrome, like the rulers, so it isn't built by the swarm.
 */
export function mobileMenu(page: Page) {
  const items: [Page | "home", string, string][] = [["home", "Home", "./"], ...NAV];
  const current = page === "project" ? "projects" : page;
  return `
  <button class="menu-btn" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mnav"><i></i><i></i><i></i></button>
  <nav class="mnav" id="mnav" aria-label="Site" hidden>
    <ul>${items.map(([id, label, href]) => `<li><a href="${href}"${id === current ? ' aria-current="page"' : ""}>${label}</a></li>`).join("")}
      <li><a href="#contact">Contact</a></li>
    </ul>
    <div class="mnav-links mono">
      <a href="mailto:${EMAIL}">${EMAIL}</a>
      <a href="${LINKEDIN_URL}" target="_blank" rel="noopener">LinkedIn</a>
      <a href="${GITHUB_URL}" target="_blank" rel="noopener">GitHub</a>
    </div>
  </nav>`;
}

export function setupMobileMenu() {
  const btn = document.querySelector<HTMLButtonElement>(".menu-btn");
  const panel = document.getElementById("mnav");
  if (!btn || !panel) return;
  const set = (open: boolean) => {
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.documentElement.classList.toggle("menu-open", open);
    if (open) { panel.hidden = false; requestAnimationFrame(() => panel.classList.add("open")); panel.querySelector("a")?.focus(); }
    else { panel.classList.remove("open"); setTimeout(() => { if (!panel.classList.contains("open")) panel.hidden = true; }, 220); }
  };
  btn.addEventListener("click", () => set(btn.getAttribute("aria-expanded") !== "true"));
  panel.addEventListener("click", (e) => { if ((e.target as HTMLElement).closest("a") || e.target === panel) set(false); });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && btn.getAttribute("aria-expanded") === "true") { set(false); btn.focus(); } });
  matchMedia("(min-width: 901px)").addEventListener("change", (m) => { if (m.matches) set(false); });
}

export function contact() {
  return section("contact", `
    <p class="eyebrow mono" data-part="text">Contact</p>
    <h2 data-part="text">Let's talk.</h2>
    <p class="lead" data-part="text">${esc(contactBlurb)}</p>
    <div class="cta">
      ${btn(EMAIL, `mailto:${EMAIL}`, "dark")}
      ${btn("LinkedIn", LINKEDIN_URL, "light", true)}
      ${btn("GitHub", GITHUB_URL, "light", true)}
    </div>`, "contact", "contact") + `
  <footer class="sec" data-assemble="footer">
    <div class="wrap foot">
      <i class="vl l" data-part="line"></i><i class="vl r" data-part="line"></i>
      <p class="mono" data-part="text">jasondank.com · Boston, MA · built live by agents as you scroll</p>
    </div>
  </footer>`;
}

/** Page header: eyebrow, title and lead. */
const header = (name: string, eyebrow: string, title: string, lead: string, extra = "") =>
  section(name, `
    <p class="eyebrow mono" data-part="text">${esc(eyebrow)}</p>
    <h1 data-part="text">${esc(title)}</h1>
    ${lead ? `<p class="lead" data-part="text">${esc(lead)}</p>` : ""}
    ${extra}`, "page-head");

const projectCard = (p: Project) => `
  <a class="card pcard" data-part="rect" href="project.html?id=${p.id}">
    <p class="kicker mono" data-part="text">${esc(`${p.year} · ${p.categories.map((c) => CAT[c]).join(" · ")}`)}</p>
    <h3 data-part="text">${esc(plain(p.title))}</h3>
    <p data-part="text">${esc((p.highlights ?? p.description)[0])}</p>
    ${chips(p.technologies.slice(0, 5))}
    <span class="more mono" data-part="text">case study →</span>
  </a>`;

/* ---------------- pages ---------------- */

function home() {
  const featured = featuredIds.map((id) => projects.find((p) => p.id === id)!).filter(Boolean);
  const current = experiences[0];
  return [
    section("hero", `
      <i class="vl mid" data-part="line"></i>
      <div class="hero-copy">
        <ul class="badges" data-dup>${heroBadges.map((b) => `<li class="badge" data-part="rect"><span data-part="text">${esc(b)}</span></li>`).join("")}</ul>
        <h1 class="name" data-part="text">Jason Dank</h1>
        <p class="sub" data-part="text">full-stack engineer.</p>
        <p class="lead" data-part="text">${esc(heroIntro)}</p>
        <div class="cta">
          ${btn("View projects", "projects.html", "dark")}
          ${btn("Contact", "#contact", "light")}
          ${btn("GitHub", GITHUB_URL, "light", true)}
          ${btn("LinkedIn", LINKEDIN_URL, "light", true)}
        </div>
      </div>
      <div class="term" data-part="rect">
        <p class="term-head mono" data-part="text">~/jason $ cat now.txt</p>
        <div class="term-rows" data-dup>${now.map(([k, v]) => `<div class="row" data-part="rect"><b class="mono" data-part="text">${esc(k)}</b><span class="mono" data-part="text">${esc(v)}</span></div>`).join("")}</div>
        <div class="bar" data-part="rect"><i></i></div>
        <p class="term-foot mono" data-part="text">13 shipped projects · 2 on the App Store</p>
      </div>`, "hero"),
    section("stats", `
      <div class="stats" data-dup>${stats.map((s) => `<div class="stat" data-part="rect"><b data-part="text">${esc(s.value)}</b><span class="mono" data-part="text">${esc(s.label)}</span></div>`).join("")}</div>`, "stats-wrap"),
    section("stack", `<p class="mono label" data-part="text">Core stack</p>${chips(ticker)}`, "strip"),
    section("about", `
      <p class="eyebrow mono" data-part="text">About</p>
      <h2 data-part="text">Fintech, systems, and the parts people don't see.</h2>
      <div class="grid4" data-dup>${focusAreas.map((f) => `
        <article class="card" data-part="rect">
          <h3 data-part="text">${esc(f.title)}</h3>
          <p class="strong" data-part="text">${esc(f.short)}</p>
          <p data-part="text">${esc(f.description)}</p>
        </article>`).join("")}</div>
      <div class="cta">${btn("More about me", "about.html", "light")}</div>`),
    section("featured", `
      <p class="eyebrow mono" data-part="text">Selected projects</p>
      <h2 data-part="text">Things I've shipped.</h2>
      <div class="grid2">${featured.map(projectCard).join("")}</div>
      <div class="cta">${btn("All 13 projects", "projects.html", "dark")}</div>`),
    section("now", `
      <p class="eyebrow mono" data-part="text">Experience</p>
      <h2 data-part="text">${esc(`${current.title} at ${current.company.split(" ")[0]}.`)}</h2>
      <p class="lead" data-part="text">${esc(current.achievements[0])}</p>
      <div class="cta">${btn("Full experience", "work.html", "light")}</div>`),
    contact(),
  ].join("");
}

function projectsPage() {
  return header("projects.head", "Projects", "Everything I've shipped.", `${projects.length} projects across machine learning, web, iOS and macOS, and automation. Each one has a case study.`)
    + section("projects.grid", `<div class="grid2">${projects.map(projectCard).join("")}</div>`)
    + contact();
}

function projectPage(id: string | null) {
  const i = Math.max(0, projects.findIndex((p) => p.id === id));
  const p = projects[i];
  document.title = `${plain(p.title)} — Jason Dank`;
  const links: [string, string | undefined][] = [
    ["GitHub", p.githubUrl], [p.demoLabel ?? "Live demo", p.demoUrl], ["App Store", p.appStoreUrl],
    ["Research paper", p.paperUrl], ["TestFlight beta", p.betaUrl],
  ];
  const linkBtns = links.filter(([, h]) => h).map(([l, h], k) => btn(l, h!, k === 0 ? "dark" : "light", true)).join("");
  const next = projects[(i + 1) % projects.length], prev = projects[(i - 1 + projects.length) % projects.length];
  const shots = p.shots ?? [];
  return header("case.head", `${p.year} · ${p.categories.map((c) => CAT[c]).join(" · ")}`, p.title, p.summary ?? p.highlights?.[0] ?? "",
      linkBtns ? `<div class="cta">${linkBtns}</div>` : "")
    + section("case.body", `
      <div class="case">
        <div class="case-text">
          <p class="eyebrow mono" data-part="text">What it is</p>
          ${p.description.map((d) => `<p class="para" data-part="text">${esc(d)}</p>`).join("")}
        </div>
        <aside class="case-side">
          <div class="card" data-part="rect">
            <h3 data-part="text">Built with</h3>
            ${chips(p.technologies)}
          </div>
          ${p.proud ? `<div class="card quote" data-part="rect"><h3 data-part="text">What I'm proudest of</h3><p data-part="text">${esc(p.proud)}</p></div>` : ""}
        </aside>
      </div>`)
    + (shots.length ? section("case.shots", `
      <p class="eyebrow mono" data-part="text">Screenshots</p>
      <div class="shots">${shots.map((s) => `
        <figure class="shot ${s.frame}" data-part="rect"><img src="${asset(s.src)}" width="${s.width}" height="${s.height}" alt="${esc(s.alt)}" loading="lazy" /></figure>`).join("")}</div>`) : "")
    + section("case.nav", `
      <div class="pager">
        <a class="card" data-part="rect" href="project.html?id=${prev.id}"><span class="mono" data-part="text">← previous</span><b data-part="text">${esc(plain(prev.title))}</b></a>
        <a class="card right" data-part="rect" href="project.html?id=${next.id}"><span class="mono" data-part="text">next →</span><b data-part="text">${esc(plain(next.title))}</b></a>
      </div>`)
    + contact();
}

function workPage() {
  return header("work.head", "Experience", "Where I've worked.", "From fintech at Fidelity to endpoint engineering at Harvard, plus consulting, program management, tutoring and teaching sailing.")
    + experiences.map((e, i) => section(`work.${e.id}`, `
      <div class="job">
        <div class="job-meta">
          <p class="kicker mono" data-part="text">${esc(e.period)}</p>
          ${e.current ? `<span class="now-badge" data-part="rect"><span data-part="text">current</span></span>` : ""}
          <p class="mono where" data-part="text">${esc(e.location)}</p>
        </div>
        <div class="job-body">
          <h2 data-part="text">${esc(e.title)}</h2>
          <p class="company" data-part="text">${esc(e.company)}</p>
          ${bullets(e.achievements)}
          ${chips(e.stack)}
        </div>
      </div>`, i === 0 ? "first" : "")).join("")
    + contact();
}

function aboutPage() {
  return header("about.head", "About", "Jason Dank", aboutParagraphs[0])
    + section("about.story", aboutParagraphs.slice(1).map((p) => `<p class="para wide" data-part="text">${esc(p)}</p>`).join(""))
    + section("about.education", `
      <p class="eyebrow mono" data-part="text">Education</p>
      <h2 data-part="text">${esc(school.degree)}</h2>
      <p class="lead" data-part="text">${esc(`${school.name} · ${school.location} · ${school.period}`)}</p>
      <div class="grid3">
        <div class="card" data-part="rect"><h3 data-part="text">Standing</h3><p data-part="text">${esc(`${school.note} · GPA ${school.gpa}`)}</p></div>
        <div class="card" data-part="rect"><h3 data-part="text">Minors</h3>${chips(minors)}</div>
        <div class="card" data-part="rect"><h3 data-part="text">Honors</h3>${bullets(honors)}</div>
      </div>
      <div class="card wide-card" data-part="rect"><h3 data-part="text">Related coursework</h3>${chips(courses)}</div>`)
    + section("about.skills", `
      <p class="eyebrow mono" data-part="text">Skills</p>
      <h2 data-part="text">What I work with.</h2>
      <div class="grid3">${skillGroups.map((g) => `<div class="card" data-part="rect"><h3 data-part="text">${esc(g.title)}</h3>${chips(g.items)}</div>`).join("")}</div>`)
    + section("about.leadership", `
      <p class="eyebrow mono" data-part="text">Leadership, honors &amp; certifications</p>
      <h2 data-part="text">Off the keyboard.</h2>
      <div class="grid2">${leadership.map((l) => `
        <article class="card" data-part="rect">
          <p class="kicker mono" data-part="text">${esc(l.period)}</p>
          <h3 data-part="text">${esc(l.title)}</h3>
          <p class="org" data-part="text">${esc(l.org)}</p>
          ${bullets(l.description)}
        </article>`).join("")}</div>`)
    + section("about.recs", `
      <p class="eyebrow mono" data-part="text">Recommendations</p>
      <h2 data-part="text">In other people's words.</h2>
      <div class="grid2" data-dup>${recommendations.map((r) => `
        <blockquote class="card quote" data-part="rect">
          <p data-part="text">${esc(r.text)}</p>
          <b data-part="text">${esc(r.author)}</b>
          <span class="mono" data-part="text">${esc(r.title)}</span>
        </blockquote>`).join("")}</div>`)
    + contact();
}

function sailingPage() {
  return header("sailing.head", "Sailing", "Racing and leadership on the water.", "From learn-to-sail on the Great South Bay to captaining the Wentworth team and racing keelboats out of Boston and Marblehead.")
    + section("sailing.highlights", `
      <div class="stats three" data-dup>${sailHighlights.map((h) => `<div class="stat" data-part="rect"><b data-part="text">${esc(h.label)}</b><span class="mono" data-part="text">${esc(h.detail)}</span></div>`).join("")}</div>`, "stats-wrap")
    + section("sailing.racing", `
      <p class="eyebrow mono" data-part="text">Racing</p>
      <h2 data-part="text">Boats I race on.</h2>
      <div class="grid2">${racing.map((r) => `
        <article class="card" data-part="rect">
          <p class="kicker mono" data-part="text">${esc([r.venue, r.period].filter(Boolean).join(" · "))}</p>
          <h3 data-part="text">${esc(r.boat)}</h3>
          ${r.result ? `<span class="now-badge" data-part="rect"><span data-part="text">${esc(r.result)}</span></span>` : ""}
          ${bullets(r.bullets)}
        </article>`).join("")}</div>`)
    + section("sailing.clubs", `
      <p class="eyebrow mono" data-part="text">Clubs</p>
      <h2 data-part="text">Where I sail.</h2>
      <div class="grid2">${clubs.map((c) => `
        <article class="card" data-part="rect">
          <p class="kicker mono" data-part="text">${esc(`${c.location} · ${c.period}`)}</p>
          <h3 data-part="text">${esc(c.name)}</h3>
          ${bullets(c.bullets)}
          ${c.boats ? `<p class="mono boats" data-part="text">${esc(c.boats)}</p>` : ""}
        </article>`).join("")}</div>
      <div class="card wide-card" data-part="rect"><h3 data-part="text">Certifications</h3>${bullets(sailCerts.map((c) => `${c.name} — ${c.detail}`))}</div>`)
    + contact();
}

export function render(page: Page, host: HTMLElement) {
  const body =
    page === "projects" ? projectsPage()
    : page === "project" ? projectPage(new URLSearchParams(location.search).get("id"))
    : page === "work" ? workPage()
    : page === "about" ? aboutPage()
    : page === "sailing" ? sailingPage()
    : home();
  host.innerHTML = nav(page) + `<main id="top">${body}</main>`;
  host.insertAdjacentHTML("afterend", mobileMenu(page));
  setupMobileMenu();
}
