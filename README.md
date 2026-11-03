# Swarm

Jason Dank's portfolio, built live by a team of AI agents while you scroll. The content comes from
[jdank417/JasonDank](https://github.com/jdank417/JasonDank) and is split across pages so each one is a
manageable build for the swarm:

| page | what's on it |
| --- | --- |
| `index.html` | hero, stats, core stack, focus areas, featured projects, current role |
| `projects.html` | all 13 projects |
| `project.html?id=<id>` | a case study per project: write-up, what I'm proudest of, tech, links, screenshots |
| `work.html` | experience |
| `about.html` | education, skills, leadership and certifications, recommendations |
| `sailing.html` | racing, clubs and certifications |

Every page ends with the contact section.

Each cursor is a separate agent with its own loop and a specialty (layout, copy or build). When a
section scrolls into view its parts go on a shared board, and agents claim them and build them with
design-tool gestures:

- **line:** drag a hairline from one end to the other
- **rect:** drag out a grey placeholder with a size label, then fill it with the element's real background, radius and border
- **text:** drag out a text box exactly the size of the text, then type it in
- **dup:** alt-drag a copy of the first item in a group into the next slot (red outline, distance badge), then select its text and retype it

Pixel rulers light up the ranges being worked on, dotted guides track the active element, and arrow
cursors point the way they're moving. On load the swarm orbits the logo, and idle agents flock around
your mouse. Everything drawn during a gesture sits exactly where the real element appears and is
removed the moment it takes over.

**Live:** https://jdank417.github.io/Swarm/

## How the cursors move

Agents make short, eased flights sized to the distance (about 140–520 ms), stop to do the work, then
move on, the way the reference [califa/swarm-site](https://califa.github.io/swarm-site/) moves. Each
cursor is redrawn from its agent's position every frame, and anything being dragged follows it exactly.
The shared task board, where agents claim work themselves, is inspired by
[tldraw's agents on the canvas](https://tldraw.dev/starter-kits/agent).

## Stack

Vite + TypeScript, no runtime dependencies. Deployed to GitHub Pages by
`.github/workflows/deploy.yml` on every push to `main`.

```sh
npm install
npm run dev       # local dev server
npm run build     # type-check + production build into dist/
```

## Editing

- **Content:** `src/data/` (ported from the JasonDank repo; `home.ts` holds the copy that lived in its components)
- **Page layouts:** `src/pages.ts`, using the helpers in `src/ui.ts`
- **Styles:** `src/style.css`
- **Screenshots:** `public/projects/`

Adding a page means an HTML file like the others (with its own `data-page`), a renderer in
`src/pages.ts`, and an entry in `vite.config.ts`.

Each `section()` is one unit the swarm builds when it scrolls into view. Inside, pieces are tagged:

| attribute | how it's built |
| --- | --- |
| `data-part="line"` | dragged end to end |
| `data-part="rect"` | grey placeholder, then filled with its real style |
| `data-part="text"` | text box, then typed (don't put it directly on a flex container) |
| `data-dup` (on a container) | first child built normally, the rest duplicated from it and retyped; the container needs `position: relative` |

The engine is in `src/engine/`: `swarm.ts` (intro, agent loops, flocking), `board.ts` (task
claiming and dependencies), `actions.ts` (line, rect, text, dup), `overlay.ts` (boxes and guides),
`rulers.ts` and `agent.ts` (brain, network samples, cursor).

Visitors with "reduce motion" turned on get the finished page with no agents.
