import { useEffect } from "react";
import { Link } from "react-router-dom";
import fileSystemData from "@/content/filesystem.json";
import { formatDate, readerPath } from "@/lib/frontmatter";

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

  useEffect(() => {
    document.title = "Blog — Andrew Dong";
    return () => {
      document.title = "AD Digital Garden";
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-mono">
      <header className="sticky top-0 z-10 border-b border-gray-700 bg-gray-900/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3 text-sm">
          <Link
            to="/"
            className="text-gray-400 transition-colors hover:text-green-400"
          >
            ← cd ~
          </Link>
          <a
            href="/rss.xml"
            className="text-gray-500 transition-colors hover:text-green-400"
          >
            rss
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-10 border-b border-gray-800 pb-6">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">blog</h1>
          <p className="mt-2 text-gray-400">
            Writing on software, languages, and creative coding.
          </p>
        </div>

        {posts.length === 0 ? (
          <p className="text-gray-400">No posts yet.</p>
        ) : (
          <ul className="space-y-8">
            {posts.map((post) => {
              const to = post.path ? readerPath(post.path) : "/blog";
              return (
                <li key={post.path}>
                  <Link to={to} className="group block">
                    <div className="flex items-baseline justify-between gap-4">
                      <h2 className="text-xl font-semibold text-white group-hover:text-green-400">
                        {post.title || prettify(post.name)}
                      </h2>
                      {post.date && (
                        <span className="shrink-0 text-sm text-gray-500">
                          {formatDate(post.date)}
                        </span>
                      )}
                    </div>
                    {post.subtitle && (
                      <p className="mt-1 text-gray-400">{post.subtitle}</p>
                    )}
                    {post.tags && post.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded border border-gray-700 bg-gray-800 px-2 py-0.5 text-xs text-green-400"
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
