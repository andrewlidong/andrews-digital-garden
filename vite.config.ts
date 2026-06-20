import path from "path";
import { execSync } from "child_process";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { plugin as markdownPlugin, Mode } from "vite-plugin-markdown";

// Build-time git metadata, surfaced in the footer metadata bar.
function gitInfo() {
  try {
    const commit = execSync("git rev-parse --short HEAD").toString().trim();
    const commitFull = execSync("git rev-parse HEAD").toString().trim();
    const lastUpdated = execSync('git log -1 --format=%cd "--date=format:%b %Y"')
      .toString()
      .trim();
    // Derive an https repo URL from the origin remote (handles SSH + .git suffix).
    let repoUrl = "";
    try {
      repoUrl = execSync("git remote get-url origin")
        .toString()
        .trim()
        .replace(/^git@github\.com:/, "https://github.com/")
        .replace(/\.git$/, "");
    } catch {
      repoUrl = "";
    }
    return { commit, commitFull, lastUpdated, repoUrl };
  } catch {
    return { commit: "unknown", commitFull: "", lastUpdated: "unknown", repoUrl: "" };
  }
}

const { commit, commitFull, lastUpdated, repoUrl } = gitInfo();

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',  // Use absolute paths for production
  define: {
    __COMMIT_HASH__: JSON.stringify(commit),
    __COMMIT_FULL__: JSON.stringify(commitFull),
    __LAST_UPDATED__: JSON.stringify(lastUpdated),
    __REPO_URL__: JSON.stringify(repoUrl),
  },
  plugins: [
    react(),
    markdownPlugin({
      mode: [Mode.MARKDOWN],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: ({ name }) => {
          if (!name) return 'assets/[name].[hash][extname]';
          
          // Keep these files in the root directory
          if (name.endsWith('favicon.ico') || 
              name.endsWith('favicon.svg') || 
              name.endsWith('favicon-32x32.png') ||
              name.endsWith('favicon-16x16.png') ||
              name.endsWith('apple-touch-icon.png') ||
              name.endsWith('site.webmanifest') ||
              name.endsWith('CNAME') ||
              name.endsWith('404.html')) {
            return '[name][extname]';
          }
          
          return 'assets/[name].[hash][extname]';
        }
      }
    }
  }
});
