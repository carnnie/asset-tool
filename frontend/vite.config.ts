import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
        output: {
            dir: '../static',
            entryFileNames: 'index-script.js',
            assetFileNames: 'index-style.css',
            chunkFileNames: "chunk.js",
            manualChunks: undefined,
        }
    }
}
})
