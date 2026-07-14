// The cast of subjects the background line morphs through, each defined as a
// SINGLE closed stroke (the pen never lifts). Shapes are authored as a loop of
// anchor points tracing the silhouette, then smoothed into chained cubic Béziers
// — anchors are far easier to hand-tune than raw control points, and the smoothing
// gives the organic, flowing line we want. All coords are normalized and roughly
// centered on the origin, within about [-0.65, 0.65], x to the right, y up.
//
// These animal/character silhouettes are deliberately loose, stylized line-art
// homages (recognizable by outline, not exact likenesses) and a first pass meant
// to be iterated on — tweak an anchor list and the dev server hot-reloads it.

export type Vec2 = [number, number];

export type CubicBezier = {
  p0: Vec2; // start (== previous segment's p3)
  p1: Vec2; // control 1
  p2: Vec2; // control 2
  p3: Vec2; // end
};

export type SubjectId =
  | "rose"
  | "snoopy"
  | "tiger"
  | "monkey"
  | "daisy"
  | "sunflower";

export type ShapeDef = {
  name: string;
  closed: true;
  beziers: CubicBezier[];
};

// Convert a closed loop of anchor points into smooth cubic Béziers using the
// Catmull-Rom -> Bézier construction: the curve passes through every anchor, and
// the control points are derived from neighbouring anchors (wrapping around the
// loop) so the whole thing is one continuous, tangent-continuous closed stroke.
function smoothClosed(anchors: Vec2[]): CubicBezier[] {
  const n = anchors.length;
  const beziers: CubicBezier[] = [];
  for (let i = 0; i < n; i++) {
    const p0 = anchors[i];
    const p3 = anchors[(i + 1) % n];
    const prev = anchors[(i - 1 + n) % n];
    const next = anchors[(i + 2) % n];
    const p1: Vec2 = [
      p0[0] + (p3[0] - prev[0]) / 6,
      p0[1] + (p3[1] - prev[1]) / 6,
    ];
    const p2: Vec2 = [
      p3[0] - (next[0] - p0[0]) / 6,
      p3[1] - (next[1] - p0[1]) / 6,
    ];
    beziers.push({ p0, p1, p2, p3 });
  }
  return beziers;
}

const shape = (name: string, anchors: Vec2[]): ShapeDef => ({
  name,
  closed: true,
  beziers: smoothClosed(anchors),
});

// A ring of points (an eye, a nostril) the continuous line loops through.
function loop(cx: number, cy: number, r: number, steps = 9, a0 = 0): Vec2[] {
  const pts: Vec2[] = [];
  for (let i = 0; i < steps; i++) {
    const a = a0 + (i / steps) * 2 * Math.PI;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return pts;
}

// An open arc from a0 to a1 — mouths, stripes, scales, manes, claws.
function arc(
  cx: number,
  cy: number,
  r: number,
  a0: number,
  a1: number,
  steps = 6
): Vec2[] {
  const pts: Vec2[] = [];
  for (let i = 0; i <= steps; i++) {
    const a = a0 + (a1 - a0) * (i / steps);
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return pts;
}

// An Archimedean spiral from r0 to r1 over `turns` — the heart of the tattoo rose.
function spiralPts(
  cx: number,
  cy: number,
  r0: number,
  r1: number,
  turns: number,
  steps: number,
  a0 = 0
): Vec2[] {
  const pts: Vec2[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = a0 + t * turns * 2 * Math.PI;
    const r = r0 + (r1 - r0) * t;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return pts;
}

// A scalloped ring of rounded petals — the head of a daisy, sunflower or blossom.
// Alternates from the valley between petals out to each petal tip and back, tracing
// one continuous flower-head loop the pen can draw without lifting.
function petalRing(
  cx: number,
  cy: number,
  rValley: number,
  rTip: number,
  count: number,
  a0 = 0
): Vec2[] {
  const pts: Vec2[] = [];
  for (let i = 0; i < count; i++) {
    const aValley = a0 + (i / count) * 2 * Math.PI;
    const aTip = a0 + ((i + 0.5) / count) * 2 * Math.PI;
    pts.push([cx + Math.cos(aValley) * rValley, cy + Math.sin(aValley) * rValley]);
    pts.push([cx + Math.cos(aTip) * rTip, cy + Math.sin(aTip) * rTip]);
  }
  return pts;
}

// --- Subject silhouettes -------------------------------------------------
// Each subject is one continuous stroke: the outer silhouette, then the line
// dives inward to draw interior tattoo detail (a spiral, eyes, stripes, scales)
// before returning near its start so the closed loop seals cleanly.

// Rose: a full tattoo rose — a layered bloom on a thorned stem with two veined
// leaves, wrapped around a spiralling bud, all in one stroke.
const ROSE: Vec2[] = [
  // --- bloom outline (top), clockwise from the crown ---
  [0.0, 0.62], // crown tip
  [0.18, 0.54],
  [0.32, 0.46],
  [0.4, 0.3],
  [0.36, 0.14],
  [0.24, 0.04],
  [0.12, 0.0], // bloom base, right -> stem
  // --- stem, right side, with a thorn ---
  [0.1, -0.1],
  [0.18, -0.14], // thorn
  [0.12, -0.18],
  // --- right leaf ---
  [0.28, -0.2],
  [0.46, -0.24],
  [0.52, -0.36],
  [0.38, -0.4],
  [0.2, -0.32],
  // --- stem down to the tip ---
  [0.12, -0.4],
  [0.1, -0.56], // stem tip
  [0.03, -0.42],
  [0.0, -0.28],
  // --- left leaf ---
  [-0.16, -0.22],
  [-0.36, -0.26],
  [-0.44, -0.38],
  [-0.3, -0.42],
  [-0.12, -0.32],
  // --- stem, left side, with a thorn ---
  [-0.08, -0.16],
  [-0.16, -0.12], // thorn
  [-0.1, -0.04],
  [-0.12, 0.0], // bloom base, left
  // --- bloom outline, left side, back to the crown ---
  [-0.24, 0.04],
  [-0.36, 0.14],
  [-0.4, 0.3],
  [-0.32, 0.46],
  [-0.18, 0.54],
  // --- interior: dive in for the spiralling bud and layered petal folds ---
  [-0.1, 0.42],
  [0.0, 0.34], // into the bloom
  ...spiralPts(0.0, 0.26, 0.19, 0.03, 2.1, 26, -Math.PI / 2), // the bud
  ...arc(0.0, 0.26, 0.24, Math.PI * 0.15, Math.PI * 0.95, 9), // inner petal fold (upper)
  [-0.26, 0.32],
  ...arc(0.0, 0.24, 0.31, Math.PI * 1.05, Math.PI * 1.55, 7), // outer petal fold
  [0.18, 0.18],
  ...arc(0.0, 0.28, 0.27, -Math.PI * 0.1, Math.PI * 0.35, 6), // right petal fold
  ...arc(0.0, 0.26, 0.37, Math.PI * 0.2, Math.PI * 0.8, 7), // outermost petal scallop
  // dewdrops on the petals
  [-0.18, 0.46],
  ...loop(-0.2, 0.44, 0.028, 6),
  [0.04, 0.5],
  ...loop(0.18, 0.42, 0.024, 6),
  // right leaf: midrib vein + serrated edge ticks
  [0.34, -0.28],
  [0.46, -0.32],
  [0.4, -0.26],
  [0.36, -0.32],
  [0.3, -0.28],
  [0.42, -0.36],
  [0.3, -0.3],
  // left leaf: midrib vein + serrations
  [-0.2, -0.3],
  [-0.36, -0.34],
  [-0.3, -0.28],
  [-0.26, -0.34],
  [-0.34, -0.4],
  [-0.22, -0.32],
  // extra thorns on the stem
  [-0.1, -0.04],
  [-0.18, 0.0],
  [-0.1, 0.02],
  [0.12, -0.06],
  [0.2, -0.04],
  [0.12, 0.0],
  // a small side bud on a short branch
  [0.16, 0.04],
  [0.28, 0.1],
  ...loop(0.32, 0.16, 0.06, 8),
  ...spiralPts(0.32, 0.16, 0.05, 0.012, 1.4, 12, 0),
  [0.18, 0.12],
  [0.06, 0.46], // climb back to the crown
];

// Snoopy: the classic beagle head in profile facing left — a long low snout,
// a tall rounded cranium, and the big floppy ear hanging off the back, with an
// inked eye, nose and smile.
const SNOOPY: Vec2[] = [
  [-0.64, 0.0], // nose tip (leftmost, low)
  [-0.62, 0.12], // nose top
  [-0.46, 0.16], // snout top (long and flat)
  [-0.32, 0.18], // stop (base of snout)
  [-0.27, 0.34], // forehead rise
  [-0.12, 0.44], // top of cranium
  [0.12, 0.43], // cranium
  [0.27, 0.32], // back of head (top)
  [0.34, 0.16], // back of head
  [0.33, 0.06], // ear root
  [0.48, 0.0], // ear outer top
  [0.5, -0.22], // ear outer edge
  [0.38, -0.37], // ear tip (hanging)
  [0.24, -0.28], // ear inner
  [0.24, -0.06], // neck under ear
  [0.06, -0.14], // under jaw
  [-0.12, -0.18], // jaw
  [-0.3, -0.17], // mouth corner
  // --- interior detail ---
  // smile curving up to the nose
  [-0.42, -0.13],
  [-0.5, -0.05],
  ...loop(-0.6, 0.04, 0.05, 8), // the nose
  ...loop(-0.585, 0.055, 0.018, 5), // nose shine
  [-0.52, 0.12], // up the snout
  [-0.36, 0.2],
  ...loop(-0.27, 0.25, 0.05, 8), // the eye
  ...loop(-0.255, 0.255, 0.02, 5), // pupil
  [-0.33, 0.33], // brow over the eye
  [-0.18, 0.34],
  // down to the collar across the neck
  [-0.12, 0.16],
  [-0.02, -0.04],
  [0.04, -0.14], // collar start (under the jaw)
  [0.16, -0.1],
  [0.22, -0.12], // collar across the neck
  ...loop(0.14, -0.2, 0.04, 7), // collar tag
  [0.06, -0.12],
  // ear texture lines along the hanging ear
  [0.22, -0.08],
  [0.36, -0.16],
  [0.44, -0.3],
  [0.32, -0.24],
  [0.2, -0.12],
  // a spot on the cheek/jaw
  ...loop(-0.04, -0.1, 0.05, 7),
  // eyebrow tuft above the eye
  [-0.2, 0.36],
  [-0.3, 0.4],
  [-0.22, 0.34],
  // a few whisker dots by the muzzle
  [-0.44, -0.04],
  ...loop(-0.46, -0.02, 0.012, 4),
  [-0.46, -0.1],
  ...loop(-0.48, -0.08, 0.012, 4),
  // back across to close near the nose
  [-0.4, 0.04],
  [-0.56, 0.02],
];

// Pochacco: a round-headed puppy with two long floppy ears hanging down the
// sides of the face (the cue that reads as Pochacco rather than a cat).
const TIGER: Vec2[] = [
  [0.0, 0.38], // top dip between ears
  [-0.12, 0.42], // left ear inner
  [-0.26, 0.6], // left ear tip
  [-0.36, 0.36], // left ear base
  [-0.42, 0.24], // upper cheek
  [-0.5, 0.06], // cheek-fur tuft
  [-0.42, -0.08], // lower cheek
  [-0.3, -0.24], // jaw
  [-0.16, -0.34], // chin left
  [0.0, -0.36], // chin
  [0.16, -0.34], // chin right
  [0.3, -0.24], // jaw (right)
  [0.42, -0.08], // lower cheek
  [0.5, 0.06], // cheek-fur tuft
  [0.42, 0.24], // upper cheek
  [0.36, 0.36], // right ear base
  [0.26, 0.6], // right ear tip
  [0.12, 0.42], // right ear inner
  // --- interior detail ---
  [0.0, 0.3], // top centre
  // forehead stripe chevrons
  [-0.08, 0.24],
  [-0.03, 0.33],
  [0.0, 0.22],
  [0.03, 0.33],
  [0.08, 0.24],
  // left eye + pupil
  [-0.16, 0.22],
  ...loop(-0.18, 0.12, 0.05, 8),
  ...loop(-0.17, 0.13, 0.02, 5),
  // left cheek stripes
  [-0.34, 0.06],
  ...arc(-0.52, 0.04, 0.13, -0.4, 0.4, 4),
  [-0.36, -0.02],
  ...arc(-0.5, -0.1, 0.12, -0.3, 0.4, 4),
  // left whisker
  [-0.3, -0.06],
  [-0.54, -0.1],
  [-0.32, -0.05],
  // nose + mouth + fangs
  [-0.12, -0.04],
  ...loop(0.0, -0.06, 0.05, 7), // nose
  ...arc(0.0, -0.1, 0.1, Math.PI, Math.PI * 2, 5), // mouth
  [-0.04, -0.2],
  [-0.03, -0.27],
  [-0.01, -0.2], // left fang
  [0.01, -0.2],
  [0.03, -0.27],
  [0.04, -0.2], // right fang
  // right whisker
  [0.12, -0.04],
  [0.54, -0.1],
  [0.32, -0.05],
  // right cheek stripes
  ...arc(0.5, -0.1, 0.12, Math.PI - 0.4, Math.PI + 0.3, 4),
  [0.36, 0.02],
  ...arc(0.52, 0.04, 0.13, Math.PI - 0.4, Math.PI + 0.4, 4),
  // right eye + pupil
  [0.16, 0.16],
  ...loop(0.18, 0.12, 0.05, 8),
  ...loop(0.17, 0.13, 0.02, 5),
  // ear-inner tufts
  [0.24, 0.4],
  [0.2, 0.5],
  [0.28, 0.42],
  [0.0, 0.34],
  [-0.24, 0.4],
  [-0.2, 0.5],
  [-0.28, 0.42],
  // a couple more forehead stripes flanking the chevron
  [-0.16, 0.28],
  [-0.2, 0.4],
  [-0.12, 0.28],
  [0.12, 0.28],
  [0.2, 0.4],
  [0.16, 0.28],
  // chin tuft
  [0.0, -0.2],
  [-0.04, -0.34],
  [0.0, -0.26],
  [0.04, -0.34],
  [0.02, -0.22],
  [0.04, 0.34],
];

// Monkey: a round face with big rounded ears out on the *sides* of the head and
// a heart-shaped face dipping into a rounded muzzle.
const MONKEY: Vec2[] = [
  [0.0, 0.4], // top of head
  [-0.18, 0.36], // upper-left head
  [-0.3, 0.3], // head, above ear
  [-0.32, 0.26], // left ear top
  [-0.5, 0.24], // left ear out-top
  [-0.56, 0.06], // left ear bulge
  [-0.46, -0.08], // left ear bottom
  [-0.32, -0.02], // back to face
  [-0.28, -0.16], // left cheek
  [-0.2, -0.3], // left jaw
  [0.0, -0.36], // rounded chin
  [0.2, -0.3], // right jaw
  [0.28, -0.16], // right cheek
  [0.32, -0.02], // back to face
  [0.46, -0.08], // right ear bottom
  [0.56, 0.06], // right ear bulge
  [0.5, 0.24], // right ear out-top
  [0.32, 0.26], // right ear top
  [0.3, 0.3], // head, above ear
  [0.18, 0.36], // upper-right head
  // --- interior detail ---
  [0.0, 0.3], // top centre
  // brow ridge
  [-0.16, 0.2],
  [-0.08, 0.24],
  [0.0, 0.2],
  [0.08, 0.24],
  [0.16, 0.2],
  // left eye + pupil
  [-0.16, 0.18],
  ...loop(-0.14, 0.11, 0.05, 8),
  ...loop(-0.13, 0.12, 0.02, 5),
  // left inner-ear crease
  [-0.4, 0.05],
  ...arc(-0.46, 0.06, 0.1, -0.3, Math.PI * 0.6, 5),
  [-0.3, 0.0],
  // muzzle: left cheek, nostrils, mouth, right cheek (heart-shaped face)
  ...arc(0.0, -0.04, 0.22, Math.PI * 0.92, Math.PI * 1.5, 5),
  ...loop(-0.05, -0.13, 0.022, 6), // left nostril
  [0.0, -0.1],
  ...loop(0.05, -0.13, 0.022, 6), // right nostril
  ...arc(0.0, -0.18, 0.09, Math.PI, Math.PI * 2, 5), // mouth
  ...arc(0.0, -0.04, 0.22, Math.PI * 1.5, Math.PI * 2.08, 5),
  [0.3, 0.0],
  // right inner-ear crease
  ...arc(0.46, 0.06, 0.1, Math.PI - 0.6, Math.PI + 0.3, 5),
  // right eye + pupil
  [0.16, 0.18],
  ...loop(0.14, 0.11, 0.05, 8),
  ...loop(0.13, 0.12, 0.02, 5),
  // crown hair tufts
  [0.14, 0.34],
  [0.18, 0.46],
  [0.08, 0.36],
  [0.0, 0.48],
  [-0.08, 0.36],
  [-0.18, 0.46],
  [-0.14, 0.34],
  [0.04, 0.34],
];

// --- More flowers --------------------------------------------------------

// Tulip: a cupped three-petal bloom on a straight stem with one blade leaf —
// the outer cup, the stem down to its tip, the leaf, then interior petal seams.
const DAISY: Vec2[] = [
  [0.0, -0.6], // stem base
  [0.0, -0.34], // up to the bloom
  ...petalRing(0.0, 0.16, 0.16, 0.46, 12, -Math.PI / 2),
  // button centre
  ...loop(0.0, 0.16, 0.12, 10),
  ...loop(0.0, 0.16, 0.06, 6),
  // a blade leaf off the stem
  [0.03, -0.26],
  [0.18, -0.32],
  [0.28, -0.2],
  [0.14, -0.18],
  [0.02, -0.28],
  [0.0, -0.5], // back down the stem
];

// Sunflower: a bigger bloom — a double ring of petals around a spiralling seed
// head, on a thick stem with a broad leaf.
const SUNFLOWER: Vec2[] = [
  [0.0, -0.62], // stem base
  [0.02, -0.34],
  [0.0, -0.16], // up to the bloom
  ...petalRing(0.0, 0.14, 0.22, 0.54, 14, -Math.PI / 2), // outer petals
  ...petalRing(0.0, 0.14, 0.18, 0.36, 14, -Math.PI / 2 + Math.PI / 14), // inner ring, offset
  // seed head spiral
  ...spiralPts(0.0, 0.14, 0.21, 0.02, 3.0, 40, 0),
  // a broad leaf off the stem
  [0.04, -0.28],
  [0.24, -0.32],
  [0.34, -0.16],
  [0.18, -0.14],
  [0.03, -0.26],
  [0.0, -0.5], // back down the stem
];

export const RAW_SHAPES: Record<SubjectId, ShapeDef> = {
  rose: shape("rose", ROSE),
  snoopy: shape("snoopy", SNOOPY),
  tiger: shape("tiger", TIGER),
  monkey: shape("monkey", MONKEY),
  daisy: shape("daisy", DAISY),
  sunflower: shape("sunflower", SUNFLOWER),
};

// The order the background morphs through, looping back to the rose at the end.
// A deliberately tight cast — only the subjects whose single-line silhouettes
// actually read (curated by rendering every candidate and keeping the best).
// Flowers and animals alternate so the rotation stays varied.
export const CYCLE: SubjectId[] = [
  "rose",
  "snoopy",
  "daisy",
  "tiger",
  "sunflower",
  "monkey",
];
