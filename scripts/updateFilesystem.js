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

// Function to update filesystem.json
function updateFilesystem() {
    try {
        const structure = generateFilesystemStructure(PUBLIC_FILES_DIR);
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