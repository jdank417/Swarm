# Swarm

Jason Dank's portfolio site. A dark, dependency-free static page where a swarm of cursor "agents"
assembles each section as you scroll, with glitch/scramble text reveals, blue wireframe panels,
and a live build HUD.

**Live:** https://jdank417.github.io/Swarm/

## GitHub Pages

The site is plain static files at the repo root (with `.nojekyll`), so it deploys straight from the branch:

1. **Settings → Pages**
2. **Source:** Deploy from a branch
3. **Branch:** `main`, folder `/ (root)` → **Save**

Every push to `main` then republishes automatically within a minute or two.

## Run locally

```sh
python3 -m http.server 8000   # then open http://localhost:8000
```

## Edit content

- **Projects:** the `PROJECTS` array at the top of `main.js`.
- **Hero, about, contact copy:** `index.html`.
- **Colors and fonts:** CSS variables at the top of `styles.css`.

Motion is disabled automatically for visitors who have "reduce motion" turned on.
