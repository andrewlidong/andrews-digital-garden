import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { plugin as markdownPlugin, Mode } from "vite-plugin-markdown";

// https://vitejs.dev/config/
export default defineConfig({
  base: '',
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
        entryFileNames: 'assets/[name].[hash].mjs',
        chunkFileNames: 'assets/[name].[hash].mjs',
        assetFileNames: ({ name }) => {
          if (name && (name.endsWith('favicon.ico') || name.endsWith('favicon.svg'))) {
            return '[name][extname]';
          }
          return 'assets/[name].[hash][extname]';
        }
      }
    }
  }
});
