// Import posts from a Substack RSS feed into public/files/blog/ as markdown
// with YAML frontmatter. Downloads inline images locally.
//
// Usage:
//   node scripts/importSubstack.js                       # fetch live feed
//   node scripts/importSubstack.js .context/substack-raw/feed.xml   # use a local feed file
//
// Re-running is safe: existing posts are overwritten, so you can re-import
// after editing on Substack. Files you create by hand (not from the feed)
// are left untouched.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import TurndownService from 'turndown';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FEED_URL = 'https://andrewdong.substack.com/feed';
const BLOG_DIR = path.join(__dirname, '../public/files/blog');
// Images live outside public/files so they don't show up as entries in the
// desktop filesystem UI. They're referenced from posts as /blog-images/...
const IMAGES_DIR = path.join(__dirname, '../public/blog-images');

// ---------------------------------------------------------------------------
// Minimal RSS parsing
// ---------------------------------------------------------------------------

function unwrapCdata(value) {
  return value
    .replace(/^\s*<!\[CDATA\[/, '')
    .replace(/\]\]>\s*$/, '')
    .trim();
}

function tag(item, name) {
  const re = new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`);
  const m = item.match(re);
  return m ? unwrapCdata(m[1]) : '';
}

function parseFeed(xml) {
  return xml
    .split('<item>')
    .slice(1)
    .map((chunk) => chunk.split('</item>')[0])
    .map((item) => ({
      title: decodeEntities(tag(item, 'title')),
      link: tag(item, 'link'),
      pubDate: tag(item, 'pubDate'),
      subtitle: decodeEntities(tag(item, 'description')),
      html: tag(item, 'content:encoded'),
    }))
    .filter((p) => p.title && p.html);
}

function decodeEntities(s) {
  return s
    .replace(/&#8217;/g, '’')
    .replace(/&#8216;/g, '‘')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .replace(/&#8212;/g, '—')
    .replace(/&#8211;/g, '–')
    .replace(/&#8230;/g, '…')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function slugFromLink(link, title) {
  const fromLink = (link.split('/p/')[1] || '').split(/[?#]/)[0];
  const base = fromLink || title;
  return base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function isoDate(pubDate) {
  const d = new Date(pubDate);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// HTML -> Markdown
// ---------------------------------------------------------------------------

function makeTurndown() {
  const td = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
    emDelimiter: '*',
  });

  // Fenced code blocks that preserve the language from `class="language-xxx"`.
  td.addRule('fencedCodeWithLang', {
    filter: (node) =>
      node.nodeName === 'PRE' &&
      node.firstChild &&
      node.firstChild.nodeName === 'CODE',
    replacement: (_content, node) => {
      const code = node.firstChild;
      const className = code.getAttribute('class') || '';
      const match = className.match(/language-([a-z0-9+#]+)/i);
      let lang = match ? match[1] : '';
      if (lang === 'plaintext' || lang === 'text') lang = '';
      const text = code.textContent.replace(/\n$/, '');
      return `\n\n\`\`\`${lang}\n${text}\n\`\`\`\n\n`;
    },
  });

  // Substack wraps images in <figure><picture>...<img></picture><figcaption>...
  // Flatten to a markdown image plus an optional italic caption.
  td.addRule('figure', {
    filter: 'figure',
    replacement: (_content, node) => {
      const img = node.querySelector('img');
      const caption = node.querySelector('figcaption');
      if (!img) return '';
      const src = img.getAttribute('src') || '';
      const alt = (img.getAttribute('alt') || '').replace(/\n/g, ' ');
      let out = `\n\n![${alt}](${src})\n`;
      if (caption && caption.textContent.trim()) {
        out += `\n*${caption.textContent.trim()}*\n`;
      }
      return out + '\n';
    },
  });

  // Drop Substack subscribe widgets / forms.
  td.remove(['form', 'input']);

  return td;
}

// ---------------------------------------------------------------------------
// Image download
// ---------------------------------------------------------------------------

function extFor(url) {
  // Substack CDN urls embed the original url (with its extension) at the end.
  const decoded = decodeURIComponent(url);
  const m = decoded.match(/\.(png|jpe?g|gif|webp|svg)(?:[?#]|$)/i);
  return m ? `.${m[1].toLowerCase().replace('jpeg', 'jpg')}` : '.png';
}

async function downloadImages(markdown, slug) {
  const imageRe = /!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g;
  const tasks = [];
  let index = 0;
  const result = markdown.replace(imageRe, (whole, alt, url) => {
    index += 1;
    const filename = `${slug}-${index}${extFor(url)}`;
    tasks.push({ url, filename });
    return `![${alt}](/blog-images/${filename})`;
  });

  for (const { url, filename } of tasks) {
    const dest = path.join(IMAGES_DIR, filename);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      fs.mkdirSync(IMAGES_DIR, { recursive: true });
      fs.writeFileSync(dest, buf);
      console.log(`   ↓ ${filename}`);
    } catch (err) {
      console.warn(`   ⚠ could not download ${url}: ${err.message}`);
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Frontmatter + write
// ---------------------------------------------------------------------------

function yamlEscape(s) {
  return String(s).replace(/"/g, '\\"');
}

function frontmatter(post) {
  const lines = [
    '---',
    `title: "${yamlEscape(post.title)}"`,
    `date: "${post.date}"`,
  ];
  if (post.subtitle) lines.push(`subtitle: "${yamlEscape(post.subtitle)}"`);
  lines.push(`slug: "${post.slug}"`);
  lines.push(`source: "${post.link}"`);
  lines.push('---');
  return lines.join('\n');
}

async function main() {
  const localPath = process.argv[2];
  let xml;
  if (localPath) {
    xml = fs.readFileSync(path.resolve(localPath), 'utf8');
    console.log(`Reading feed from ${localPath}`);
  } else {
    console.log(`Fetching ${FEED_URL}`);
    const res = await fetch(FEED_URL);
    if (!res.ok) throw new Error(`Failed to fetch feed: HTTP ${res.status}`);
    xml = await res.text();
  }

  const posts = parseFeed(xml);
  console.log(`Found ${posts.length} posts\n`);

  fs.mkdirSync(BLOG_DIR, { recursive: true });
  const td = makeTurndown();

  for (const raw of posts) {
    const slug = slugFromLink(raw.link, raw.title);
    const date = isoDate(raw.pubDate);
    let body = td.turndown(raw.html);
    body = await downloadImages(body, slug);
    body = body.replace(/\n{3,}/g, '\n\n').trim();

    const post = { ...raw, slug, date };
    const file = path.join(BLOG_DIR, `${slug}.md`);
    fs.writeFileSync(file, `${frontmatter(post)}\n\n${body}\n`);
    console.log(`✓ ${slug}.md  (${date})`);
  }

  console.log(`\nDone. Wrote ${posts.length} posts to public/files/blog/`);
  console.log('Run `npm run watch-filesystem` or commit to refresh filesystem.json.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
