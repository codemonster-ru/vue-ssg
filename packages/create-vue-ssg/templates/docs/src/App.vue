<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { useHead } from '@unhead/vue'
import {
  VfButton,
  VfDrawer,
  type VfNavMenuItem,
  VfNavMenu,
  VfTableOfContents,
  VfThemeProvider,
  useTableOfContents
} from '@codemonster-ru/vueforge-core'
import { VfDocumentLayout, VfStack, useBreakpoint } from '@codemonster-ru/vueforge-layouts'
import { VueIconify, icons } from '@codemonster-ru/vueiconify'
import { docsSite } from '@/content/docs'
import defaultFaviconUrl from '@/assets/default-favicon.svg?url'
import {
  type DocsPage,
  docsComponents,
  docsFooter,
  docsHeaderNav,
  docsLayout,
  docsPackagesCatalog,
  docsPages,
  docsScrollOffset,
  docsSidebar,
  getDocsPageByPath
} from '@/content/docs'
import DocsDefaultHeader from '@/components/DocsDefaultHeader.vue'

const faviconHref = computed(() => docsSite.favicon ?? defaultFaviconUrl)
const route = useRoute()
const router = useRouter()
const isLgUp = useBreakpoint('lg')
const isXlUp = useBreakpoint('xl')
const isHomeRoute = computed(() => route.path === '/')
const isNotFoundRoute = computed(() => route.name === 'not-found')
const isContentOnlyRoute = computed(() => isHomeRoute.value || isNotFoundRoute.value)
const currentPage = computed(() => getDocsPageByPath(route.path))
const showContentSubheader = computed(() => !isXlUp.value && !isContentOnlyRoute.value)
const tocScrollOffset = ref(docsScrollOffset)
const hasMobileToc = computed(() =>
  !isContentOnlyRoute.value && currentPage.value.tableOfContents.length > 0
)
const mobileTocItems = computed(() =>
  currentPage.value.tableOfContents.map((item) => ({
    ...item,
    href: `${currentPage.value.path}#${item.id}`
  }))
)
const currentPageMeta = computed(() => ({
  title: currentPage.value.title,
  path: currentPage.value.path
}))
const pageHeadTitle = computed(() => {
  if (isHomeRoute.value) {
    return docsSite.title
  }

  if (isNotFoundRoute.value) {
    return `Page not found | ${docsSite.title}`
  }

  return `${currentPage.value.title} | ${docsSite.title}`
})
const currentPackageKey = computed(() => {
  if (isContentOnlyRoute.value) {
    return null
  }

  const match = route.path.match(/^\/([^/]+)/)
  const routePackageKey = match?.[1]

  if (!routePackageKey) {
    return null
  }

  const hasPackage = docsPackagesCatalog.some((entry) => entry.packageKey === routePackageKey)
  return hasPackage ? routePackageKey : null
})
const isMobileSidebarOpen = ref(false)
const isMobileTocOpen = ref(false)
const sidebarNavRoot = ref<HTMLElement | null>(null)
const tocRoot = ref<HTMLElement | null>(null)
let sidebarResizeObserver: ResizeObserver | null = null
let sidebarMutationObserver: MutationObserver | null = null
let sidebarIndicatorAnimationTimeout: ReturnType<typeof setTimeout> | null = null
let suppressSidebarObserverReset = false
const sidebarIndicatorTop = ref(0)
const sidebarIndicatorHeight = ref(0)
const sidebarIndicatorVisible = ref(false)
const sidebarIndicatorAnimated = ref(false)
const tocIndicatorTop = ref(0)
const tocIndicatorHeight = ref(0)
const tocIndicatorVisible = ref(false)

interface DocsSearchItem {
  title: string
  breadcrumb: string
  snippet: string
  to: string
  keywords?: string
}

function normalizeSearchText(value: string | undefined): string {
  return (value ?? '').replace(/\s+/g, ' ').trim()
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, ' ')
}

function getPageSnippet(page: DocsPage): string {
  const summary = page.description
    ? page.description
    : page.blocks.find((block) => block.type === 'paragraph' || block.type === 'blockquote' || block.type === 'html')

  if (!summary) {
    return ''
  }

  if (typeof summary === 'string') {
    return normalizeSearchText(summary).slice(0, 180)
  }

  const html = summary.type === 'paragraph' || summary.type === 'blockquote' || summary.type === 'html'
    ? summary.html
    : ''
  return normalizeSearchText(stripHtml(html)).slice(0, 180)
}

const docsSearchIndex = computed<DocsSearchItem[]>(() =>
  docsPages.flatMap((page) => {
    const sectionLabel = page.section
      .map((section) => section.replace(/[-_]/g, ' '))
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' / ')
    const pageBreadcrumb = sectionLabel ? `${sectionLabel} / ${page.title}` : page.title
    const pageSnippet = getPageSnippet(page)
    const pageKeywords = normalizeSearchText(
      page.blocks
        .filter((block) => block.type === 'heading')
        .map((block) => stripHtml(block.html))
        .join(' ')
    )

    const pageItem: DocsSearchItem = {
      title: page.title,
      breadcrumb: sectionLabel || 'Documentation',
      snippet: pageSnippet,
      to: page.path,
      keywords: pageKeywords
    }

    const headingItems: DocsSearchItem[] = page.tableOfContents.map((heading) => ({
      title: heading.label,
      breadcrumb: pageBreadcrumb,
      snippet: pageSnippet,
      to: `${page.path}#${heading.id}`,
      keywords: `${page.title} ${pageKeywords}`.trim()
    }))

    return [pageItem, ...headingItems]
  })
)

const shellLayout = computed(() => (isContentOnlyRoute.value ? 'content' : docsLayout.variant))
const activePackageRepoUrl = computed(() => {
  if (!currentPackageKey.value) {
    return null
  }

  const packageEntry = docsPackagesCatalog.find((entry) => entry.packageKey === currentPackageKey.value)
  const repo = packageEntry?.repo?.trim()

  return repo || null
})
const headerSite = computed(() => {
  if (!activePackageRepoUrl.value) {
    return docsSite
  }

  return {
    ...docsSite,
    githubUrl: activePackageRepoUrl.value
  }
})
const headerProps = computed(() => ({
  site: headerSite.value,
  searchItems: docsSearchIndex.value
}))
const footerProps = computed(() => ({
  site: docsSite
}))
function subtreeHasValue(item: VfNavMenuItem, value: string): boolean {
  if (item.value === value) {
    return true
  }

  const stack = [...(item.children ?? [])]

  while (stack.length > 0) {
    const current = stack.shift()

    if (!current) {
      continue
    }

    if (current.value === value) {
      return true
    }

    if (current.children) {
      stack.push(...current.children)
    }
  }

  return false
}

function getSidebarItemsForPackage(items: VfNavMenuItem[], packageKey: string, activePageId: string): VfNavMenuItem[] {
  const packagesNode = items.find((item) => item.value === 'packages')

  if (!packagesNode?.children) {
    return items
  }

  const targetNode = packagesNode.children.find((item) => item.value === `packages-${packageKey}`)

  if (!targetNode) {
    return items
  }

  const packageChildren = targetNode.children ?? []

  if (packageChildren.length === 0) {
    return [targetNode]
  }

  // Never expose version nodes in the sidebar UI.
  // We pick the branch that contains the active page, then return its children directly.
  const activeVersionNode = packageChildren.find((child) => subtreeHasValue(child, activePageId))
  const fallbackVersionNode = packageChildren[0]
  const resolvedVersionNode = activeVersionNode ?? fallbackVersionNode
  const versionChildren = resolvedVersionNode.children ?? []

  if (versionChildren.length > 0) {
    return versionChildren
  }

  return packageChildren
}

const sidebarItems = computed(() => {
  if (!currentPackageKey.value) {
    return docsSidebar
  }

  return getSidebarItemsForPackage(docsSidebar, currentPackageKey.value, currentPage.value.id)
})

const sidebarProps = computed(() => ({
  site: docsSite,
  page: currentPageMeta.value,
  items: sidebarItems.value
}))
const asideProps = computed(() => ({
  site: docsSite,
  page: currentPageMeta.value,
  items: currentPage.value.tableOfContents
}))

const { activeId } = useTableOfContents({
  items: computed(() => currentPage.value.tableOfContents),
  offset: computed(() => tocScrollOffset.value)
})

function isVisibleElement(element: HTMLElement | null): element is HTMLElement {
  return Boolean(element && element.offsetParent !== null)
}

function computeStickyOffsetTop(): number {
  if (typeof document === 'undefined') {
    return docsScrollOffset
  }

  const header = document.querySelector<HTMLElement>('.vf-document-layout__header')
  const layoutSubheader = document.querySelector<HTMLElement>('.vf-document-layout__subheader')
  const contentSubheader = document.querySelector<HTMLElement>('.vf-document-layout__content-subheader')
  const topGap = 16
  let offset = topGap

  if (isVisibleElement(header)) {
    offset += header.getBoundingClientRect().height
  }

  if (isVisibleElement(layoutSubheader)) {
    offset += layoutSubheader.getBoundingClientRect().height
  }

  if (isVisibleElement(contentSubheader)) {
    offset += contentSubheader.getBoundingClientRect().height
  }

  return offset
}

async function syncTocScrollOffset(): Promise<void> {
  await nextTick()
  tocScrollOffset.value = computeStickyOffsetTop()
}

const findTopLevelActiveIndex = (items: VfNavMenuItem[], value: string): number =>
  items.findIndex((item) => {
    if (item.value === value) {
      return true
    }

    const stack = [...(item.children ?? [])]

    while (stack.length > 0) {
      const current = stack.shift()

      if (!current) {
        continue
      }

      if (current.value === value) {
        return true
      }

      if (current.children) {
        stack.push(...current.children)
      }
    }

    return false
  })

const updateSidebarIndicator = () => {
  const root = sidebarNavRoot.value
  const topLevelIndex = findTopLevelActiveIndex(sidebarItems.value, currentPage.value.id)

  if (!root || topLevelIndex === -1) {
    sidebarIndicatorVisible.value = false
    return
  }

  const navMenu = root.querySelector<HTMLElement>('.vf-nav-menu')

  if (!navMenu) {
    sidebarIndicatorVisible.value = false
    return
  }

  const topLevelNodes = navMenu.querySelectorAll<HTMLElement>(
    ':scope > .vf-nav-menu__list > .vf-nav-menu__node'
  )
  const activeNode = topLevelNodes.item(topLevelIndex)

  if (!activeNode) {
    sidebarIndicatorVisible.value = false
    return
  }

  const rootRect = root.getBoundingClientRect()
  const activeNodeRect = activeNode.getBoundingClientRect()

  sidebarIndicatorTop.value = activeNodeRect.top - rootRect.top
  sidebarIndicatorHeight.value = activeNodeRect.height
  sidebarIndicatorVisible.value = true
}

const updateTocIndicator = () => {
  const root = tocRoot.value

  if (!root) {
    tocIndicatorVisible.value = false
    return
  }

  const activeLink = root.querySelector<HTMLElement>('.vf-table-of-contents__link--active')

  if (!activeLink) {
    tocIndicatorVisible.value = false
    return
  }

  const rootRect = root.getBoundingClientRect()
  const activeLinkRect = activeLink.getBoundingClientRect()

  tocIndicatorTop.value = activeLinkRect.top - rootRect.top
  tocIndicatorHeight.value = activeLinkRect.height
  tocIndicatorVisible.value = true
}

const syncTocIndicator = async () => {
  await nextTick()
  updateTocIndicator()
}

const syncSidebarIndicator = async () => {
  await nextTick()
  updateSidebarIndicator()
}

const animateSidebarIndicator = async () => {
  suppressSidebarObserverReset = true
  sidebarIndicatorAnimated.value = true
  await syncSidebarIndicator()

  if (sidebarIndicatorAnimationTimeout) {
    clearTimeout(sidebarIndicatorAnimationTimeout)
  }

  sidebarIndicatorAnimationTimeout = setTimeout(() => {
    sidebarIndicatorAnimated.value = false
    suppressSidebarObserverReset = false
    sidebarIndicatorAnimationTimeout = null
  }, 320)
}

const handleWindowResize = () => {
  updateSidebarIndicator()
  updateTocIndicator()
  void syncTocScrollOffset()
}

onMounted(() => {
  void syncTocScrollOffset()
  void animateSidebarIndicator()
  void syncTocIndicator()
  sidebarResizeObserver = new ResizeObserver(() => {
    if (!suppressSidebarObserverReset) {
      sidebarIndicatorAnimated.value = false
    }

    updateSidebarIndicator()
  })
  sidebarMutationObserver = new MutationObserver(() => {
    if (!suppressSidebarObserverReset) {
      sidebarIndicatorAnimated.value = false
    }

    updateSidebarIndicator()
  })

  if (sidebarNavRoot.value) {
    sidebarResizeObserver.observe(sidebarNavRoot.value)
    sidebarMutationObserver.observe(sidebarNavRoot.value, {
      attributes: true,
      childList: true,
      subtree: true
    })
  }

  window.addEventListener('resize', handleWindowResize)
})

onBeforeUnmount(() => {
  if (sidebarIndicatorAnimationTimeout) {
    clearTimeout(sidebarIndicatorAnimationTimeout)
  }

  suppressSidebarObserverReset = false
  sidebarResizeObserver?.disconnect()
  sidebarMutationObserver?.disconnect()
  window.removeEventListener('resize', handleWindowResize)
})

watch(
  () => [route.path, activeId.value, currentPage.value.tableOfContents.length],
  () => {
    if (isContentOnlyRoute.value) {
      sidebarIndicatorVisible.value = false
      tocIndicatorVisible.value = false
      return
    }

    void animateSidebarIndicator()
    void syncTocIndicator()
    void syncTocScrollOffset()
  },
  { flush: 'post' }
)

watch(
  () => [isXlUp.value, isHomeRoute.value, showContentSubheader.value],
  () => {
    void syncTocScrollOffset()
  },
  { flush: 'post' }
)

watch(
  () => route.path,
  () => {
    isMobileSidebarOpen.value = false
    isMobileTocOpen.value = false
  }
)

watch(isMobileSidebarOpen, (open) => {
  if (open) {
    isMobileTocOpen.value = false
  }
})

watch(isMobileTocOpen, (open) => {
  if (open) {
    isMobileSidebarOpen.value = false
  }
})

function handleMobileTocClick(event: MouseEvent) {
  const target = event.target as HTMLElement | null
  const link = target?.closest<HTMLAnchorElement>('.vf-table-of-contents__link')

  if (!link) {
    return
  }

  const href = link.getAttribute('href')

  if (!href) {
    return
  }

  event.preventDefault()
  isMobileTocOpen.value = false
  void router.push(href)
}

useHead(() => ({
  title: pageHeadTitle.value,
  link: [
    {
      rel: 'icon',
      type: 'image/svg+xml',
      href: faviconHref.value
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      href: '/favicon-32x32.png'
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '192x192',
      href: '/favicon-192x192.png'
    },
    {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      href: '/apple-touch-icon.png'
    }
  ]
}))
</script>

<template>
  <VfThemeProvider>
    <VfDocumentLayout
      :layout="shellLayout"
      :fill-viewport="docsLayout.fillViewport"
      :sticky-header="docsLayout.stickyHeader"
      :sticky-sidebar="docsLayout.stickySidebar"
      :sticky-aside="docsLayout.stickyAside"
      :edge-notches="docsLayout.edgeNotches"
      :show-content-subheader="showContentSubheader"
    >
      <template #header>
        <component
          :is="docsComponents.Header"
          v-if="docsComponents.Header"
          v-bind="headerProps"
        />
        <DocsDefaultHeader
          v-else
          :site="headerSite"
          :search-items="docsSearchIndex"
          :brand-component="docsComponents.Brand"
          :header-nav-component="docsComponents.HeaderNav"
          :header-nav-items="docsHeaderNav.items"
          :header-nav-aria-label="docsHeaderNav.ariaLabel"
          :mobile-nav-items="docsHeaderNav.items"
          :mobile-nav-aria-label="docsHeaderNav.ariaLabel"
        />
      </template>

      <template #content-subheader>
        <div class="docs-content-subheader">
          <VfButton
            v-if="!isLgUp"
            size="sm"
            variant="ghost"
            class="docs-content-subheader__action"
            @click="isMobileSidebarOpen = true"
          >
            <span class="docs-content-subheader__action-content">
              <VueIconify :icon="icons.bars" :size="14" aria-hidden="true" />
              <span>Navigation</span>
            </span>
          </VfButton>
          <VfButton
            v-if="hasMobileToc"
            size="sm"
            variant="ghost"
            class="docs-content-subheader__action"
            @click="isMobileTocOpen = true"
          >
            <span class="docs-content-subheader__action-content">
              <VueIconify :icon="icons.fileText" :size="14" aria-hidden="true" />
              <span>On this page</span>
            </span>
          </VfButton>
        </div>
      </template>

      <template v-if="!isContentOnlyRoute" #sidebar>
        <VfStack gap="1rem">
          <component
            :is="docsComponents.SidebarTop"
            v-if="docsComponents.SidebarTop"
            v-bind="sidebarProps"
          />
          <div ref="sidebarNavRoot" class="docs-sidebar-nav">
            <div class="docs-page-toc__label">Navigation</div>
            <div
              v-if="sidebarIndicatorVisible"
              class="docs-sidebar-nav__indicator"
              :class="{ 'docs-sidebar-nav__indicator--animated': sidebarIndicatorAnimated }"
              :style="{
                transform: `translateY(${sidebarIndicatorTop}px)`,
                height: `${sidebarIndicatorHeight}px`
              }"
            />
            <VfNavMenu :items="sidebarItems" :model-value="currentPage.id" />
          </div>
          <component
            :is="docsComponents.SidebarBottom"
            v-if="docsComponents.SidebarBottom"
            v-bind="sidebarProps"
          />
        </VfStack>
      </template>

      <template #default>
        <RouterView />
      </template>

      <template v-if="!isContentOnlyRoute" #aside>
        <VfStack gap="1rem">
          <component
            :is="docsComponents.AsideTop"
            v-if="docsComponents.AsideTop"
            v-bind="asideProps"
          />
          <div
            v-if="currentPage.tableOfContents.length > 0"
            ref="tocRoot"
            class="docs-page-toc"
          >
            <div class="docs-page-toc__label">On this page</div>
            <div
              v-if="tocIndicatorVisible"
              class="docs-page-toc__indicator"
              :style="{
                transform: `translateY(${tocIndicatorTop}px)`,
                height: `${tocIndicatorHeight}px`
              }"
            />
            <VfTableOfContents
              :items="currentPage.tableOfContents"
              :active-id="activeId"
              label="On this page"
              smooth
              :scroll-offset="tocScrollOffset"
            />
          </div>
          <component
            :is="docsComponents.AsideBottom"
            v-if="docsComponents.AsideBottom"
            v-bind="asideProps"
          />
        </VfStack>
      </template>

      <template #footer>
        <component
          :is="docsComponents.Footer"
          v-if="docsComponents.Footer"
          v-bind="footerProps"
        />
        <div v-else class="docs-footer">
          <span>{{ docsFooter.left }}</span>
          <span v-if="docsFooter.right">{{ docsFooter.right }}</span>
        </div>
      </template>
    </VfDocumentLayout>

    <VfDrawer
      :open="isMobileSidebarOpen"
      placement="left"
      size="sm"
      dividers
      @update:open="isMobileSidebarOpen = $event"
    >
      <template #header>
        <div class="docs-page-toc__label docs-header-drawer__label">Navigation</div>
      </template>

      <template #default>
        <div class="docs-header-drawer">
          <VfNavMenu :items="sidebarItems" :model-value="currentPage.id" aria-label="Documentation navigation" />
        </div>
      </template>
    </VfDrawer>

    <VfDrawer
      :open="isMobileTocOpen"
      placement="right"
      size="sm"
      dividers
      @update:open="isMobileTocOpen = $event"
    >
      <template #header>
        <div class="docs-page-toc__label docs-header-drawer__label">On this page</div>
      </template>

      <template #default>
        <div class="docs-header-drawer" @click.capture="handleMobileTocClick">
          <VfTableOfContents
            v-if="hasMobileToc"
            :items="mobileTocItems"
            :active-id="activeId"
            label="On this page"
            smooth
            :scroll-offset="tocScrollOffset"
          />
        </div>
      </template>
    </VfDrawer>
  </VfThemeProvider>
</template>
