# Swarm

Jason Dank's portfolio, built live by a team of AI agents while you scroll.

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

Like a real multiplayer app, each agent only sends its position every 45–85 ms. The visible cursor
interpolates those samples along a spline with [perfect-cursors](https://github.com/steveruizok/perfect-cursors)
(MIT, by Steve Ruiz, the library tldraw uses for remote cursors), so it trails the agent slightly and
moves the way a collaborator's cursor does. Anything an agent is dragging follows its visible cursor.

The named cursors follow the [Liveblocks live cursors](https://liveblocks.io/examples) pattern. The shared
task board is inspired by [tldraw's agents on the canvas](https://tldraw.dev/starter-kits/agent).

## Stack

Vite + TypeScript, with perfect-cursors as the only runtime dependency. Deployed to GitHub Pages by
`.github/workflows/deploy.yml` on every push to `main`.

```sh
npm install
npm run dev       # local dev server
npm run build     # type-check + production build into dist/
```

## Editing

- **Projects, stack and repos:** `src/content.ts`
- **Page copy and layout:** `index.html`
- **Styles:** `src/style.css`

To make anything buildable, put it inside an element with `data-assemble="name"` and tag the pieces:

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
