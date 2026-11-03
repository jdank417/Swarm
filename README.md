# Swarm

Jason Dank's portfolio. Dozens of cursor "agents" run around the page and **assemble each component as
it scrolls into view**:

- **frame:** a crosshair drags out a box exactly the size of the element, and the element fills it
- **carry:** the element appears beside its slot, a hand grabs it and drops it in place
- **type:** the text is split into characters and up to five I-beam cursors type it out at once

Nothing is drawn that doesn't become part of the page. Cursors with nothing to do flock like starlings
around your mouse (or a roaming point on touch screens) and peel off when new work appears. The HUD at
the bottom shows agents, how many are working, and parts built.

**Live:** https://jdank417.github.io/Swarm/

## Stack

Vite + TypeScript, no runtime dependencies. Deployed to GitHub Pages by `.github/workflows/deploy.yml`
on every push to `main` (Settings → Pages → Source must be **GitHub Actions**).

```sh
npm install
npm run dev       # local dev server
npm run build     # type-check + production build into dist/
```

## Editing

- **Projects:** `src/content.ts`
- **Page copy and layout:** `index.html`
- **Styles:** `src/style.css`

To make anything assemble, put it inside an element with `data-assemble="name"` and tag the pieces:

| attribute | what the swarm does |
| --- | --- |
| `data-part="frame"` | drags out a box, then reveals the element |
| `data-part="carry"` | drags the element into place (must be block or inline-block) |
| `data-part="type"` | types the text (don't put it directly on a flex container) |

A part waits for the part it sits inside to finish first. The engine is in `src/engine/`:
`assembler.ts` (scheduling and roaming), `tasks.ts` (the three jobs), `agent.ts` (cursor motion) and
`overlay.ts` (drawing).

Visitors with "reduce motion" turned on get the finished page with no animation.
