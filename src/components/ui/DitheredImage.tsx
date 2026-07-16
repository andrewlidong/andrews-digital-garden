import { useCallback, useEffect, useRef, useState, type ImgHTMLAttributes } from 'react';

// Images in the garden are dithered into the active theme's palette — ordered
// (Bayer 8x8) dithering, the Obra Dinn / risograph look — so photos read as
// native to the terminal instead of pasted onto it, and re-tint when the
// theme changes. Hovering (or tapping) an image reveals the original.
//
// Only same-origin, non-GIF images are dithered: GIFs would lose their
// animation, and cross-origin pixels would taint the canvas. Everything else
// falls back to a plain <img>.

const BAYER8 = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];

// The darkest tone is the *elevated* background, not the page background:
// screenshots of dark UIs would otherwise dissolve straight into the page.
const PALETTE_VARS = ['--term-bg-elevated', '--term-fg', '--term-accent', '--term-yellow'];
const SPREAD = 84; // how far the Bayer threshold pushes each channel

function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.replace(/./g, (c) => c + c);
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function readPalette(): [number, number, number][] {
  const style = getComputedStyle(document.documentElement);
  const colors: [number, number, number][] = [];
  for (const v of PALETTE_VARS) {
    const rgb = hexToRgb(style.getPropertyValue(v));
    if (rgb) colors.push(rgb);
  }
  return colors;
}

function ditherInto(source: ImageData, palette: [number, number, number][]): ImageData {
  const { width, height, data } = source;
  const out = new ImageData(width, height);
  const o = out.data;
  for (let y = 0; y < height; y++) {
    const row = BAYER8[y & 7];
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const t = ((row[x & 7] + 0.5) / 64 - 0.5) * SPREAD;
      const r = data[i] + t;
      const g = data[i + 1] + t;
      const b = data[i + 2] + t;
      let best = 0;
      let bestD = Infinity;
      for (let p = 0; p < palette.length; p++) {
        const dr = r - palette[p][0];
        const dg = g - palette[p][1];
        const db = b - palette[p][2];
        const d = dr * dr + dg * dg + db * db;
        if (d < bestD) {
          bestD = d;
          best = p;
        }
      }
      o[i] = palette[best][0];
      o[i + 1] = palette[best][1];
      o[i + 2] = palette[best][2];
      o[i + 3] = data[i + 3];
    }
  }
  return out;
}

function shouldSkip(src: string): boolean {
  if (/\.gif(?:$|[?#])/i.test(src)) return true;
  try {
    return new URL(src, window.location.href).origin !== window.location.origin;
  } catch {
    return true;
  }
}

function Dithered({ src = '', alt = '', ...rest }: ImgHTMLAttributes<HTMLImageElement>) {
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // The downscaled source pixels, cached so a theme switch only re-quantizes
  // instead of re-decoding the image.
  const sourceRef = useRef<ImageData | null>(null);
  const [ready, setReady] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);

  const paint = useCallback(() => {
    const canvas = canvasRef.current;
    const source = sourceRef.current;
    if (!canvas || !source) return;
    const palette = readPalette();
    if (palette.length < 2) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.putImageData(ditherInto(source, palette), 0, 0);
    setReady(true);
  }, []);

  const prepare = useCallback(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas || !img.naturalWidth) return;
    // Dither at the displayed CSS-pixel size (not the natural size): the dots
    // are the aesthetic, and at natural resolution they'd shrink into noise.
    // The canvas upscales with image-rendering: pixelated for crisp dots.
    const w = Math.max(1, Math.min(Math.round(img.clientWidth) || img.naturalWidth, img.naturalWidth));
    const h = Math.max(1, Math.round((w / img.naturalWidth) * img.naturalHeight));
    const scratch = document.createElement('canvas');
    scratch.width = w;
    scratch.height = h;
    const sctx = scratch.getContext('2d');
    if (!sctx) return;
    sctx.drawImage(img, 0, 0, w, h);
    try {
      sourceRef.current = sctx.getImageData(0, 0, w, h);
    } catch {
      return; // tainted or otherwise unreadable — leave the original showing
    }
    canvas.width = w;
    canvas.height = h;
    paint();
  }, [paint]);

  // If the image was cached and loaded before hydration, onLoad never fires.
  useEffect(() => {
    if (imgRef.current?.complete) prepare();
  }, [prepare]);

  // Re-dither when the theme changes: applyTheme rewrites the CSS variables
  // on the document root's inline style.
  useEffect(() => {
    const mo = new MutationObserver(() => {
      if (sourceRef.current) paint();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
    return () => mo.disconnect();
  }, [paint]);

  const revealed = pinned || hovered;

  return (
    <span
      className="group/dither relative inline-block cursor-pointer overflow-hidden rounded-lg border border-term-border/50"
      onClick={() => setPinned((p) => !p)}
      onMouseEnter={() => {
        if (window.matchMedia('(hover: hover)').matches) setHovered(true);
      }}
      onMouseLeave={() => setHovered(false)}
      title={ready ? 'hover or tap for the original' : undefined}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={prepare}
        className="block max-w-full rounded-lg"
        style={{
          opacity: ready && !revealed ? 0 : 1,
          transition: 'opacity 400ms ease',
        }}
        {...rest}
      />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full rounded-lg"
        style={{
          opacity: ready && !revealed ? 1 : 0,
          transition: 'opacity 400ms ease',
          imageRendering: 'pixelated',
        }}
      />
      {ready && (
        <span
          aria-hidden="true"
          className="dither-chip absolute bottom-2 right-2 rounded border border-term-border/60 bg-term-bg/70 px-1.5 py-0.5 font-mono text-[10px] text-term-faint opacity-0 transition-opacity group-hover/dither:opacity-100"
        >
          {revealed ? 'original' : 'dithered'}
        </span>
      )}
    </span>
  );
}

export function DitheredImage(props: ImgHTMLAttributes<HTMLImageElement>) {
  const { src = '', alt = '', ...rest } = props;
  if (!src || shouldSkip(src)) {
    return <img src={src} alt={alt} loading="lazy" decoding="async" {...rest} />;
  }
  return <Dithered src={src} alt={alt} {...rest} />;
}
