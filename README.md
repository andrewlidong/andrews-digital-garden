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
   ---

   Your markdown body goes here…
   ```

   Only `title` and `date` are required. Posts in a folder are sorted
   newest-first by `date`. Put images in `public/blog-images/` and reference
   them as `/blog-images/your-image.png`.

2. Commit. The pre-commit hook regenerates `src/content/filesystem.json` so the
   post appears in the file tree. (Or run `npm run watch-filesystem` while you
   write to keep it live.)

### Reading a post

- Click a file to open it in a draggable window, then click the green **⤢**
  button to expand it full screen.
- Each post has a permalink: `/read/blog/my-post-slug`.
- In the on-site terminal, `vim <file>` (or `nvim`) opens a post full screen;
  `cat <file>` opens it in a window.

### Importing from Substack

`scripts/importSubstack.js` pulls posts from the Substack RSS feed, converts
them to markdown with frontmatter, and downloads inline images:

```bash
# Fetch the live feed
node scripts/importSubstack.js

# …or convert a saved feed file
node scripts/importSubstack.js path/to/feed.xml
```

Re-running overwrites the imported posts but leaves hand-written files alone.
Note: Substack's RSS only exposes recent posts — for a full archive, use
Substack's official export (Settings → Exports) and point the script at it.

## License

MIT
