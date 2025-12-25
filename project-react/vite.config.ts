import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: true,
    proxy: {
      '/api/v1': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/api/analyze': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/api/metrics': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/api/recent': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/api/crisis-alerts': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:8080',
        ws: true,
      },
      '/health-scrapping': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/health-scrapping/, '/health'),
      },
      '/health-sniffing': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/health-sniffing/, '/health'),
      },
    },
  },
});
