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
        // Aggressive code splitting for better performance
        manualChunks: (id) => {
          // React ecosystem - keep together but smaller
          if (id.includes('react') && !id.includes('recharts')) {
            return 'vendor-react';
          }
          
          // Charts - keep recharts together to prevent module loading issues
          if (id.includes('recharts')) {
            return 'vendor-recharts'; // Single chunk for all recharts to fix PureComponent error
          }
          
          // UI libraries
          if (id.includes('lucide-react')) return 'vendor-icons';
          if (id.includes('zustand')) return 'vendor-state';
          if (id.includes('clsx') || id.includes('tailwind-merge')) return 'vendor-utils';
          
          // Split large pages into separate chunks
          if (id.includes('/pages/') && !id.includes('node_modules')) {
            const match = id.match(/pages\/([^\/]+)/);
            if (match) return `page-${match[1]}`;
          }
          
          // Split components by category
          if (id.includes('/components/') && !id.includes('node_modules')) {
            if (id.includes('dashboard')) return 'components-dashboard';
            if (id.includes('charts')) return 'components-charts';
            if (id.includes('ui')) return 'components-ui';
            if (id.includes('layout')) return 'components-layout';
            return 'components-misc';
          }
          
          // Large node_modules
          if (id.includes('node_modules')) {
            if (id.includes('react-router')) return 'vendor-router';
            if (id.includes('react-hot-toast')) return 'vendor-toast';
            
            // Group smaller utilities together
            return 'vendor-misc';
          }
          
          return undefined;
        },
        // Optimize chunk and asset names
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        // Improve chunking performance
        experimentalMinChunkSize: 50000, // 50kb minimum chunk size
      }
    },
    target: 'es2020',
    minify: 'esbuild',
    chunkSizeWarningLimit: 300, // Even stricter limit
    reportCompressedSize: false,
    cssCodeSplit: true,
    // CSS optimization
    cssMinify: 'esbuild',
    // Advanced optimizations
    commonjsOptions: {
      esmExternals: true,
      include: [/node_modules/],
      transformMixedEsModules: true
    },
    modulePreload: {
      polyfill: false
    },
    // Tree shaking optimization
    treeshake: {
      preset: 'recommended',
      moduleSideEffects: false
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