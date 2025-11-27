import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.PERPLEXITY_API_KEY': JSON.stringify(env.PERPLEXITY_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks: (id) => {
              // Ensure React is in a single chunk to prevent multiple instances
              if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
                return 'react-vendor';
              }
              // Split Three.js and related 3D libraries into separate chunk
              if (id.includes('node_modules/three') || 
                  id.includes('node_modules/@react-three')) {
                return 'three';
              }
              // Split Polkadot libraries
              if (id.includes('node_modules/@polkadot')) {
                return 'polkadot';
              }
              // Keep router with React
              if (id.includes('node_modules/react-router')) {
                return 'react-vendor';
              }
            }
          }
        },
        chunkSizeWarningLimit: 1000, // Increase limit since we're splitting properly
      },
      optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom'],
      }
    };
});
