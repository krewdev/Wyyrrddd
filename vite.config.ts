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
            manualChunks: {
              // Split Three.js and related 3D libraries into separate chunk
              'three': ['three', '@react-three/fiber', '@react-three/drei'],
              // Split Polkadot libraries
              'polkadot': ['@polkadot/api', '@polkadot/extension-dapp', '@polkadot/util'],
              // Keep React and core router together
              'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            }
          }
        },
        chunkSizeWarningLimit: 1000, // Increase limit since we're splitting properly
      }
    };
});
