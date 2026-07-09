# OMBRA — image generation prompts

11 images fill the placeholders. Keep them all in **one visual world** so they sit with the film:
high‑contrast **black‑and‑white**, a pale/white figure or garment on a **pure black background**,
soft studio light, fine film grain, a sense of motion (slight blur / dissolving edges). Mood:
avant‑garde conceptual couture — Maison Margiela, Rick Owens, Comme des Garçons, Ann Demeulemeester.
No colour, no logos, no text, no props, minimal styling. Faces obscured, cropped, or turned away.

**Reusable style suffix** (append to every prompt):
> black and white, monochrome, pure black background, single soft key light, pale skin and fabric,
> subtle motion blur, 35mm film grain, high contrast, editorial fashion photography, avant‑garde
> couture, negative space, no text, no logo — aspect ratio {RATIO}

Generate at the listed aspect ratio (or larger, same ratio) so the crop fills the slot cleanly.

## Collection — garment studies (slots `rom-piece-1…6`, ratio 3:4)
1. **rom-piece-1 · Shroud Coat** — a floor‑length draped wool coat swallowing the body, hood up, figure half‑turned into shadow. *(3:4)*
2. **rom-piece-2 · Second Skin** — a bonded‑jersey dress moulded to the torso, arms wrapped across the chest, skin and fabric the same tone. *(3:4)*
3. **rom-piece-3 · Void Trouser** — wide raw‑silk trousers, bare torso cropped at the ribs, fabric catching a single light. *(3:4)*
4. **rom-piece-4 · Relic Knit** — an oversized hand‑loomed knit unravelling at the hem, figure receding into black. *(3:4)*
5. **rom-piece-5 · Membrane Shirt** — a translucent organza shirt, light passing through, shoulder and collarbone visible beneath. *(3:4)*
6. **rom-piece-6 · Absence Gown** — a long cupro gown caught mid‑movement, hem lifting, the body barely there. *(3:4)*

## Lookbook — editorial looks (varied ratios)
7. **rom-look-1 · "Figure, dissolving"** — full‑length figure walking out of frame, strong motion blur, dissolving into the black. *(3:4)*
8. **rom-look-2 · "The coat, worn by air"** — a coat billowing as if worn by no one, empty hood, wind‑caught fabric. *(4:5)*
9. **rom-look-3 · "Detail, the seam of absence"** — extreme close‑up of a raw seam / hand‑stitch on pale fabric, shallow depth of field. *(1:1)*
10. **rom-look-4 · "Exit"** — the figure from behind at the edge of the frame, mostly shadow, one shoulder lit. *(3:4)*

## House — campaign portrait (slot `rom-house-portrait`, ratio 3:4)
11. **rom-house-portrait** — a quiet studio portrait, figure lit from one side against pure black, face turned away or in deep shadow, couture drape on the shoulders. *(3:4)*

## Putting images in
- **In the prototype:** drag an image file onto a slot (it persists), or double‑click to reframe.
- **In production:** save to `public/` and set the slot/`<img>` `src` to the path.
