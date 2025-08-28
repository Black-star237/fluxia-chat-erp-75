import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: './',
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    // Désactivé temporairement pour résoudre le problème d'injection des scripts
    // VitePWA({...})
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'src/main.tsx'),
        index: path.resolve(__dirname, 'index.html'),
      },
      output: {
        manualChunks: {
          // Separate heavy markdown dependencies
          'markdown-vendor': ['react-markdown', 'remark-gfm', 'react-syntax-highlighter'],
          // Separate UI components
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-scroll-area'],
          // Keep React separately
          'react-vendor': ['react', 'react-dom']
        },
        // Disable hash in main file name for stable reference
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    chunkSizeWarningLimit: 1000 // Increase warning limit to 1MB
  }
}));
