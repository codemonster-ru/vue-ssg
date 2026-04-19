import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  ssr: {
    noExternal: [
      '@codemonster-ru/vue-codeblock',
      '@codemonster-ru/vueforge-core',
      '@codemonster-ru/vueforge-layouts',
      '@codemonster-ru/vueforge-theme',
      '@codemonster-ru/vueiconify'
    ]
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
