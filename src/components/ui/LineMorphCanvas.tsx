import { useEffect, useRef } from "react";
import type { ThemeTokens } from "@/lib/themes";
import {
  buildMorphCycle,
  buildRibbon,
  N,
  RIBBON_FLOAT_COUNT,
} from "@/lib/lineMorph";
import { CYCLE } from "@/lib/lineShapes";

/**
 * A self-contained WebGL background that draws a SINGLE continuous line and
 * morphs it through a cycle of richly-detailed tattoo subjects (rose, Snoopy,
 * Pochacco, dragon, horse, tiger, monkey). The pen never lifts: every subject is
 * one closed stroke resampled to the same number of points, so the line flows
 * from one form into the next.
 *
 * Each subject gets its own calm cycle: the line *draws itself on* tip-first,
 * holds, then *fades out*, and the next subject draws on — a gentle, unhurried
 * rhythm rather than a busy morph. Touches that make it feel hand-drawn:
 *  - a bright spark rides the drawing tip while the line is being drawn on;
 *  - the glow flows through a multi-colour gradient (accent ↔ cyan ↔ magenta)
 *    over a white-hot core;
 *  - the subject order is shuffled each load.
 *
 * The stroke is a thin triangle-strip "ribbon", crisp and cheap at any size, on a
 * transparent canvas so it sits behind page content. It respects
 * `prefers-reduced-motion` (one static frame) and pauses when off-screen/hidden.
 */

// A light Fisher–Yates shuffle so the sequence is fresh each load. Math.random is
// fine here (module init in the browser).
function shuffled<T>(arr: readonly T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Build the resampled shapes once, in a shuffled order.
const ORDER = shuffled(CYCLE);
const MORPH_CYCLE = buildMorphCycle(ORDER);

// Timing for each subject's gentle cycle (draw on -> hold -> fade out). Slow and
// unhurried — the pace of watching an artist sketch, not a slideshow.
const DRAW_SECONDS = 8.0; // the line unhurriedly draws itself on
const HOLD_SECONDS = 7.0; // fully drawn, just breathing
const FADE_SECONDS = 4.5; // dissolves away before the next is drawn
const SUBJECT_SECONDS = DRAW_SECONDS + HOLD_SECONDS + FADE_SECONDS;

// Half-width of the ribbon in normalized shape units (includes the glow falloff;
// the bright core occupies the inner fraction set by `coreHalf` in the shader).
// A touch bolder than a hairline so the stroke reads as a confident, luminous
// ink while the subjects' features stay legible.
const HALF_WIDTH = 0.052;

const VERT_SRC = `
attribute vec2 a_position;
attribute float a_edge;
attribute float a_along;
varying float v_edge;
varying float v_along;
uniform vec2 u_scale;
uniform float u_time;
void main() {
  v_edge = a_edge;
  v_along = a_along;
  // A barely-there sway and breath so the drawing feels alive on the page, like
  // paper drifting on a desk — not a static decal.
  float ang = 0.018 * sin(u_time * 0.11);
  float breath = 1.0 + 0.014 * sin(u_time * 0.08);
  mat2 rot = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));
  vec2 p = rot * (a_position * breath);
  // u_scale compresses the longer axis so the line keeps its proportions on any
  // canvas shape (wide or tall) instead of stretching.
  gl_Position = vec4(p * u_scale, 0.0, 1.0);
}
`;

// `hasDeriv` switches between derivative-based anti-aliasing (crisp, preferred)
// and a fixed fallback width when OES_standard_derivatives is unavailable.
function makeFragSrc(hasDeriv: boolean): string {
  return `${hasDeriv ? "#extension GL_OES_standard_derivatives : enable\n" : ""}precision highp float;
${hasDeriv ? "#define USE_DERIV\n" : ""}
varying float v_edge;
varying float v_along;
uniform vec3 u_core;            // white-hot filament colour
uniform vec3 u_glow;            // gradient stop A (accent)
uniform vec3 u_glow2;           // gradient stop B (cyan)
uniform vec3 u_glow3;           // gradient stop C (magenta)
uniform float u_time;
uniform float u_progress;       // how much of the stroke has been "drawn" (0..1)
uniform float u_fade;           // global opacity for the fade-out (1..0)

// Smooth 3-stop colour wheel: A -> B -> C -> A.
vec3 gradient(float h) {
  h = fract(h);
  if (h < 0.3333) return mix(u_glow, u_glow2, h / 0.3333);
  if (h < 0.6666) return mix(u_glow2, u_glow3, (h - 0.3333) / 0.3333);
  return mix(u_glow3, u_glow, (h - 0.6666) / 0.3334);
}

void main() {
  float d = abs(v_edge);              // 0 at the centerline, 1 at the ribbon edge
#ifdef USE_DERIV
  float aa = fwidth(v_edge) * 1.5;
#else
  float aa = 0.07;
#endif
  // Hide the portion of the stroke not yet drawn (tip-leading reveal).
  float reveal = 1.0 - smoothstep(u_progress - 0.012, u_progress + 0.012, v_along);

  // Four concentric bands: white-hot filament, saturated body, soft glow halo,
  // and a broad outer aura that radiates well beyond the stroke for a luminous,
  // majestic light (kept low-amplitude so it reads as radiance, not fog).
  float hot  = 1.0 - smoothstep(0.10, 0.17 + aa, d);
  float body = 1.0 - smoothstep(0.34 - aa, 0.40 + aa, d);
  float glow = exp(-3.4 * d * d);
  float aura = exp(-1.05 * d * d);
  // Two shimmers: a slow breath over the whole stroke, plus a finer ember
  // sparkle that travels along it like glints catching in flowing ink.
  float shimmer = 0.90 + 0.10 * sin(u_time * 0.45 + v_along * 7.0);
  float ember   = 0.84 + 0.16 * sin(u_time * 0.9 + v_along * 38.0);
  glow *= shimmer;
  aura *= shimmer;

  // Colour flows along the stroke and drifts slowly for an elegant, iridescent ink.
  vec3 grad = gradient(v_along * 1.25 - u_time * 0.018);

  // A bright comet head rides the drawing tip — only while the line is being
  // drawn on, so it reads as a pen, not a constant distraction.
  float pen = exp(-pow((v_along - u_progress) * 9.0, 2.0));
  pen *= 1.0 - smoothstep(0.92, 1.0, u_progress);

  vec3 col = grad * aura * 0.45;                     // broad outer aura
  col += grad * glow * ember;                        // coloured halo + ember sparkle
  col = mix(col, mix(grad, vec3(1.0), 0.45), body);  // bright body
  col = mix(col, vec3(1.0), hot * 0.95);             // white-hot filament
  col += mix(grad, vec3(1.0), 0.5) * pen * 0.9;      // drawing-tip comet
  float a = clamp(max(body, max(glow * 0.6, aura * 0.32)) + pen * 0.3, 0.0, 1.0);
  a *= reveal * u_fade;

  // Filmic tone-map + gamma for richer colour, then straight alpha (the context
  // uses premultipliedAlpha:false).
  vec3 pre = col * a;
  pre = pre / (pre + 0.5);
  pre = pow(pre, vec3(0.82));
  gl_FragColor = vec4(a > 0.0001 ? pre / a : vec3(0.0), a);
}
`;
}

type RGB = [number, number, number];

type Palette = {
  core: RGB; // white-hot filament
  glow: RGB; // gradient stop A
  glow2: RGB; // gradient stop B
  glow3: RGB; // gradient stop C
};

const DEFAULT_PALETTE: Palette = {
  core: [1.0, 1.0, 1.0],
  glow: [0.48, 0.64, 1.0], // blue
  glow2: [0.36, 0.86, 0.86], // cyan
  glow3: [0.86, 0.44, 0.96], // magenta
};

function hexToRgb(hex: string): RGB {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

const mix = (a: RGB, b: RGB, t: number): RGB => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];
// Lift a colour toward white so it reads as bright neon even from a dark token.
const lift = (c: RGB): RGB => mix(c, [1, 1, 1], 0.25);

// The line flows through three of the theme's accent hues over a white-hot core,
// so it stays theme-coherent but vivid and colourful.
function paletteFromTokens(tokens: ThemeTokens): Palette {
  return {
    core: [1, 1, 1],
    glow: lift(hexToRgb(tokens.accent)),
    glow2: lift(hexToRgb(tokens.cyan)),
    glow3: lift(hexToRgb(tokens.magenta)),
  };
}

function smoothstep01(x: number): number {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
}

function compileShader(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

interface LineMorphCanvasProps {
  className?: string;
  /** Active theme tokens — the line recolours to match. */
  tokens?: ThemeTokens;
}

export function LineMorphCanvas({ className, tokens }: LineMorphCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // The palette is applied as uniforms, so a theme change must NOT tear down and
  // rebuild the GL context (that would restart the morph cycle). The setup effect
  // runs once; a separate effect updates the colour uniforms when accent/yellow
  // change. These refs let the colour effect reach into the live context, and let
  // it repaint the current frame immediately (e.g. when reduced-motion is on).
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const colorLocRef = useRef<{
    core: WebGLUniformLocation | null;
    glow: WebGLUniformLocation | null;
    glow2: WebGLUniformLocation | null;
    glow3: WebGLUniformLocation | null;
  } | null>(null);
  const tokensRef = useRef(tokens);
  tokensRef.current = tokens;
  const drawFrameRef = useRef<(t: number) => void>(() => {});
  const currentTRef = useRef(0);

  const paletteKey = tokens
    ? `${tokens.accent}|${tokens.cyan}|${tokens.magenta}`
    : "default";

  // One-time setup: create the context, shaders, buffers and render loop. Runs on
  // mount only (reads the latest tokens through a ref), so theme switches never
  // restart the cycle.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl =
      (canvas.getContext("webgl", {
        alpha: true,
        premultipliedAlpha: false,
        antialias: true,
      }) as WebGLRenderingContext | null) ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
    if (!gl) return;

    const hasDeriv = !!gl.getExtension("OES_standard_derivatives");

    const vert = compileShader(gl, gl.VERTEX_SHADER, VERT_SRC);
    const frag = compileShader(gl, gl.FRAGMENT_SHADER, makeFragSrc(hasDeriv));
    if (!vert || !frag) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    // Dynamic vertex buffer — rebuilt from the morphed point set each frame.
    const vertexData = new Float32Array(RIBBON_FLOAT_COUNT);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexData.byteLength, gl.DYNAMIC_DRAW);

    const stride = 4 * 4; // x, y, edge, along
    const posLoc = gl.getAttribLocation(program, "a_position");
    const edgeLoc = gl.getAttribLocation(program, "a_edge");
    const alongLoc = gl.getAttribLocation(program, "a_along");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(edgeLoc);
    gl.vertexAttribPointer(edgeLoc, 1, gl.FLOAT, false, stride, 8);
    gl.enableVertexAttribArray(alongLoc);
    gl.vertexAttribPointer(alongLoc, 1, gl.FLOAT, false, stride, 12);

    const uScale = gl.getUniformLocation(program, "u_scale");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uProgress = gl.getUniformLocation(program, "u_progress");
    const uFade = gl.getUniformLocation(program, "u_fade");

    // Expose the context to the colour effect, and apply the initial palette.
    glRef.current = gl;
    programRef.current = program;
    colorLocRef.current = {
      core: gl.getUniformLocation(program, "u_core"),
      glow: gl.getUniformLocation(program, "u_glow"),
      glow2: gl.getUniformLocation(program, "u_glow2"),
      glow3: gl.getUniformLocation(program, "u_glow3"),
    };
    const palette = tokensRef.current
      ? paletteFromTokens(tokensRef.current)
      : DEFAULT_PALETTE;
    gl.uniform3f(colorLocRef.current.core, ...palette.core);
    gl.uniform3f(colorLocRef.current.glow, ...palette.glow);
    gl.uniform3f(colorLocRef.current.glow2, ...palette.glow2);
    gl.uniform3f(colorLocRef.current.glow3, ...palette.glow3);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    // Decorative, masked backdrop: render at a low internal resolution and let
    // CSS upscale it. On phones the canvas is physically small, so we can afford a
    // crisper internal resolution and a slightly bolder line so the fine tattoo
    // detail stays legible at hand size.
    const small = window.matchMedia("(max-width: 767px)").matches;
    const renderScale = small ? 0.9 : 0.6;
    const halfWidth = small ? 0.068 : HALF_WIDTH;

    const resize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const pw = Math.max(1, Math.floor(w * renderScale));
      const ph = Math.max(1, Math.floor(h * renderScale));
      if (canvas.width !== pw || canvas.height !== ph) {
        canvas.width = pw;
        canvas.height = ph;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
      // Compress the longer axis so the line keeps its proportions whether the
      // canvas is wide (hero) or tall (the personal-page side panel).
      const ar = canvas.width / Math.max(1, canvas.height);
      if (ar >= 1) gl.uniform2f(uScale, 1 / ar, 1);
      else gl.uniform2f(uScale, 1, ar);
    };

    resize();
    window.addEventListener("resize", resize);
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(resize);
      ro.observe(canvas);
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Reusable scratch buffer for the per-frame interpolated point set.
    const current = new Float32Array(N * 2);

    const len = MORPH_CYCLE.length;

    // Each subject runs its own draw -> hold -> fade cycle; the next is then drawn
    // fresh. Compute the current subject, draw progress and fade opacity for time
    // t, build the ribbon, and draw.
    const drawFrame = (t: number) => {
      currentTRef.current = t;

      const cycleIndex = Math.floor(t / SUBJECT_SECONDS);
      const phase = t - cycleIndex * SUBJECT_SECONDS;
      const subject = MORPH_CYCLE[cycleIndex % len];

      let progress = 1;
      let fade = 1;
      if (phase < DRAW_SECONDS) {
        progress = smoothstep01(phase / DRAW_SECONDS); // draw on, tip-first
      } else if (phase < DRAW_SECONDS + HOLD_SECONDS) {
        progress = 1; // hold, fully drawn
      } else {
        progress = 1;
        fade = 1 - smoothstep01((phase - DRAW_SECONDS - HOLD_SECONDS) / FADE_SECONDS);
      }

      current.set(subject);
      const vertexCount = buildRibbon(current, halfWidth, vertexData);

      gl.uniform1f(uTime, t);
      gl.uniform1f(uProgress, progress);
      gl.uniform1f(uFade, fade);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertexData);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexCount);
    };
    drawFrameRef.current = drawFrame; // let the colour effect repaint on demand

    let raf = 0;
    let running = false;
    const start = performance.now();

    // ~30fps: the morph is slow, so half the frames are imperceptible but it
    // halves GPU work and keeps the main thread responsive.
    const frameInterval = 1000 / 30;
    let last = -Infinity;

    const render = (now: number) => {
      raf = requestAnimationFrame(render);
      if (now - last < frameInterval) return;
      last = now;
      drawFrame((now - start) / 1000);
    };

    let onScreen = true;
    const shouldRun = () => onScreen && !document.hidden && !reduceMotion;

    const startLoop = () => {
      if (running || !shouldRun()) return;
      running = true;
      last = -Infinity;
      raf = requestAnimationFrame(render);
    };
    const stopLoop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    // For reduced motion, render one fully-drawn static frame (mid-hold) rather
    // than t=0, which would reveal nothing.
    const STATIC_T = DRAW_SECONDS + HOLD_SECONDS * 0.5;

    if (reduceMotion) {
      resize();
      drawFrame(STATIC_T);
    } else {
      startLoop();
    }

    const onVisibility = () => (document.hidden ? stopLoop() : startLoop());
    document.addEventListener("visibilitychange", onVisibility);

    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        ([entry]) => {
          onScreen = entry.isIntersecting;
          if (!onScreen) {
            stopLoop();
          } else if (reduceMotion) {
            resize();
            drawFrame(STATIC_T);
          } else {
            startLoop();
          }
        },
        { rootMargin: "100px" }
      );
      io.observe(canvas);
    }

    return () => {
      stopLoop();
      window.removeEventListener("resize", resize);
      if (ro) ro.disconnect();
      if (io) io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      gl.deleteProgram(program);
      gl.deleteShader(vert);
      gl.deleteShader(frag);
      gl.deleteBuffer(buffer);
      glRef.current = null;
      programRef.current = null;
      colorLocRef.current = null;
      drawFrameRef.current = () => {};
    };
  }, []);

  // Recolour live when the theme changes — update the uniforms on the existing
  // context (no rebuild, no cycle restart) and repaint the current frame so the
  // change shows immediately even when the loop is paused or reduced-motion.
  useEffect(() => {
    const gl = glRef.current;
    const program = programRef.current;
    const locs = colorLocRef.current;
    if (!gl || !program || !locs) return;
    const palette = tokensRef.current
      ? paletteFromTokens(tokensRef.current)
      : DEFAULT_PALETTE;
    gl.useProgram(program);
    gl.uniform3f(locs.core, ...palette.core);
    gl.uniform3f(locs.glow, ...palette.glow);
    gl.uniform3f(locs.glow2, ...palette.glow2);
    gl.uniform3f(locs.glow3, ...palette.glow3);
    drawFrameRef.current(currentTRef.current);
  }, [paletteKey]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ display: "block", width: "100%", height: "100%", pointerEvents: "none" }}
    />
  );
}

export default LineMorphCanvas;
