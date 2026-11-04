// Full-text search over post bodies. The index is generated at build time
// (scripts/generateSearchIndex.js) and fetched lazily the first time anyone
// greps, then kept for the life of the page.

export type SearchDoc = {
  path: string;
  title: string;
  lines: string[];
};

export type SearchHit = {
  path: string;
  title: string;
  /** 1-based line number within the (frontmatter-stripped, blank-free) body. */
  line: number;
  text: string;
};

export type GrepOptions = {
  ignoreCase?: boolean;
  maxHits?: number;
};

let indexPromise: Promise<SearchDoc[]> | null = null;

export function loadSearchIndex(): Promise<SearchDoc[]> {
  if (!indexPromise) {
    indexPromise = fetch('/search-index.json')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<SearchDoc[]>;
      })
      .catch((err) => {
        // Let a later call retry instead of caching the failure.
        indexPromise = null;
        throw err;
      });
  }
  return indexPromise;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Build the matcher for a pattern. Plain words are matched literally; a
 * pattern is only treated as a regex when it contains metacharacters other
 * than `.` and compiles — so `e.g.` stays literal while `foo|bar` or `^#`
 * behave like grep.
 */
export function compilePattern(pattern: string, ignoreCase = false): RegExp {
  const flags = ignoreCase ? 'gi' : 'g';
  const looksLikeRegex = /[|^$[\]()\\+*?{}]/.test(pattern);
  if (looksLikeRegex) {
    try {
      return new RegExp(pattern, flags);
    } catch {
      /* fall through to literal */
    }
  }
  return new RegExp(escapeRegExp(pattern), flags);
}

export async function grep(
  pattern: string,
  { ignoreCase = false, maxHits = Infinity }: GrepOptions = {}
): Promise<SearchHit[]> {
  const term = pattern.trim();
  if (!term) return [];
  const docs = await loadSearchIndex();
  const re = compilePattern(term, ignoreCase);
  const hits: SearchHit[] = [];
  for (const doc of docs) {
    for (let i = 0; i < doc.lines.length; i++) {
      re.lastIndex = 0;
      if (re.test(doc.lines[i])) {
        hits.push({ path: doc.path, title: doc.title, line: i + 1, text: doc.lines[i] });
        if (hits.length >= maxHits) return hits;
      }
    }
  }
  return hits;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** HTML-escape `text` and wrap every match of `re` in <mark>. */
export function highlightMatches(text: string, re: RegExp): string {
  re.lastIndex = 0;
  let out = '';
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m[0] === '') {
      re.lastIndex++;
      continue;
    }
    out += escapeHtml(text.slice(last, m.index));
    out += `<mark>${escapeHtml(m[0])}</mark>`;
    last = m.index + m[0].length;
  }
  return out + escapeHtml(text.slice(last));
}
