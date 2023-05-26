import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      process: 'process/browser',
      util: 'util',
    },
  },
  server: {
    origin: 'http://localhost:3000',
    port: 3000,
    host: '0.0.0.0',
    fs: {
      strict: true,
    }
  },
  plugins: [react()],
})
