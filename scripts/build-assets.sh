#!/usr/bin/env bash
# OMBRA — regenerates every derived asset in public/ from a source film.
# Requires ffmpeg + node on PATH. Run from the project root:
#
#   npm run assets                 # re-derive from the shipped public/film.mp4
#   npm run assets my-clip.mov     # swap in your own footage
set -euo pipefail

SRC="${1:-public/film.mp4}"
FPS=24                  # frame density = scrub smoothness; see README
LUM_W=48; LUM_H=27      # luminance grid, matches the runtime drift sampler
# Footage requirement: the centroid pass expects a bright subject moving on a
# near-black field. Other footage washes out past TH and the figure track dies.
TH=62                   # bright-figure threshold (0–255)
OUT_FRAMES="public/frames"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

command -v ffmpeg >/dev/null || { echo "ffmpeg not found on PATH"; exit 1; }
command -v node   >/dev/null || { echo "node not found on PATH"; exit 1; }
[ -f "$SRC" ] || { echo "source film not found: $SRC"; exit 1; }

echo "→ source: $SRC"
mkdir -p "$OUT_FRAMES" public/images

# Staged through $TMP so re-deriving from public/film.mp4 can't eat its own input.
echo "→ film.mp4 (faststart, stream-copy)"
ffmpeg -y -loglevel error -i "$SRC" -c copy -movflags +faststart "$TMP/film.mp4"
mv "$TMP/film.mp4" public/film.mp4

echo "→ film-poster.jpg"
ffmpeg -y -loglevel error -ss 1.5 -i "$SRC" -frames:v 1 -vf "scale=1280:-1" -q:v 3 public/film-poster.jpg

echo "→ frame sequence @ ${FPS}fps"
rm -f "$OUT_FRAMES"/*.jpg
ffmpeg -y -loglevel error -i "$SRC" -vf "fps=${FPS},scale=960:-1" -q:v 4 "$OUT_FRAMES/%03d.jpg"
N=$(ls "$OUT_FRAMES"/*.jpg | wc -l | tr -d ' ')
echo "  ${N} frames"

# Same fps as the frame export, so centroid N lines up with frame N exactly.
# ffmpeg emits a raw grayscale stream; scripts/centroids.mjs reduces it with
# zero dependencies, and warns on stderr if the footage defeats TH.
echo "→ luminance centroids → src/frames-meta.json"
ffmpeg -y -loglevel error -i "$SRC" -vf "fps=${FPS},scale=${LUM_W}:${LUM_H}" \
  -pix_fmt gray -f rawvideo "$TMP/lum.gray"

node scripts/centroids.mjs \
  --raw "$TMP/lum.gray" \
  --width "$LUM_W" --height "$LUM_H" \
  --threshold "$TH" --fps "$FPS" \
  --frame-width 960 \
  --out src/frames-meta.json

echo "✓ assets rebuilt"
