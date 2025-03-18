import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { plugin as markdownPlugin, Mode } from "vite-plugin-markdown";

// https://vitejs.dev/config/
export default defineConfig({
  base: './',  // Use relative paths
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
    rollupOptions: {
      output: {
        format: 'es',
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: ({ name }) => {
          if (!name) return 'assets/[name].[hash][extname]';
          
          // Keep these files in the root directory
          if (name.endsWith('favicon.ico') || 
              name.endsWith('favicon.svg') || 
              name.endsWith('favicon-16x16.png') ||
              name.endsWith('favicon-32x32.png') ||
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
