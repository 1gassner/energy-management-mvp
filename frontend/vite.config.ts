import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/stores': path.resolve(__dirname, './src/stores'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/utils': path.resolve(__dirname, './src/utils'),
    },
  },
  server: {
    port: 3000,
    host: true,
    strictPort: false,
    hmr: {
      port: 24678,
      host: 'localhost'
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    emptyOutDir: true, // Force clean build
    rollupOptions: {
      output: {
        // Simplified chunking to fix module loading issues
        manualChunks: (id) => {
          // Keep React in main vendor bundle to avoid hook issues
          if (id.includes('node_modules')) {
            // Charts are heavy, keep them separate
            if (id.includes('recharts') || id.includes('d3-') || id.includes('victory')) {
              return 'charts';
            }
            // All other vendor code in one bundle
            return 'vendor';
          }
          // Split by feature
          if (id.includes('src/pages/buildings')) {
            return 'buildings';
          }
          if (id.includes('src/pages/analytics')) {
            return 'analytics';
          }
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name!.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/img/[name]-[hash].[ext]`;
          }
          if (ext === 'css') {
            return `assets/css/[name]-[hash].[ext]`;
          }
          return `assets/[ext]/[name]-[hash].[ext]`;
        }
      }
    },
    target: 'es2020',
    minify: 'esbuild',
    chunkSizeWarningLimit: 2000, // Increased for single bundle
    reportCompressedSize: false,
    cssCodeSplit: false, // Single CSS file to avoid loading issues
    // CSS optimization
    cssMinify: 'esbuild',
    // Simplified optimizations to avoid module issues
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    },
    modulePreload: {
      polyfill: true // Enable polyfill for better compatibility
    }
  },
  optimizeDeps: {
    // Pre-bundle critical dependencies INCLUDING recharts to fix PureComponent error
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'react-router-dom',
      'recharts',  // MUST be included to prevent module loading issues
      'zustand',
      'clsx',
      'tailwind-merge',
      'react-hot-toast',
      'lucide-react'
    ],
    // Don't exclude anything critical
    exclude: [],
    // Enable aggressive optimization
    esbuildOptions: {
      target: 'es2020',
      supported: {
        'top-level-await': true,
        'import-meta': true
      },
      // Tree shake more aggressively
      treeShaking: true
    }
  },
  // Enable experimental features for better performance
  esbuild: {
    // Remove console logs in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    // Enable tree shaking
    treeShaking: true
  }
})