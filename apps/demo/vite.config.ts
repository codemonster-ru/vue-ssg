import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createMarkdownComponentPlaygrounds } from '@codemonster-ru/vue-ssg-core/playground'

const markdownPlaygrounds = createMarkdownComponentPlaygrounds({
  contentRoot: fileURLToPath(new URL('./content', import.meta.url)),
  generatedRegistryPath: fileURLToPath(new URL('./src/content/playgroundRegistry.generated.ts', import.meta.url))
})

export default defineConfig({
  optimizeDeps: {
    entries: [
      'index.html',
      'src/**/*.{ts,vue}',
      '!src/content/playgroundRegistry.generated.ts'
    ],
    exclude: ['@codemonster-ru/ui-codeblock']
  },
  plugins: [markdownPlaygrounds.plugin, vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
