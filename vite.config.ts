import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { plugin as markdownPlugin, Mode } from "vite-plugin-markdown";

// https://vitejs.dev/config/
export default defineConfig({
  base: '',  // Empty string for GitHub Pages
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
          if (name && (name.endsWith('favicon.ico') || name.endsWith('favicon.svg') || 
              name.endsWith('.png') || name.endsWith('.webmanifest'))) {
            return '[name][extname]';
          }
          return 'assets/[name].[hash][extname]';
        }
      }
    }
  }
});
