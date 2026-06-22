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
  const splat = params["*"] || "";
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
      document.title = "AD Digital Garden";
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

            <div className="prose prose-invert max-w-none sm:prose-lg prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-term-fg prose-p:text-term-fg prose-li:text-term-fg prose-strong:text-term-fg prose-a:text-term-accent prose-a:no-underline hover:prose-a:underline prose-code:rounded prose-code:bg-term-elevated prose-code:px-1.5 prose-code:py-0.5 prose-code:text-term-green prose-code:before:content-none prose-code:after:content-none prose-pre:border prose-pre:border-term-border prose-pre:bg-term-inset prose-blockquote:border-l-term-accent prose-blockquote:text-term-dim prose-img:rounded-lg">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[[rehypeHighlight, { detect: true, ignoreMissing: true }]]}
              >
                {body}
              </ReactMarkdown>
            </div>

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
