# Vice Panels — multi-panel cover art maker

[![gta6-cover-art-01 on make.fun](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/c/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/Anonymus22/gta6-cover-art-01/rank.svg)](https://make.fun/c/gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/Anonymus22/gta6-cover-art-01/reward.svg)](https://make.fun/c/gta6-cover-art-01)

Vice Panels turns a person's own photo and a caption into cover art in the multi-panel poster
tradition: bold stacked lettering, a sunset or neon colour grade, and panels you can fill with
one photo or several. It runs entirely offline in a desktop browser — photos are read on your
own machine and never uploaded anywhere — and exports a finished cover as a PNG in the common
post sizes. The look is an original design: no game logo, artwork or font is used, and the
lettering is drawn on the canvas with system font stacks.

An entry in make.fun's [gta6-cover-art-01](https://make.fun/c/gta6-cover-art-01) bounty.

## Features

- **Any photo** — two built-in samples to start with; add your own by file picker or by
  dragging a photo file onto the page. Nothing leaves the machine.
- **Six panel layouts** — Cover Classic (hero over a strip of three), Hero & Strips, Four-Up
  Grid, Triptych, Diagonal Split and Full Bleed.
- **Per-panel framing** — click a panel to select it, drag inside it to reposition its photo,
  scroll (or use the zoom slider) to crop tighter; one photo can fill every panel with a
  different crop in each, or every panel can hold a different photo.
- **Five colour grades** — Vice Sunset, Neon Nights, Golden Hour, Noir and Clean, each a
  canvas filter plus a painted wash and vignette.
- **Caption lettering** — a two-line title and a subtitle in four drawn styles (Block, Sunset,
  Neon Glow, Chrome), at the top or bottom of the cover, with a size control.
- **One-click export** — PNG at 1080 × 1080, 1080 × 1350 or 1920 × 1080, rendered offscreen
  from the same drawing code as the preview, so what you see is exactly what you post.

## Run it

Serve `app/` with any static file server and open `index.html` in a desktop browser. With
Node:

```
node serve.ts            # serves app/ at http://localhost:8080
```

There is no build step and the app makes no network requests.

## Layout

- `app/index.html` — the editor page
- `app/style.css` — the editor's dark, neon-trimmed styling
- `app/src/editor.js` — page wiring: photo library, gestures, controls, export
- `app/src/render.js` — the cover renderer (panels, photos, grade, lettering) shared by the
  preview and the export
- `app/src/layouts.js` — the six panel layouts as unit-space polygons
- `app/src/grades.js` — the five colour grades
- `app/src/lettering.js` — the drawn caption lettering and its four styles
- `app/src/shots.js` — fixed scenes used to take the screenshots in `screenshots/`
- `app/samples/` — two sample photos, free to use, so the app works the moment it opens
- `main.ts` — the hand-in program: copies `app/` and `screenshots/` to the output directory
  and writes `dossier.json` with the vendored make.fun library
- `serve.ts` — a tiny local static server for trying the app

## Screenshots

`screenshots/` holds four shots of the app as it is handed in: two covers it exported (a
1080 × 1350 Vice Sunset cover and a 1080 × 1080 Neon Nights cover) and the editor at work in
both the portrait and wide export sizes.
