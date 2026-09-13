# Imagery

The page has **eleven image slots**. Each one is rendered by `ImageSlot`, which
resolves its `id` to `<base>images/<id>.jpg`. If the file is missing the
component falls back to a refined empty well — a hairline crosshair and the slot
label — so the layout still reads intentionally.

There is no upload UI and nothing is stored in the browser: **the filename *is*
the wiring.** Drop `public/images/<id>.jpg` in place and it appears on the next
reload.

## Slots

| Slot id | Ratio | Section | Subject |
|---|---|---|---|
| `rom-piece-1` | 3:4 | Collection | **Shroud Coat** — floor-length draped wool coat swallowing the body, hood up, figure half-turned into shadow |
| `rom-piece-2` | 3:4 | Collection | **Second Skin** — bonded-jersey dress moulded to the torso, arms wrapped across the chest, skin and fabric the same tone |
| `rom-piece-3` | 3:4 | Collection | **Void Trouser** — wide raw-silk trousers, bare torso cropped at the ribs, fabric catching a single light |
| `rom-piece-4` | 3:4 | Collection | **Relic Knit** — oversized hand-loomed knit unravelling at the hem, figure receding into black |
| `rom-piece-5` | 3:4 | Collection | **Membrane Shirt** — translucent organza shirt, light passing through, shoulder and collarbone beneath |
| `rom-piece-6` | 3:4 | Collection | **Absence Gown** — long cupro gown caught mid-movement, hem lifting, the body barely there |
| `rom-look-1` | 3:4 | Lookbook | *Figure, dissolving* — full-length figure walking out of frame, strong motion blur |
| `rom-look-2` | 4:5 | Lookbook | *The coat, worn by air* — a coat billowing as if worn by no one, empty hood |
| `rom-look-3` | 1:1 | Lookbook | *Detail, the seam of absence* — extreme close-up of a raw hand-stitch on pale fabric |
| `rom-look-4` | 3:4 | Lookbook | *Exit* — the figure from behind at the edge of the frame, mostly shadow, one shoulder lit |
| `rom-house-portrait` | 3:4 | House | Campaign portrait — figure lit from one side against pure black, face turned away |

## The visual rule

Every slot must sit in the same world as the film, or the page falls apart:

> Black and white, monochrome, **pure black background**, single soft key light,
> pale skin and fabric, subtle motion blur, 35mm film grain, high contrast,
> editorial fashion photography, avant-garde couture (Margiela / Rick Owens /
> Comme des Garçons / Ann Demeulemeester), negative space, no colour, no text,
> no logo, no props, faces obscured or turned away.

`ImageSlot` additionally applies `filter: saturate(0)` at runtime, so a stray
colour cast is flattened rather than clashing — but contrast and background
tone have to be right in the source file.

## The shipped set

The eleven images in `public/images/` are **AI-generated** (Google Nano Banana
Pro / Gemini 3 Pro Image), rendered at 2K with one shared system prompt for a
consistent grade, then downscaled:

```bash
ffmpeg -i in.jpg -vf scale=1080:-1 -q:v 4 public/images/<id>.jpg
```

Generation seeds run `101`–`111` in the table order above, so any single slot can
be reproduced or re-rolled in isolation. The per-slot prompt was the subject line
from the table plus the visual rule above, at the listed aspect ratio.

To replace them with real studio photography, keep the filenames and the visual
rule. Nothing in the code needs to change.
