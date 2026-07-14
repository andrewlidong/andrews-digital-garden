import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import fileSystemData from "@/content/filesystem.json";
import { useTheme } from "@/hooks/useTheme";
import {
  parseFrontmatter,
  formatDate,
  readingTime,
  readerPath,
  type PostMeta,
} from "@/lib/frontmatter";
import { remarkWikilinks, getBacklinks } from "@/lib/wikilinks";
import { StageBadge } from "@/components/ui/StageBadge";
import { useInternalLinkNav } from "@/lib/useInternalLinkNav";

type LoadState = "loading" | "ready" | "notfound";

type FsNode = {
  name: string;
  type: "file" | "folder";
  path?: string;
  date?: string;
  title?: string;
  children?: FsNode[];
};

type Sibling = { to: string; label: string };

function prettify(name: string): string {
  return name.replace(/\.(md|markdown)$/i, "").replace(/[-_]/g, " ");
}

// ---------------------------------------------------------------------------
// Heading anchors + table of contents. Headings get stable ids derived from
// their text; the ToC is extracted from the raw markdown with the same
// slugging so the fragments always line up.
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

// Strip inline markdown (code, emphasis, links) so heading text matches what
// the renderer produces.
function cleanInline(text: string): string {
  return text
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\*\*([^*]*)\*\*/g, "$1")
    .replace(/\*([^*]*)\*/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .trim();
}

type Heading = { depth: number; text: string; id: string };

function extractHeadings(body: string): Heading[] {
  const out: Heading[] = [];
  let inFence = false;
  for (const line of body.split("\n")) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (m) {
      const text = cleanInline(m[2]);
      out.push({ depth: m[1].length, text, id: slugify(text) });
    }
  }
  return out;
}

function flattenText(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(flattenText).join("");
  if (typeof node === "object" && "props" in node) {
    return flattenText((node as React.ReactElement<{ children?: React.ReactNode }>).props.children);
  }
  return "";
}

// h2/h3 renderer with an id and a hover # link.
function makeHeading(Tag: "h2" | "h3") {
  return function AnchoredHeading({ children }: { children?: React.ReactNode }) {
    const id = slugify(flattenText(children));
    return (
      <Tag id={id} className="group scroll-mt-20">
        {children}
        <a
          href={`#${id}`}
          aria-label="Link to this section"
          className="ml-2 align-middle font-mono text-sm text-term-accent no-underline opacity-0 transition-opacity group-hover:opacity-70"
        >
          #
        </a>
      </Tag>
    );
  };
}
const headingComponents = { h2: makeHeading("h2"), h3: makeHeading("h3") };

// Find the previous (newer) and next (older) posts in the same folder, by date.
function findNeighbors(section: string, filePath: string) {
  const folder = (fileSystemData as FsNode[]).find(
    (n) => n.type === "folder" && n.name === section
  );
  if (!folder?.children) return { prev: null, next: null };
  const posts = folder.children
    .filter((c) => c.type === "file" && /\.(md|markdown)$/i.test(c.name))
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const idx = posts.findIndex((p) => p.path === filePath);
  if (idx === -1) return { prev: null, next: null };
  const toSib = (p?: FsNode): Sibling | null =>
    p?.path ? { to: readerPath(p.path), label: p.title || prettify(p.name) } : null;
  return { prev: toSib(posts[idx - 1]), next: toSib(posts[idx + 1]) };
}

export default function ReaderPage() {
  const params = useParams();
  const navigate = useNavigate();
  // GitHub Pages serves the pre-rendered share pages from <slug>/index.html
  // and 301s bare URLs to the trailing-slash form — strip it, or the file
  // fetch below becomes "/files/blog/<slug>/.md" and 404s.
  const splat = (params["*"] || "").replace(/\/+$/, "");
  // Honor the active theme on direct loads of a post URL.
  useTheme();

  const [meta, setMeta] = useState<PostMeta>({});
  const [body, setBody] = useState("");
  const [state, setState] = useState<LoadState>("loading");
  const progressBarRef = useRef<HTMLDivElement>(null);

  // The reader path is the file path under /files without its extension.
  const decoded = splat
    .split("/")
    .map((p) => decodeURIComponent(p))
    .join("/");
  const filePath = `/files/${decoded}.md`;
  const section = decoded.split("/")[0] || "files";
  const filename = decoded.split("/").pop() || "file";

  const { prev, next } = useMemo(
    () => findNeighbors(section, filePath),
    [section, filePath]
  );
  const backlinks = useMemo(() => getBacklinks(filePath), [filePath]);
  const headings = useMemo(() => extractHeadings(body), [body]);
  const onProseClick = useInternalLinkNav();

  useEffect(() => {
    let cancelled = false;
    setState("loading");
    fetch(filePath)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((raw) => {
        if (cancelled) return;
        // GitHub Pages serves index.html (200) for missing files; guard against
        // accidentally rendering the SPA shell as a "post".
        if (raw.trimStart().slice(0, 14).toLowerCase() === "<!doctype html") {
          setState("notfound");
          return;
        }
        const { meta: m, body: b } = parseFrontmatter(raw);
        setMeta(m);
        setBody(b);
        setState("ready");
      })
      .catch(() => {
        if (!cancelled) setState("notfound");
      });
    return () => {
      cancelled = true;
    };
  }, [filePath]);

  // Set the document title and scroll to top on load.
  useEffect(() => {
    if (state === "ready") {
      document.title = meta.title
        ? `${meta.title} — Andrew Dong`
        : "Andrew Dong";
      window.scrollTo(0, 0);
    }
    return () => {
      document.title = "Andrew Dong";
    };
  }, [state, meta.title]);

  // Reading-progress bar — a light maximeheckel-style touch that reads well on
  // mobile. Updated directly on the DOM node to avoid re-rendering on scroll.
  useEffect(() => {
    const onScroll = () => {
      if (!progressBarRef.current) return;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(window.scrollY / docHeight, 1) : 0;
      progressBarRef.current.style.width = `${pct * 100}%`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [state]);

  // Esc returns to the desktop.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") navigate("/");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  const title = meta.title || filename;
  const isBlog = section === "blog";

  return (
    <div className="min-h-screen bg-term-bg font-sans text-term-fg antialiased transition-colors duration-500">
      {/* Reading-progress bar */}
      <div className="fixed top-0 left-0 right-0 z-20 h-0.5 bg-term-border/40">
        <div ref={progressBarRef} className="h-full bg-term-accent" style={{ width: "0%" }} />
      </div>

      {/* Terminal-style top bar */}
      <header className="sticky top-0 z-10 border-b border-term-border bg-[color-mix(in_srgb,var(--term-bg)_85%,transparent)] backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-3 font-mono text-sm sm:px-6">
          <Link
            to={isBlog ? "/blog" : "/"}
            className="shrink-0 text-term-dim transition-colors hover:text-term-accent"
            aria-label={isBlog ? "All posts" : "Back to desktop"}
          >
            ← {isBlog ? "cd ~/blog" : "cd ~"}
          </Link>
          <span className="truncate pl-4 text-term-faint">
            <span className="text-term-green">nvim</span> ~/{section}/{filename}.md
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 py-8 sm:px-6 sm:py-12">
        {state === "loading" && (
          <p className="font-mono text-term-accent">
            <span className="animate-pulse">▌</span> loading {filename}…
          </p>
        )}

        {state === "notfound" && (
          <div className="text-term-dim">
            <p className="mb-4 font-mono text-term-red">
              :e {filename}.md — No such file or directory
            </p>
            <Link to="/" className="text-term-accent underline hover:opacity-80">
              Return to the desktop
            </Link>
          </div>
        )}

        {state === "ready" && (
          <article>
            <div className="mb-8 border-b border-term-border pb-6 sm:mb-10">
              <h1 className="mb-2 text-2xl font-bold leading-tight tracking-tight text-term-fg sm:text-4xl">
                {title}
              </h1>
              {meta.subtitle && (
                <p className="mb-3 text-base text-term-dim sm:text-lg">{meta.subtitle}</p>
              )}
              <div className="flex flex-wrap items-center gap-3 font-mono text-sm text-term-faint">
                {meta.date && <span>{formatDate(meta.date)}</span>}
                <span aria-hidden>·</span>
                <span>{readingTime(body)}</span>
                {meta.stage && (
                  <>
                    <span aria-hidden>·</span>
                    <StageBadge stage={meta.stage} />
                  </>
                )}
              </div>
              {meta.tags && meta.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {meta.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md border border-term-border/60 bg-term-elevated/50 px-2 py-0.5 font-mono text-xs text-term-dim"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Table of contents for longer pieces */}
            {headings.length >= 3 && (
              <nav
                aria-label="Table of contents"
                className="mb-8 rounded-lg border border-term-border/60 bg-term-elevated/30 p-4 font-mono text-sm sm:mb-10"
              >
                <div className="mb-2 text-xs text-term-faint">on this page</div>
                <ul className="space-y-1.5">
                  {headings.map((h, i) => (
                    <li key={`${h.id}-${i}`} className={h.depth === 3 ? "pl-4" : ""}>
                      <a
                        href={`#${h.id}`}
                        className="text-term-dim transition-colors hover:text-term-accent"
                      >
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            <div onClick={onProseClick} className="prose prose-invert max-w-none sm:prose-lg prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-term-fg prose-p:text-term-fg prose-li:text-term-fg prose-strong:text-term-fg prose-a:text-term-accent prose-a:no-underline hover:prose-a:underline prose-code:rounded prose-code:bg-term-elevated prose-code:px-1.5 prose-code:py-0.5 prose-code:text-term-green prose-code:before:content-none prose-code:after:content-none prose-pre:border prose-pre:border-term-border prose-pre:bg-term-inset prose-blockquote:border-l-term-accent prose-blockquote:text-term-dim prose-img:rounded-lg">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkWikilinks]}
                rehypePlugins={[[rehypeHighlight, { detect: true, ignoreMissing: true }]]}
                components={headingComponents}
              >
                {body}
              </ReactMarkdown>
            </div>

            {/* Backlinks — pages elsewhere in the garden that link here */}
            {backlinks.length > 0 && (
              <aside className="mt-14 rounded-lg border border-term-border/70 bg-term-elevated/30 p-4 sm:mt-16">
                <div className="mb-3 font-mono text-xs text-term-faint">
                  Linked from
                </div>
                <ul className="space-y-2">
                  {backlinks.map((bl) => (
                    <li key={bl.path}>
                      <Link
                        to={bl.to}
                        className="group inline-flex items-baseline gap-2 text-sm"
                      >
                        <span className="font-mono text-xs text-term-faint">
                          ~/{bl.section}
                        </span>
                        <span className="text-term-dim group-hover:text-term-accent">
                          {bl.title}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </aside>
            )}

            {/* Prev / next navigation */}
            {(prev || next) && (
              <nav className="mt-14 grid grid-cols-1 gap-3 border-t border-term-border pt-6 sm:mt-16 sm:grid-cols-2 sm:gap-4">
                {prev ? (
                  <Link
                    to={prev.to}
                    className="group rounded-lg border border-term-border/70 p-4 transition-colors hover:border-term-accent/60 hover:bg-term-elevated/50"
                  >
                    <div className="font-mono text-xs text-term-faint">← Newer</div>
                    <div className="mt-1 text-sm text-term-dim group-hover:text-term-accent">
                      {prev.label}
                    </div>
                  </Link>
                ) : (
                  <span className="hidden sm:block" />
                )}
                {next ? (
                  <Link
                    to={next.to}
                    className="group rounded-lg border border-term-border/70 p-4 transition-colors hover:border-term-accent/60 hover:bg-term-elevated/50 sm:text-right"
                  >
                    <div className="font-mono text-xs text-term-faint">Older →</div>
                    <div className="mt-1 text-sm text-term-dim group-hover:text-term-accent">
                      {next.label}
                    </div>
                  </Link>
                ) : (
                  <span className="hidden sm:block" />
                )}
              </nav>
            )}

            <footer className="mt-10 font-mono text-sm text-term-faint">
              <Link to="/" className="text-term-dim hover:text-term-accent">
                ← back to the digital garden
              </Link>
              <span className="ml-3 text-term-faint/70">(press Esc)</span>
            </footer>
          </article>
        )}
      </main>
    </div>
  );
}
