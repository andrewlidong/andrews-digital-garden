// Generate public/sitemap.xml from the markdown files in public/files/,
// mirroring the reader routes. Runs as part of `npm run build` (see
// package.json), alongside generateRss.js.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILES_DIR = path.join(__dirname, '../public/files');
const OUT_PATH = path.join(__dirname, '../public/sitemap.xml');
const ORIGIN = 'https://andrewlidong.xyz';

function frontmatterDate(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const m = raw.match(/^﻿?---\s*\n([\s\S]*?)\n---/);
  const line = m && m[1].split('\n').find((l) => l.trim().startsWith('date:'));
  if (!line) return '';
  return line.slice(line.indexOf(':') + 1).trim().replace(/^["']|["']$/g, '');
}

function walk(dir, rel = '') {
  const urls = [];
  for (const name of fs.readdirSync(dir)) {
    if (name.startsWith('.')) continue;
    // Secrets don't go in sitemaps.
    if (name === 'secret-garden.md') continue;
    const abs = path.join(dir, name);
    const relPath = rel ? `${rel}/${name}` : name;
    if (fs.statSync(abs).isDirectory()) {
      urls.push(...walk(abs, relPath));
    } else if (/\.(md|markdown)$/i.test(name)) {
      const readerPath = `/read/${relPath.replace(/\.(md|markdown)$/i, '')}`
        .split('/')
        .map((p) => encodeURIComponent(p))
        .join('/')
        .replace(/^%2F/, '/')
        .replace(/%2F/g, '/');
      urls.push({ loc: `${ORIGIN}${readerPath}`, lastmod: frontmatterDate(abs) });
    }
  }
  return urls;
}

const entries = [
  { loc: `${ORIGIN}/`, lastmod: '' },
  { loc: `${ORIGIN}/blog`, lastmod: '' },
  ...walk(FILES_DIR),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (e) =>
      `  <url><loc>${e.loc}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ''}</url>`
  )
  .join('\n')}
</urlset>
`;

fs.writeFileSync(OUT_PATH, xml);
console.log(`✅ sitemap.xml: ${entries.length} urls`);
