<script setup lang="ts">
import { defineAsyncComponent, onMounted, ref, useAttrs } from 'vue'
import { RouterLink } from 'vue-router'
import { VfTable } from '@codemonster-ru/vueforge-core'
import { VfTabs } from '@codemonster-ru/vueforge-core'
import { VfCodeBlock } from '@codemonster-ru/vueforge-codeblock/view'
import {
  docsVirtualPlaygroundRegistry,
  docsVirtualPlaygroundSourceFileRegistry,
  docsVirtualPlaygroundSourceLanguageRegistry,
  docsVirtualPlaygroundSourceRegistry
} from '@/generated/playgroundRegistry.generated'
import type { DocsContentBlock } from '@/content/docs'

defineProps<{
  blocks: DocsContentBlock[]
  path?: string
}>()

const attrs = useAttrs()
const isHydrated = ref(false)
const codeBlockAllowedLanguages = ['plaintext', 'text', 'bash', 'ts', 'typescript', 'vue'] as const
const VfPlayground = defineAsyncComponent(() =>
  import('@codemonster-ru/vueforge-playground/ui').then((module) => module.VfPlayground)
)

onMounted(() => {
  isHydrated.value = true
})

const hasHtml = (block: DocsContentBlock): block is DocsContentBlock & { html: string } =>
  typeof (block as { html?: unknown }).html === 'string'

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

function getVirtualPlaygroundComponent(block: Extract<DocsContentBlock, { type: 'playground' }>): any {
  const demoId = getPlaygroundComponentDemoId(block)

  if (!demoId) {
    return undefined
  }

  return docsVirtualPlaygroundRegistry[demoId] as any
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

function getPlaygroundStyle(block: Extract<DocsContentBlock, { type: 'playground' }>): Record<string, string> {
  if (block.height == null) {
    return {}
  }

  return {
    height: typeof block.height === 'number' ? `${block.height}px` : block.height
  }
}

interface DocsLinkTabItem {
  value: string
  label: string
  to: string
}

function getTabTo(item: unknown): string {
  if (!item || typeof item !== 'object') {
    return '/'
  }

  const to = (item as { to?: unknown }).to
  return typeof to === 'string' ? to : '/'
}

function normalizePathname(pathname: string): string {
  return pathname.replace(/\/+$/, '') || '/'
}

function isComponentLandingPath(pathname: string): boolean {
  return /^\/[^/]+\/components\/[^/]+$/.test(normalizePathname(pathname))
}

function parseListAnchor(itemHtml: string): { href: string; label: string } | null {
  const match = itemHtml.match(/<a[^>]*href=(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/i)
  if (!match) {
    return null
  }

  const href = match[2]?.trim()
  const label = (match[3] ?? '').replace(/<[^>]+>/g, '').trim()
  if (!href || !label) {
    return null
  }

  return { href, label }
}

function resolveTabPath(basePath: string, href: string): string | null {
  if (href.startsWith('/')) {
    return normalizePathname(href)
  }

  if (href.startsWith('./') && href.endsWith('.md')) {
    const relativePath = href.slice(2).replace(/\.md$/i, '')
    if (!relativePath) {
      return null
    }

    return `${normalizePathname(basePath)}/${relativePath}`
  }

  if (!href.includes('://') && !href.startsWith('#')) {
    return `${normalizePathname(basePath)}/${href.replace(/^\.?\//, '').replace(/\.md$/i, '')}`
  }

  return null
}

function getTabsForComponentLanding(
  block: DocsContentBlock,
  pagePath?: string
): DocsLinkTabItem[] | null {
  if (!pagePath || !isComponentLandingPath(pagePath) || block.type !== 'list' || block.ordered) {
    return null
  }

  const tabs = block.items
    .map((itemHtml, index) => {
      const anchor = parseListAnchor(itemHtml)
      if (!anchor) {
        return null
      }

      const to = resolveTabPath(pagePath, anchor.href)
      if (!to) {
        return null
      }

      return {
        value: String(index),
        label: anchor.label,
        to
      }
    })
    .filter((item): item is DocsLinkTabItem => item !== null)

  if (!tabs.length || tabs.length !== block.items.length) {
    return null
  }

  return tabs
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

      <div v-else-if="block.type === 'code'">
        <VfCodeBlock
          :code="block.code"
          :language="block.language"
          :allowed-languages="codeBlockAllowedLanguages"
          language-fallback="plaintext"
          :show-line-numbers="true"
        />
      </div>

      <template v-else-if="block.type === 'playground'">
        <VfPlayground
          v-if="isHydrated && getPlaygroundComponentDemoId(block)"
          mode="component"
          :component="getVirtualPlaygroundComponent(block)"
          :component-source="getVirtualPlaygroundSource(block)"
          :component-files="getVirtualPlaygroundComponentFiles(block)"
          :component-entry="getVirtualPlaygroundComponentEntry(block)"
          :component-source-language="getVirtualPlaygroundSourceLanguage(block)"
          initial-tab="preview"
          :show-code="block.showCode"
          :height="block.height"
        />

        <VfPlayground
          v-else-if="isHydrated"
          :files="block.files"
          :entry="block.entry"
          :framework="block.framework"
          :autorun="block.autorun"
          initial-tab="preview"
          :show-code="block.showCode"
          :height="block.height"
        />

        <div
          v-else
          aria-hidden="true"
          class="vf-playground docs-playground-placeholder"
          :style="getPlaygroundStyle(block)"
        />
      </template>

      <ol v-else-if="block.type === 'list' && block.ordered">
        <!-- eslint-disable vue/no-v-html -->
        <li v-for="(item, itemIndex) in block.items" :key="itemIndex" v-html="item" />
        <!-- eslint-enable vue/no-v-html -->
      </ol>

      <VfTabs
        v-else-if="getTabsForComponentLanding(block, path)"
        :items="getTabsForComponentLanding(block, path)!"
      >
        <template #tab="{ item }">
          <RouterLink :to="getTabTo(item)">
            {{ item.label }}
          </RouterLink>
        </template>
      </VfTabs>

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

      <!-- eslint-disable vue/no-v-html -->
      <div v-else-if="hasHtml(block)" v-html="block.html" />
      <!-- eslint-enable vue/no-v-html -->
    </template>
  </article>
</template>
