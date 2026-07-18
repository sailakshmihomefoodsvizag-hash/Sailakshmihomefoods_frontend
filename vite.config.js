import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { compression } from 'vite-plugin-compression2'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Gzip compression for production
    compression({
      algorithm: 'gzip',
      exclude: [/\.(br)$/, /\.(gz)$/],
    }),
    // Brotli compression for production (better than gzip)
    compression({
      algorithm: 'brotliCompress',
      exclude: [/\.(br)$/, /\.(gz)$/],
    }),
  ],
  
  build: {
    // Code splitting & optimization
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI components
          'ui-vendor': ['lucide-react'],
          // ✅ REMOVED: Firebase from manualChunks - Vite handles it automatically
        },
        // Asset file naming for cache busting
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp|avif/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          } else if (/woff|woff2|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
    
    // Chunk size warnings
    chunkSizeWarningLimit: 600,
    
    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
    
    // Source maps for debugging (optional - set to false for faster builds)
    sourcemap: false,
    
    // CSS code splitting
    cssCodeSplit: true,
    
    // Asset inlining threshold (images < 4kb will be inlined as base64)
    assetsInlineLimit: 4096,
  },
  
  // Server configuration
  server: {
    port: 3000,
    open: true,
    // Fix Cross-Origin-Opener-Policy warning from Firebase Auth popup.
    // 'same-origin-allow-popups' lets Firebase close the OAuth popup window
    // without being blocked by the browser's COOP policy.
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
    },
  },
  
  // Preview configuration
  preview: {
    port: 3000,
  },
  
  // ✅ UPDATED: Optimizations for dependencies - include Firebase modules
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react',
      'firebase/app',
      'firebase/auth',
    ],
  },
})
