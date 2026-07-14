import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import fileSystemData from '@/content/filesystem.json';
import { readerPath } from '@/lib/frontmatter';

// Cmd+K / Ctrl+K jump-anywhere palette. Everything in the garden is already
// indexed in filesystem.json, so this is pure UI: flatten it once, substring
// match, arrow keys + enter to go.

type FsNode = {
  name: string;
  type: 'file' | 'folder';
  path?: string;
  title?: string;
  children?: FsNode[];
};

type Entry = {
  label: string;
  hint: string;
  to: string;
  key: string; // lowercase haystack for matching
};

function collectEntries(): Entry[] {
  const entries: Entry[] = [
    { label: 'Desktop', hint: '~', to: '/', key: 'desktop home ~' },
    { label: 'Writing', hint: '~/blog', to: '/blog', key: 'writing blog posts index' },
  ];
  const walk = (nodes: FsNode[], section: string) => {
    for (const node of nodes) {
      if (node.type === 'folder' && node.children) {
        walk(node.children, node.name);
      } else if (node.type === 'file' && node.path && /\.(md|markdown)$/i.test(node.name)) {
        const label = node.title || node.name.replace(/\.(md|markdown)$/i, '').replace(/[-_]+/g, ' ');
        entries.push({
          label,
          hint: section ? `~/${section}` : '~',
          to: readerPath(node.path),
          key: `${label} ${node.name} ${section}`.toLowerCase(),
        });
      }
    }
  };
  walk(fileSystemData as FsNode[], '');
  return entries;
}

export function CommandPalette() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const entries = useMemo(collectEntries, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
        setQuery('');
        setIndex(0);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const q = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!q) return entries.slice(0, 9);
    return entries
      .filter((e) => e.key.includes(q))
      .sort((a, b) => Number(b.key.startsWith(q)) - Number(a.key.startsWith(q)))
      .slice(0, 9);
  }, [entries, q]);

  const go = (entry: Entry) => {
    setOpen(false);
    navigate(entry.to);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-start justify-center bg-black/40 pt-[18vh] backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-xl border border-term-border bg-term-elevated font-mono shadow-2xl">
        <div className="flex items-center gap-2 border-b border-term-border px-4 py-3">
          <span className="text-term-green">❯</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIndex(0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setIndex((i) => Math.min(i + 1, results.length - 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setIndex((i) => Math.max(i - 1, 0));
              } else if (e.key === 'Enter' && results[index]) {
                go(results[index]);
              }
            }}
            placeholder="jump anywhere in the garden…"
            aria-label="Search the garden"
            className="flex-1 bg-transparent text-sm text-term-fg outline-none placeholder:text-term-faint"
          />
          <kbd className="rounded border border-term-border px-1.5 py-0.5 text-[10px] text-term-faint">esc</kbd>
        </div>
        <ul className="max-h-80 overflow-y-auto py-1">
          {results.length === 0 && (
            <li className="px-4 py-3 text-sm text-term-faint">nothing planted by that name</li>
          )}
          {results.map((r, i) => (
            <li key={r.to + r.label}>
              <button
                type="button"
                onMouseEnter={() => setIndex(i)}
                onClick={() => go(r)}
                className={`flex w-full items-baseline gap-3 px-4 py-2 text-left text-sm ${
                  i === index ? 'bg-term-bg text-term-accent' : 'text-term-dim'
                }`}
              >
                <span className="flex-1 truncate text-term-fg">{r.label}</span>
                <span className="text-xs text-term-faint">{r.hint}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="border-t border-term-border px-4 py-2 text-[10px] text-term-faint">
          ↑↓ navigate · enter open · ⌘K toggle
        </div>
      </div>
    </div>
  );
}
