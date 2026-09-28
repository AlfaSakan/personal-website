# Personal CV / Portfolio Site

Ahmad Alfa Sakan's personal CV and portfolio website — a single-page site with About, Resume, Projects, and Contact sections.

## Tech stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4

## Scripts

- `npm run dev` — start the local dev server
- `npm run build` — type-check and build for production
- `npm run lint` — run ESLint
- `npm run preview` — preview the production build locally

## Updating the Crypt Crawler build

`public/games/crypt-crawler/play/` holds a pre-built WebAssembly bundle of Crypt Crawler, a
Rust/Bevy game whose source lives in a separate repo (`dream-games`, crate
`crates/crypt-crawler`). Nothing in this repo compiles it — the built files are committed
as static assets and served as-is. `src/pages/games/crypt-crawler.astro` is the page that
embeds it in an `<iframe>`. To pick up new changes from the game, rebuild there and
re-copy the output here:

```bash
# 1. Build in the dream-games repo. --public-url must match this site's base path plus
#    the folder the bundle is served from, or the hashed js/wasm 404 at runtime.
cd path/to/dream-games/crates/crypt-crawler
trunk build --release --public-url /personal-website/games/crypt-crawler/play/

# 2. Copy the bundle and the game's runtime assets into this repo.
#    Removing the folder first drops the previous build's stale hashed js/wasm.
rm -rf path/to/cv/public/games/crypt-crawler/play
mkdir -p path/to/cv/public/games/crypt-crawler/play
cp -r dist/. path/to/cv/public/games/crypt-crawler/play/
cp -r assets path/to/cv/public/games/crypt-crawler/play/assets
```

The bundle lives in `play/`, not directly in `games/crypt-crawler/`, on purpose: its
`index.html` would otherwise sit at the same output path as the Astro page and Astro would
silently skip the page in favour of the public file.

Then commit the changed files. `assets/` is copied separately because Bevy's asset server
fetches it at runtime, relative to `index.html` — Trunk does not bundle it.

## Deployment

Deployed to GitHub Pages under the `/personal-website` base path (see `base` in `vite.config.ts`), live at https://alfasakan.github.io/personal-website/.
