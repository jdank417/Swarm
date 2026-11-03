# Swarm

Jason Dank's portfolio, built live by a team of AI agents while you scroll.

Each cursor is a separate agent with a name, a color and a specialty (**layout**, **copy** or **build**).
When a section scrolls into view, a free agent **scouts** it and posts its tasks to a shared board.
The other agents then **claim tasks themselves**, each running its own loop:

- **layout** agents drag out a box exactly the size of a panel or card, and the element fills it
- **copy** agents stream the real text in token by token, like an LLM, with an I-beam as the caret
- **build** agents bring in buttons, tiles, chips and links and drop them in their slots

A task waits until the element it sits inside has been built. Agents prefer their own specialty and help
with anything that's been waiting a while. Each shows its status in its name tag ("thinking…", then
what it's doing), and the activity feed in the corner logs who planned and finished what. Nothing is
drawn that doesn't become part of the page. Agents with nothing to do flock slowly around your mouse.

**Live:** https://jdank417.github.io/Swarm/

## How the cursors move

Like a real multiplayer app, each agent only sends its position every 45–85 ms. The visible cursor
interpolates those samples along a spline with [perfect-cursors](https://github.com/steveruizok/perfect-cursors)
(MIT, by Steve Ruiz, the library tldraw uses for remote cursors), so it trails the agent slightly and
moves the way a collaborator's cursor does. Anything an agent is dragging follows its visible cursor.

The named cursors follow the [Liveblocks live cursors](https://liveblocks.io/examples) pattern. The scout
and shared board are inspired by [tldraw's agents on the canvas](https://tldraw.dev/starter-kits/agent).

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

| attribute | who builds it |
| --- | --- |
| `data-part="frame"` | layout agent drags out its box, then it appears |
| `data-part="carry"` | build agent drops it into place (must be block or inline-block) |
| `data-part="type"` | copy agent streams its text in (don't put it directly on a flex container) |

Optional `data-label="…"` sets how the task is described in name tags and the feed.

The engine is in `src/engine/`: `swarm.ts` (agent loops, flocking, feed), `board.ts` (sections and
task claiming), `actions.ts` (scout, frame, carry, type) and `agent.ts` (brain, network samples, cursor).

Visitors with "reduce motion" turned on get the finished page with no agents.
