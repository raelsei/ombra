# OMBRA — image manifest

The 11 slot images in `public/images/` are AI-generated (regenerable), then
downscaled to 1080px wide and served as JPEG. `ImageSlot` resolves each by id
(`/images/<id>.jpg`) and cover-fits it with `filter:saturate(0)`.

- **Model**: `fal-ai/nano-banana-pro` (Google Nano Banana Pro / Gemini 3 Pro Image), via fal MCP
- **Resolution generated**: 2K → resized to 1080w, `ffmpeg -q:v 4`
- **safety_tolerance**: `5`
- **system_prompt** (unified grade across all 11):
  > Master black-and-white film photographer. Every image: monochrome, pure #000
  > black background, single soft key light, pale skin/fabric, high contrast, 35mm
  > grain, avant-garde couture (Margiela/Rick Owens/CDG), faces obscured or turned
  > away, no color, no text, no logo, no props.
- Per-slot `prompt` = the IMAGE_PROMPTS.md line + the reusable B&W style suffix.

| slot id | aspect_ratio | seed | source prompt |
|---|---|---|---|
| rom-piece-1 | 3:4 | 101 | Shroud Coat |
| rom-piece-2 | 3:4 | 102 | Second Skin |
| rom-piece-3 | 3:4 | 103 | Void Trouser |
| rom-piece-4 | 3:4 | 104 | Relic Knit |
| rom-piece-5 | 3:4 | 105 | Membrane Shirt |
| rom-piece-6 | 3:4 | 106 | Absence Gown |
| rom-look-1 | 3:4 | 107 | Figure, dissolving |
| rom-look-2 | 4:5 | 108 | The coat, worn by air |
| rom-look-3 | 1:1 | 109 | Detail, the seam of absence |
| rom-look-4 | 3:4 | 110 | Exit |
| rom-house-portrait | 3:4 | 111 | Campaign portrait |

## Regenerate a slot
Re-run the same model with the slot's seed/aspect/prompt (fal MCP `run_model`,
`fal-ai/nano-banana-pro`), download `images[0].url`, then
`ffmpeg -i in.jpg -vf scale=1080:-1 -q:v 4 public/images/<id>.jpg`.
To swap in real studio photography, just drop `public/images/<id>.jpg` (same name).
