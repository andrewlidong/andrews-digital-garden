// Generate public/rss.xml from the blog posts in public/files/blog/.
// Run at build time (see package.json "build"). Readers can subscribe at
// https://andrewlidong.xyz/rss.xml

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE = 'https://andrewlidong.xyz';
const BLOG_DIR = path.join(__dirname, '../public/files/blog');
const OUT = path.join(__dirname, '../public/rss.xml');

function parseFrontmatter(raw) {
  const match = raw.match(/^﻿?---\s*\n([\s\S]*?)\n---\s*\n?/);
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

function esc(s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function main() {
  if (!fs.existsSync(BLOG_DIR)) {
    console.warn('No blog directory; skipping RSS.');
    return;
  }

  const posts = fs
    .readdirSync(BLOG_DIR)
    .filter((f) => /\.(md|markdown)$/i.test(f))
    .map((file) => {
      const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8');
      const { meta, body } = parseFrontmatter(raw);
      const slug = meta.slug || file.replace(/\.(md|markdown)$/i, '');
      return {
        title: meta.title || slug,
        subtitle: meta.subtitle || '',
        date: meta.date || '',
        slug,
        link: `${SITE}/read/blog/${slug}`,
        html: marked.parse(body),
      };
    })
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const items = posts
    .map(
      (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${esc(p.link)}</link>
      <guid isPermaLink="true">${esc(p.link)}</guid>
      ${p.date ? `<pubDate>${new Date(`${p.date}T12:00:00Z`).toUTCString()}</pubDate>` : ''}
      ${p.subtitle ? `<description>${esc(p.subtitle)}</description>` : ''}
      <content:encoded><![CDATA[${p.html}]]></content:encoded>
    </item>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Andrew Dong</title>
    <link>${SITE}/blog</link>
    <atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml" />
    <description>Writing on software, languages, and creative coding.</description>
    <language>en-us</language>
${items}
  </channel>
</rss>
`;

  fs.writeFileSync(OUT, xml);
  console.log(`✅ rss.xml written with ${posts.length} posts`);
}

main();
