import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import fileSystemData from "@/content/filesystem.json";
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

  const [meta, setMeta] = useState<PostMeta>({});
  const [body, setBody] = useState("");
  const [state, setState] = useState<LoadState>("loading");

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
    <div className="min-h-screen bg-gray-900 text-gray-100 font-mono">
      {/* Terminal-style top bar */}
      <header className="sticky top-0 z-10 border-b border-gray-700 bg-gray-900/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3 text-sm">
          <Link
            to={isBlog ? "/blog" : "/"}
            className="text-gray-400 transition-colors hover:text-green-400"
            aria-label={isBlog ? "All posts" : "Back to desktop"}
          >
            ← {isBlog ? "cd ~/blog" : "cd ~"}
          </Link>
          <span className="truncate pl-4 text-gray-500">
            <span className="text-green-500">nvim</span> ~/{section}/{filename}.md
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        {state === "loading" && (
          <p className="text-green-400">
            <span className="animate-pulse">▌</span> loading {filename}…
          </p>
        )}

        {state === "notfound" && (
          <div className="text-gray-300">
            <p className="mb-4 text-red-400">
              :e {filename}.md — No such file or directory
            </p>
            <Link to="/" className="text-blue-400 underline hover:text-blue-300">
              Return to the desktop
            </Link>
          </div>
        )}

        {state === "ready" && (
          <article>
            <div className="mb-10 border-b border-gray-800 pb-6">
              <h1 className="mb-2 text-3xl font-bold leading-tight text-white sm:text-4xl">
                {title}
              </h1>
              {meta.subtitle && (
                <p className="mb-3 text-lg text-gray-400">{meta.subtitle}</p>
              )}
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                {meta.date && <span>{formatDate(meta.date)}</span>}
                <span aria-hidden>·</span>
                <span>{readingTime(body)}</span>
              </div>
              {meta.tags && meta.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {meta.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded border border-gray-700 bg-gray-800 px-2 py-0.5 text-xs text-green-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="prose prose-invert prose-lg max-w-none prose-headings:font-semibold prose-headings:text-white prose-a:text-green-400 prose-a:no-underline hover:prose-a:underline prose-code:rounded prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-green-300 prose-code:before:content-none prose-code:after:content-none prose-pre:border prose-pre:border-gray-800 prose-pre:bg-gray-950 prose-blockquote:border-l-green-700 prose-blockquote:text-gray-300 prose-img:rounded-lg">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[[rehypeHighlight, { detect: true, ignoreMissing: true }]]}
              >
                {body}
              </ReactMarkdown>
            </div>

            {/* Prev / next navigation */}
            {(prev || next) && (
              <nav className="mt-16 grid grid-cols-1 gap-4 border-t border-gray-800 pt-6 sm:grid-cols-2">
                {prev ? (
                  <Link
                    to={prev.to}
                    className="group rounded-lg border border-gray-800 p-4 transition-colors hover:border-green-700"
                  >
                    <div className="text-xs text-gray-500">← Newer</div>
                    <div className="mt-1 text-sm text-gray-200 group-hover:text-green-400">
                      {prev.label}
                    </div>
                  </Link>
                ) : (
                  <span />
                )}
                {next ? (
                  <Link
                    to={next.to}
                    className="group rounded-lg border border-gray-800 p-4 text-right transition-colors hover:border-green-700"
                  >
                    <div className="text-xs text-gray-500">Older →</div>
                    <div className="mt-1 text-sm text-gray-200 group-hover:text-green-400">
                      {next.label}
                    </div>
                  </Link>
                ) : (
                  <span />
                )}
              </nav>
            )}

            <footer className="mt-10 text-sm text-gray-500">
              <Link to="/" className="text-gray-400 hover:text-green-400">
                ← back to the digital garden
              </Link>
              <span className="ml-3 text-gray-600">(press Esc)</span>
            </footer>
          </article>
        )}
      </main>
    </div>
  );
}
