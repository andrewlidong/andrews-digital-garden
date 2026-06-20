# Andrew's Digital Garden

My personal website featuring a terminal-inspired interface. Visit at [andrewlidong.xyz](https://andrewlidong.xyz).

## Stack

- React + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Deployment

The site automatically deploys to GitHub Pages when changes are pushed to the main branch.

## Blogging

Posts live as markdown files under `public/files/`. The `blog/` folder holds
long-form writing; `notes/` and `projects/` work the same way. Each file shows
up as a clickable file in the desktop UI and can be opened full screen.

### Writing a new post

1. Create `public/files/blog/my-post-slug.md` with frontmatter:

   ```markdown
   ---
   title: "My Post Title"
   date: "2026-06-20"
   subtitle: "An optional one-line dek"
   tags: [zig, cli]
   ---

   Your markdown body goes here…
   ```

   Only `title` and `date` are required. `subtitle` and `tags` are optional.
   Posts are sorted newest-first by `date`. Put images in `public/blog-images/`
   and reference them as `/blog-images/your-image.png`. Fenced code blocks get
   syntax highlighting — tag them with a language (` ```zig `).

2. Commit. The pre-commit hook regenerates `src/content/filesystem.json` so the
   post appears in the file tree. (Or run `npm run watch-filesystem` while you
   write to keep it live.)

### Reading a post

- Browse to `/blog` for a chronological index of all posts.
- Click a file to open it in a draggable window, then click the green **⤢**
  button to expand it full screen.
- Each post has a permalink: `/read/blog/my-post-slug`, with reading time and
  previous/next navigation.
- In the on-site terminal, `vim <file>` (or `nvim`) opens a post full screen;
  `cat <file>` opens it in a window.

### Feeds and sharing

- **RSS:** `scripts/generateRss.js` writes `public/rss.xml` from the blog
  frontmatter at build time (subscribe at `/rss.xml`).
- **Share cards:** `scripts/genOgPages.js` runs after `vite build` and emits a
  static `dist/read/blog/<slug>/index.html` per post with Open Graph / Twitter
  meta tags, so shared post links unfurl with their own title and subtitle.

Both run automatically as part of `npm run build`.

### Importing posts (one-off migration)

`scripts/importSubstack.js` converts an RSS feed of existing posts into the
markdown + frontmatter format above and downloads inline images:

```bash
node scripts/importSubstack.js path/to/feed.xml
```

Re-running overwrites the imported posts but leaves hand-written files alone.

## License

MIT
