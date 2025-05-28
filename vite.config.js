import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174 // Preferred port, but will use another if this one is busy
  },
  build: {
    outDir: 'dist'
  }
})
