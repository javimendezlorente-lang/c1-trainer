import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/examiner/',
  build: {
    // Increase chunk size warning limit to reduce noisy warnings for large single-page bundle
    chunkSizeWarningLimit: 1000
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'dist/',
        'node_modules/',
        'src/test/',
        '**/*.config.js',
        '**/main.jsx'
      ]
    }
  }
})
