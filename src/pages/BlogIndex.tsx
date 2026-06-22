import { useEffect } from "react";
import { Link } from "react-router-dom";
import fileSystemData from "@/content/filesystem.json";
import { formatDate, readerPath } from "@/lib/frontmatter";
import { useTheme } from "@/hooks/useTheme";

type FsNode = {
  name: string;
  type: "file" | "folder";
  path?: string;
  date?: string;
  title?: string;
  subtitle?: string;
  tags?: string[];
  children?: FsNode[];
};

function prettify(name: string): string {
  return name.replace(/\.(md|markdown)$/i, "").replace(/[-_]/g, " ");
}

function getPosts(): FsNode[] {
  const blog = (fileSystemData as FsNode[]).find(
    (n) => n.type === "folder" && n.name === "blog"
  );
  if (!blog?.children) return [];
  return blog.children
    .filter((c) => c.type === "file" && /\.(md|markdown)$/i.test(c.name))
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
}

export default function BlogIndex() {
  const posts = getPosts();
  // Honor the active "rice" theme on this route too (direct loads of /blog
  // would otherwise fall back to the CSS default palette).
  useTheme();

  useEffect(() => {
    document.title = "Blog — Andrew Dong";
    return () => {
      document.title = "AD Digital Garden";
    };
  }, []);

  return (
    <div className="min-h-screen bg-term-bg font-sans text-term-fg antialiased transition-colors duration-500">
      <header className="sticky top-0 z-10 border-b border-term-border bg-[color-mix(in_srgb,var(--term-bg)_85%,transparent)] backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-3 font-mono text-sm sm:px-6">
          <Link
            to="/"
            className="text-term-dim transition-colors hover:text-term-accent"
          >
            ← cd ~
          </Link>
          <a
            href="/rss.xml"
            className="text-term-faint transition-colors hover:text-term-accent"
          >
            rss
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 py-10 sm:px-6 sm:py-16">
        <div className="mb-8 sm:mb-10">
          <p className="mb-2 font-mono text-sm text-term-accent">~/blog</p>
          <h1 className="text-3xl font-bold tracking-tight text-term-fg sm:text-4xl">
            Writing
          </h1>
          <p className="mt-2 text-term-dim">
            Notes on software, languages, and creative coding.
          </p>
        </div>

        {posts.length === 0 ? (
          <p className="text-term-dim">No posts yet.</p>
        ) : (
          <ul className="-mx-3 flex flex-col">
            {posts.map((post) => {
              const to = post.path ? readerPath(post.path) : "/blog";
              return (
                <li key={post.path}>
                  <Link
                    to={to}
                    className="group block rounded-xl border border-transparent px-3 py-4 transition-all hover:border-term-border/70 hover:bg-term-elevated/50 active:scale-[0.99]"
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <h2 className="text-lg font-semibold tracking-tight text-term-fg transition-colors group-hover:text-term-accent sm:text-xl">
                        {post.title || prettify(post.name)}
                      </h2>
                      {post.date && (
                        <span className="shrink-0 font-mono text-xs text-term-faint sm:text-sm">
                          {formatDate(post.date)}
                        </span>
                      )}
                    </div>
                    {post.subtitle && (
                      <p className="mt-1.5 text-sm leading-relaxed text-term-dim sm:text-base">
                        {post.subtitle}
                      </p>
                    )}
                    {post.tags && post.tags.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md border border-term-border/60 bg-term-bg/50 px-2 py-0.5 font-mono text-xs text-term-dim"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
