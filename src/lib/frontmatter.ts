// Tiny YAML-frontmatter parser. Handles the simple `key: "value"` pairs that
// our blog posts use — no need to pull in a full YAML dependency.

export interface PostMeta {
  title?: string;
  date?: string;
  subtitle?: string;
  slug?: string;
  tags?: string[];
}

export interface ParsedDoc {
  meta: PostMeta;
  body: string;
}

const FRONTMATTER_RE = /^\uFEFF?---\s*\n([\s\S]*?)\n---\s*\n?/;

function unquote(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).replace(/\\"/g, '"');
  }
  return trimmed;
}

export function parseFrontmatter(raw: string): ParsedDoc {
  const match = raw.match(FRONTMATTER_RE);
  if (!match) {
    return { meta: {}, body: raw };
  }

  const meta: PostMeta = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = unquote(line.slice(idx + 1));
    if (!key) continue;
    if (key === 'tags') {
      meta.tags = value
        .replace(/^\[|\]$/g, '')
        .split(',')
        .map((t) => unquote(t))
        .filter(Boolean);
    } else {
      (meta as Record<string, string>)[key] = value;
    }
  }

  return { meta, body: raw.slice(match[0].length) };
}

/** Strip a frontmatter block, returning just the markdown body. */
export function stripFrontmatter(raw: string): string {
  return parseFrontmatter(raw).body;
}

/** Estimated reading time, e.g. "4 min read", from a markdown body. */
export function readingTime(body: string): string {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

/** A readable date like "June 17, 2026" from an ISO date string. */
export function formatDate(date?: string): string {
  if (!date) return '';
  const d = new Date(date.length === 10 ? `${date}T00:00:00` : date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Turn a file path under /files into a reader permalink.
 * e.g. "/files/blog/foo.md" -> "/read/blog/foo"
 */
export function readerPath(filePath: string): string {
  const rel = filePath.replace(/^\/files\//, '').replace(/\.(md|markdown)$/i, '');
  return `/read/${rel.split('/').map(encodeURIComponent).join('/')}`;
}
