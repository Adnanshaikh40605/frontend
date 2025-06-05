import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Preferred port, but will use another if this one is busy
    proxy: {
      // Proxy API requests to Django backend
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      },
      // Proxy media requests to Django backend
      '/media': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      },
      // Proxy CKEditor requests to Django backend
      '/ckeditor': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist'
  },
  optimizeDeps: {
    include: [
      'react-dnd',
      'react-dnd-html5-backend',
      'react-color',
      'react-resizable',
      'react-dropzone'
    ]
  }
})
