<script setup lang="ts">
import { computed, defineAsyncComponent, defineComponent, h, markRaw, onMounted, ref, shallowRef, useAttrs } from 'vue'
import type { Component } from 'vue'
import { RouterLink } from 'vue-router'
import { VfTable } from '@codemonster-ru/vueforge-core'
import { VfTabs } from '@codemonster-ru/vueforge-core'
import { VfSkeletonGate } from '@codemonster-ru/vueforge-core'
import { VfCodeBlock } from '@codemonster-ru/vueforge-codeblock/view'
import '@codemonster-ru/vueforge-codeblock/style.css'
import type { DocsContentBlock } from '@/content/docs'

const props = defineProps<{
  blocks: DocsContentBlock[]
  path?: string
}>()

const attrs = useAttrs()
const isHydrated = ref(false)
const docsVirtualPlaygroundRegistry = shallowRef<Record<string, Component>>({})
const docsVirtualPlaygroundSourceFileRegistry = shallowRef<Record<string, string>>({})
const docsVirtualPlaygroundSourceLanguageRegistry = shallowRef<Record<string, string>>({})
const docsVirtualPlaygroundSourceRegistry = shallowRef<Record<string, string>>({})
const readyPlaygroundKeys = shallowRef<Record<string, true>>({})
const pendingPlaygroundReadyTimers = new Map<string, ReturnType<typeof setTimeout>>()
const codeBlockAllowedLanguages = ['plaintext', 'text', 'bash', 'ts', 'typescript', 'vue'] as const
const hasPlaygroundBlocks = computed(() => props.blocks.some((block) => block.type === 'playground'))
const VfPlaygroundLoading = defineComponent({
  name: 'DocsPlaygroundLoading',
  props: {
    height: {
      type: [Number, String],
      default: undefined
    },
    minHeight: {
      type: [Number, String],
      default: '320px'
    }
  },
  setup(loadingProps) {
    const toCssLength = (value: number | string | undefined): string | undefined => {
      if (value == null) {
        return undefined
      }
      return typeof value === 'number' ? `${value}px` : value
    }

    return () =>
      h('div', {
        'aria-hidden': 'true',
        class: 'vf-playground docs-playground-placeholder',
        style: {
          minHeight: toCssLength(loadingProps.minHeight),
          height: toCssLength(loadingProps.height)
        }
      })
  }
})
const VfPlayground = defineAsyncComponent({
  loader: async () => {
    const [, module] = await Promise.all([
      import('@codemonster-ru/vueforge-playground/style.css'),
      import('@codemonster-ru/vueforge-playground/ui')
    ])
    return module.VfPlayground
  },
  loadingComponent: VfPlaygroundLoading,
  delay: 0
})

onMounted(async () => {
  if (hasPlaygroundBlocks.value) {
    const playgroundRegistryModule = await import('@/generated/playgroundRegistry.generated')
    docsVirtualPlaygroundRegistry.value = Object.fromEntries(
      Object.entries(playgroundRegistryModule.docsVirtualPlaygroundRegistry).map(([key, component]) => [key, markRaw(component)])
    )
    docsVirtualPlaygroundSourceFileRegistry.value = playgroundRegistryModule.docsVirtualPlaygroundSourceFileRegistry
    docsVirtualPlaygroundSourceLanguageRegistry.value = playgroundRegistryModule.docsVirtualPlaygroundSourceLanguageRegistry
    docsVirtualPlaygroundSourceRegistry.value = playgroundRegistryModule.docsVirtualPlaygroundSourceRegistry
  }

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
  for (const [demoId, source] of Object.entries(docsVirtualPlaygroundSourceRegistry.value)) {
    if (
      docsVirtualPlaygroundRegistry.value[demoId]
      && docsVirtualPlaygroundSourceFileRegistry.value[demoId] === block.entry
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
  if (demoId && docsVirtualPlaygroundSourceRegistry.value[demoId]) {
    return docsVirtualPlaygroundSourceRegistry.value[demoId]
  }

  return block.entry && block.files ? block.files[block.entry] ?? '' : ''
}

function getVirtualPlaygroundSourceLanguage(block: Extract<DocsContentBlock, { type: 'playground' }>): string {
  const demoId = getPlaygroundComponentDemoId(block)
  if (demoId && docsVirtualPlaygroundSourceLanguageRegistry.value[demoId]) {
    return docsVirtualPlaygroundSourceLanguageRegistry.value[demoId]
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
    return {
      minHeight: getPlaygroundMinHeight(block)
    }
  }

  return {
    height: typeof block.height === 'number' ? `${block.height}px` : block.height
  }
}

function getCodeBlockMinHeight(block: Extract<DocsContentBlock, { type: 'code' }>): string {
  const lines = block.code.split('\n').length
  const estimatedHeight = Math.max(120, Math.min(520, 56 + lines * 22))
  return `${estimatedHeight}px`
}

function getPlaygroundMinHeight(block: Extract<DocsContentBlock, { type: 'playground' }>): string {
  if (block.height != null) {
    return typeof block.height === 'number' ? `${block.height}px` : block.height
  }

  return '320px'
}

function getPlaygroundKey(block: Extract<DocsContentBlock, { type: 'playground' }>, index: number): string {
  if (block.entry) {
    return `${block.entry}:${index}`
  }
  return `playground:${index}`
}

function isPlaygroundReady(block: Extract<DocsContentBlock, { type: 'playground' }>, index: number): boolean {
  return Boolean(readyPlaygroundKeys.value[getPlaygroundKey(block, index)])
}

function markPlaygroundReady(block: Extract<DocsContentBlock, { type: 'playground' }>, index: number): void {
  const key = getPlaygroundKey(block, index)
  if (readyPlaygroundKeys.value[key]) {
    return
  }
  if (pendingPlaygroundReadyTimers.has(key)) {
    return
  }

  const timer = setTimeout(() => {
    pendingPlaygroundReadyTimers.delete(key)
    readyPlaygroundKeys.value = {
      ...readyPlaygroundKeys.value,
      [key]: true
    }
  }, 160)

  pendingPlaygroundReadyTimers.set(key, timer)
}

function onPlaygroundMounted(block: Extract<DocsContentBlock, { type: 'playground' }>, index: number): void {
  markPlaygroundReady(block, index)
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
    <template v-for="(block, index) in props.blocks" :key="`${block.type}-${index}`">
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
          :min-height="getCodeBlockMinHeight(block)"
        />
      </div>

      <template v-else-if="block.type === 'playground'">
        <VfSkeletonGate :ready="isPlaygroundReady(block, index)" :min-height="getPlaygroundMinHeight(block)">
          <template #skeleton>
            <div aria-hidden="true" class="vf-playground docs-playground-placeholder" :style="getPlaygroundStyle(block)" />
          </template>

          <VfPlayground
            v-if="block.renderMode === 'component' && isHydrated && getPlaygroundComponentDemoId(block)"
            mode="component"
            :component="docsVirtualPlaygroundRegistry[getPlaygroundComponentDemoId(block)!]"
            :component-source="getVirtualPlaygroundSource(block)"
            :component-files="getVirtualPlaygroundComponentFiles(block)"
            :component-entry="getVirtualPlaygroundComponentEntry(block)"
            :component-source-language="getVirtualPlaygroundSourceLanguage(block)"
            initial-tab="preview"
            :show-code="block.showCode"
            :min-height="getPlaygroundMinHeight(block)"
            :height="block.height"
            @vue:mounted="onPlaygroundMounted(block, index)"
          />

          <VfPlayground
            v-else-if="block.renderMode !== 'component'"
            :files="block.files"
            :entry="block.entry"
            :framework="block.framework"
            :autorun="block.autorun"
            initial-tab="preview"
            :show-code="block.showCode"
            :min-height="getPlaygroundMinHeight(block)"
            :height="block.height"
            @run="markPlaygroundReady(block, index)"
            @vue:mounted="onPlaygroundMounted(block, index)"
          />
        </VfSkeletonGate>

        <div
          v-if="block.renderMode === 'component' && !(isHydrated && getPlaygroundComponentDemoId(block))"
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
        v-else-if="getTabsForComponentLanding(block, props.path)"
        :items="getTabsForComponentLanding(block, props.path)!"
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
