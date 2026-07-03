import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'

  return {
    plugins: [
      vue({
        template: {
          compilerOptions: {
            isCustomElement: (tag) => tag.startsWith('ion-'),
          },
        },
      }),
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
              manualChunks(id) {
            if (!id.includes('node_modules')) return

            // ── PrimeVue splitting ──────────────────────────────────────────
            // 1. Theming — CSS-in-JS terbesar, hampir tidak berubah
            if (id.includes('/@primeuix/themes')) return 'vendor-primevue-themes'

            // 2. @primeuix core (utils, core primitives) — pisah dari komponen UI
            if (id.includes('/@primeuix/') || id.includes('/@primevue/')) {
              return 'vendor-primeuix-core'
            }

            // 3. Komponen data berat (paginator digabung agar tidak ada cross-chunk dep dengan datatable)
            if (
              id.includes('/primevue/datatable') ||
              id.includes('/primevue/paginator') ||
              id.includes('/primevue/treetable') ||
              id.includes('/primevue/virtualscroller') ||
              id.includes('/primevue/picklist') ||
              id.includes('/primevue/orderlist')
            ) return 'vendor-primevue-data'

            // 4. Komponen overlay & editor berat
            if (
              id.includes('/primevue/editor') ||
              id.includes('/primevue/dialog') ||
              id.includes('/primevue/confirmdialog') ||
              id.includes('/primevue/dynamicdialog') ||
              id.includes('/primevue/drawer') ||
              id.includes('/primevue/sidebar') ||
              id.includes('/primevue/galleria') ||
              id.includes('/primevue/image') ||
              id.includes('/primevue/fileupload')
            ) return 'vendor-primevue-overlay'

            // 5. Komponen UI ringan (button, tag, badge, input, dll)
            if (id.includes('/primevue/')) return 'vendor-primevue'

            // ── Vendor lain ─────────────────────────────────────────────────
            if (
              id.includes('/vue/') ||
              id.includes('/vue-router/') ||
              id.includes('/pinia/') ||
              id.includes('/@vue/')
            ) return 'vendor-vue'

            if (id.includes('/jspdf/') || id.includes('/jspdf.es')) return 'vendor-jspdf'
            if (id.includes('/html2canvas')) return 'vendor-html2canvas'
            // echarts + zrender (PartografView) — pisah agar tidak ikut chunk view
            if (
              id.includes('/echarts/') ||
              id.includes('/vue-echarts/') ||
              id.includes('/zrender/')
            ) return 'vendor-echarts'
            if (id.includes('/chart.js/')) return 'vendor-chart'
            if (id.includes('/xlsx/')) return 'vendor-xlsx'
            if (id.includes('/pusher-js/')) return 'vendor-pusher'

            if (
              id.includes('/axios/') ||
              id.includes('/date-fns/') ||
              id.includes('/jwt-decode/')
            ) return 'vendor-utils'
          },
        },
      },
    },
  }
})
