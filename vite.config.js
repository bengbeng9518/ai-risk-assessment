import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 3000,
    open: false
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  },
  define: {
    'process.env.API_BASE_URL': JSON.stringify(process.env.API_BASE_URL || '')
  }
})
