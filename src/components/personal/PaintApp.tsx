import { useEffect, useRef, useState } from 'react';

// A little desktop paint program. Colors come from the active theme's CSS
// variables so doodles always match the rice. Drawing state lives on the
// canvas itself; resizes preserve the picture by blitting through an
// offscreen copy.
const COLOR_VARS = [
  '--term-fg',
  '--term-accent',
  '--term-green',
  '--term-yellow',
  '--term-red',
  '--term-cyan',
  '--term-magenta',
];

const SIZES = [2, 5, 12];

function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#888';
}

export function PaintApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [colorVar, setColorVar] = useState(COLOR_VARS[1]);
  const [size, setSize] = useState(SIZES[1]);

  // Size the canvas to its container; keep the drawing across resizes.
  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const resize = () => {
      const r = wrap.getBoundingClientRect();
      const w = Math.max(1, Math.floor(r.width));
      const h = Math.max(1, Math.floor(r.height));
      if (canvas.width === w && canvas.height === h) return;
      const copy = document.createElement('canvas');
      copy.width = canvas.width;
      copy.height = canvas.height;
      copy.getContext('2d')?.drawImage(canvas, 0, 0);
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d')?.drawImage(copy, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  const pos = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const down = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = pos(e);
    draw(e); // dot on click
  };

  const draw = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !last.current) return;
    const p = pos(e);
    ctx.strokeStyle = cssVar(colorVar);
    ctx.lineWidth = size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
  };

  const up = () => {
    drawing.current = false;
    last.current = null;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    canvas?.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Composite onto the theme background so the PNG isn't transparent.
    const out = document.createElement('canvas');
    out.width = canvas.width;
    out.height = canvas.height;
    const ctx = out.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = cssVar('--term-bg');
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(canvas, 0, 0);
    const a = document.createElement('a');
    a.href = out.toDataURL('image/png');
    a.download = 'garden-doodle.png';
    a.click();
  };

  return (
    <div className="flex h-full flex-col bg-term-bg">
      <div className="flex flex-wrap items-center gap-2 border-b border-term-border px-3 py-2">
        {COLOR_VARS.map((v) => (
          <button
            key={v}
            type="button"
            aria-label={`Color ${v.replace('--term-', '')}`}
            onClick={() => setColorVar(v)}
            className={`h-5 w-5 rounded-full border ${
              colorVar === v ? 'border-term-fg ring-2 ring-term-accent/50' : 'border-term-border'
            }`}
            style={{ backgroundColor: `var(${v})` }}
          />
        ))}
        <span className="mx-1 h-5 w-px bg-term-border" aria-hidden />
        {SIZES.map((s) => (
          <button
            key={s}
            type="button"
            aria-label={`Brush size ${s}`}
            onClick={() => setSize(s)}
            className={`flex h-6 w-6 items-center justify-center rounded ${
              size === s ? 'bg-term-elevated ring-1 ring-term-accent/60' : 'hover:bg-term-elevated/60'
            }`}
          >
            <span
              className="rounded-full bg-term-fg"
              style={{ width: Math.min(s + 2, 14), height: Math.min(s + 2, 14) }}
            />
          </button>
        ))}
        <span className="flex-1" />
        <button
          type="button"
          onClick={clear}
          className="rounded border border-term-border/70 px-2 py-0.5 font-mono text-xs text-term-dim hover:border-term-red/60 hover:text-term-red"
        >
          clear
        </button>
        <button
          type="button"
          onClick={save}
          className="rounded border border-term-border/70 px-2 py-0.5 font-mono text-xs text-term-dim hover:border-term-accent/60 hover:text-term-accent"
        >
          save .png
        </button>
      </div>
      <div ref={wrapRef} className="min-h-0 flex-1">
        <canvas
          ref={canvasRef}
          className="block h-full w-full cursor-crosshair touch-none"
          onPointerDown={down}
          onPointerMove={draw}
          onPointerUp={up}
          onPointerLeave={up}
        />
      </div>
    </div>
  );
}
