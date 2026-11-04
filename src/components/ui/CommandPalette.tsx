import { useEffect, useMemo, useRef, useState } from 'react';
import { useViewTransitionNavigate } from '@/hooks/useViewTransitionNavigate';
import fileSystemData from '@/content/filesystem.json';
import { readerPath } from '@/lib/frontmatter';
import { grep, compilePattern, highlightMatches, type SearchHit } from '@/lib/searchIndex';
import { usePaletteActions } from '@/lib/paletteActions';

// Cmd+K / Ctrl+K jump-anywhere palette. Everything in the garden is already
// indexed in filesystem.json, so the primary list is pure UI: flatten it
// once, substring match, arrow keys + enter to go. When nothing matches by
// name, it falls back to full-text search over post bodies, and pages can
// contribute contextual actions (see lib/paletteActions).

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

type Item = {
  id: string;
  label: string;
  hint?: string;
  snippet?: string; // pre-escaped HTML
  select: () => void;
};

type Group = { title: string; items: Item[] };

const RECENT_KEY = 'garden-recent-searches';
const RECENT_MAX = 5;
const SEARCH_MIN = 3;
const SEARCH_DEBOUNCE = 400;

function loadRecent(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    return Array.isArray(raw) ? raw.filter((s) => typeof s === 'string').slice(0, RECENT_MAX) : [];
  } catch {
    return [];
  }
}

function saveRecent(term: string): string[] {
  const next = [term, ...loadRecent().filter((s) => s !== term)].slice(0, RECENT_MAX);
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* private mode */
  }
  return next;
}

// Trim a long line to a window around its first match so the highlight is
// visible inside the two-line snippet.
function snippetAround(text: string, re: RegExp, radius = 70): string {
  re.lastIndex = 0;
  const m = re.exec(text);
  if (!m || m.index <= radius) return text;
  const start = text.lastIndexOf(' ', m.index - radius);
  return `…${text.slice(start === -1 ? m.index - radius : start + 1)}`;
}

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
  const navigate = useViewTransitionNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  // null = no full-text search in flight or shown for the current query.
  const [searchHits, setSearchHits] = useState<SearchHit[] | null>(null);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const entries = useMemo(collectEntries, []);
  const actions = usePaletteActions();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
        setQuery('');
        setIndex(0);
        setSearchHits(null);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      setRecent(loadRecent());
    }
  }, [open]);

  const q = query.trim().toLowerCase();
  const matchedEntries = useMemo(() => {
    if (!q) return entries.slice(0, 9);
    return entries
      .filter((e) => e.key.includes(q))
      .sort((a, b) => Number(b.key.startsWith(q)) - Number(a.key.startsWith(q)))
      .slice(0, 9);
  }, [entries, q]);
  const matchedActions = useMemo(
    () => (q ? actions.filter((a) => a.label.toLowerCase().includes(q)) : actions),
    [actions, q]
  );

  // Full-text fallback: only when the name match comes up empty.
  const needsSearch = open && q.length >= SEARCH_MIN && matchedEntries.length === 0 && matchedActions.length === 0;
  useEffect(() => {
    setSearchHits(null);
    if (!needsSearch) {
      setSearching(false);
      return;
    }
    let cancelled = false;
    setSearching(true);
    const timer = setTimeout(() => {
      grep(q, { ignoreCase: true })
        .then((hits) => {
          if (cancelled) return;
          setSearchHits(hits);
          setIndex(0);
        })
        .catch(() => {
          if (!cancelled) setSearchHits([]);
        })
        .finally(() => {
          if (!cancelled) setSearching(false);
        });
    }, SEARCH_DEBOUNCE);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [needsSearch, q]);

  const groups = useMemo<Group[]>(() => {
    const out: Group[] = [];
    if (matchedActions.length) {
      out.push({
        title: 'Actions',
        items: matchedActions.map((a) => ({
          id: `action:${a.id}`,
          label: a.label,
          hint: a.hint,
          select: () => {
            setOpen(false);
            a.run();
          },
        })),
      });
    }
    if (!q && recent.length) {
      out.push({
        title: 'Recent searches',
        items: recent.map((term) => ({
          id: `recent:${term}`,
          label: term,
          hint: 'search',
          select: () => {
            setQuery(term);
            setIndex(0);
          },
        })),
      });
    }
    if (matchedEntries.length) {
      out.push({
        title: q ? 'Pages' : 'Jump to',
        items: matchedEntries.map((e) => ({
          id: `entry:${e.to}`,
          label: e.label,
          hint: e.hint,
          select: () => {
            setOpen(false);
            navigate(e.to);
          },
        })),
      });
    }
    if (searchHits && searchHits.length) {
      // One row per file — the first matching line — so a long post doesn't
      // crowd out the rest of the garden.
      const re = compilePattern(q, true);
      const perFile = new Map<string, { hit: SearchHit; count: number }>();
      for (const h of searchHits) {
        const cur = perFile.get(h.path);
        if (cur) cur.count++;
        else perFile.set(h.path, { hit: h, count: 1 });
      }
      out.push({
        title: 'Search',
        items: [...perFile.values()].slice(0, 9).map(({ hit, count }) => ({
          id: `search:${hit.path}`,
          label: hit.title,
          hint: `${hit.path.replace(/^\/files\//, '~/').replace(/\/[^/]*$/, '')}${count > 1 ? ` · ${count} matches` : ''}`,
          snippet: highlightMatches(snippetAround(hit.text, re), re),
          select: () => {
            setRecent(saveRecent(query.trim()));
            setOpen(false);
            navigate(readerPath(hit.path));
          },
        })),
      });
    }
    return out;
  }, [matchedActions, matchedEntries, recent, searchHits, q, query, navigate]);

  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  if (!open) return null;

  const emptyMessage = searching
    ? 'searching the garden…'
    : searchHits
      ? 'nothing in the garden mentions that'
      : q.length >= SEARCH_MIN
        ? 'nothing planted by that name'
        : 'nothing planted by that name (keep typing to search inside posts)';

  let cursor = 0;

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
                setIndex((i) => Math.min(i + 1, flat.length - 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setIndex((i) => Math.max(i - 1, 0));
              } else if (e.key === 'Enter' && flat[index]) {
                flat[index].select();
              } else if (e.key === 'Backspace' && query === '') {
                setSearchHits(null);
                setIndex(0);
              }
            }}
            placeholder="jump anywhere in the garden…"
            aria-label="Search the garden"
            className="flex-1 bg-transparent text-sm text-term-fg outline-none placeholder:text-term-faint"
          />
          <kbd className="rounded border border-term-border px-1.5 py-0.5 text-[10px] text-term-faint">esc</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto py-1">
          {flat.length === 0 && (
            <p className="px-4 py-3 text-sm text-term-faint">{emptyMessage}</p>
          )}
          {groups.map((g) => (
            <section key={g.title}>
              <h3 className="px-4 pb-1 pt-2 text-[10px] uppercase tracking-wider text-term-faint">{g.title}</h3>
              <ul>
                {g.items.map((item) => {
                  const i = cursor++;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onMouseEnter={() => setIndex(i)}
                        onClick={item.select}
                        className={`flex w-full flex-col gap-0.5 px-4 py-2 text-left text-sm ${
                          i === index ? 'bg-term-bg text-term-accent' : 'text-term-dim'
                        }`}
                      >
                        <span className="flex w-full items-baseline gap-3">
                          <span className="flex-1 truncate text-term-fg">{item.label}</span>
                          {item.hint && <span className="shrink-0 text-xs text-term-faint">{item.hint}</span>}
                        </span>
                        {item.snippet && (
                          <span
                            className="line-clamp-2 text-xs text-term-dim"
                            dangerouslySetInnerHTML={{ __html: item.snippet }}
                          />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
        <div className="border-t border-term-border px-4 py-2 text-[10px] text-term-faint">
          ↑↓ navigate · enter open · ⌘K toggle
        </div>
      </div>
    </div>
  );
}
