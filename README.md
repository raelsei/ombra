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

Scroll scrubs a **1,458-frame JPEG sequence** onto a canvas — a seekable video
stutters, because every `currentTime` assignment restarts decode from the
nearest keyframe. A build-time ffmpeg pass also reduces the film to the
**luminance centroid of the figure in every frame**, so the headings can dodge a
moving subject with an array lookup instead of per-frame pixel work.

~2,000 lines of TypeScript, one `requestAnimationFrame` loop, React as the only
runtime dependency. Maison OMBRA is **fictional**, the stills are AI-generated
and the film is Pixabay stock — set dressing, credited below.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc -b && vite build → dist/
npm test           # the centroid reducer
npm run lint
```

Node 20+. No API keys, no env file, no backend. Every push to `main` deploys to
Pages via [`deploy.yml`](.github/workflows/deploy.yml).

## Docs

- [`docs/film.md`](docs/film.md) — the frame pipeline, why frames beat a video,
  the footage requirement, how frames are loaded (and the measurements), and the
  known limitations.
- [`docs/engine.md`](docs/engine.md) — the rAF loop, the CSS variables it
  writes, the renderers, tuning constants, URL config, structure, and the DOM
  contract to keep if you reuse the engine.
- [`docs/imagery.md`](docs/imagery.md) — the eleven image slots and their shared
  visual rule.

<details>
<summary>More screens</summary>

<img src="docs/media/01-hero.jpg" width="100%" alt="Hero: the wordmark over the display heading The Shape Remains">
<img src="docs/media/03-collection.jpg" width="100%" alt="Collection: garment studies on a 12-column asymmetric grid">
<img src="docs/media/05-lookbook.jpg" width="100%" alt="Lookbook: two editorial photographs under the heading In Motion">
<img src="docs/media/06-house.jpg" width="100%" alt="House: campaign portrait beside the heading The House">
<img src="docs/media/07-footer.jpg" width="100%" alt="Footer: enquiries block above a giant OMBRA wordmark">

</details>

## Credits

Film: stock footage from [Pixabay](https://pixabay.com/) (Pixabay Content
License). Stills: AI-generated, Google Nano Banana Pro — see
[`docs/imagery.md`](docs/imagery.md). Type:
[Syne](https://fonts.google.com/specimen/Syne) and
[Space Mono](https://fonts.google.com/specimen/Space+Mono). Influences:
Margiela, Rick Owens, Comme des Garçons, Ann Demeulemeester.

[MIT](LICENSE) — the code only. The media in `public/` is not mine to relicense.
