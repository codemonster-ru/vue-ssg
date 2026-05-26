import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createMarkdownComponentPlaygrounds } from '@codemonster-ru/vue-ssg-core/playground'

const markdownPlaygrounds = createMarkdownComponentPlaygrounds({
  contentRoot: fileURLToPath(new URL('./content', import.meta.url)),
  generatedRegistryPath: fileURLToPath(new URL('./src/content/playgroundRegistry.generated.ts', import.meta.url))
})

export default defineConfig({
  plugins: [markdownPlaygrounds.plugin, vue()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@codemonster-ru/vueforge-playground')) {
            return 'vf-playground'
          }
          if (id.includes('@codemonster-ru/vueforge-playground-core')) {
            return 'vf-playground'
          }
          if (id.includes('@codemonster-ru/vueforge-codeblock')) {
            return 'vf-codeblock'
          }
          if (id.includes('node_modules/shiki')) {
            return 'vf-codeblock'
          }
          if (id.includes('node_modules/typescript')) {
            return 'vf-playground-runtime'
          }
          return undefined
        }
      }
    }
  },
  ssr: {
    noExternal: [
      '@codemonster-ru/vue-codeblock',
      '@codemonster-ru/vueforge-codeblock',
      '@codemonster-ru/vueforge-core',
      '@codemonster-ru/vueforge-layouts',
      '@codemonster-ru/vueforge-theme',
      '@codemonster-ru/vueforge-playground',
      '@codemonster-ru/vueforge-icons',
      '@codemonster-ru/vueiconify'
    ]
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
