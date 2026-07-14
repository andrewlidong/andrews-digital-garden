// Wikilink support for the digital garden: `[[Some Page]]` or
// `[[Some Page|shown text]]` in any markdown file links to another file in
// public/files/, matched by frontmatter title or filename (extension and
// -/_ separators optional, case-insensitive).
//
// The remark plugin here handles rendering; scripts/updateFilesystem.js
// mirrors the same resolution at commit time to record each file's outgoing
// `links` in filesystem.json, which is what makes backlinks computable
// without fetching every file.

import fileSystemData from '@/content/filesystem.json';
import { readerPath } from '@/lib/frontmatter';

type FsNode = {
  name: string;
  type: 'file' | 'folder';
  path?: string;
  title?: string;
  links?: string[];
  children?: FsNode[];
};

// Loose mdast typings — enough for the small tree surgery we do, without
// pulling in @types packages for it.
type MdNode = {
  type: string;
  value?: string;
  url?: string;
  children?: MdNode[];
  data?: { hProperties?: Record<string, string> };
};

export interface Backlink {
  path: string;
  to: string;
  title: string;
  section: string;
}

export const WIKILINK_RE = /\[\[([^[\]|]+)(?:\|([^[\]]+))?\]\]/g;

function isMarkdown(name: string): boolean {
  return /\.(md|markdown)$/i.test(name);
}

function baseName(name: string): string {
  return name.replace(/\.(md|markdown)$/i, '');
}

function walkFs(
  nodes: FsNode[],
  visit: (node: FsNode, section: string) => void,
  section = ''
): void {
  for (const node of nodes) {
    if (node.type === 'file') {
      visit(node, section);
    } else if (node.children) {
      walkFs(node.children, visit, node.name);
    }
  }
}

// Lazily built lookup from normalized link target -> file path.
let targetIndex: Map<string, string> | null = null;

function buildIndex(): Map<string, string> {
  const index = new Map<string, string>();
  const add = (key: string | undefined, path: string) => {
    const k = (key || '').trim().toLowerCase();
    if (k && !index.has(k)) index.set(k, path);
  };
  walkFs(fileSystemData as FsNode[], (node) => {
    if (!node.path || !isMarkdown(node.name)) return;
    const base = baseName(node.name);
    add(node.title, node.path);
    add(base, node.path);
    add(base.replace(/[-_]+/g, ' '), node.path);
  });
  return index;
}

/** Resolve a wikilink target to a /files/... path, or null if unknown. */
export function resolveWikilink(target: string): string | null {
  if (!targetIndex) targetIndex = buildIndex();
  const key = target.trim().toLowerCase();
  return targetIndex.get(key) || targetIndex.get(key.replace(/[-_]+/g, ' ')) || null;
}

/** All files whose wikilinks point at the given /files/... path. */
export function getBacklinks(filePath: string): Backlink[] {
  const found: Backlink[] = [];
  walkFs(fileSystemData as FsNode[], (node, section) => {
    if (node.path && node.path !== filePath && node.links?.includes(filePath)) {
      found.push({
        path: node.path,
        to: readerPath(node.path),
        title: node.title || baseName(node.name).replace(/[-_]+/g, ' '),
        section,
      });
    }
  });
  return found;
}

// Split one mdast text node into text + link nodes. Returns null when the
// node contains no resolvable wikilink, so the tree is left untouched.
function splitTextNode(value: string): MdNode[] | null {
  WIKILINK_RE.lastIndex = 0;
  const out: MdNode[] = [];
  let last = 0;
  let resolvedAny = false;
  let m: RegExpExecArray | null;
  while ((m = WIKILINK_RE.exec(value))) {
    const target = m[1].trim();
    const label = (m[2] || m[1]).trim();
    const path = resolveWikilink(target);
    if (m.index > last) out.push({ type: 'text', value: value.slice(last, m.index) });
    if (path) {
      resolvedAny = true;
      out.push({
        type: 'link',
        url: readerPath(path),
        data: { hProperties: { className: 'wikilink' } },
        children: [{ type: 'text', value: label }],
      });
    } else {
      // Unresolved links stay as visible [[stubs]] — a page not yet planted.
      out.push({ type: 'text', value: m[0] });
    }
    last = m.index + m[0].length;
  }
  if (!resolvedAny) return null;
  if (last < value.length) out.push({ type: 'text', value: value.slice(last) });
  return out;
}

function transform(node: MdNode): void {
  if (!node.children || node.type === 'link') return;
  let changed = false;
  const next: MdNode[] = [];
  for (const child of node.children) {
    if (child.type === 'text' && child.value && child.value.includes('[[')) {
      const parts = splitTextNode(child.value);
      if (parts) {
        next.push(...parts);
        changed = true;
        continue;
      }
    }
    transform(child);
    next.push(child);
  }
  if (changed) node.children = next;
}

/** Remark plugin: turn [[wikilinks]] into reader links. */
export function remarkWikilinks() {
  return (tree: MdNode) => {
    transform(tree);
  };
}
