import { useEffect, useMemo, useRef, useState } from 'react';

// Vines growing off the name — small curved stems that sprout from the top
// edge of the letters, unfurl a leaf or two, and open a blossom at the tip.
// Geometry is generated in pixel space from a seeded PRNG so the garden is
// stable across renders; colors ride the theme's CSS variables. Stems draw on
// via stroke-dashoffset when scrolled into view; leaves and blossoms spring
// open as the stem reaches them. Under prefers-reduced-motion everything
// renders fully grown with no animation.

function mulberry32(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Pt = { x: number; y: number };

function cubicPoint(p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
}

function cubicTangent(p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): number {
  const u = 1 - t;
  const dx = 3 * u * u * (p1.x - p0.x) + 6 * u * t * (p2.x - p1.x) + 3 * t * t * (p3.x - p2.x);
  const dy = 3 * u * u * (p1.y - p0.y) + 6 * u * t * (p2.y - p1.y) + 3 * t * t * (p3.y - p2.y);
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}

type Leaf = { x: number; y: number; angle: number; size: number; colorIdx: number; at: number };
type Tip = { x: number; y: number; angle: number; kind: 'flower' | 'bud'; colorIdx: number };

type Sprout = {
  d: string;
  leaves: Leaf[];
  tip: Tip;
  order: number;
};

const LEAF_COLORS = [
  'var(--term-green)',
  'color-mix(in srgb, var(--term-green) 55%, var(--term-cyan))',
];
const PETAL_COLORS = ['var(--term-magenta)', 'var(--term-yellow)'];

function buildSprouts(w: number, h: number, seed: number, count: number): Sprout[] {
  const rnd = mulberry32(seed);
  const sprouts: Sprout[] = [];
  for (let i = 0; i < count; i++) {
    // Spread anchors across the width with a little jitter per slot.
    const slot = (i + 0.5) / count;
    const x = 8 + (slot + (rnd() - 0.5) * (0.5 / count)) * (w - 16);
    const stemH = Math.min(h - 5, h * (0.5 + rnd() * 0.45));
    const lean = (rnd() - 0.5) * stemH * 0.9;
    const p0 = { x, y: h };
    const p1 = { x: x + lean * 0.08, y: h - stemH * 0.38 };
    const p2 = { x: x + lean * 0.62, y: h - stemH * 0.72 };
    const p3 = { x: x + lean, y: h - stemH };
    const d = `M ${p0.x.toFixed(1)} ${p0.y.toFixed(1)} C ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}, ${p3.x.toFixed(1)} ${p3.y.toFixed(1)}`;

    const leaves: Leaf[] = [];
    const nLeaves = stemH > h * 0.62 ? 2 : 1;
    for (let l = 0; l < nLeaves; l++) {
      const at = 0.42 + l * 0.26 + rnd() * 0.08;
      const pt = cubicPoint(p0, p1, p2, p3, at);
      const tangent = cubicTangent(p0, p1, p2, p3, at);
      const side = l % 2 === 0 ? 1 : -1;
      leaves.push({
        x: pt.x,
        y: pt.y,
        angle: tangent + side * (55 + rnd() * 20),
        size: 3.2 + rnd() * 1.8,
        colorIdx: Math.floor(rnd() * LEAF_COLORS.length),
        at,
      });
    }

    const tip: Tip = {
      x: p3.x,
      y: p3.y,
      angle: cubicTangent(p0, p1, p2, p3, 1),
      kind: rnd() < 0.45 ? 'flower' : 'bud',
      colorIdx: Math.floor(rnd() * PETAL_COLORS.length),
    };

    sprouts.push({ d, leaves, tip, order: i });
  }
  return sprouts;
}

export function SproutGrowth({
  className = '',
  seed = 7,
  delay = 0,
  maxCount = 9,
}: {
  className?: string;
  seed?: number;
  delay?: number;
  maxCount?: number;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [grown, setGrown] = useState(false);
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) setSize({ w: r.width, h: r.height });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced) {
      setGrown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setGrown(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  const sprouts = useMemo(() => {
    if (!size) return [];
    const count = Math.max(4, Math.min(maxCount, Math.round(size.w / 64)));
    return buildSprouts(size.w, size.h, seed, count);
  }, [size, seed, maxCount]);

  const STEM_MS = 900;

  return (
    <svg
      ref={ref}
      className={`pointer-events-none ${className}`}
      aria-hidden="true"
      viewBox={size ? `0 0 ${size.w} ${size.h}` : undefined}
      style={{ width: '100%', height: '100%', overflow: 'visible' }}
    >
      {sprouts.map((s) => {
        const base = delay + s.order * 110;
        const pop = (at: number) =>
          reduced
            ? undefined
            : {
                transform: grown ? 'scale(1)' : 'scale(0)',
                transformBox: 'fill-box' as const,
                transformOrigin: 'center',
                transition: `transform 480ms cubic-bezier(0.34, 1.56, 0.64, 1) ${
                  base + at * STEM_MS
                }ms`,
              };
        return (
          <g key={s.order}>
            <path
              d={s.d}
              fill="none"
              stroke="var(--term-green)"
              strokeWidth={1.4}
              strokeLinecap="round"
              opacity={0.85}
              pathLength={1}
              strokeDasharray={reduced ? undefined : 1}
              strokeDashoffset={reduced ? undefined : grown ? 0 : 1}
              style={
                reduced
                  ? undefined
                  : {
                      transition: `stroke-dashoffset ${STEM_MS}ms cubic-bezier(0.4, 0, 0.2, 1) ${base}ms`,
                    }
              }
            />
            {s.leaves.map((leaf, li) => (
              <g key={li} transform={`translate(${leaf.x.toFixed(1)} ${leaf.y.toFixed(1)}) rotate(${leaf.angle.toFixed(1)})`}>
                <g style={pop(leaf.at)}>
                  <path
                    d={`M 0 0 Q ${leaf.size} ${-leaf.size * 0.6} ${leaf.size * 2} 0 Q ${leaf.size} ${leaf.size * 0.6} 0 0 Z`}
                    fill={LEAF_COLORS[leaf.colorIdx]}
                    opacity={0.8}
                  />
                </g>
              </g>
            ))}
            <g transform={`translate(${s.tip.x.toFixed(1)} ${s.tip.y.toFixed(1)})`}>
              <g style={pop(1)}>
                {s.tip.kind === 'flower' ? (
                  <>
                    {[0, 72, 144, 216, 288].map((a) => (
                      <ellipse
                        key={a}
                        cx={2.8}
                        cy={0}
                        rx={2.4}
                        ry={1.3}
                        transform={`rotate(${a})`}
                        fill={PETAL_COLORS[s.tip.colorIdx]}
                        opacity={0.85}
                      />
                    ))}
                    <circle
                      r={1.3}
                      fill={PETAL_COLORS[(s.tip.colorIdx + 1) % PETAL_COLORS.length]}
                    />
                  </>
                ) : (
                  <ellipse
                    cx={0}
                    cy={0}
                    rx={1.7}
                    ry={2.6}
                    transform={`rotate(${(s.tip.angle + 90).toFixed(1)})`}
                    fill={PETAL_COLORS[s.tip.colorIdx]}
                    opacity={0.75}
                  />
                )}
              </g>
            </g>
          </g>
        );
      })}
    </svg>
  );
}
