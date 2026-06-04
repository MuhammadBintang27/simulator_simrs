import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'

  return {
    plugins: [
      vue(),
      // DevTools TIDAK masuk production build
      ...(isProd ? [] : [vueDevTools()]),
    ],

    base: '/',

    server: {
      proxy: {
        // Proxy gambar dari ws-simrs.net — dev only, path prioritas utama
        '/ws-simrs-assets': {
          target: 'https://ws-simrs.net',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/ws-simrs-assets/, ''),
        },
        // Proxy Laravel API (termasuk /img-proxy endpoint)
        '/api-laravel': {
          target: 'https://simrs-link.site',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api-laravel/, ''),
        },
      },
    },

    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },

    build: {
      target: 'es2020',
      minify: 'esbuild',
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          // Function-based: deteksi via path — aman untuk paket tanpa root entry (PrimeVue v4)
          manualChunks(id) {
            if (!id.includes('node_modules')) return

            // PrimeVue ecosystem — chunk terbesar, cache terpisah
            if (
              id.includes('/primevue/') ||
              id.includes('/@primeuix/') ||
              id.includes('/@primevue/')
            ) {
              return 'vendor-primevue'
            }

            // Vue core — cache seumur hidup setelah pertama
            if (
              id.includes('/vue/') ||
              id.includes('/vue-router/') ||
              id.includes('/pinia/') ||
              id.includes('/@vue/')
            ) {
              return 'vendor-vue'
            }

            // Chart — hanya DashboardView (lazy)
            if (id.includes('/chart.js/')) return 'vendor-chart'

            // xlsx — hanya di halaman laporan (lazy)
            if (id.includes('/xlsx/')) return 'vendor-xlsx'

            // Pusher — hanya FormPoliKlinik (lazy)
            if (id.includes('/pusher-js/')) return 'vendor-pusher'

            // Utility ringan
            if (
              id.includes('/axios/') ||
              id.includes('/date-fns/') ||
              id.includes('/jwt-decode/')
            ) {
              return 'vendor-utils'
            }
          },
        },
      },
    },
  }
})
