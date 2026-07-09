# Paste this into Claude Code

You can paste the whole block below into Claude Code (run it from this project folder).

---

You are picking up **OMBRA**, an avant‑garde fashion‑house landing page. Read `README.md`,
`IMAGE_PROMPTS.md`, and `OMBRA.dc.html` in this folder first — they fully specify the design
(layout, colours, type, copy, motion). `OMBRA.dc.html` is a **hi‑fi design reference**, not code to
ship verbatim.

## Goal
Build a production version of this landing page as a clean, standalone site.

## Stack
- If this repo already has a framework, use it and follow its conventions.
- Otherwise scaffold a fresh **Vite + React + TypeScript** app (no heavy UI kit). Plain CSS or
  CSS modules — no Tailwind unless already present. Keep dependencies minimal.

## Requirements
1. **Recreate all six sections pixel‑accurately** from the README's tokens & copy: Hero → Apparition
   → Collection (6 cards) → Lookbook (4 asymmetric figures) → House → Footer, plus the persistent
   chrome (nav, bottom status bar with the live `FIGURE X/Y` readout, scroll‑progress line, inset
   frame + corner ticks + rotated side rails). Fonts: **Syne** (display) + **Space Mono** (mono).
   Palette: bone `#ECE6DA` on black `#000`, cold accent `#A9B4C0`.
2. **Film backdrop + masking.** Fixed full‑viewport video behind the content on pure black so the
   footage's black background disappears and only the white figure shows. Apply
   `filter:contrast(1.14) brightness(1.03) saturate(0)`. First, re‑encode the video for production:
   `ffmpeg -i uploads/77316-561991002.mp4 -movflags +faststart out.mp4` and also export a WebM/VP9.
3. **Buttery scroll‑scrubbing (the important part).** Do NOT scrub by seeking `currentTime`.
   Implement a **frame‑sequence**: at build time extract ~120–180 downscaled frames
   (`ffmpeg -i film.mp4 -vf "fps=2,scale=960:-1" public/frames/%03d.jpg`) or a sprite sheet, preload
   them, and on scroll draw the nearest frame to a `<canvas>` (cover‑fit). Map scroll progress →
   frame index, ease the float index (~0.2 lerp), redraw only on index change. Keep a **"smooth
   drift"** alternate mode that just plays the video natively at ~0.5× with scroll‑velocity speed‑up.
   Make the mode a prop/toggle; default to frame‑scrub.
4. **Reactive figure layer.** Reproduce the luminance‑centroid behaviour: per frame (or precomputed
   per extracted frame at build time) find the bright figure's centroid → CSS vars `--mx/--my/--mp`
   (eased) that drive the eyeline + `FIGURE X/Y` readout, the spotlight, and the hero/apparition text
   "dodge". Fall back to centre with instruments hidden when there's no figure.
5. **Scroll reveals.** `IntersectionObserver`; mask‑rise for big headings, fade+rise+blur for the
   rest; stagger; reveal first‑viewport immediately; safety‑net so nothing stays hidden.
6. **Real imagery.** Wire the 11 image slots (`rom-piece-1…6`, `rom-look-1…4`, `rom-house-portrait`)
   to real files at the aspect ratios in the README. I will generate them with the prompts in
   `IMAGE_PROMPTS.md`; put them in `public/` and reference by path.
7. **Responsive.** Desktop‑first (it's a couture canvas) but must not break on tablet/mobile — let
   the grids collapse gracefully and keep type legible. Respect `prefers-reduced-motion` (freeze the
   film on a still frame, skip reveals).
8. **Performance & quality.** 60 fps scroll, no layout thrash (drive everything from one rAF loop +
   CSS vars), lazy‑load images, no console errors, Lighthouse‑clean. Accessible: real landmarks,
   focus states, `alt` text, `aria` on the decorative film.

## Deliverable
A runnable app (`npm i && npm run dev`), a short README explaining the frame‑sequence build step,
and the video/frames prep documented. Ask me before adding any content or sections not in the spec.
