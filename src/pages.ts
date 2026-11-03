import { beyond, contactBlurb, featuredIds, focusAreas, FULL_SITE, heroBadges, heroIntro, now, recommendations, stats, ticker } from "./data/home";
import { projects, type Project } from "./data/projects";
import { EMAIL, GITHUB_URL, LINKEDIN_URL } from "./data/site";
import { experiences } from "./data/work";
import { btn, chips, esc, section } from "./ui";

/*
  The one-page site. Each section() is built by the swarm as it scrolls into
  view; the full write-ups live on jasondank.com, linked throughout.
*/

const LINKS: [string, string][] = [["Projects", "#projects"], ["Experience", "#work"], ["About", "#about"], ["Contact", "#contact"]];
const CAT: Record<string, string> = { ml: "machine learning", web: "web", apple: "ios / macos", automation: "automation" };
const short = (s: string) => s.replace(/\s+—\s+.*$/, "");

function nav() {
  return `
  <header class="sec" data-assemble="nav">
    <div class="wrap nav">
      <i class="vl l" data-part="line"></i><i class="vl r" data-part="line"></i>
      <a class="brand" href="#top"><span class="logo" data-part="rect"><b>JD</b></span><span data-part="text">Jason Dank</span></a>
      <nav class="links" data-dup>${LINKS.map(([l, h]) => `<a href="${h}" data-part="text">${l}</a>`).join("")}</nav>
      ${btn("Full site ↗", FULL_SITE, "dark", true)}
    </div>
    <i class="hl" data-part="line"></i>
  </header>`;
}

const projectCard = (p: Project) => `
  <a class="card pcard" data-part="rect" href="${FULL_SITE}/projects/${p.id}/" target="_blank" rel="noopener">
    <p class="kicker mono" data-part="text">${esc(`${p.year} · ${p.categories.map((c) => CAT[c]).join(" · ")}`)}</p>
    <h3 data-part="text">${esc(short(p.title))}</h3>
    <p data-part="text">${esc((p.highlights ?? p.description)[0])}</p>
    ${chips(p.technologies.slice(0, 4))}
    <span class="more mono" data-part="text">case study ↗</span>
  </a>`;

function onePage() {
  const featured = featuredIds.map((id) => projects.find((p) => p.id === id)).filter((p): p is Project => !!p);
  const rec = recommendations[0];
  return [
    section("hero", `
      <i class="vl mid" data-part="line"></i>
      <div class="hero-copy">
        <ul class="badges" data-dup>${heroBadges.map((b) => `<li class="badge" data-part="rect"><span data-part="text">${esc(b)}</span></li>`).join("")}</ul>
        <h1 class="name" data-part="text">Jason Dank</h1>
        <p class="sub" data-part="text">full-stack engineer.</p>
        <p class="lead" data-part="text">${esc(heroIntro)}</p>
        <div class="cta">
          ${btn("See my work", "#projects", "dark")}
          ${btn("Get in touch", "#contact", "light")}
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
    section("projects", `
      <p class="eyebrow mono" data-part="text">Selected projects</p>
      <h2 data-part="text">Things I've shipped.</h2>
      <div class="grid3 projects">${featured.map(projectCard).join("")}</div>
      <div class="cta">${btn("All 13 projects on jasondank.com ↗", `${FULL_SITE}/#projects`, "light", true)}</div>`, "", "projects"),
    section("work", `
      <p class="eyebrow mono" data-part="text">Experience</p>
      <h2 data-part="text">Where I've worked.</h2>
      <div class="timeline" data-dup>${experiences.map((e) => `
        <div class="trow" data-part="rect">
          <span class="mono when" data-part="text">${esc(e.period.replace(/\s+·.*$/, ""))}</span>
          <b data-part="text">${esc(e.title)}</b>
          <span class="org" data-part="text">${esc(e.company)}</span>
        </div>`).join("")}</div>
      <div class="cta">${btn("Full experience on jasondank.com ↗", `${FULL_SITE}/#work`, "light", true)}</div>`, "", "work"),
    section("about", `
      <p class="eyebrow mono" data-part="text">What I do</p>
      <h2 data-part="text">Fintech, systems, and the parts people don't see.</h2>
      <div class="grid4" data-dup>${focusAreas.map((f) => `
        <article class="card" data-part="rect">
          <h3 data-part="text">${esc(f.title)}</h3>
          <p class="strong" data-part="text">${esc(f.short)}</p>
          <p data-part="text">${esc(f.description)}</p>
        </article>`).join("")}</div>`, "", "about"),
    section("beyond", `
      <p class="eyebrow mono" data-part="text">Off the keyboard</p>
      <h2 data-part="text">Leadership, honors, and sailing.</h2>
      <div class="grid3" data-dup>${beyond.map((b) => `
        <div class="card hl-card" data-part="rect"><h3 data-part="text">${esc(b.title)}</h3><p data-part="text">${esc(b.detail)}</p></div>`).join("")}</div>
      <div class="cta">${btn("Sailing résumé on jasondank.com ↗", `${FULL_SITE}/sailing/`, "light", true)}</div>`),
    section("quote", `
      <blockquote class="pull" data-part="rect">
        <p data-part="text">“${esc(rec.text)}”</p>
        <b data-part="text">${esc(rec.author)}</b>
        <span class="mono" data-part="text">${esc(rec.title)}</span>
      </blockquote>`),
    section("contact", `
      <p class="eyebrow mono" data-part="text">Contact</p>
      <h2 data-part="text">Let's talk.</h2>
      <p class="lead" data-part="text">${esc(contactBlurb)}</p>
      <div class="cta">
        ${btn(EMAIL, `mailto:${EMAIL}`, "dark")}
        ${btn("LinkedIn", LINKEDIN_URL, "light", true)}
        ${btn("GitHub", GITHUB_URL, "light", true)}
      </div>
      <div class="more-card" data-part="rect">
        <p data-part="text">Want the full story? Case studies, the complete résumé, and the sailing log are on jasondank.com.</p>
        ${btn("Visit jasondank.com ↗", FULL_SITE, "dark", true)}
      </div>`, "contact", "contact"),
  ].join("");
}

function footer() {
  return `
  <footer class="sec" data-assemble="footer">
    <div class="wrap foot">
      <i class="vl l" data-part="line"></i><i class="vl r" data-part="line"></i>
      <p class="mono" data-part="text">Jason Dank · Boston, MA · this page was built live by agents as you scrolled</p>
      <button class="btn light small replay" type="button" data-part="rect"><span data-part="text">↻ Watch it build again</span></button>
    </div>
  </footer>`;
}

/** Phone and tablet navigation: a fixed menu button opening a full-screen list of sections. */
function mobileMenu() {
  return `
  <button class="menu-btn" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mnav"><i></i><i></i><i></i></button>
  <nav class="mnav" id="mnav" aria-label="Site" hidden>
    <ul>
      ${LINKS.map(([l, h]) => `<li><a href="${h}">${l}</a></li>`).join("")}
      <li><a href="${FULL_SITE}" target="_blank" rel="noopener">Full site ↗</a></li>
    </ul>
    <div class="mnav-links mono">
      <a href="mailto:${EMAIL}">${EMAIL}</a>
      <a href="${LINKEDIN_URL}" target="_blank" rel="noopener">LinkedIn</a>
      <a href="${GITHUB_URL}" target="_blank" rel="noopener">GitHub</a>
    </div>
  </nav>`;
}

function setupMobileMenu() {
  const btnEl = document.querySelector<HTMLButtonElement>(".menu-btn");
  const panel = document.getElementById("mnav");
  if (!btnEl || !panel) return;
  const set = (open: boolean) => {
    btnEl.setAttribute("aria-expanded", String(open));
    btnEl.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.documentElement.classList.toggle("menu-open", open);
    if (open) { panel.hidden = false; requestAnimationFrame(() => panel.classList.add("open")); panel.querySelector("a")?.focus(); }
    else { panel.classList.remove("open"); setTimeout(() => { if (!panel.classList.contains("open")) panel.hidden = true; }, 220); }
  };
  btnEl.addEventListener("click", () => set(btnEl.getAttribute("aria-expanded") !== "true"));
  panel.addEventListener("click", (e) => { if ((e.target as HTMLElement).closest("a") || e.target === panel) set(false); });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && btnEl.getAttribute("aria-expanded") === "true") { set(false); btnEl.focus(); } });
  matchMedia("(min-width: 901px)").addEventListener("change", (m) => { if (m.matches) set(false); });
}

export function render(host: HTMLElement) {
  host.innerHTML = nav() + `<main id="top">${onePage()}</main>` + footer();
  host.insertAdjacentHTML("afterend", mobileMenu());
  setupMobileMenu();
  // Rebuild from the top: reload with the scroll position reset.
  host.querySelector(".replay")?.addEventListener("click", () => { scrollTo(0, 0); location.reload(); });
}
