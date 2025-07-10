import react from "@vitejs/plugin-react";
import "dotenv/config";
import path from "node:path";
import { defineConfig, splitVendorChunkPlugin } from "vite";
import { visualizer } from "rollup-plugin-visualizer";
import { resolve } from "path";

// NEXUS-CORE Optimized Vite Configuration
// Focus: Bundle size optimization, code splitting, performance

export default defineConfig({
  plugins: [
    react({
      // Optimize React refresh for better dev performance
      fastRefresh: true
    }),
    
    // Advanced vendor chunking for better caching
    splitVendorChunkPlugin(),
    
    // Bundle analyzer - generates bundle analysis report
    visualizer({
      filename: 'dist/bundle-analysis.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],

  // Build optimization configuration
  build: {
    // Enable source maps only in development
    sourcemap: process.env.NODE_ENV === 'development',
    
    // Optimize bundle size
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
        pure_funcs: process.env.NODE_ENV === 'production' ? ['console.log', 'console.info'] : [],
      },
    },
    
    // Advanced chunking strategy
    rollupOptions: {
      output: {
        // Manual chunk splitting for optimal caching
        manualChunks: (id) => {
          // Vendor chunks - separate large libraries
          if (id.includes('node_modules')) {
            // React ecosystem
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            
            // UI libraries
            if (id.includes('@radix-ui') || id.includes('shadcn') || id.includes('@headlessui')) {
              return 'ui-vendor';
            }
            
            // Charts and visualization
            if (id.includes('recharts') || id.includes('chart') || id.includes('plotly') || id.includes('@amcharts')) {
              return 'charts-vendor';
            }
            
            // Rich text editors
            if (id.includes('@tiptap') || id.includes('lexical') || id.includes('@blocknote') || id.includes('quill')) {
              return 'editor-vendor';
            }
            
            // Authentication libraries
            if (id.includes('firebase') || id.includes('@auth0') || id.includes('@clerk') || id.includes('supabase')) {
              return 'auth-vendor';
            }
            
            // Date/time libraries
            if (id.includes('date-fns') || id.includes('moment') || id.includes('dayjs')) {
              return 'date-vendor';
            }
            
            // Utility libraries
            if (id.includes('lodash') || id.includes('ramda') || id.includes('immutable')) {
              return 'utils-vendor';
            }
            
            // Animation libraries
            if (id.includes('framer-motion') || id.includes('lottie') || id.includes('gsap')) {
              return 'animation-vendor';
            }
            
            // Media libraries
            if (id.includes('fabric') || id.includes('konva') || id.includes('three') || id.includes('wavesurfer')) {
              return 'media-vendor';
            }
            
            // Development tools (should be excluded in production)
            if (id.includes('@sentry') || id.includes('@builder.io') || id.includes('amplitude')) {
              return 'dev-tools-vendor';
            }
            
            // Catch-all for other vendor libraries
            return 'vendor';
          }
          
          // Feature-based chunking for app code
          if (id.includes('/src/features/')) {
            const feature = id.split('/src/features/')[1]?.split('/')[0];
            return `feature-${feature}`;
          }
          
          // Shared code chunk
          if (id.includes('/src/shared/')) {
            return 'shared';
          }
        },
        
        // Optimize chunk file names
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId 
            ? chunkInfo.facadeModuleId.split('/').pop()?.replace('.tsx', '').replace('.ts', '')
            : 'chunk';
          return `chunks/[name]-[hash].js`;
        },
        
        // Optimize asset file names
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          
          if (/woff|woff2|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          
          return `assets/[name]-[hash][extname]`;
        },
        
        entryFileNames: 'assets/[name]-[hash].js',
      },
      
      // External dependencies (if using CDN)
      external: process.env.NODE_ENV === 'production' ? [] : [],
    },
    
    // Chunk size warnings
    chunkSizeWarningLimit: 1000, // 1MB warning
    
    // Target modern browsers for smaller bundles
    target: ['es2020', 'chrome80', 'firefox78', 'safari14'],
  },

  // Resolve configuration
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@shared": resolve(__dirname, "./src/shared"),
      "@features": resolve(__dirname, "./src/features"),
    },
  },

  // Development server configuration
  server: {
    proxy: {
      "/routes": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
    },
    // Enable HMR for better development experience
    hmr: {
      overlay: true,
    },
  },

  // Preview server (for production builds)
  preview: {
    proxy: {
      "/routes": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
    },
  },

  // Define global constants
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __API_URL__: JSON.stringify(process.env.VITE_API_URL || "http://localhost:8000"),
    __NODE_ENV__: JSON.stringify(process.env.NODE_ENV),
  },

  // CSS optimization
  css: {
    devSourcemap: process.env.NODE_ENV === 'development',
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`,
      },
    },
  },

  // Dependency pre-bundling optimization for optimized build
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'zustand',
      'clsx',
      'tailwind-merge',
      'lucide-react',
      'date-fns'
    ],
    exclude: [],
  },
});