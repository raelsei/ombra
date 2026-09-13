// node --test scripts/
import test from "node:test";
import assert from "node:assert/strict";
import { centroids } from "./centroids.mjs";

const W = 11;
const H = 11;
const TH = 62;
const OPTS = { width: W, height: H, threshold: TH };

// 4-decimal rounding on a 0–1 range: half a unit in the last place.
const EPS = 5e-5;

function frame(fill = 0) {
  return new Uint8Array(W * H).fill(fill);
}

function put(f, x, y, value) {
  f[y * W + x] = value;
  return f;
}

function concat(...frames) {
  const out = new Uint8Array(frames.length * W * H);
  frames.forEach((f, i) => out.set(f, i * W * H));
  return out;
}

test("a single bright blob lands on its own coordinates", () => {
  const f = put(frame(), 3, 7, 200);
  const r = centroids(f, OPTS);
  assert.equal(r.count, 1);
  assert.equal(r.degenerate, 0);
  // x = 3/(11-1), y = 7/(11-1)
  assert.ok(Math.abs(r.centroids[0][0] - 0.3) < EPS, `mx ${r.centroids[0][0]}`);
  assert.ok(Math.abs(r.centroids[0][1] - 0.7) < EPS, `my ${r.centroids[0][1]}`);
});

test("an all-black frame falls back to the grid centre and is degenerate", () => {
  const r = centroids(frame(0), OPTS);
  assert.deepEqual(r.centroids, [[0.5, 0.5]]);
  assert.equal(r.degenerate, 1);
});

test("a pixel exactly at the threshold does not clear it", () => {
  const r = centroids(put(frame(), 2, 2, TH), OPTS);
  assert.deepEqual(r.centroids, [[0.5, 0.5]]);
  assert.equal(r.degenerate, 1);
});

test("a washed-out frame is degenerate even though its centroid is valid", () => {
  // Every pixel clears the threshold, so there is no figure to find — but the
  // brightness is lopsided, so the centroid is not the 0.5,0.5 fallback.
  const f = frame(200);
  for (let y = 0; y < H; y++) for (let x = 0; x < 5; x++) f[y * W + x] = 255;
  const r = centroids(f, OPTS);
  assert.equal(r.degenerate, 1);
  assert.notDeepEqual(r.centroids[0], [0.5, 0.5]);
  assert.ok(r.centroids[0][0] < 0.5, `washout pulls left: ${r.centroids[0][0]}`);
});

test("a blob covering just over 60% of the grid trips the washout branch", () => {
  const per = W * H; // 121; 60% = 72.6
  const under = frame();
  for (let i = 0; i < 72; i++) under[i] = 255;
  assert.equal(centroids(under, OPTS).degenerate, 0);

  const over = frame();
  for (let i = 0; i < 73; i++) over[i] = 255;
  assert.equal(centroids(over, OPTS).degenerate, 1);
  assert.ok(73 / per > 0.6 && 72 / per <= 0.6);
});

test("weighting is by excess over threshold, not by bright-pixel count", () => {
  const f = frame();
  put(f, 0, 0, 255); // excess 193
  put(f, 10, 0, 70); //  excess 8
  const [[mx, my]] = centroids(f, OPTS).centroids;
  // Binary weighting would put this dead centre.
  const binaryMidpoint = 0.5;
  assert.notEqual(mx, binaryMidpoint);
  assert.ok(mx < 0.1, `centroid should sit near the bright blob, got ${mx}`);
  const expected = (193 * 0 + 8 * 10) / (193 + 8) / (W - 1);
  assert.ok(Math.abs(mx - expected) < EPS, `mx ${mx} vs ${expected}`);
  assert.ok(Math.abs(my - 0) < EPS, `my ${my}`);
});

test("one centroid per frame, in stream order", () => {
  const a = put(frame(), 0, 0, 255);
  const b = put(frame(), 5, 5, 255);
  const c = put(frame(), 10, 10, 255);
  const r = centroids(concat(a, b, c), OPTS);
  assert.equal(r.count, 3);
  assert.deepEqual(r.centroids, [
    [0, 0],
    [0.5, 0.5],
    [1, 1],
  ]);
});

test("a trailing partial frame is ignored rather than half-reduced", () => {
  const whole = put(frame(), 4, 4, 255);
  const stream = new Uint8Array(W * H + 7);
  stream.set(whole, 0);
  stream.fill(255, W * H);
  const r = centroids(stream, OPTS);
  assert.equal(r.count, 1);
  assert.deepEqual(r.centroids, [[0.4, 0.4]]);
});

test("a degenerate grid geometry is rejected instead of dividing by zero", () => {
  assert.throws(() => centroids(frame(), { width: 1, height: H, threshold: TH }), /width/);
  assert.throws(() => centroids(frame(), { width: W, height: 1, threshold: TH }), /height/);
});
