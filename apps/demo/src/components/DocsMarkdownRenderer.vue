<script setup lang="ts">
import { useAttrs } from 'vue'
import { VfCodeBlock } from '@codemonster-ru/vueforge-codeblock'
import { VfPlayground } from '@codemonster-ru/vueforge-playground'
import { VfTable } from '@codemonster-ru/vueforge-core'
import type { DocsContentBlock } from '@/content/docs'
import {
  docsVirtualPlaygroundRegistry,
  docsVirtualPlaygroundSourceFileRegistry,
  docsVirtualPlaygroundSourceLanguageRegistry,
  docsVirtualPlaygroundSourceRegistry
} from '@/content/playgroundRegistry.generated'

defineProps<{
  blocks: DocsContentBlock[]
}>()

const attrs = useAttrs()

function getMarkdownComponentDemoId(block: Extract<DocsContentBlock, { type: 'playground' }>): string | null {
  if (!block.entry || !block.files || block.renderMode !== 'component' || !block.entry.endsWith('.vue')) {
    return null
  }

  const entryContent = block.files[block.entry]
  if (typeof entryContent !== 'string') {
    return null
  }

  const normalizedEntryContent = entryContent.trimEnd()
  for (const [demoId, source] of Object.entries(docsVirtualPlaygroundSourceRegistry)) {
    if (
      docsVirtualPlaygroundRegistry[demoId]
      && docsVirtualPlaygroundSourceFileRegistry[demoId] === block.entry
      && source.trimEnd() === normalizedEntryContent
    ) {
      return demoId
    }
  }

  return null
}

function getPlaygroundComponentDemoId(block: Extract<DocsContentBlock, { type: 'playground' }>): string | null {
  return getMarkdownComponentDemoId(block)
}

function hasSandboxPlaygroundFiles(
  block: Extract<DocsContentBlock, { type: 'playground' }>
): block is Extract<DocsContentBlock, { type: 'playground' }> & { files: Record<string, string>, entry: string } {
  return Boolean(block.files && block.entry)
}

function getPlaygroundSourceLanguage(entryPath: string): string {
  if (entryPath.endsWith('.ts')) {
    return 'typescript'
  }
  if (entryPath.endsWith('.js') || entryPath.endsWith('.mjs') || entryPath.endsWith('.cjs')) {
    return 'javascript'
  }
  if (entryPath.endsWith('.vue')) {
    return 'vue'
  }
  return 'plaintext'
}

function getVirtualPlaygroundSource(block: Extract<DocsContentBlock, { type: 'playground' }>): string {
  const demoId = getPlaygroundComponentDemoId(block)
  if (demoId && docsVirtualPlaygroundSourceRegistry[demoId]) {
    return docsVirtualPlaygroundSourceRegistry[demoId]
  }

  return block.entry && block.files ? block.files[block.entry] ?? '' : ''
}

function getVirtualPlaygroundSourceLanguage(block: Extract<DocsContentBlock, { type: 'playground' }>): string {
  const demoId = getPlaygroundComponentDemoId(block)
  if (demoId && docsVirtualPlaygroundSourceLanguageRegistry[demoId]) {
    return docsVirtualPlaygroundSourceLanguageRegistry[demoId]
  }

  return block.entry ? getPlaygroundSourceLanguage(block.entry) : 'plaintext'
}

function getVirtualPlaygroundComponentFiles(block: Extract<DocsContentBlock, { type: 'playground' }>): Record<string, string> | undefined {
  const markdownDemoId = getMarkdownComponentDemoId(block)
  if (markdownDemoId) {
    return block.files ?? undefined
  }

  return undefined
}

function getVirtualPlaygroundComponentEntry(block: Extract<DocsContentBlock, { type: 'playground' }>): string | undefined {
  const markdownDemoId = getMarkdownComponentDemoId(block)
  if (markdownDemoId) {
    return block.entry
  }

  return undefined
}
</script>

<template>
  <article class="docs-content vf-prose" v-bind="attrs">
    <template v-for="(block, index) in blocks" :key="`${block.type}-${index}`">
      <component :is="`h${block.depth}`" v-if="block.type === 'heading'" :id="block.id">
        <!-- eslint-disable vue/no-v-html -->
        <span v-html="block.html" />
        <!-- eslint-enable vue/no-v-html -->
      </component>

      <p v-else-if="block.type === 'paragraph'">
        <!-- eslint-disable vue/no-v-html -->
        <span v-html="block.html" />
        <!-- eslint-enable vue/no-v-html -->
      </p>

      <VfCodeBlock
        v-else-if="block.type === 'code'"
        :code="block.code"
        :language="block.language"
        theme="inherit"
      />
      <template v-else-if="block.type === 'playground'">
        <VfPlayground
          v-if="getPlaygroundComponentDemoId(block)"
          mode="component"
          :component="docsVirtualPlaygroundRegistry[getPlaygroundComponentDemoId(block)!]"
          :component-source="getVirtualPlaygroundSource(block)"
          :component-files="getVirtualPlaygroundComponentFiles(block)"
          :component-entry="getVirtualPlaygroundComponentEntry(block)"
          :component-source-language="getVirtualPlaygroundSourceLanguage(block)"
          :show-code="block.showCode"
          :height="block.height"
          theme="inherit"
        />

        <VfPlayground
          v-else-if="hasSandboxPlaygroundFiles(block)"
          :files="block.files"
          :entry="block.entry"
          :framework="block.framework"
          :autorun="block.autorun"
          :show-code="block.showCode"
          :height="block.height"
          theme="inherit"
        />
      </template>

      <VfTable v-else-if="block.type === 'table'" striped>
        <template #header>
          <tr>
            <!-- eslint-disable vue/no-v-html -->
            <th
              v-for="(cell, cellIndex) in block.header"
              :key="cellIndex"
              :style="{ textAlign: block.align[cellIndex] ?? undefined }"
              v-html="cell"
            />
            <!-- eslint-enable vue/no-v-html -->
          </tr>
        </template>

        <tr v-for="(row, rowIndex) in block.rows" :key="rowIndex">
          <!-- eslint-disable vue/no-v-html -->
          <td
            v-for="(cell, cellIndex) in row"
            :key="cellIndex"
            :style="{ textAlign: block.align[cellIndex] ?? undefined }"
            v-html="cell"
          />
          <!-- eslint-enable vue/no-v-html -->
        </tr>
      </VfTable>

      <ol v-else-if="block.type === 'list' && block.ordered">
        <!-- eslint-disable vue/no-v-html -->
        <li v-for="(item, itemIndex) in block.items" :key="itemIndex" v-html="item" />
        <!-- eslint-enable vue/no-v-html -->
      </ol>

      <ul v-else-if="block.type === 'list'">
        <!-- eslint-disable vue/no-v-html -->
        <li v-for="(item, itemIndex) in block.items" :key="itemIndex" v-html="item" />
        <!-- eslint-enable vue/no-v-html -->
      </ul>

      <blockquote v-else-if="block.type === 'blockquote'">
        <!-- eslint-disable vue/no-v-html -->
        <div v-html="block.html" />
        <!-- eslint-enable vue/no-v-html -->
      </blockquote>

      <!-- eslint-disable vue/no-v-html -->
      <div v-else-if="block.type === 'html'" v-html="block.html" />
      <!-- eslint-enable vue/no-v-html -->
    </template>
  </article>
</template>
