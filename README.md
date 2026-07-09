# OMBRA — Conceptual Couture (design reference)

A dark, avant-garde fashion-house landing experience built around a black‑and‑white film
of a model. The black background of the footage merges into the black UI so only the white
figure floats ("masked" look), and the page content reacts to where the figure is on screen.

> **What these files are.** `OMBRA.dc.html` is a **design reference** — a high‑fidelity HTML
> prototype that shows the intended look, motion and behaviour. It is *not* meant to be shipped
> as‑is into a product. The task for production is to **recreate this design in your target stack**
> (React/Next, Vue, Astro, SvelteKit, plain Vite — whatever the codebase uses; if there is no
> codebase yet, Next.js + plain CSS/CSS‑modules is a good default) using that stack's patterns.
> The prototype also *runs* directly in a browser via a static server (see below) if you just want
> to see it.

Fidelity: **hi‑fi** (final colours, type, spacing, motion). Recreate pixel‑accurately.

---

## 1. Run the prototype locally

The file uses `fetch()` (to load the video as a Blob) and ES modules, so it must be served over
HTTP — opening it as a `file://` will not work.

```bash
# from the project root
npx serve .            # then open the printed URL + /OMBRA.dc.html
# or
python3 -m http.server 8000   # open http://localhost:8000/OMBRA.dc.html
```

`OMBRA.dc.html` is an **Omelette Design Component**: a self‑contained streaming component whose
runtime is `support.js` (loaded automatically by the file). You do not need Node/build tooling to
view it — any static file server works. The video decodes in every real browser (Chrome, Safari,
Edge, Firefox); only sandboxed/headless renderers may fail to decode H.264.

---

## 2. Files

| File | Role |
|---|---|
| `OMBRA.dc.html` | The design (template markup + a `Component` logic class). Everything lives here. |
| `image-slot.js` | `<image-slot>` web component — the drag‑and‑drop image placeholders. |
| `support.js` | Design‑component runtime (do not edit). |
| `uploads/77316-561991002.mp4` | The source film. 1920×1080, ~60.7 s, **60 fps**, H.264 High profile, ~2.8 MB. Black background, white/pale model that walks in and out of frame. |
| `README.md` / `CLAUDE_CODE_PROMPT.md` / `IMAGE_PROMPTS.md` | This handoff. |

---

## 3. How the prototype works

**Layering (z‑index):**
- `1` — fixed full‑viewport film **stage**: the `<video>` (`object-fit:cover`,
  `filter:contrast(1.14) brightness(1.03) saturate(0)`, `scale(1.04)`), a faint SVG‑turbulence grain
  (`mix-blend-mode:overlay`), a vignette, a figure‑tracking spotlight, and a figure‑tracking "eyeline".
- `80` — a thin inset frame (`inset:14px`, `1px` hairline) + corner registration ticks + rotated side rails.
- `100` — top nav + bottom status bar; `101` — 1px scroll‑progress line.
- `3` — the scrolling `<main>` content, sitting above the film. Content panels use translucent black
  gradients so the figure ghosts through; text sits in the negative space.
- `200` — a loader ("OMBRA / Summoning the figure") that hides on `canplay` (or a 2.6 s failsafe).

**The masking.** There is no alpha mask. The page background and the footage background are both
black, so the black of the film is invisible and only the bright figure reads. A contrast filter
crushes any compression noise in the blacks.

**Motion (two modes, `videoMotion` tweak):**
- **Smooth drift** (default) — the video *plays* natively (buttery, honours the 60 fps source) at a
  slow idle rate (`baseSpeed`, default `0.5×`); scroll velocity gently ramps the playback rate up
  (`+` up to `~3.4×`, eased with a `0.06` lerp) and it eases back to idle when you stop. **No seeking.**
- **Scroll scrub** — video time is mapped to scroll position by seeking `currentTime`. This is the
  effect the client wants but seeking an H.264 stream is choppy (decode restarts from the nearest
  keyframe). **This is the one thing to upgrade for production — see §4.**

**Reactive layer.** Every animation frame a 48×27 offscreen canvas samples the video and computes
the luminance **centroid** of the bright figure (threshold 62) → `--mx`, `--my` (0–1) and a
`--mp` presence value, all eased. These CSS variables drive: the eyeline + live `FIGURE X/Y`
readout, the spotlight, the hero heading's horizontal "dodge" away from the figure, and the
Apparition heading's dodge toward it. When no figure/decode is present everything falls back to
centre with `--mp:0` (instruments fade out).

**Reveals.** An `IntersectionObserver` reveals `[data-reveal]` elements by mutating inline styles
(opacity/transform/filter with inline transitions). Big headings use a *mask‑rise*
(`translateY(115%)` inside an `overflow:hidden` wrapper). Anything already in the first viewport is
revealed immediately; a 6 s safety net force‑reveals everything so nothing can get stuck hidden.

**Responsive.** All layout is fluid (clamp / auto-fit). A width-based JS pass (`_applyResponsive`, run on load + resize) collapses the Lookbook and House grids to one column, hides the rotated side-rails and secondary chrome, and tightens the status bar below ~620–900px — no media queries (kept inline-first per the component model).

**Tweaks (props):** `videoMotion` (enum), `baseSpeed` (0.2–1.5×), `showFigureData` (bool),
`grain` (bool), `accent` (colour: `#A9B4C0` steel‑blue default, plus gold/vermilion/steel/bone).

---

## 4. The main production task — buttery scroll‑scrubbing

Scroll‑scrubbing a compressed video by seeking `currentTime` is inherently choppy. The correct
technique (used by Apple product pages) is a **pre‑decoded frame sequence**:

1. **Prefer build‑time extraction.** Use `ffmpeg` to export ~120–180 frames as an image sequence or
   a sprite sheet, e.g. `ffmpeg -i film.mp4 -vf "fps=2,scale=960:-1" frames/%03d.jpg`. Ship those.
   (Client‑side extraction — seeking the video 120× at load and caching `ImageBitmap`s — also works
   and was prototyped, but it costs a few seconds of load and ~100 MB RAM, and depends on reliable
   decode. Build‑time is better.)
2. On scroll, map scroll progress → frame index and **draw the nearest pre‑decoded frame to a
   `<canvas>`** (cover‑fit). No `currentTime` seeking → perfectly smooth, exactly scroll‑locked.
3. Ease the *float* frame index toward the target (≈`0.2` lerp) for softness; only redraw when the
   rounded index changes.
4. **Pre‑compute the figure centroid per frame** at build time (or during extraction) and store it
   alongside each frame, so the reactive layer reads a lookup instead of sampling live.
5. Keep **Smooth drift** as the alternate mode (it is already smooth and needs no frames).

**Also recommended for production video:**
- Re‑encode to a **fast‑start** MP4 (`ffmpeg -movflags +faststart`) — the source has its `moov`
  atom at the end, which delays first playback until fully downloaded.
- Ship a **WebM/VP9** alongside the MP4 for broadest/lightest decoding.
- Consider a slightly higher‑contrast/true‑black grade so the background drops out perfectly.

---

## 5. Design tokens

**Colour**
- Base / stage / card‑empty: `#000000`; card wells: `#0A0A0A`
- Primary ink (bone): `#ECE6DA`
- Ink dim: `rgba(236,230,218,.55)` · secondary `rgba(236,230,218,.6/.5)` · faint `rgba(236,230,218,.34–.4)`
- Hairlines: `rgba(236,230,218,.10–.14)`
- Live / cold accent (`--live`): `#A9B4C0` (default). Alternates: `#C9A227` gold, `#B4472E` vermilion, `#8E97A6` steel, `#E3DCCB` light bone.
- Content panels: vertical black gradients ≈ `rgba(0,0,0,.84–.90)`.

**Type** (Google Fonts)
- Display: **Syne** 700/800 — wordmark, hero slogan, section titles, footer wordmark; **Syne 400** for the House body paragraphs.
- Everything else: **Space Mono** 400/700 — nav, labels, captions, coordinates, small body.
- Scales: hero H1 `clamp(46px,11.5vw,172px)` / `lh .9` / `ls -.02em`; "Apparition" `clamp(52px,16vw,240px)` / `ls -.035em`; section titles `clamp(38px,7vw,104px)`; footer wordmark `clamp(64px,22vw,340px)`; labels `10.5px` `ls .28–.34em` uppercase; mono body `12.5–13px` `lh 1.9`; House paragraphs Syne `clamp(15px,1.4vw,19px)` `lh 1.72`.

**Layout / spacing**
- Content max‑width `1200–1360px`; section padding `clamp(120px,16vh,200px)` vertical, `clamp(40px,7vw,120px)` horizontal.
- Fixed frame `inset:14px`; side rails at `~18px`; nav padding `28px`; status bar padding `16px`.
- Grids: Collection `repeat(auto-fit,minmax(240px,1fr))`; Lookbook 12‑col editorial (spans `1/7`, `8/13`, `2/6`, `8/12` with vertical offsets); House `0.9fr / 1.1fr`.
- Card aspect ratios: products `3:4`; look 1 `3:4`, look 2 `4:5`, look 3 `1:1`, look 4 `3:4`; portrait `3:4`.

**Motion**
- Reveal easing `cubic-bezier(.16,.84,.3,1)`, ~1–1.2 s, staggered `0.05–0.35 s`.
- Drift idle `0.5×`, scroll boost eased at `0.06`; centroid eased at `0.09–0.11`.

---

## 6. Screens & copy

1. **Hero** (`#top`) — eyebrow `— Conceptual Couture — Antwerp / Paris`; H1 `The Body / Is Only / A Rumour` (line 2 dimmed); meta `APPARITION — Autumn·Winter 2026 — Edition of Few`; scroll cue `Scroll to summon`. Hero text dodges away from the figure.
2. **Apparition** — right‑aligned slogan beat. Eyebrow `A study in disappearance`; huge `Apparition` (`mix-blend-mode:difference`); line `Cut for the silhouette a figure leaves in a room once it has gone. Worn by no one. Seen by all.`
3. **Collection** (`#collection`) — `01 — The Collection` / `Six Objects` + intro. 6 cards, each an `<image-slot>` + `NN — Name` / material: `01 Shroud Coat · Wool·Silence`, `02 Second Skin · Bonded Jersey`, `03 Void Trouser · Raw Silk`, `04 Relic Knit · Hand Loom`, `05 Membrane Shirt · Organza`, `06 Absence Gown · Cupro·Air`.
4. **Lookbook** (`#lookbook`) — `02 — Lookbook` / `In Motion`. 4 asymmetric figures with captions: `Look 01 — Figure, dissolving`, `Look 02 — The coat, worn by air`, `Look 03 — Detail, the seam of absence`, `Look 04 — Exit`.
5. **House** (`#house`) — portrait slot + `03 — The House` / `Light, and its absence.` + two Syne paragraphs + a mono spec list (Atelier: Antwerp & Paris · Material: Wool, silk, organza, air · Release: Once yearly · edition of few · Contact: studio@ombra.atelier).
6. **Footer** — `Nothing to wear. Everything to become.` + giant `OMBRA` wordmark + links (Instagram/Contact/Stockists/Press) + `© 2026 OMBRA · Apparition AW26 · All figures imagined`.

Persistent chrome: nav (`OMBRA` · Collection/Lookbook/House · `AW·26`); bottom status bar (`FIGURE X/Y` live readout · `mm:ss / 01:00` · `NN / 06` section index · blinking `REC`); scroll‑progress line; inset frame + corner ticks + rotated side rails.

---

## 7. Assets to supply

The 11 `<image-slot id="…">` placeholders take the real photography (drag‑and‑drop in the
prototype, or set a real image path in production). See **IMAGE_PROMPTS.md** for a generation prompt
per slot and the required aspect ratios. Keep every image **high‑contrast black‑and‑white on a black
background** so it sits in the same world as the film.

Slot ids: `rom-piece-1…6` (collection), `rom-look-1…4` (lookbook), `rom-house-portrait` (House).
