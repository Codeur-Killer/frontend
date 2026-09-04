import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Service worker personnalisé (src/sw.js) : nécessaire pour gérer les
      // évènements push et notificationclick, ce que le mode par défaut
      // (generateSW) ne permet pas de faire proprement.
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      injectManifest: {
        // Data comes from an authenticated API and must always be fresh -
        // only the app shell (JS/CSS/HTML/icons/fonts) is precached.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
      // Sans ceci, le manifeste et le service worker ne sont pas injectés
      // par `npm run dev` — impossible de tester l'installation avant un
      // vrai build. Sans incidence en production (registerType/manifest
      // restent la seule source de vérité une fois buildé).
      devOptions: { enabled: true, type: 'module' },
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'G-UGP - Gestion des stocks et expressions de besoins',
        short_name: 'G-UGP',
        description: 'Gestion des stocks et expressions de besoins',
        lang: 'fr',
        theme_color: '#1D2B45',
        background_color: '#F3F1EB',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
})
