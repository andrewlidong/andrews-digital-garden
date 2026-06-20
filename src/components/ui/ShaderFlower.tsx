import { useEffect, useRef } from "react";

/**
 * A self-contained WebGL fragment-shader "enchanted rose" rendered into a canvas.
 *
 * Draws a single deep-crimson rose with bold tattoo-style linework — inspired by
 * the enchanted rose from Beauty and the Beast. The bloom is a spiral of layered
 * petals (built in log-polar space), set on a thorned stem with two leaves, with
 * a couple of slowly drifting fallen petals and a faint glass-cloche silhouette.
 * It paints onto a transparent canvas so it can sit behind page content. No
 * external dependencies — raw WebGL.
 *
 * It respects `prefers-reduced-motion` (renders a single static frame) and
 * pauses rendering when the tab is hidden to save battery.
 */

const VERT_SRC = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

// A single rose drawn as line art: a spiral bloom of petals tiled in log-polar
// space, a thorned stem with leaves, drifting petals, and a glass dome.
const FRAG_SRC = `
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;

#define PI 3.14159265359
#define TAU 6.28318530718

// --- palette (deep velvet crimson with warm magical highlights) ---
const vec3 INK     = vec3(0.06, 0.01, 0.02);   // near-black tattoo outline
const vec3 DEEP    = vec3(0.26, 0.02, 0.05);   // shadow / crease red
const vec3 MID     = vec3(0.68, 0.05, 0.10);   // body red
const vec3 BRIGHT  = vec3(0.96, 0.28, 0.26);   // lit petal red
const vec3 GOLD    = vec3(1.00, 0.78, 0.42);   // enchanted core glow
const vec3 LEAF    = vec3(0.10, 0.30, 0.12);   // stem / leaf green
const vec3 LEAFLIT = vec3(0.30, 0.62, 0.28);

mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

// Soft anti-aliased fill from a signed distance (negative = inside).
float aafill(float d, float w) { return smoothstep(w, -w, d); }

// A teardrop/petal mask: base near origin, tip toward +y. Returns a signed
// distance-ish value (negative inside). sz is (halfWidth, height).
float petalSD(vec2 p, vec2 sz) {
  vec2 q = p / sz;                       // q.y in [0,1] along the petal
  float y = clamp(q.y, 0.0, 1.0);
  float hw = sin(y * PI) * 0.55 + 0.02;  // wide in the middle, pointed at ends
  float d = (abs(q.x) - hw);             // horizontal distance to the silhouette
  d = max(d, q.y - 1.0);                 // cap the tip
  d = max(d, -q.y - 0.05);               // cap the base
  return d * min(sz.x, sz.y);            // back to roughly world units
}

// --- The rose bloom: a spiral of petals tiled in log-polar coordinates. ---
// Returns premultiplied colour in .rgb and coverage in .a.
vec4 bloom(vec2 p, float t) {
  // Gentle breathing + very slow turn.
  float breathe = 1.0 + 0.025 * sin(t * 0.7);
  p = rot(t * 0.04) * p;
  float r = length(p) / breathe;
  float a = atan(p.y, p.x);

  // Only the annulus between the glowing core and the outer guard petals is
  // tiled into petals; inside rmin we hand off to the core glow.
  float rmin = 0.045, rmax = 0.62;

  float lr = log(max(r, 1e-3));   // guard log(0) at the exact centre
  float ringStep = 0.52;     // radial spacing between rows of petals
  float perRing  = 8.0;      // petals per row
  float twist    = 1.15;     // spiral swirl that makes it read as a rose

  // Spiral: rotate the angle as we move in/out in radius.
  float aa = a + lr * twist;

  float ringF = lr / ringStep;
  float ring  = floor(ringF);
  float fy    = fract(ringF) - 0.5;

  // Brick-offset alternate rows so petals interleave like a real bloom.
  float off = mod(ring, 2.0) * 0.5;
  float cx  = aa / (TAU / perRing) + off;
  float fx  = fract(cx) - 0.5;

  // Petal silhouette within the cell (pointed toward the centre = -y).
  vec2 q = vec2(fx, fy + 0.5);                 // local, base at inner edge
  float yy = clamp(q.y, 0.0, 1.0);
  float hw = (0.16 + 0.30 * sin(yy * PI)) ;    // half width profile
  float d  = abs(q.x) - hw;
  d = max(d, q.y - 0.97);
  d = max(d, -q.y + 0.02);

  // Anti-alias width grows with ring density toward the centre.
  float w = 0.04 + 0.05 * smoothstep(0.4, 0.0, r);
  float fill = aafill(d, w);
  float din  = -d;                              // depth inside the petal

  // Tattoo outline: a dark band hugging each petal edge.
  float line = smoothstep(0.06, 0.015, abs(d));

  // Shading — crease shadow at the edges, warmer toward the lit centre.
  vec3 col = mix(DEEP, MID, smoothstep(0.0, 0.22, din));
  col = mix(col, BRIGHT, smoothstep(0.5, 0.0, r) * smoothstep(0.05, 0.3, din));
  // A crisp highlight along the upper curl of each petal.
  col += BRIGHT * 0.35 * smoothstep(0.55, 0.95, q.y) * smoothstep(0.12, 0.3, din);
  // Lay the ink line over the fill.
  col = mix(col, INK, line);

  // Coverage: fade out below the core and beyond the outer petals.
  float cov = fill;
  cov *= smoothstep(rmin * 0.7, rmin * 1.6, r);
  cov *= smoothstep(rmax, rmax - 0.16, r);

  return vec4(col * cov, cov);
}

// Distance from point p to segment a-b.
float sdSeg(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}

// Stem with a few thorns and two leaves, drawn as inked line art.
vec4 stem(vec2 p) {
  vec3 col = vec3(0.0);
  float cov = 0.0;

  // Curving stem from just under the bloom downward, with a gentle bend.
  float stemD = sdSeg(vec2(p.x - 0.04 * sin((p.y + 0.5) * 3.0), p.y), vec2(0.0, -0.5), vec2(0.06, -1.4)) - 0.02;
  float stemFill = aafill(stemD, 0.012);
  col = mix(col, mix(LEAF, LEAFLIT, 0.4), stemFill);
  col = mix(col, INK, smoothstep(0.03, 0.008, abs(stemD)) * stemFill);
  cov = max(cov, stemFill);

  // Two leaves off the stem.
  for (int i = 0; i < 2; i++) {
    float fi = float(i);
    float side = (i == 0) ? 1.0 : -1.0;
    vec2 anchor = vec2(0.02 * side, -0.78 - fi * 0.28);
    vec2 lp = p - anchor;
    lp = rot(side * 0.9 - 0.3) * lp;
    float ld = petalSD(lp + vec2(0.0, 0.0), vec2(0.10, 0.34));
    float lf = aafill(ld, 0.012);
    // leaf midrib
    float rib = smoothstep(0.012, 0.0, abs(lp.x)) * step(0.0, lp.y) * step(lp.y, 0.34);
    vec3 lcol = mix(LEAF, LEAFLIT, smoothstep(0.0, 0.34, lp.y));
    lcol = mix(lcol, INK, max(smoothstep(0.05, 0.012, abs(ld)) , rib * 0.7));
    col = mix(col, lcol, lf);
    cov = max(cov, lf);
  }

  return vec4(col * cov, cov);
}

// A single drifting fallen petal.
vec4 fallenPetal(vec2 p, float seed, float t) {
  float life = fract(t * 0.05 + seed);
  vec2 c;
  c.x = 0.45 + 0.55 * (seed - 0.5) + 0.12 * sin(t * 0.6 + seed * 9.0);
  c.y = mix(0.45, -1.25, life);                 // drift downward
  vec2 lp = (p - c);
  lp = rot(t * (0.5 + seed) + seed * 6.0) * lp; // tumble
  float d = petalSD(lp, vec2(0.05, 0.16));
  float f = aafill(d, 0.012);
  float fade = smoothstep(0.0, 0.1, life) * smoothstep(1.0, 0.7, life);
  vec3 col = mix(MID, BRIGHT, smoothstep(0.06, -0.06, d));
  col = mix(col, INK, smoothstep(0.04, 0.01, abs(d)));
  float cov = f * fade;
  return vec4(col * cov, cov);
}

// Composite src (premultiplied) over dst (premultiplied).
vec4 over(vec4 dst, vec4 src) {
  return dst * (1.0 - src.a) + src;
}

void main() {
  // Centred, aspect-correct coordinates; lift origin so the bloom sits high
  // and the stem has room beneath it.
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
  uv.y += 0.18;

  float t = u_time;

  vec4 acc = vec4(0.0);  // premultiplied accumulator

  // Faint glass cloche silhouette behind the rose (Beauty & the Beast).
  {
    vec2 g = uv;
    // bell jar: tall rounded-top capsule outline + base line
    float jar = abs(length(vec2(g.x, max(0.0, g.y - 0.15))) - 0.62);
    jar = min(jar, abs(g.y + 0.55) + step(0.5, abs(g.x)) * 9.0); // base line
    float jarLine = smoothstep(0.02, 0.0, jar) * step(g.y, 0.78);
    vec3 jc = vec3(0.55, 0.75, 0.95);
    acc = over(acc, vec4(jc * jarLine * 0.10, jarLine * 0.10));
  }

  // Stem + leaves (behind the bloom).
  acc = over(acc, stem(uv));

  // The rose bloom.
  acc = over(acc, bloom(uv, t));

  // Enchanted core glow at the heart of the bloom.
  {
    float cr = length(rot(t * 0.04) * uv);
    float pulse = 0.8 + 0.3 * sin(t * 1.6);
    float g = (0.05 / (cr * cr + 0.02)) * pulse;
    g = clamp(g, 0.0, 1.4);
    vec3 gc = mix(GOLD, BRIGHT, smoothstep(0.0, 0.12, cr));
    acc = over(acc, vec4(gc * g * 0.5, clamp(g * 0.35, 0.0, 0.9)));
  }

  // A couple of slowly drifting fallen petals.
  acc = over(acc, fallenPetal(uv, 0.17, t));
  acc = over(acc, fallenPetal(uv, 0.63, t));

  // Soft radial vignette so the whole thing dissolves into the dark page.
  float vig = smoothstep(1.25, 0.35, length(uv - vec2(0.0, -0.05)));
  acc *= vig;

  // Subtle filmic tone-map for richer reds.
  acc.rgb = acc.rgb / (acc.rgb + 0.55);
  acc.rgb = pow(acc.rgb, vec3(0.85));

  // Output straight alpha (context uses premultipliedAlpha:false).
  vec3 outRGB = acc.a > 0.0001 ? acc.rgb / acc.a : vec3(0.0);
  gl_FragColor = vec4(outRGB, clamp(acc.a, 0.0, 1.0));
}
`;

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

interface ShaderFlowerProps {
  className?: string;
}

export function ShaderFlower({ className }: ShaderFlowerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl =
      (canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false, antialias: true }) as
        | WebGLRenderingContext
        | null) ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
    if (!gl) return;

    const vert = compileShader(gl, gl.VERTEX_SHADER, VERT_SRC);
    const frag = compileShader(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
    if (!vert || !frag) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    // Full-screen triangle pair.
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
    const posLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uResolution = gl.getUniformLocation(program, "u_resolution");
    const uTime = gl.getUniformLocation(program, "u_time");

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // This is a soft, masked, decorative backdrop, so we deliberately render at
    // a low internal resolution and let CSS upscale it. The heavy per-pixel
    // shader would otherwise saturate the GPU and make the rest of the page
    // (e.g. typing in the terminal) stutter. ~0.6x of one device pixel is
    // invisible behind the radial mask but a fraction of the fragment cost.
    const renderScale = 0.6;

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
      gl.uniform2f(uResolution, canvas.width, canvas.height);
    };

    resize();
    window.addEventListener("resize", resize);
    // Re-size on container changes too, but never inside the render loop —
    // reading clientWidth/clientHeight forces a synchronous layout, and doing
    // that every frame thrashes the page (e.g. it fights react-rnd while you
    // drag a window). A ResizeObserver fires only when the size actually changes.
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(resize);
      ro.observe(canvas);
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let raf = 0;
    const start = performance.now();

    // Throttle to ~30fps. The animation is slow and gentle, so half the frames
    // are imperceptible but it halves the GPU work and keeps the main thread
    // responsive.
    const frameInterval = 1000 / 30;
    let last = -Infinity;

    const render = (now: number) => {
      raf = requestAnimationFrame(render);
      if (now - last < frameInterval) return;
      last = now;
      // No resize() here: sizing is handled by the resize listener and the
      // ResizeObserver, so the render loop never forces a layout.
      gl.uniform1f(uTime, (now - start) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    if (reduceMotion) {
      // Single static frame.
      resize();
      gl.uniform1f(uTime, 4.2);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    } else {
      raf = requestAnimationFrame(render);
    }

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else if (!reduceMotion) {
        raf = requestAnimationFrame(render);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      if (ro) ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      gl.deleteProgram(program);
      gl.deleteShader(vert);
      gl.deleteShader(frag);
      gl.deleteBuffer(buffer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ display: "block", width: "100%", height: "100%", pointerEvents: "none" }}
    />
  );
}

export default ShaderFlower;
