#!/usr/bin/env node
import { fileURLToPath } from 'node:url'
import { createMarkdownComponentPlaygrounds } from '@codemonster-ru/vue-ssg-core/playground'

createMarkdownComponentPlaygrounds({
  contentRoot: fileURLToPath(new URL('../content', import.meta.url)),
  generatedRegistryPath: fileURLToPath(new URL('../src/content/playgroundRegistry.generated.ts', import.meta.url))
})
