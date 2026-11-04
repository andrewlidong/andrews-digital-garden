// Pixel-art frames for the cursor-chasing dog (see components/ui/CursorDog).
// He is a white beagle with black ears and a spot on his back: Snoopy, more or
// less, at 16 pixels.
// Each frame is a 16x16 grid of palette keys; '.' is transparent. Frames are
// drawn with fillRect so there are no image assets to load and the sprite
// stays crisp at any device pixel ratio.

export const SPRITE_SIZE = 16;

const PALETTE: Record<string, string> = {
  o: "#111111", // outline
  b: "#fbfbfb", // white coat
  d: "#111111", // black ears
  s: "#111111", // the spot on his back
  e: "#111111", // eye
  n: "#111111", // nose
  p: "#e07a7a", // tongue
};

export type Frame = readonly string[];

// Side view, facing right. Left-facing frames are drawn mirrored.
const RUN_SIDE_A: Frame = [
  "................",
  "..........oooo..",
  ".........obbbbo.",
  ".........obdbbo.",
  ".oo.....obddbebo",
  ".odo....obbdbbbn",
  "..odo..obbbbbooo",
  "...oobobbbbbbo..",
  "...obbbbbbbbbbo.",
  "..obbssbbbbbbo..",
  "..obsssbbbbbbo..",
  "..obbsbbbbbbbo..",
  ".ob.obbbbbbo.bo.",
  "ob..ob....ob..bo",
  "o...o......o...o",
  "................",
];

const RUN_SIDE_B: Frame = [
  ...RUN_SIDE_A.slice(0, 12),
  "..o.obbbbbbo.o..",
  "...oob....boo...",
  "....oo....oo....",
  "................",
];

// Facing the viewer.
const FACE_DOWN: Frame = [
  "................",
  "................",
  "................",
  "....oooooooo....",
  "...obbbbbbbbo...",
  "..odbbbbbbbbdo..",
  ".oddbbbbbbbbddo.",
  ".oddbbebbebbddo.",
  ".odbbbbbbbbbbdo.",
  "..obbbbnnbbbbo..",
  "..obbbbbpbbbbo..",
  "...obbbbbbbbo...",
];

const LEGS_FRONT_A: Frame = [
  "..oobbbbbbbboo..",
  ".ob.obbbbbbo.bo.",
  "o...o......o...o",
  "................",
];

const LEGS_FRONT_B: Frame = [
  "...obobbbbobo...",
  "...ob.obbo.bo...",
  "...oo..oo..oo...",
  "................",
];

const RUN_DOWN_A: Frame = [...FACE_DOWN, ...LEGS_FRONT_A];
const RUN_DOWN_B: Frame = [...FACE_DOWN, ...LEGS_FRONT_B];

// Facing away: back of the head, curled tail poking up.
const FACE_UP: Frame = [
  "................",
  "........oo......",
  ".......oddo.....",
  "....ooooddoo....",
  "...obbbbbbbbo...",
  "..odbbbbbbbbdo..",
  ".oddbbbbbbbbddo.",
  ".oddbbbbbbbbddo.",
  ".odbbbbbbbbbbdo.",
  "..obbbbbbbssbo..",
  "..obbbbbbbsbbo..",
  "...obbbbbbbbo...",
];

const RUN_UP_A: Frame = [...FACE_UP, ...LEGS_FRONT_A];
const RUN_UP_B: Frame = [...FACE_UP, ...LEGS_FRONT_B];

// Sitting, facing right, tail resting.
const SIT: Frame = [
  "................",
  "................",
  "...........oo...",
  "..........obbo..",
  ".........obbbbo.",
  "........obdbbbbo",
  "........obddbebo",
  "........obbdbbno",
  ".......obbbbbbo.",
  "..oo..obbbbbbbo.",
  ".odbo.obbbbbbbo.",
  ".odbbobssbbbbo..",
  "..obbbsssbbbbo..",
  "...obbbbobbbbo..",
  "...oooooooooo...",
  "................",
];

// Sitting with the tail flicked up — alternated with SIT for a wag.
const SIT_WAG: Frame = [
  ...SIT.slice(0, 8),
  ".oo....obbbbbbo.",
  ".odo..obbbbbbbo.",
  "..odo.obbbbbbbo.",
  "...oobbbbbbbbo..",
  ...SIT.slice(12),
];

// Curled up asleep; the second frame lifts the back a pixel for breathing.
const SLEEP_A: Frame = [
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "......oooooo....",
  "....oobbbbbboo..",
  "...obbssbbbbbbo.",
  "..obbsssbbbbdbbo",
  "..odbbbbbbbbdbbo",
  "..oddbbbbbbbbono",
  "...obbbbbbbbbbo.",
  "....oooooooooo..",
  "................",
];

const SLEEP_B: Frame = [
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "......oooooo....",
  "....oobbbbbboo..",
  "...obbssbbbbbbo.",
  "..obbsssbbbbbbbo",
  "..obbbbbbbbbdbbo",
  "..odbbbbbbbbdbbo",
  "..oddbbbbbbbbono",
  "...obbbbbbbbbbo.",
  "....oooooooooo..",
  "................",
];

export const FRAMES = {
  runSide: [RUN_SIDE_A, RUN_SIDE_B],
  runDown: [RUN_DOWN_A, RUN_DOWN_B],
  runUp: [RUN_UP_A, RUN_UP_B],
  sit: [SIT, SIT_WAG],
  sleep: [SLEEP_A, SLEEP_B],
} as const;

export type FrameSet = keyof typeof FRAMES;

/**
 * Paints a frame onto a 2D context at the given pixel scale. The context is
 * expected to be cleared and sized to SPRITE_SIZE * scale beforehand.
 */
export function drawFrame(
  ctx: CanvasRenderingContext2D,
  frame: Frame,
  scale: number,
  mirror: boolean,
): void {
  for (let y = 0; y < SPRITE_SIZE; y++) {
    const row = frame[y] ?? "";
    for (let x = 0; x < SPRITE_SIZE; x++) {
      const key = row[mirror ? SPRITE_SIZE - 1 - x : x];
      const color = key ? PALETTE[key] : undefined;
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x * scale, y * scale, scale, scale);
    }
  }
}
