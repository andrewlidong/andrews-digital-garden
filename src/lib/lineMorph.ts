// Geometry helpers that turn the hand-authored subjects in `lineShapes.ts` into
// a single continuous stroke we can morph between and draw as a ribbon.
//
// The pipeline, run once at startup (see `buildMorphCycle`):
//   bezier control points  ->  dense flattened polyline  ->  arc-length resample
//   to exactly N points  ->  fix winding  ->  rotate the index so corresponding
//   points line up across shapes (minimal travel during a morph).
//
// At runtime we `lerpShape` between two resampled shapes and `buildRibbon` the
// result into an interleaved vertex buffer the WebGL component uploads each frame.

import { CYCLE, RAW_SHAPES, type ShapeDef } from "./lineShapes";

// Number of points every shape is resampled to. Each subject's stroke is
// expressed with this many samples so point i in one shape corresponds to point
// i in every other shape — that correspondence is what makes the morph read as a
// single line flowing from one form into the next. A high count is needed to
// carry the dense interior tattoo detail (spirals, pupils, stripes, scales,
// manes) without it blurring together.
export const N = 1180;

// Floats per ribbon vertex: x, y, edge (-1..+1 across the stroke), along (0..1).
export const FLOATS_PER_VERTEX = 4;
// A closed strip needs one extra column (duplicate of index 0) to seal the seam,
// and two vertices (left/right of the centerline) per column.
export const RIBBON_VERTEX_COUNT = (N + 1) * 2;
export const RIBBON_FLOAT_COUNT = RIBBON_VERTEX_COUNT * FLOATS_PER_VERTEX;

type Vec2 = [number, number];

function cubicAt(p0: Vec2, p1: Vec2, p2: Vec2, p3: Vec2, t: number): Vec2 {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return [
    a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0],
    a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1],
  ];
}

// Flatten a shape's chained cubic Béziers into one dense closed polyline. Each
// segment contributes samples for t in [0, 1) so the start of the next segment
// (== this segment's end point) is not duplicated; the loop closes because the
// last segment's end is the first segment's start.
function flattenBeziers(def: ShapeDef, stepsPerSeg = 48): Vec2[] {
  const out: Vec2[] = [];
  for (const seg of def.beziers) {
    for (let i = 0; i < stepsPerSeg; i++) {
      out.push(cubicAt(seg.p0, seg.p1, seg.p2, seg.p3, i / stepsPerSeg));
    }
  }
  return out;
}

// Resample a dense closed polyline to exactly `count` points spaced evenly by
// arc length. Returns a flat [x0,y0, x1,y1, ...] array of length 2*count.
function resampleClosed(dense: Vec2[], count: number): Float32Array {
  const n = dense.length;
  // Cumulative length at each vertex, plus the closing segment back to start.
  const seg: number[] = new Array(n);
  let total = 0;
  for (let i = 0; i < n; i++) {
    const a = dense[i];
    const b = dense[(i + 1) % n];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    seg[i] = len;
    total += len;
  }

  const out = new Float32Array(count * 2);
  const step = total / count;
  let segIdx = 0;
  let segStart = 0; // arc length at the start of segment `segIdx`
  for (let i = 0; i < count; i++) {
    const target = i * step;
    while (segIdx < n - 1 && segStart + seg[segIdx] < target) {
      segStart += seg[segIdx];
      segIdx++;
    }
    const a = dense[segIdx];
    const b = dense[(segIdx + 1) % n];
    const local = seg[segIdx] > 1e-9 ? (target - segStart) / seg[segIdx] : 0;
    out[i * 2] = a[0] + (b[0] - a[0]) * local;
    out[i * 2 + 1] = a[1] + (b[1] - a[1]) * local;
  }
  return out;
}

// Signed area via the shoelace formula; sign tells us the winding direction.
function signedArea(pts: Float32Array): number {
  let area = 0;
  const count = pts.length / 2;
  for (let i = 0; i < count; i++) {
    const j = (i + 1) % count;
    area += pts[i * 2] * pts[j * 2 + 1] - pts[j * 2] * pts[i * 2 + 1];
  }
  return area * 0.5;
}

// Force a consistent (counter-clockwise) winding across all shapes. Mismatched
// winding makes a morph turn the shape inside-out, so we reverse any clockwise loop.
function normalizeWinding(pts: Float32Array): Float32Array {
  if (signedArea(pts) >= 0) return pts;
  const count = pts.length / 2;
  const out = new Float32Array(pts.length);
  for (let i = 0; i < count; i++) {
    const src = (count - i) % count; // reverse order, keep index 0 fixed
    out[i * 2] = pts[src * 2];
    out[i * 2 + 1] = pts[src * 2 + 1];
  }
  return out;
}

// The start point of a closed loop is arbitrary, so before morphing we rotate
// `target`'s indices to whichever offset makes its points travel the least to
// reach `ref`'s points. Minimizes Σ‖target[(i+k)%N] − ref[i]‖² over all k.
function alignRotation(target: Float32Array, ref: Float32Array): Float32Array {
  const count = target.length / 2;
  let bestK = 0;
  let bestCost = Infinity;
  for (let k = 0; k < count; k++) {
    let cost = 0;
    for (let i = 0; i < count; i++) {
      const ti = (i + k) % count;
      const dx = target[ti * 2] - ref[i * 2];
      const dy = target[ti * 2 + 1] - ref[i * 2 + 1];
      cost += dx * dx + dy * dy;
      if (cost >= bestCost) break; // early out once we exceed the best so far
    }
    if (cost < bestCost) {
      bestCost = cost;
      bestK = k;
    }
  }
  if (bestK === 0) return target;
  const out = new Float32Array(target.length);
  for (let i = 0; i < count; i++) {
    const ti = (i + bestK) % count;
    out[i * 2] = target[ti * 2];
    out[i * 2 + 1] = target[ti * 2 + 1];
  }
  return out;
}

// Build the full set of resampled, winding-normalized, mutually-aligned shapes
// in the given order (defaults to CYCLE). Each shape is aligned to the previous
// one so consecutive morphs (including the wrap from the last back to the first)
// stay smooth — pass a shuffled order to randomise the sequence per load.
export function buildMorphCycle(order: readonly string[] = CYCLE, count = N): Float32Array[] {
  const shapes = order.map((id) =>
    normalizeWinding(
      resampleClosed(flattenBeziers(RAW_SHAPES[id as keyof typeof RAW_SHAPES]), count)
    )
  );
  for (let i = 1; i < shapes.length; i++) {
    shapes[i] = alignRotation(shapes[i], shapes[i - 1]);
  }
  return shapes;
}

// Linearly interpolate every coordinate from `from` toward `to`, writing into
// the reused `out` buffer (avoids per-frame allocation).
export function lerpShape(
  from: Float32Array,
  to: Float32Array,
  mix: number,
  out: Float32Array
): void {
  for (let i = 0; i < out.length; i++) {
    out[i] = from[i] + (to[i] - from[i]) * mix;
  }
}

// Morph with a "front" that sweeps along the stroke (tail -> head) instead of all
// at once: points the front has already passed are the new shape, points ahead of
// it are still the old shape, with a soft `width` transition zone between. As
// `front` runs 0 -> 1 the line visibly *redraws itself* into the next subject.
export function lerpShapeSweep(
  from: Float32Array,
  to: Float32Array,
  front: number,
  width: number,
  out: Float32Array
): void {
  const n = out.length / 2;
  const span = front * (1 + width);
  for (let i = 0; i < n; i++) {
    const along = i / (n - 1);
    let m = (span - along) / width;
    m = m < 0 ? 0 : m > 1 ? 1 : m;
    m = m * m * (3 - 2 * m); // smoothstep for a soft front
    const x = i * 2;
    const y = x + 1;
    out[x] = from[x] + (to[x] - from[x]) * m;
    out[y] = from[y] + (to[y] - from[y]) * m;
  }
}

// Expand a closed point loop into a triangle-strip ribbon. At each point we
// offset along the *miter* direction (the bisector of the two adjacent edge
// normals) so the stroke keeps a roughly constant width through corners; the
// miter length is clamped so very sharp turns don't shoot out a spike. Writes
// interleaved [x, y, edge, along] into `out`; returns the vertex count to draw.
const MAX_MITER = 3;

export function buildRibbon(
  pts: Float32Array,
  halfWidth: number,
  out: Float32Array
): number {
  const count = pts.length / 2;
  let o = 0;
  // Iterate count+1 columns so the strip wraps back onto its first column.
  for (let col = 0; col <= count; col++) {
    const i = col % count;
    const prev = (i - 1 + count) % count;
    const next = (i + 1) % count;

    const px = pts[i * 2];
    const py = pts[i * 2 + 1];

    // Incoming and outgoing edge directions.
    let inx = px - pts[prev * 2];
    let iny = py - pts[prev * 2 + 1];
    let outx = pts[next * 2] - px;
    let outy = pts[next * 2 + 1] - py;
    const inLen = Math.hypot(inx, iny) || 1;
    const outLen = Math.hypot(outx, outy) || 1;
    inx /= inLen;
    iny /= inLen;
    outx /= outLen;
    outy /= outLen;

    // Left-hand normals of each edge, then the miter = normalized sum.
    const ninx = -iny;
    const niny = inx;
    const noutx = -outy;
    const nouty = outx;
    let mx = ninx + noutx;
    let my = niny + nouty;
    const mlen = Math.hypot(mx, my) || 1;
    mx /= mlen;
    my /= mlen;

    // Scale so the offset still reaches the edge through the corner, clamped.
    let scale = 1 / Math.max(0.1, mx * noutx + my * nouty);
    if (scale > MAX_MITER) scale = MAX_MITER;
    const ox = mx * halfWidth * scale;
    const oy = my * halfWidth * scale;

    const along = col / count;

    // Left vertex (edge +1), then right vertex (edge -1).
    out[o++] = px + ox;
    out[o++] = py + oy;
    out[o++] = 1;
    out[o++] = along;

    out[o++] = px - ox;
    out[o++] = py - oy;
    out[o++] = -1;
    out[o++] = along;
  }
  return (count + 1) * 2;
}
