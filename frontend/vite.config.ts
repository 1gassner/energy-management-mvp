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
    rollupOptions: {
      output: {
        // Simplified chunking strategy to avoid dynamic import issues
        manualChunks: {
          // Core vendor chunks - always loaded
          'vendor': [
            'react',
            'react-dom',
            'react-router-dom'
          ],
          // Charts library - separate bundle
          'charts': [
            'recharts'
          ],
          // UI utilities
          'ui': [
            'lucide-react',
            'clsx',
            'tailwind-merge'
          ],
          // State management
          'state': [
            'zustand'
          ]
        },
        // Optimize chunk and asset names
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    target: 'es2020',
    minify: 'esbuild',
    chunkSizeWarningLimit: 500, // Increased for vendor bundles
    reportCompressedSize: false,
    cssCodeSplit: false, // Single CSS file to avoid loading issues
    // CSS optimization
    cssMinify: 'esbuild',
    // Simplified optimizations to avoid module issues
    commonjsOptions: {
      include: [/node_modules/]
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