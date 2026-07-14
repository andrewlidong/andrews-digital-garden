import { useEffect, useRef, useState } from 'react';
import { parseFrontmatter } from '@/lib/frontmatter';
import { loadFileContent } from '@/lib/loadFileContent';

// Hover a [[wikilink]] anywhere and a small popover previews the target
// page — title plus its first few lines — so you can peek before you click.
// One document-level listener covers the reader, desktop windows, and any
// future surface that renders wikilinks.

const SHOW_DELAY_MS = 300;
const EXCERPT_CHARS = 260;

const cache = new Map<string, { title: string; excerpt: string }>();

function excerptFrom(raw: string, fallbackTitle: string) {
  const { meta, body } = parseFrontmatter(raw);
  const text = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^#+\s+/gm, '')
    .replace(/[*_`>~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return {
    title: meta.title || fallbackTitle,
    excerpt: text.slice(0, EXCERPT_CHARS) + (text.length > EXCERPT_CHARS ? '…' : ''),
  };
}

type Popover = { title: string; excerpt: string; x: number; y: number; below: boolean };

export function WikilinkPreviews() {
  const [pop, setPop] = useState<Popover | null>(null);
  const timer = useRef<number>(0);
  const anchor = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    const hide = () => {
      window.clearTimeout(timer.current);
      anchor.current = null;
      setPop(null);
    };

    const show = async (a: HTMLAnchorElement) => {
      const href = a.getAttribute('href') || '';
      if (!href.startsWith('/read/')) return;
      const rel = href
        .replace(/^\/read\//, '')
        .split('/')
        .map(decodeURIComponent)
        .join('/');
      const filePath = `/files/${rel}.md`;
      let data = cache.get(filePath);
      if (!data) {
        const raw = await loadFileContent(filePath);
        if (raw === 'Error loading content') return;
        data = excerptFrom(raw, rel.split('/').pop() || 'note');
        cache.set(filePath, data);
      }
      if (anchor.current !== a) return; // hover moved on while fetching
      const r = a.getBoundingClientRect();
      const below = r.bottom < window.innerHeight - 180;
      setPop({
        title: data.title,
        excerpt: data.excerpt,
        x: Math.min(Math.max(r.left + r.width / 2, 170), window.innerWidth - 170),
        y: below ? r.bottom + 8 : r.top - 8,
        below,
      });
    };

    const onOver = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.('a.wikilink') as HTMLAnchorElement | null;
      if (!a) return;
      window.clearTimeout(timer.current);
      anchor.current = a;
      timer.current = window.setTimeout(() => show(a), SHOW_DELAY_MS);
    };
    const onOut = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.('a.wikilink');
      if (a && a === anchor.current) hide();
    };

    // Scrolling dismisses a visible popover (its position is stale) but must
    // not cancel a pending one — hovering a link often scrolls it into view
    // first, and that scroll shouldn't eat the preview.
    const hideVisible = () => setPop(null);

    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);
    document.addEventListener('scroll', hideVisible, true);
    document.addEventListener('click', hide, true);
    return () => {
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
      document.removeEventListener('scroll', hideVisible, true);
      document.removeEventListener('click', hide, true);
      window.clearTimeout(timer.current);
    };
  }, []);

  if (!pop) return null;

  return (
    <div
      className="pointer-events-none fixed z-[900] w-[340px] max-w-[85vw] rounded-lg border border-term-border bg-term-elevated p-3 shadow-xl"
      style={{
        left: pop.x,
        top: pop.y,
        transform: `translate(-50%, ${pop.below ? '0' : '-100%'})`,
      }}
    >
      <div className="mb-1 font-mono text-xs text-term-accent">{pop.title}</div>
      {pop.excerpt && (
        <p className="font-sans text-xs leading-relaxed text-term-dim">{pop.excerpt}</p>
      )}
    </div>
  );
}
