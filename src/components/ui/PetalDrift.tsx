import { useEffect, useRef } from 'react';

// A whisper of petals drifting down over the hero — small theme-colored
// ellipses with sway and spin, like a tree shedding over the garden.
// Renders nothing under prefers-reduced-motion; pauses when the tab hides.
const COLOR_VARS = ['--term-green', '--term-magenta', '--term-yellow', '--term-cyan'];

type Petal = {
  x: number;
  y: number;
  size: number;
  fall: number;
  phase: number;
  sway: number;
  rot: number;
  spin: number;
  colorVar: string;
  alpha: number;
};

export function PetalDrift({ className = '', count = 12 }: { className?: string; count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let w = 0;
    let h = 0;
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = Math.max(1, r.width);
      h = Math.max(1, r.height);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const petals: Petal[] = Array.from({ length: count }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      size: 2.2 + Math.random() * 2.8,
      fall: 10 + Math.random() * 14, // px/s
      phase: Math.random() * Math.PI * 2,
      sway: 8 + Math.random() * 16,
      rot: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 1.2,
      colorVar: COLOR_VARS[i % COLOR_VARS.length],
      alpha: 0.22 + Math.random() * 0.28,
    }));

    const cssVar = (name: string) =>
      getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#9ece9e';

    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      for (const p of petals) {
        p.y += (p.fall * dt) / h;
        p.phase += dt * 1.1;
        p.rot += p.spin * dt;
        if (p.y > 1.04) {
          p.y = -0.04;
          p.x = Math.random();
        }
        const x = p.x * w + Math.sin(p.phase) * p.sway;
        const y = p.y * h;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(p.rot + Math.sin(p.phase) * 0.5);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = cssVar(p.colorVar);
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    };
    raf = requestAnimationFrame(tick);

    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none ${className}`}
      style={{ width: '100%', height: '100%' }}
    />
  );
}
