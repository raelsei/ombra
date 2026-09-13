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
# ffmpeg emits a raw grayscale stream; node reduces it with zero dependencies.
echo "→ luminance centroids → src/frames-meta.json"
ffmpeg -y -loglevel error -i "$SRC" -vf "fps=${FPS},scale=${LUM_W}:${LUM_H}" \
  -pix_fmt gray -f rawvideo "$TMP/lum.gray"

LUM="$TMP/lum.gray" W="$LUM_W" H="$LUM_H" TH="$TH" FPS="$FPS" node -e '
const fs=require("fs");
const {LUM,W,H,TH,FPS}=process.env;
const w=+W,h=+H,th=+TH,per=w*h;
const buf=fs.readFileSync(LUM);
const N=Math.floor(buf.length/per);
const out=[];
for(let f=0;f<N;f++){
  let ws=0,xs=0,ys=0,base=f*per;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const l=buf[base+y*w+x];
    if(l>th){const q=l-th; ws+=q; xs+=q*x; ys+=q*y;}
  }
  let mx=0.5,my=0.5;
  if(ws>0){mx=xs/ws/(w-1); my=ys/ws/(h-1);}
  out.push([+mx.toFixed(4),+my.toFixed(4)]);
}
fs.writeFileSync("src/frames-meta.json",JSON.stringify({fps:+FPS,count:N,width:960,threshold:th,centroids:out}));
console.log("  "+N+" centroids");
'

echo "✓ assets rebuilt"
