import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import * as path from 'path'
import eslintPlugin from 'vite-plugin-eslint'

export default defineConfig({
  plugins: [vue(), eslintPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  css: {
    preprocessorOptions: {
      less: {},
    },
  },
  server: {
    hmr: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000/',
        changeOrigin: true,
      },
    },
  },
})
