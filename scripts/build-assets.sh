#!/usr/bin/env bash
# ===================================================================
# OMBRA — build-time media pipeline.
# Regenerates every derived asset in public/ from the source film.
# Requires: ffmpeg + node on PATH. Run from the project root:  npm run assets
# ===================================================================
set -euo pipefail

SRC="${1:-uploads/77316-561991002.mp4}"
FPS=24                  # → ~1458 frames over the 60.7s source.
                        # Density matters: the page scrolls ~6200px, so this is
                        # ~4.3px per frame → very smooth scrub. Lower fps = visible
                        # stepping; frames are tiny (~8.5KB) so density is cheap.
LUM_W=48; LUM_H=27      # luminance sampling grid (matches the runtime sampler)
TH=62                   # bright-figure threshold (0–255)
OUT_FRAMES="public/frames"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

command -v ffmpeg >/dev/null || { echo "ffmpeg not found on PATH"; exit 1; }
command -v node   >/dev/null || { echo "node not found on PATH"; exit 1; }
[ -f "$SRC" ] || { echo "source film not found: $SRC"; exit 1; }

echo "→ source: $SRC"
mkdir -p "$OUT_FRAMES" public/images

# 1) Fast-start MP4 (moov atom to the front; stream-copy, keeps H.264).
echo "→ film.mp4 (faststart, stream-copy)"
ffmpeg -y -loglevel error -i "$SRC" -c copy -movflags +faststart public/film.mp4

# 2) WebM / VP9 — broader, lighter decode.
echo "→ film.webm (VP9)"
ffmpeg -y -loglevel error -i "$SRC" -c:v libvpx-vp9 -b:v 0 -crf 34 \
  -row-mt 1 -deadline good -cpu-used 4 -an public/film.webm

# 3) Poster still (reduced-motion freeze + <video poster>).
echo "→ film-poster.jpg"
ffmpeg -y -loglevel error -ss 1.5 -i "$SRC" -frames:v 1 -vf "scale=1280:-1" -q:v 3 public/film-poster.jpg

# 4) Frame sequence for scroll-scrubbing (downscaled, cover-fit at runtime).
echo "→ frame sequence @ ${FPS}fps"
rm -f "$OUT_FRAMES"/*.jpg
ffmpeg -y -loglevel error -i "$SRC" -vf "fps=${FPS},scale=960:-1" -q:v 4 "$OUT_FRAMES/%03d.jpg"
N=$(ls "$OUT_FRAMES"/*.jpg | wc -l | tr -d ' ')
echo "  ${N} frames"

# 5) Per-frame luminance centroid (same fps → indices align with the frames).
#    ffmpeg emits a tiny raw grayscale stream; node reads it with zero deps.
echo "→ luminance centroids → src/frames-meta.json"
ffmpeg -y -loglevel error -i "$SRC" -vf "fps=${FPS},scale=${LUM_W}:${LUM_H}" \
  -pix_fmt gray -f rawvideo "$TMP/lum.gray"

LUM="$TMP/lum.gray" N="$N" W="$LUM_W" H="$LUM_H" TH="$TH" FPS="$FPS" node -e '
const fs=require("fs");
const {LUM,W,H,TH,FPS}=process.env;
const w=+W,h=+H,th=+TH,per=w*h;
const buf=fs.readFileSync(LUM);
const N=Math.floor(buf.length/per);
const out=[];
for(let f=0;f<N;f++){
  let ws=0,xs=0,ys=0,br=0,base=f*per;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const l=buf[base+y*w+x];
    if(l>th){const q=l-th; ws+=q; xs+=q*x; ys+=q*y; br++;}
  }
  let mx=0.5,my=0.5,mp=0;
  if(ws>0){mx=xs/ws/(w-1); my=ys/ws/(h-1); mp=Math.min(1,(br/per)/0.24);}
  out.push([+mx.toFixed(4),+my.toFixed(4),+mp.toFixed(4)]);
}
fs.writeFileSync("src/frames-meta.json",JSON.stringify({fps:+FPS,count:N,width:960,threshold:th,centroids:out}));
console.log("  "+N+" centroids");
'

echo "✓ assets rebuilt"
