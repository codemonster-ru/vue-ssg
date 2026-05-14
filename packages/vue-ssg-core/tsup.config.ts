import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/playground.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['vue', 'vue-router', '@unhead/vue', '@codemonster-ru/vueforge-core']
})
