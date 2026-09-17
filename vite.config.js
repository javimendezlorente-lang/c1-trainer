import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'generateSW',
      includeAssets: [
        'icons/c1-trainer-192.png',
        'icons/c1-trainer-512.png',
      ],
      includeManifestIcons: false,
      manifest: {
        name: 'C1 Trainer',
        short_name: 'C1 Trainer',
        description: 'Independent browser-first study tool for Cambridge C1 Advanced preparation',
        start_url: '/c1-trainer/',
        scope: '/c1-trainer/',
        display: 'standalone',
        background_color: '#102b3d',
        theme_color: '#102b3d',
        lang: 'en',
        orientation: 'any',
        icons: [
          {
            src: 'icons/c1-trainer-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/c1-trainer-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html}'],
        maximumFileSizeToCacheInBytes: 1_000_000,
      },
    }),
  ],
  base: '/c1-trainer/',
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
