<div align="center">

# OMBRA

**A landing page for a fashion house that does not exist, built to solve the
interesting part: driving a film from scroll without the stutter, and letting
the typography know where the subject is.**

[**→ Live site**](https://koray.dev/ombra/)

[![Build &amp; Deploy](https://github.com/raelsei/ombra/actions/workflows/deploy.yml/badge.svg?branch=main)](https://github.com/raelsei/ombra/actions/workflows/deploy.yml?query=branch%3Amain)
[![License: MIT](https://img.shields.io/badge/license-MIT-000000.svg)](LICENSE)
![Runtime dependencies: react only](https://img.shields.io/badge/runtime%20deps-react%20only-000000)

<img src="docs/media/02-apparition.jpg" alt="The apparition trail: a walking figure smeared into several fading ghosts behind the display heading Silhouette" width="100%">

<sub>Scroll velocity smears the figure into ghosts of itself.</sub>

</div>

---

Two mechanisms are the reason to read the source:

- **A pre-decoded frame sequence instead of a seekable video.** Assigning
  `currentTime` restarts decode from the nearest keyframe, so a scrubbed video
  stutters however you ease it. 1,458 JPEGs drawn to a `<canvas>` are exactly
  scroll-locked.
- **Build-time perceptual metadata.** One ffmpeg pass emits a 48×27 grayscale
  stream; [`scripts/centroids.mjs`](scripts/centroids.mjs) reduces it to the
  luminance centroid of the bright figure in every frame. At runtime that is an
  array lookup, so headings dodge a moving subject with no per-frame pixel work.

Maison OMBRA is **fictional**, the stills are AI-generated and the film is
Pixabay stock — set dressing, disclosed in [Credits](#credits). The code is
~2,000 lines of TypeScript, a 220-line stylesheet and one
`requestAnimationFrame` loop, with React as the only runtime dependency.

<details>
<summary>More screens</summary>

<img src="docs/media/01-hero.jpg" width="100%" alt="Hero: the wordmark over the display heading The Shape Remains">
<img src="docs/media/03-collection.jpg" width="100%" alt="Collection: garment studies on a 12-column asymmetric grid">
<img src="docs/media/05-lookbook.jpg" width="100%" alt="Lookbook: two editorial photographs under the heading In Motion">
<img src="docs/media/06-house.jpg" width="100%" alt="House: campaign portrait beside the heading The House">
<img src="docs/media/07-footer.jpg" width="100%" alt="Footer: enquiries block above a giant OMBRA wordmark">

</details>

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc -b && vite build → dist/
npm test           # node --test, the centroid reducer
npm run lint
```

Node 20+. No API keys, no env file, no backend.

## The film

**Frame density is the whole trick.** The page scrolls ≈8,000px; at 1,458 frames
that is ≈5px of scroll per frame, so the film steps imperceptibly. A sparse
sequence (150 frames → ~53px/frame) visibly stutters. Both sides of the ratio
are yours — `FPS` in the script, and your page height. Aim for
**frames ≈ scrollable px / 6**.

One script regenerates every derived asset (`ffmpeg` + `node` on `PATH`):

```bash
npm run assets                 # re-derive from the shipped public/film.mp4
npm run assets my-clip.mov     # swap in your own footage
```

| Output | How | Used by |
|---|---|---|
| `public/frames/001…1458.jpg` | `fps=24, scale=960:-1` | the scrub canvas |
| `src/frames-meta.json` | 48×27 gray → centroid reducer | figure position |
| `public/film.mp4` | `-c copy -movflags +faststart` | drift mode (`?motion=drift`) |
| `public/film-poster.jpg` | frame at 1.5s | `<video poster>` |

The luminance pass uses the **same `fps`** as the frame export, so centroid *N*
is frame *N* by construction.

> [!IMPORTANT]
> **The pipeline needs a bright subject on a near-black field.** `TH=62` in
> `scripts/build-assets.sh` is a luminance cut. Feed it a daylight clip and
> every centroid collapses toward 0.5 and the figure tracking goes inert while
> the scrub keeps working — an invisible failure. The reducer counts frames it
> could not locate a subject in and warns when more than a quarter are
> degenerate.

## Loading

1,458 frames is 9.6 MB. Requesting them all on mount saturates the connection
and starves the actual content, so frames are fetched against the playhead: a
coarse spine every 24th frame guarantees something drawable anywhere, a window
around the current frame biased by scroll direction fills in the rest, and at
most 6 requests stay open. When the exact frame has not landed, the nearest
loaded one is drawn.

Same harness, same scroll, eager vs. windowed — mobile viewport on throttled
4G (1.6 Mbps, 150 ms RTT):

| | eager | windowed |
|---|---|---|
| First film frame | 0.55 s | **0.55 s** |
| Two editorial photographs on screen | 27.8 s | **0.75 s** |
| Data spent by that point | 6.97 MB | **0.27 MB** |

On unthrottled broadband the film's first frame lands after 12 requests / 0.13 MB
instead of 1,462 / 9.65 MB, and the eleven photographs finish in 4.5 s instead
of 10.7 s. Total bytes for a full scroll-through are unchanged — the sequence
still streams, just behind the content instead of in front of it.

Reduced-motion visitors load exactly one frame and never schedule a rAF.

## Docs

- [`docs/engine.md`](docs/engine.md) — the rAF loop, the CSS variables it
  writes, the renderers, tuning constants, URL config, file structure, and the
  DOM contract to keep if you reuse the engine.
- [`docs/imagery.md`](docs/imagery.md) — the eleven image slots and the visual
  rule they share.

## Limitations

- **No server-rendered content.** `index.html` ships an empty `#root` with no
  `<noscript>` fallback.
- **No mobile navigation.** Below 620px the top nav is hidden with no
  replacement; sections are reachable by scrolling or via the footer.
- **Blend-mode contrast is unmeasurable by construction.** Display headings use
  `mix-blend-mode: difference` over a moving film, so their contrast ratio is a
  function of the frame behind them.
- **Tests cover the reducer only.** The rAF loop and canvas compositing are
  verified by hand.
- **9.6 MB of frames live in git.** Committed so a clone is a working site, but
  `npm run assets` rewrites every blob, so each regeneration adds ~9.6 MB to
  history permanently.

## Deploying

[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) lints, tests,
type-checks and builds on every push and pull request, then publishes to Pages
on `main`. One-time setup per repository:

```bash
gh api -X POST /repos/<owner>/<repo>/pages -f build_type=workflow
```

The workflow passes `BASE_PATH=/<repo>/` and every runtime asset URL is built
from `import.meta.env.BASE_URL`, so the site works under any sub-path and at the
root for local dev and custom domains.

## Credits

- **Film** — stock footage from [Pixabay](https://pixabay.com/) (Pixabay Content
  License: free to use, no attribution required).
- **Imagery** — the eleven stills are AI-generated (Google Nano Banana Pro);
  see [`docs/imagery.md`](docs/imagery.md).
- **Type** — [Syne](https://fonts.google.com/specimen/Syne) and
  [Space Mono](https://fonts.google.com/specimen/Space+Mono).
- **Influences** — Margiela, Rick Owens, Comme des Garçons, Ann Demeulemeester.

## License

[MIT](LICENSE) — the code only. The media in `public/` is not mine to relicense.
