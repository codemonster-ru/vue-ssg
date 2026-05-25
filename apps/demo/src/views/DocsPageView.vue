<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { VfTabs } from '@codemonster-ru/vueforge-core'
import DocsMarkdownRenderer from '@/components/DocsMarkdownRenderer.vue'
import { docsPages, getDocsPageByPath } from '@/content/docs'
import type { DocsContentBlock, DocsPage } from '@/content/docs'

const route = useRoute()
const router = useRouter()
const currentPage = computed(() => getDocsPageByPath(route.path))

const componentPageMatch = computed(() =>
  route.path.match(/^\/([^/]+)\/components\/([^/]+)(?:\/(features|api|theming))?$/)
)

const componentBasePath = computed(() => {
  const match = componentPageMatch.value
  if (!match) {
    return null
  }

  return `/${match[1]}/components/${match[2]}`
})

const activeComponentTab = ref('features')
const availableComponentTabValues = computed(() => new Set(componentTabs.value.map((item) => item.value)))

function normalizeComponentTab(value: unknown): string {
  return value === 'features' || value === 'api' || value === 'theming' ? value : 'features'
}

watch(
  [componentPageMatch, () => route.query.tab],
  ([match, queryTab]) => {
    const routeTab = normalizeComponentTab(route.query.tab)
    const matchTab = normalizeComponentTab(match?.[3])
    activeComponentTab.value = queryTab ? routeTab : matchTab
  },
  { immediate: true }
)

function getComponentTabPage(basePath: string, tab: string): DocsPage | undefined {
  const tabPath = tab === 'overview' ? basePath : `${basePath}/${tab}`
  return docsPages.find((page) => page.path === tabPath)
}

const componentTabPages = computed(() => {
  const basePath = componentBasePath.value
  if (!basePath) {
    return null
  }

  const overview = getComponentTabPage(basePath, 'overview')
  const features = getComponentTabPage(basePath, 'features')
  const api = getComponentTabPage(basePath, 'api')
  const theming = getComponentTabPage(basePath, 'theming')

  if (!overview) {
    return null
  }

  return {
    overview,
    features,
    api,
    theming
  }
})

const componentTabs = computed(() => {
  const pages = componentTabPages.value
  if (!pages) {
    return []
  }

  return [
    ...(pages.features ? [{ value: 'features', label: 'Features' }] : []),
    ...(pages.api ? [{ value: 'api', label: 'API' }] : []),
    ...(pages.theming ? [{ value: 'theming', label: 'Theming' }] : [])
  ]
})

watch(
  [activeComponentTab, componentTabPages, availableComponentTabValues],
  ([tab, pages, available]) => {
    if (!pages || !available.has(tab)) {
      return
    }

    const currentQueryTab = typeof route.query.tab === 'string' ? route.query.tab : undefined
    if (currentQueryTab === tab) {
      return
    }

    void router.replace({
      query: {
        ...route.query,
        tab
      }
    })
  },
  { immediate: true }
)

const activeComponentPage = computed(() => {
  const pages = componentTabPages.value
  if (!pages) {
    return null
  }

  const preferred = pages[activeComponentTab.value as keyof typeof pages]

  if (preferred && activeComponentTab.value !== 'overview') {
    return preferred
  }

  return pages.features ?? pages.api ?? pages.theming ?? pages.overview
})

function toText(html: string): string {
  return html.replace(/<[^>]+>/g, '').trim()
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function stripTabHeading(blocks: DocsContentBlock[], tab: string): DocsContentBlock[] {
  const tabTitle = tab.toLowerCase()

  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index]

    if (block.type !== 'heading') {
      continue
    }

    const headingText = toText(block.html).toLowerCase()
    if (headingText === tabTitle) {
      return [...blocks.slice(0, index), ...blocks.slice(index + 1)]
    }

    break
  }

  return blocks
}

function stripFeaturesSummaryHeading(blocks: DocsContentBlock[], tab: string): DocsContentBlock[] {
  if (tab !== 'features' || !blocks.length) {
    return blocks
  }

  const firstBlock = blocks[0]
  if (firstBlock?.type === 'heading' && firstBlock.depth === 2 && toText(firstBlock.html).toLowerCase() === 'summary') {
    return blocks.slice(1)
  }

  return blocks
}

function stripLegacyTabsList(blocks: DocsContentBlock[]): DocsContentBlock[] {
  const result: DocsContentBlock[] = []

  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index]
    const nextBlock = blocks[index + 1]

    if (
      block.type === 'heading'
      && block.depth === 2
      && toText(block.html).toLowerCase() === 'tabs'
      && nextBlock?.type === 'list'
    ) {
      index += 1
      continue
    }

    result.push(block)
  }

  return result
}

const componentPageHeaderBlocks = computed<DocsContentBlock[]>(() => {
  const pages = componentTabPages.value
  if (!pages) {
    return []
  }

  const blocks: DocsContentBlock[] = [
    {
      type: 'heading',
      depth: 1,
      id: `component-${pages.overview.id}`,
      html: escapeHtml(pages.overview.title)
    }
  ]

  if (pages.overview.description) {
    blocks.push({
      type: 'paragraph',
      html: escapeHtml(pages.overview.description)
    })
  }

  return blocks
})

const renderedBlocks = computed(() => {
  if (activeComponentPage.value) {
    return stripFeaturesSummaryHeading(
      stripTabHeading(
        stripLegacyTabsList(activeComponentPage.value.blocks),
        activeComponentTab.value
      ),
      activeComponentTab.value
    )
  }

  return currentPage.value.blocks
})
</script>

<template>
  <main class="docs-page">
    <div v-if="componentTabPages" class="docs-page__component-header">
      <DocsMarkdownRenderer
        :aria-label="currentPage.title"
        :blocks="componentPageHeaderBlocks"
        :path="currentPage.path"
      />
      <VfTabs
        v-model="activeComponentTab"
        :items="componentTabs"
      />
    </div>
    <div :class="{ 'docs-page__tab-panel': componentTabPages }">
      <DocsMarkdownRenderer
        :aria-label="(activeComponentPage ?? currentPage).title"
        :blocks="renderedBlocks"
        :path="(activeComponentPage ?? currentPage).path"
      />
    </div>
  </main>
</template>
