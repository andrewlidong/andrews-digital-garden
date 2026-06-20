import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { parseFrontmatter, formatDate, type PostMeta } from "@/lib/frontmatter";

type LoadState = "loading" | "ready" | "notfound";

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

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-mono">
      {/* Terminal-style top bar */}
      <header className="sticky top-0 z-10 border-b border-gray-700 bg-gray-900/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3 text-sm">
          <Link
            to="/"
            className="text-gray-400 transition-colors hover:text-green-400"
            aria-label="Back to desktop"
          >
            ← cd ~
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
                {meta.source && (
                  <>
                    <span aria-hidden>·</span>
                    <a
                      href={meta.source}
                      target="_blank"
                      rel="noreferrer"
                      className="text-gray-500 underline-offset-2 hover:text-green-400 hover:underline"
                    >
                      originally on Substack
                    </a>
                  </>
                )}
              </div>
            </div>

            <div className="prose prose-invert prose-lg max-w-none prose-headings:font-semibold prose-headings:text-white prose-a:text-green-400 prose-a:no-underline hover:prose-a:underline prose-code:rounded prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-green-300 prose-code:before:content-none prose-code:after:content-none prose-pre:border prose-pre:border-gray-800 prose-pre:bg-gray-950 prose-blockquote:border-l-green-700 prose-blockquote:text-gray-300 prose-img:rounded-lg">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
            </div>

            <footer className="mt-16 border-t border-gray-800 pt-6 text-sm text-gray-500">
              <Link
                to="/"
                className="text-gray-400 hover:text-green-400"
              >
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
