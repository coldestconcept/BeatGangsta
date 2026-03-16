import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      preview: {
        port: parseInt(process.env.PORT || '8080'),
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        tailwindcss(),
      ],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        }
      },
      build: {
        chunkSizeWarningLimit: 1500,
        rollupOptions: {
          output: {
            manualChunks: {
              vendor: ['react', 'react-dom'],
              motion: ['motion', 'framer-motion'],
              icons: ['lucide-react'],
              gemini: ['@google/genai'],
              pdf: ['jspdf', 'html2canvas']
            }
          }
        }
      }
    };
});
