import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '192.168.0.23',
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://192.168.0.23:5059',
        changeOrigin: true,
      },
    },
  },
})
