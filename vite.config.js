import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://video-studio-ai-asol-back-production.up.railway.app',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'https://video-studio-ai-asol-back-production.up.railway.app',
        changeOrigin: true,
        secure: false,
      },
      '/r2-media': {
        target: 'https://pub-f7e229b86c1940fabdcf50f072f1013a.r2.dev',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/r2-media/, ''),
      },

    },
  },
})
