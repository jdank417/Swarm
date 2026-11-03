/*
  Markup helpers. Everything the swarm builds is tagged here:
    data-part="text"  typed into a text box
    data-part="rect"  dragged out as a placeholder, then filled
    data-part="line"  dragged end to end
    data-dup          repeated items: the first is built, the rest duplicated and retyped
  Repeated items in a data-dup group must share the same structure and must not
  contain their own rects or dup groups.
*/

export const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);


/** A section of the page: one unit the swarm builds when it scrolls into view. */
export const section = (name: string, inner: string, cls = "", id = "") => `
  <section class="sec"${id ? ` id="${id}"` : ""} data-assemble="${name}">
    <div class="wrap ${cls}">
      <i class="vl l" data-part="line"></i><i class="vl r" data-part="line"></i>
      ${inner}
    </div>
    <i class="hl" data-part="line"></i>
  </section>`;

export const chips = (items: string[], cls = "") =>
  items.length ? `<ul class="chips ${cls}" data-dup>${items.map((i) => `<li class="chip" data-part="rect"><span data-part="text">${esc(i)}</span></li>`).join("")}</ul>` : "";

export const bullets = (items: string[]) =>
  items.length ? `<ul class="bullets" data-dup>${items.map((i) => `<li data-part="text">${esc(i)}</li>`).join("")}</ul>` : "";

/** A button-like link: a filled box with its label typed in. */
export const btn = (label: string, href: string, kind: "dark" | "light" = "dark", external = false) =>
  `<a class="btn ${kind}" data-part="rect" href="${esc(href)}"${external ? ' target="_blank" rel="noopener"' : ""}><span data-part="text">${esc(label)}</span></a>`;

export const external = (href: string) => /^https?:|^mailto:/.test(href);
