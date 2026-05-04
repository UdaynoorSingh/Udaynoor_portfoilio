 import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  assetsInclude: ['**/*.glsl', '**/*.vert', '**/*.frag'],
  server: {
    proxy: {
      // Django on 8000: `python manage.py runserver` from /backend (after `npm run build` for first visit, or use bootstrap)
      '/api': { target: 'http://127.0.0.1:8000', changeOrigin: true },
    },
  },
})
