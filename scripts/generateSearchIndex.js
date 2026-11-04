// Generate public/search-index.json: every markdown body under public/files/
// as trimmed lines, so the terminal `grep` and the palette's full-text
// fallback can search post contents without fetching each file.
// Run at build time and from the pre-commit hook (see package.json).

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_FILES_DIR = path.join(__dirname, '../public/files');
const OUT = path.join(__dirname, '../public/search-index.json');
const MAX_LINE = 300;

function parseFrontmatter(raw) {
  const match = raw.match(/^\uFEFF?---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!match) return { meta: {}, body: raw };
  const meta = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (value) meta[key] = value;
  }
  return { meta, body: raw.slice(match[0].length) };
}

function walk(dir, out = []) {
  for (const item of fs.readdirSync(dir)) {
    if (item.startsWith('.')) continue;
    // Mirrors updateFilesystem.js: the secret garden isn't listed anywhere.
    if (item === 'secret-garden.md') continue;
    const abs = path.join(dir, item);
    if (fs.statSync(abs).isDirectory()) walk(abs, out);
    else if (/\.(md|markdown)$/i.test(item)) out.push(abs);
  }
  return out;
}

export function buildSearchIndex() {
  if (!fs.existsSync(PUBLIC_FILES_DIR)) return [];
  return walk(PUBLIC_FILES_DIR).map((abs) => {
    const raw = fs.readFileSync(abs, 'utf8');
    const { meta, body } = parseFrontmatter(raw);
    const rel = path.relative(PUBLIC_FILES_DIR, abs).replace(/\\/g, '/');
    const lines = body
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => (l.length > MAX_LINE ? `${l.slice(0, MAX_LINE)}…` : l));
    return {
      path: `/files/${rel}`,
      title: meta.title || path.basename(rel).replace(/\.(md|markdown)$/i, ''),
      lines,
    };
  });
}

export function writeSearchIndex() {
  const index = buildSearchIndex();
  fs.writeFileSync(OUT, JSON.stringify(index));
  console.log(`✅ search-index.json written with ${index.length} files`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  writeSearchIndex();
}
