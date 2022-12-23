import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import { createStyleImportPlugin } from 'vite-plugin-style-import'
import importToCDN, { autoComplete } from 'vite-plugin-cdn-import'

function NutuiResolve() {
  return {
    libraryName: '@nutui/nutui',
    libraryNameChangeCase: 'noCase',
    resolveStyle: (name) => {
      return `@nutui/nutui/dist/packages/${name.replace(' ', '')}/index.scss`
    },
  }
}

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
      prodUrl: 'https://npm.elemecdn.com/{name}@{version}/{path}',
      //prodUrl: '//unpkg.com/{name}@{version}/{path}',
      modules: [
        autoComplete('vue'),
        autoComplete('axios'),
        autoComplete('lodash'),
        // {
        //   name: 'vue-router',
        //   var: 'VueRouter',
        //   path: 'dist/vue-router.global.min.js'
        // },
        {
          name: 'highcharts',
          var: 'Highcharts',
          path: 'highstock.js'
        },
        {
          name: 'leaflet',
          var: 'leaflet',
          path: 'dist/leaflet.js',
          css: 'dist/leaflet.css'
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
