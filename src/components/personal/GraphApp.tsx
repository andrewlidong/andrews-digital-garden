import { useEffect, useRef } from 'react';
import fileSystemData from '@/content/filesystem.json';

// The garden graph: every markdown page is a node, every wikilink an edge
// (the same link data that powers backlinks, recorded in filesystem.json at
// commit time). A small hand-rolled force simulation — ~40 nodes doesn't
// need d3. Drag nodes around; click one to open it in a window.

type FsNode = {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path?: string;
  title?: string;
  links?: string[];
  children?: FsNode[];
};

type GNode = {
  id: string;
  path: string;
  label: string;
  section: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  deg: number;
};

type GEdge = { a: GNode; b: GNode };

function buildGraph(): { nodes: GNode[]; edges: GEdge[] } {
  const nodes: GNode[] = [];
  const byPath = new Map<string, GNode>();
  const walk = (ns: FsNode[], section: string) => {
    for (const n of ns) {
      if (n.type === 'folder' && n.children) walk(n.children, n.name);
      else if (n.type === 'file' && n.path && /\.(md|markdown)$/i.test(n.name)) {
        const label = n.title || n.name.replace(/\.(md|markdown)$/i, '').replace(/[-_]+/g, ' ');
        const node: GNode = {
          id: n.id,
          path: n.path,
          label,
          section,
          // deterministic-ish spread so the sim starts untangled
          x: Math.cos(nodes.length * 2.4) * (60 + nodes.length * 4),
          y: Math.sin(nodes.length * 2.4) * (60 + nodes.length * 4),
          vx: 0,
          vy: 0,
          deg: 0,
        };
        nodes.push(node);
        byPath.set(n.path, node);
      }
    }
  };
  walk(fileSystemData as FsNode[], '~');

  const edges: GEdge[] = [];
  const walkLinks = (ns: FsNode[]) => {
    for (const n of ns) {
      if (n.children) walkLinks(n.children);
      else if (n.path && n.links) {
        for (const target of n.links) {
          const a = byPath.get(n.path);
          const b = byPath.get(target);
          if (a && b && a !== b) {
            edges.push({ a, b });
            a.deg++;
            b.deg++;
          }
        }
      }
    }
  };
  walkLinks(fileSystemData as FsNode[]);
  return { nodes, edges };
}

const SECTION_VAR: Record<string, string> = {
  blog: '--term-accent',
  notes: '--term-green',
  projects: '--term-yellow',
};

function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#888';
}

export function GraphApp({ onOpenNode }: { onOpenNode?: (fileId: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { nodes, edges } = buildGraph();
    let width = 0;
    let height = 0;
    let hovered: GNode | null = null;
    let dragging: GNode | null = null;
    let dragMoved = false;
    let alpha = 1; // sim heat: decays to rest, reheats on drag

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      const r = wrap.getBoundingClientRect();
      width = Math.max(1, r.width);
      height = Math.max(1, r.height);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      alpha = Math.max(alpha, 0.3);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const radius = (n: GNode) => 4 + Math.min(8, n.deg * 1.5);

    const tick = () => {
      // pairwise repulsion
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          let dx = b.x - a.x;
          let dy = b.y - a.y;
          const d2 = dx * dx + dy * dy || 1;
          const d = Math.sqrt(d2);
          const force = (2200 / d2) * alpha;
          dx /= d;
          dy /= d;
          a.vx -= dx * force;
          a.vy -= dy * force;
          b.vx += dx * force;
          b.vy += dy * force;
        }
      }
      // springs along edges
      for (const { a, b } of edges) {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 1;
        const force = (d - 90) * 0.02 * alpha;
        a.vx += (dx / d) * force;
        a.vy += (dy / d) * force;
        b.vx -= (dx / d) * force;
        b.vy -= (dy / d) * force;
      }
      // gentle gravity toward center + integrate
      for (const n of nodes) {
        n.vx -= n.x * 0.005 * alpha;
        n.vy -= n.y * 0.005 * alpha;
        if (n !== dragging) {
          n.x += n.vx;
          n.y += n.vy;
        }
        n.vx *= 0.85;
        n.vy *= 0.85;
      }
      alpha = Math.max(0.02, alpha * 0.995);
    };

    const neighborsOf = (n: GNode) => {
      const set = new Set<GNode>([n]);
      for (const e of edges) {
        if (e.a === n) set.add(e.b);
        if (e.b === n) set.add(e.a);
      }
      return set;
    };

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.translate(width / 2, height / 2);

      const fg = cssVar('--term-fg');
      const faint = cssVar('--term-fg-faint');
      const border = cssVar('--term-border');
      const hoodSet = hovered ? neighborsOf(hovered) : null;

      for (const { a, b } of edges) {
        const lit = hoodSet && (a === hovered || b === hovered);
        ctx.strokeStyle = lit ? cssVar('--term-accent') : border;
        ctx.globalAlpha = lit ? 0.9 : 0.5;
        ctx.lineWidth = lit ? 1.5 : 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      for (const n of nodes) {
        const dim = hoodSet ? !hoodSet.has(n) : false;
        ctx.globalAlpha = dim ? 0.25 : 1;
        ctx.fillStyle = cssVar(SECTION_VAR[n.section] || '--term-magenta');
        ctx.beginPath();
        ctx.arc(n.x, n.y, radius(n), 0, Math.PI * 2);
        ctx.fill();
        if (n === hovered) {
          ctx.strokeStyle = fg;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
        ctx.fillStyle = n === hovered ? fg : faint;
        ctx.font = `${n === hovered ? '600 ' : ''}10px ui-monospace, monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(n.label.slice(0, 28), n.x, n.y + radius(n) + 11);
      }
      ctx.restore();
      ctx.globalAlpha = 1;
    };

    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      tick();
      draw();
    };
    loop();

    const toLocal = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left - width / 2, y: e.clientY - r.top - height / 2 };
    };
    const hit = (p: { x: number; y: number }) => {
      let best: GNode | null = null;
      let bestD = 18;
      for (const n of nodes) {
        const d = Math.hypot(n.x - p.x, n.y - p.y);
        if (d < bestD) {
          bestD = d;
          best = n;
        }
      }
      return best;
    };

    const onMove = (e: PointerEvent) => {
      const p = toLocal(e);
      if (dragging) {
        dragging.x = p.x;
        dragging.y = p.y;
        dragMoved = true;
        alpha = Math.max(alpha, 0.3);
        return;
      }
      hovered = hit(p);
      canvas.style.cursor = hovered ? 'pointer' : 'grab';
    };
    const onDown = (e: PointerEvent) => {
      dragging = hit(toLocal(e));
      dragMoved = false;
      if (dragging) canvas.setPointerCapture(e.pointerId);
    };
    const onUp = () => {
      if (dragging && !dragMoved && onOpenNode) onOpenNode(dragging.id);
      dragging = null;
    };
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointerleave', () => {
      if (!dragging) hovered = null;
    });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
    };
  }, [onOpenNode]);

  return (
    <div ref={wrapRef} className="relative h-full w-full bg-term-bg">
      <canvas ref={canvasRef} className="block" />
      <div className="pointer-events-none absolute bottom-2 left-3 flex gap-3 font-mono text-[10px] text-term-faint">
        <span><span style={{ color: 'var(--term-accent)' }}>●</span> blog</span>
        <span><span style={{ color: 'var(--term-green)' }}>●</span> notes</span>
        <span><span style={{ color: 'var(--term-yellow)' }}>●</span> projects</span>
        <span><span style={{ color: 'var(--term-magenta)' }}>●</span> other</span>
        <span className="ml-2">drag to arrange · click to open</span>
      </div>
    </div>
  );
}
