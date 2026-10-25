import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3005,
    proxy: {
      '/api/itunes': {
        target: 'https://itunes.apple.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/itunes/, ''),
      },
      '/api/yts': {
        target: 'https://yts.bz',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/yts/, ''),
      },
      '/api/imdb': {
        target: 'https://v2.sg.media-imdb.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/imdb/, ''),
      },
    },
  },
  preview: { host: true, port: 3005 },
});
