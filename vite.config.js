import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import { createStyleImportPlugin, NutuiResolve } from 'vite-plugin-style-import'
import importToCDN, { autoComplete } from 'vite-plugin-cdn-import'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        trip: resolve(__dirname, 'trip.html')
      }
    }
  },
  server: {
    host: '0.0.0.0'
  },
  plugins: [
    vue(),
    createStyleImportPlugin({
      resolves: [
        NutuiResolve()
      ]
    }),
    importToCDN({
      modules: [
        autoComplete('vue'),
        autoComplete('axios'),
        autoComplete('lodash'),
        {
          name: 'vue-router',
          var: 'VueRouter',
          path: 'dist/vue-router.global.min.js'
        },
        {
          name: 'highcharts',
          var: 'Highcharts',
          path: 'highcharts.min.js'
        },
        {
          name: 'leaflet',
          var: 'leaflet',
          path: 'dist/leaflet-src.min.js'
        },
        {
          name: '@nutui/nutui',
          var: 'nutui',
          path: 'dist/nutui.umd.js',
          css: 'dist/style.css'
        }
      ],
    })
  ],
  css: {
    preprocessorOptions: {
      scss: {
        // 配置 nutui 全局 scss 变量
        additionalData: `@import "@nutui/nutui/dist/styles/variables.scss";`
      }
    }
  }
})
