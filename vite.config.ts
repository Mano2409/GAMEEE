import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' keeps the build portable (event machines may serve it from a
// subfolder or a plain static file host).
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { proxy: { '/api': 'http://127.0.0.1:3001' } },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 1200,
  },
})
