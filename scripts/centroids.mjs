// OMBRA — luminance-centroid reducer.
//
// Reduces a raw 8-bit grayscale stream (as emitted by
// `ffmpeg -pix_fmt gray -f rawvideo`) to one threshold-weighted luminance
// centroid per frame. The runtime reads those centroids from
// src/frames-meta.json and dodges the heading away from the figure.
//
// Zero dependencies beyond node:fs / node:path / node:url.
//
// Library:  import { centroids } from "./centroids.mjs"
// CLI:      node scripts/centroids.mjs --raw <file> --width 48 --height 27 \
//                  --threshold 62 --fps 24 --frame-width 960 \
//                  --out src/frames-meta.json
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// A frame counts as degenerate once more than this fraction of its pixels
// clears the threshold: the centroid is still arithmetically valid, but it has
// collapsed toward the middle of the grid and no longer tracks anything.
const WASHOUT_FRACTION = 0.6;

// Above this fraction of degenerate frames the figure track is inert and the
// operator needs to hear about it.
export const DEGENERATE_ALARM = 0.25;

/**
 * Threshold-weighted luminance centroid of every frame in `gray`.
 *
 * Each pixel brighter than `threshold` contributes weight `l - threshold`, so
 * the centroid is pulled by *excess* brightness rather than by bright-pixel
 * count. Frames where nothing clears the threshold fall back to the grid
 * centre.
 *
 * @param {Uint8Array|Buffer} gray concatenated width*height frames, 8-bit gray
 * @param {{width:number,height:number,threshold:number}} opts
 * @returns {{count:number,centroids:[number,number][],degenerate:number}}
 *   `centroids` are normalised to 0–1 and rounded to 4 decimals; `degenerate`
 *   counts frames in which no figure could be located (nothing cleared the
 *   threshold, or the frame was washed out).
 */
export function centroids(gray, { width, height, threshold }) {
  const w = +width;
  const h = +height;
  const th = +threshold;
  if (!Number.isInteger(w) || w < 2) throw new Error(`width must be an integer >= 2, got ${width}`);
  if (!Number.isInteger(h) || h < 2) throw new Error(`height must be an integer >= 2, got ${height}`);
  if (!Number.isFinite(th)) throw new Error(`threshold must be finite, got ${threshold}`);

  const per = w * h;
  const count = Math.floor(gray.length / per);
  const washout = per * WASHOUT_FRACTION;
  const out = [];
  let degenerate = 0;

  for (let f = 0; f < count; f++) {
    const base = f * per;
    let ws = 0;
    let xs = 0;
    let ys = 0;
    let lit = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const l = gray[base + y * w + x];
        if (l > th) {
          const q = l - th;
          ws += q;
          xs += q * x;
          ys += q * y;
          lit++;
        }
      }
    }
    let mx = 0.5;
    let my = 0.5;
    if (ws > 0) {
      mx = xs / ws / (w - 1);
      my = ys / ws / (h - 1);
    }
    if (ws === 0 || lit > washout) degenerate++;
    out.push([+mx.toFixed(4), +my.toFixed(4)]);
  }

  return { count, centroids: out, degenerate };
}

function parseArgs(argv) {
  const opts = {};
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i];
    const value = argv[i + 1];
    if (!key.startsWith("--") || value === undefined) {
      throw new Error(`expected --flag value pairs, got "${argv.slice(i).join(" ")}"`);
    }
    opts[key.slice(2)] = value;
  }
  return opts;
}

function main(argv) {
  const o = parseArgs(argv);
  const raw = o.raw;
  const out = o.out ?? "src/frames-meta.json";
  const width = +o.width;
  const height = +o.height;
  const threshold = +o.threshold;
  const fps = +o.fps;
  const frameWidth = +o["frame-width"];
  if (!raw) throw new Error("--raw <rawvideo file> is required");

  const gray = fs.readFileSync(raw);
  const result = centroids(gray, { width, height, threshold });

  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(
    out,
    JSON.stringify({
      fps,
      count: result.count,
      width: frameWidth,
      threshold,
      centroids: result.centroids,
    }),
  );
  console.log("  " + result.count + " centroids");

  if (result.count > 0 && result.degenerate > result.count * DEGENERATE_ALARM) {
    const pct = ((result.degenerate / result.count) * 100).toFixed(1);
    process.stderr.write(
      [
        "",
        "  !! WARNING — figure tracking is inert ------------------------------",
        `  ${pct}% of frames (${result.degenerate}/${result.count}) yielded no locatable figure.`,
        "  This source film does not look like a bright subject on a near-black",
        "  field, which is what the centroid pass requires. The --mx figure track",
        "  that drives the heading dodge will not move.",
        `  Tune TH (currently ${threshold}) in scripts/build-assets.sh and re-run.`,
        "  The frame scrub itself is unaffected.",
        "  --------------------------------------------------------------------",
        "",
      ].join("\n"),
    );
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main(process.argv.slice(2));
}
