import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PUBLIC_FILES_DIR = path.join(__dirname, '../public/files');
const FILESYSTEM_JSON_PATH = path.join(__dirname, '../src/content/filesystem.json');

// Pull `title` and `date` out of a markdown file's YAML frontmatter so the UI
// can show/sort posts without fetching their full contents.
function readFrontmatter(filePath) {
    if (!/\.(md|markdown)$/i.test(filePath)) return {};
    const raw = fs.readFileSync(filePath, 'utf8');
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
        if ((key === 'title' || key === 'date' || key === 'subtitle') && value) {
            meta[key] = value;
        }
        if (key === 'tags' && value) {
            const tags = value
                .replace(/^\[|\]$/g, '')
                .split(',')
                .map((t) => t.trim().replace(/^["']|["']$/g, ''))
                .filter(Boolean);
            if (tags.length) meta.tags = tags;
        }
    }
    return meta;
}

// Function to generate filesystem structure
function generateFilesystemStructure(dir) {
    const stats = fs.statSync(dir);
    const name = path.basename(dir);

    if (stats.isFile()) {
        return {
            id: name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase(),
            name: name,
            type: 'file',
            path: `/files/${path.relative(PUBLIC_FILES_DIR, dir).replace(/\\/g, '/')}`,
            ...readFrontmatter(dir)
        };
    }

    const children = fs.readdirSync(dir)
        .filter(item => !item.startsWith('.')) // Ignore hidden files
        // The secret garden is reachable only through the hidden graph node —
        // keep it out of the sidebar, terminal, graph, and sitemap.
        .filter(item => item !== 'secret-garden.md')
        .map(item => generateFilesystemStructure(path.join(dir, item)));

    // If this is the root files directory, return just the children
    if (dir === PUBLIC_FILES_DIR) {
        return children;
    }

    return {
        id: name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase(),
        name: name,
        type: 'folder',
        children: children
    };
}

// ---------------------------------------------------------------------------
// Wikilinks: [[Some Page]] / [[Some Page|label]] in markdown bodies resolve to
// other files by frontmatter title or filename. Each file node gets a `links`
// array of resolved /files/... paths so the UI can render backlinks without
// fetching every file. Mirrors the resolution in src/lib/wikilinks.ts.
// ---------------------------------------------------------------------------

const WIKILINK_RE = /\[\[([^[\]|]+)(?:\|([^[\]]+))?\]\]/g;

// Site-page targets like [[blog]] resolve to routes, not files; they carry no
// backlinks, so the scan just needs to know they're valid. Mirrors
// PAGE_ALIASES in src/lib/wikilinks.ts.
const PAGE_ALIASES = new Set(['blog', 'writing', 'home', 'desktop']);

function walkFiles(nodes, visit) {
    for (const node of nodes) {
        if (node.type === 'file') visit(node);
        else if (node.children) walkFiles(node.children, visit);
    }
}

function annotateWikilinks(structure) {
    // Pass 1: index every markdown file by title and filename.
    const index = new Map();
    const add = (key, filePath) => {
        const k = (key || '').trim().toLowerCase();
        if (k && !index.has(k)) index.set(k, filePath);
    };
    walkFiles(structure, (node) => {
        if (!/\.(md|markdown)$/i.test(node.name)) return;
        const base = node.name.replace(/\.(md|markdown)$/i, '');
        add(node.title, node.path);
        add(base, node.path);
        add(base.replace(/[-_]+/g, ' '), node.path);
    });

    // Pass 2: scan each file's body (code blocks excluded) for wikilinks.
    walkFiles(structure, (node) => {
        if (!/\.(md|markdown)$/i.test(node.name)) return;
        const abs = path.join(PUBLIC_FILES_DIR, node.path.replace(/^\/files\//, ''));
        const body = fs.readFileSync(abs, 'utf8')
            .replace(/^﻿?---\s*\n[\s\S]*?\n---\s*\n?/, '')
            .replace(/```[\s\S]*?```/g, '')
            .replace(/`[^`\n]*`/g, '');
        const links = new Set();
        let m;
        WIKILINK_RE.lastIndex = 0;
        while ((m = WIKILINK_RE.exec(body))) {
            const key = m[1].trim().toLowerCase();
            if (PAGE_ALIASES.has(key)) continue;
            const resolved = index.get(key) || index.get(key.replace(/[-_]+/g, ' '));
            if (resolved && resolved !== node.path) links.add(resolved);
            else if (!resolved) console.warn(`   ⚠ unresolved wikilink [[${m[1].trim()}]] in ${node.path}`);
        }
        if (links.size) node.links = [...links].sort();
    });
}

// Function to update filesystem.json
function updateFilesystem() {
    try {
        const structure = generateFilesystemStructure(PUBLIC_FILES_DIR);
        annotateWikilinks(structure);
        fs.writeFileSync(
            FILESYSTEM_JSON_PATH,
            JSON.stringify(structure, null, 4)
        );
        console.log('✅ filesystem.json updated successfully');
    } catch (error) {
        console.error('❌ Error updating filesystem.json:', error);
        process.exit(1);
    }
}

// Check if we're running in pre-commit mode
const isPreCommit = process.argv.includes('--pre-commit');

if (isPreCommit) {
    // Just update the filesystem and exit
    updateFilesystem();
    process.exit(0);
} else {
    // Import chokidar only when not in pre-commit mode
    import('chokidar').then(chokidar => {
        // Watch for changes
        const watcher = chokidar.watch(PUBLIC_FILES_DIR, {
            ignored: /(^|[\/\\])\../, // ignore dotfiles
            persistent: true
        });

        console.log('👀 Watching for file changes in', PUBLIC_FILES_DIR);

        watcher
            .on('add', path => {
                console.log(`📄 File ${path} has been added`);
                updateFilesystem();
            })
            .on('unlink', path => {
                console.log(`🗑️ File ${path} has been removed`);
                updateFilesystem();
            })
            .on('addDir', path => {
                console.log(`📁 Directory ${path} has been added`);
                updateFilesystem();
            })
            .on('unlinkDir', path => {
                console.log(`🗑️ Directory ${path} has been removed`);
                updateFilesystem();
            })
            .on('error', error => console.error('❌ Watcher error:', error));

        // Initial update
        updateFilesystem();
    });
}