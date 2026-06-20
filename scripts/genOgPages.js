// After `vite build`, generate a static HTML stub per blog post at
// dist/read/blog/<slug>/index.html with post-specific Open Graph / Twitter
// meta tags. Crawlers (Twitter, LinkedIn, Slack, iMessage) read these so a
// shared post link unfurls with its own title + subtitle; real browsers still
// boot the SPA, which routes to the reader as usual.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE = 'https://andrewlidong.xyz';
const BLOG_DIR = path.join(__dirname, '../public/files/blog');
const DIST = path.join(__dirname, '../dist');
const TEMPLATE = path.join(DIST, 'index.html');

function parseFrontmatter(raw) {
  const match = raw.match(/^﻿?---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!match) return {};
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
  return meta;
}

function esc(s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Swap the content="" of a specific meta tag (matched by property/name + value).
function setMeta(html, attr, key, content) {
  const re = new RegExp(
    `(<meta\\s+${attr}="${key}"\\s+content=")[^"]*(")`,
    'i'
  );
  return html.replace(re, `$1${esc(content)}$2`);
}

function main() {
  if (!fs.existsSync(TEMPLATE)) {
    console.warn('dist/index.html not found; run after `vite build`. Skipping.');
    return;
  }
  if (!fs.existsSync(BLOG_DIR)) return;

  const template = fs.readFileSync(TEMPLATE, 'utf8');
  let count = 0;

  for (const file of fs.readdirSync(BLOG_DIR)) {
    if (!/\.(md|markdown)$/i.test(file)) continue;
    const meta = parseFrontmatter(
      fs.readFileSync(path.join(BLOG_DIR, file), 'utf8')
    );
    const slug = meta.slug || file.replace(/\.(md|markdown)$/i, '');
    const title = meta.title || slug;
    const desc = meta.subtitle || `A post by Andrew Dong`;
    const url = `${SITE}/read/blog/${slug}`;

    let html = template;
    html = html.replace(
      /<title>[^<]*<\/title>/i,
      `<title>${esc(title)} — Andrew Dong</title>`
    );
    html = setMeta(html, 'name', 'description', desc);
    html = setMeta(html, 'property', 'og:type', 'article');
    html = setMeta(html, 'property', 'og:title', title);
    html = setMeta(html, 'property', 'og:description', desc);
    html = setMeta(html, 'property', 'og:url', url);
    html = setMeta(html, 'property', 'og:image:alt', title);
    html = setMeta(html, 'name', 'twitter:title', title);
    html = setMeta(html, 'name', 'twitter:description', desc);
    html = html.replace(
      /<link rel="canonical" href="[^"]*" \/>/i,
      `<link rel="canonical" href="${url}" />`
    );

    const outDir = path.join(DIST, 'read', 'blog', slug);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), html);
    count += 1;
  }

  console.log(`✅ generated ${count} per-post share-card pages`);
}

main();
