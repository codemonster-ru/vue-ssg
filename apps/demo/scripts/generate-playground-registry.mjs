#!/usr/bin/env node
import { fileURLToPath } from 'node:url'
import { writeMarkdownComponentPlaygroundRegistry } from '@codemonster-ru/vue-ssg-core/playground'
import { createSafeMarkdownComponentPlaygrounds } from './markdown-playgrounds.mjs'

const result = createSafeMarkdownComponentPlaygrounds({
  contentRoot: fileURLToPath(new URL('../content', import.meta.url)),
  generatedRegistryPath: fileURLToPath(new URL('../src/generated/playgroundRegistry.generated.ts', import.meta.url))
})

writeMarkdownComponentPlaygroundRegistry(result.demos, {
  generatedRegistryPath: fileURLToPath(new URL('../src/generated/playgroundRegistry.generated.ts', import.meta.url)),
  virtualPrefix: result.virtualPrefix
})
