import { featuredIds, FULL_SITE, heroBadges, nowRows, pitch, stats, taglines } from "./data/home";
import { projects, type Project } from "./data/projects";
import { EMAIL, GITHUB_URL, LINKEDIN_URL } from "./data/site";
import { btn, esc, section } from "./ui";

/*
  The whole site is about two screens: a hero, then selected work and contact.
  Each section() is built by the swarm as it scrolls into view; everything
  else lives on jasondank.com.
*/

const short = (s: string) => s.replace(/\s+—\s+.*$/, "");
const CAT: Record<string, string> = { ml: "ml", web: "web", apple: "ios / macos", automation: "automation" };

function nav() {
  return `
  <header class="sec" data-assemble="nav">
    <div class="wrap nav">
      <i class="vl l" data-part="line"></i><i class="vl r" data-part="line"></i>
      <a class="brand" href="./"><span class="logo" data-part="rect"><b>JD</b></span><span data-part="text">Jason Dank</span></a>
      ${btn("Full site ↗", FULL_SITE, "dark", true)}
    </div>
    <i class="hl" data-part="line"></i>
  </header>`;
}

const tile = (p: Project) => `
  <a class="tile" data-part="rect" href="${FULL_SITE}/projects/${p.id}/" target="_blank" rel="noopener">
    <span class="mono kicker" data-part="text">${esc(`${p.year} · ${CAT[p.categories[0]]}`)}</span>
    <b data-part="text">${esc(short(p.title))}</b>
    <span class="tl" data-part="text">${esc(taglines[p.id] ?? "")}</span>
  </a>`;

function onePage() {
  const featured = featuredIds.map((id) => projects.find((p) => p.id === id)).filter((p): p is Project => !!p);
  return section("hero", `
      <div class="hero-copy">
        <ul class="badges" data-dup>${heroBadges.map((b) => `<li class="badge" data-part="rect"><span data-part="text">${esc(b)}</span></li>`).join("")}</ul>
        <h1 class="name" data-part="text">Jason Dank</h1>
        <p class="sub" data-part="text">full-stack engineer.</p>
        <p class="lead" data-part="text">${esc(pitch)}</p>
        <div class="mini-stats" data-dup>${stats.map((s) => `<div class="ms" data-part="rect"><b data-part="text">${esc(s.value)}</b><span data-part="text">${esc(s.label)}</span></div>`).join("")}</div>
        <div class="cta">
          ${btn("Get in touch", `mailto:${EMAIL}`, "dark")}
          ${btn("Full site ↗", FULL_SITE, "light", true)}
        </div>
      </div>
      <div class="term" data-part="rect">
        <p class="term-head mono" data-part="text">~/jason $ cat now.txt</p>
        <div class="term-rows" data-dup>${nowRows.map(([k, v]) => `<div class="row" data-part="rect"><b class="mono" data-part="text">${esc(k)}</b><span class="mono" data-part="text">${esc(v)}</span></div>`).join("")}</div>
        <div class="bar" data-part="rect"><i></i></div>
        <p class="term-foot mono" data-part="text">13 shipped projects · 2 on the App Store</p>
      </div>`, "hero")
    + section("work", `
      <div class="work-head">
        <h2 data-part="text">Selected work</h2>
        <a class="mono all" href="${FULL_SITE}/#projects" target="_blank" rel="noopener" data-part="text">all 13 ↗</a>
      </div>
      <div class="tiles" data-dup>${featured.map(tile).join("")}</div>
      <div class="reach">
        <p class="mono" data-part="text">Say hi</p>
        <div class="reach-links" data-dup>
          <a href="mailto:${EMAIL}" data-part="text">${esc(EMAIL)}</a>
          <a href="${LINKEDIN_URL}" target="_blank" rel="noopener" data-part="text">LinkedIn ↗</a>
          <a href="${GITHUB_URL}" target="_blank" rel="noopener" data-part="text">GitHub ↗</a>
        </div>
      </div>`, "work", "work");
}

function footer() {
  return `
  <footer class="sec" data-assemble="footer">
    <div class="wrap foot">
      <i class="vl l" data-part="line"></i><i class="vl r" data-part="line"></i>
      <p class="mono" data-part="text">Built live by agents as you scrolled.</p>
      <button class="btn light small replay" type="button" data-part="rect"><span data-part="text">↻ Watch it build again</span></button>
    </div>
  </footer>`;
}

export function render(host: HTMLElement) {
  host.innerHTML = nav() + `<main id="top">${onePage()}</main>` + footer();
  // Rebuild from the top: reload with the scroll position reset.
  host.querySelector(".replay")?.addEventListener("click", () => { scrollTo(0, 0); location.reload(); });
}
