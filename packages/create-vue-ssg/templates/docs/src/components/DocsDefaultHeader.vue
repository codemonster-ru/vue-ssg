<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch, type Component } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import {
  VfBadge,
  VfCommandPalette,
  VfDrawer,
  VfIconButton,
  VfInput,
  VfMenuBar,
  VfNavMenu,
  VfTag,
  VfThemeSwitch,
  type VfNavMenuItem
} from '@codemonster-ru/vueforge-core'
import { VfInline, useBreakpoint } from '@codemonster-ru/vueforge-layouts'
import type { DocsSiteConfig } from '@/content/config'

const props = defineProps<{
  site: DocsSiteConfig
  searchItems?: DocsSearchItem[]
  brandComponent?: Component
  headerNavComponent?: Component
  headerNavItems?: VfNavMenuItem[]
  headerNavAriaLabel?: string
  mobileNavItems?: VfNavMenuItem[]
  mobileNavAriaLabel?: string
}>()

const route = useRoute()
const router = useRouter()
const isLgUp = useBreakpoint('lg')
const isMobileNavOpen = ref(false)
const isSearchPaletteOpen = ref(false)
const searchQuery = ref('')
const maxSearchItems = 24
const isApplePlatform = ref(false)

interface DocsSearchItem {
  title: string
  breadcrumb?: string
  snippet?: string
  keywords?: string
  to?: string
  href?: string
}

const brandStyle = computed(() => {
  if (!props.site.logo) {
    return undefined
  }

  return {
    '--docs-logo-width': toCssSize(props.site.logo.width),
    '--docs-logo-height': toCssSize(props.site.logo.height),
    '--docs-logo-color': 'var(--vf-color-primary)'
  }
})

function toCssSize(value: number | string | undefined): string | undefined {
  if (value == null || value === '') {
    return undefined
  }

  return typeof value === 'number' ? `${value}px` : value
}

const activeHeaderNavValue = computed(() => findActiveNavValue(props.headerNavItems ?? [], route.path))
const activeMobileNavValue = computed(() => findActiveNavValue(props.mobileNavItems ?? [], route.path))
const hasHeaderNav = computed(() => Boolean(props.headerNavComponent) || Boolean(props.headerNavItems?.length))
const hasMobileNav = computed(() => Boolean(props.mobileNavItems?.length))
const showHeaderNav = computed(() => hasHeaderNav.value && isLgUp.value)
const showMobileMenuButton = computed(() => hasMobileNav.value && !isLgUp.value)
const searchHotkeyLabel = computed(() => (isApplePlatform.value ? 'Cmd + K' : 'Ctrl + K'))
const filteredSearchItems = computed(() => {
  const items = props.searchItems ?? []
  const query = searchQuery.value.trim().toLowerCase()

  if (!query) {
    return []
  }

  const tokens = query.split(/\s+/).filter(Boolean)

  const scored = items
    .map((item) => {
      const title = (item.title ?? '').toLowerCase()
      const breadcrumb = (item.breadcrumb ?? '').toLowerCase()
      const snippet = (item.snippet ?? '').toLowerCase()
      const keywords = (item.keywords ?? '').toLowerCase()
      let score = 0

      for (const token of tokens) {
        if (title.includes(token)) {
          score += 6
        }

        if (breadcrumb.includes(token)) {
          score += 3
        }

        if (snippet.includes(token)) {
          score += 2
        }

        if (keywords.includes(token)) {
          score += 1
        }
      }

      return { item, score }
    })
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score || left.item.title.localeCompare(right.item.title))
    .slice(0, maxSearchItems)

  return scored.map((entry) => entry.item)
})

watch(
  () => route.path,
  () => {
    isMobileNavOpen.value = false
    isSearchPaletteOpen.value = false
  }
)

watch(isSearchPaletteOpen, (open) => {
  if (!open) {
    searchQuery.value = ''
  }
})

function openSearchPalette(): void {
  isSearchPaletteOpen.value = true
}

function handleGlobalSearchShortcut(event: KeyboardEvent): void {
  if (event.key.toLowerCase() !== 'k') {
    return
  }

  if (!event.metaKey && !event.ctrlKey) {
    return
  }

  event.preventDefault()
  openSearchPalette()
}

function handleSearchSelect(item: unknown): void {
  if (!item || typeof item !== 'object') {
    return
  }

  const candidate = item as DocsSearchItem

  if (typeof candidate.to === 'string') {
    void router.push(candidate.to)
    return
  }

  if (typeof candidate.href === 'string') {
    window.location.href = candidate.href
  }
}

function openGithubLink(): void {
  if (!props.site.githubUrl) {
    return
  }

  window.open(props.site.githubUrl, '_blank', 'noopener,noreferrer')
}

onMounted(() => {
  const platform = navigator.platform.toLowerCase()
  isApplePlatform.value = platform.includes('mac') || platform.includes('iphone') || platform.includes('ipad')
  window.addEventListener('keydown', handleGlobalSearchShortcut)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleGlobalSearchShortcut)
})

function findActiveNavValue(items: VfNavMenuItem[], pathname: string): string {
  const normalizedPath = pathname.replace(/\/$/, '') || '/'
  let matchedValue = ''
  let matchedLength = -1

  const visit = (nodes: VfNavMenuItem[]) => {
    for (const node of nodes) {
      if (typeof node.to === 'string') {
        const candidate = node.to.replace(/\/$/, '') || '/'
        const isExactMatch = normalizedPath === candidate
        const isNestedMatch = candidate !== '/' && normalizedPath.startsWith(`${candidate}/`)

        if ((isExactMatch || isNestedMatch) && candidate.length > matchedLength) {
          matchedValue = node.value
          matchedLength = candidate.length
        }
      }

      if (node.children?.length) {
        visit(node.children)
      }
    }
  }

  visit(items)
  return matchedValue
}
</script>

<template>
  <div class="docs-header" :class="{ 'docs-header--mobile': !isLgUp }">
    <div v-if="!isLgUp" class="docs-header__mobile-side docs-header__mobile-side--left">
      <component
        :is="brandComponent"
        v-if="brandComponent"
        :site="site"
      />

      <RouterLink v-else-if="site.homeTo" :to="site.homeTo" class="docs-header__brand" :style="brandStyle">
        <component
          :is="site.logo.component"
          v-if="site.logo?.component"
          class="docs-header__logo docs-header__logo--component"
          aria-hidden="true"
        />
        <img
          v-else-if="site.logo?.src"
          class="docs-header__logo"
          :src="site.logo.src"
          :alt="site.logo.alt ?? `${site.title} logo`"
        >
        <strong v-if="site.logo ? site.logoLabel : true">
          {{ site.logo ? site.logoLabel : site.title }}
        </strong>
        <VfTag v-if="!site.logo">docs</VfTag>
      </RouterLink>

      <VfInline v-else-if="!brandComponent" gap="0.85rem" align="center" class="docs-header__brand">
        <component
          :is="site.logo.component"
          v-if="site.logo?.component"
          class="docs-header__logo docs-header__logo--component"
          aria-hidden="true"
        />
        <img
          v-else-if="site.logo?.src"
          class="docs-header__logo"
          :style="brandStyle"
          :src="site.logo.src"
          :alt="site.logo.alt ?? `${site.title} logo`"
        >
        <strong v-if="site.logo ? site.logoLabel : true">
          {{ site.logo ? site.logoLabel : site.title }}
        </strong>
        <VfTag v-if="!site.logo">docs</VfTag>
      </VfInline>
    </div>

    <div v-if="isLgUp" class="docs-header__left">
      <component
        :is="brandComponent"
        v-if="brandComponent"
        :site="site"
      />

      <RouterLink v-else-if="site.homeTo" :to="site.homeTo" class="docs-header__brand" :style="brandStyle">
        <component
          :is="site.logo.component"
          v-if="site.logo?.component"
          class="docs-header__logo docs-header__logo--component"
          aria-hidden="true"
        />
        <img
          v-else-if="site.logo?.src"
          class="docs-header__logo"
          :src="site.logo.src"
          :alt="site.logo.alt ?? `${site.title} logo`"
        >
        <strong v-if="site.logo ? site.logoLabel : true">
          {{ site.logo ? site.logoLabel : site.title }}
        </strong>
        <VfTag v-if="!site.logo">docs</VfTag>
      </RouterLink>

      <VfInline v-else-if="!brandComponent" gap="0.85rem" align="center">
        <component
          :is="site.logo.component"
          v-if="site.logo?.component"
          class="docs-header__logo docs-header__logo--component"
          aria-hidden="true"
        />
        <img
          v-else-if="site.logo?.src"
          class="docs-header__logo"
          :style="brandStyle"
          :src="site.logo.src"
          :alt="site.logo.alt ?? `${site.title} logo`"
        >
        <strong v-if="site.logo ? site.logoLabel : true">
          {{ site.logo ? site.logoLabel : site.title }}
        </strong>
        <VfTag v-if="!site.logo">docs</VfTag>
      </VfInline>

      <div v-if="showHeaderNav" class="docs-header__nav">
        <component
          :is="headerNavComponent"
          v-if="headerNavComponent"
          :site="site"
          :items="headerNavItems ?? []"
          :active-value="activeHeaderNavValue"
        />

        <VfMenuBar
          v-else-if="headerNavItems?.length"
          class="docs-header__menu"
          :items="headerNavItems"
          :model-value="activeHeaderNavValue"
          :aria-label="headerNavAriaLabel"
        />
      </div>
    </div>

    <div class="docs-header__right">
      <VfInline v-if="isLgUp" gap="0.75rem" align="center">
        <VfInput
          class="docs-header__search"
          placeholder="search"
          leading-icon="magnifyingGlass"
          readonly
          @click="openSearchPalette"
          @keydown.enter.prevent="openSearchPalette"
          @keydown.space.prevent="openSearchPalette"
        >
          <template #trailing>
            <VfBadge class="docs-header__search-shortcut">{{ searchHotkeyLabel }}</VfBadge>
          </template>
        </VfInput>
        <VfThemeSwitch size="lg" static thumb-contrast="inverse" />
        <VfIconButton
          v-if="site.githubUrl"
          icon="github"
          variant="ghost"
          class="docs-header__github-button"
          aria-label="Open GitHub repository"
          @click="openGithubLink"
        />
      </VfInline>
      <VfInline v-else class="docs-header__mobile-actions" align="center">
        <VfIconButton
          icon="magnifyingGlass"
          variant="ghost"
          class="docs-header__mobile-search-button"
          aria-label="Search documentation"
          @click="openSearchPalette"
        />
        <VfIconButton
          v-if="showMobileMenuButton"
          icon="bars"
          variant="ghost"
          class="docs-header__mobile-nav-button"
          aria-label="Open navigation"
          @click="isMobileNavOpen = true"
        />
      </VfInline>
    </div>

    <VfDrawer
      :open="isMobileNavOpen"
      placement="left"
      size="full"
      dividers
      @update:open="isMobileNavOpen = $event"
    >
      <template #header>
        <component
          :is="brandComponent"
          v-if="brandComponent"
          class="docs-header-drawer__brand"
          :site="site"
        />

        <RouterLink
          v-else-if="site.homeTo"
          :to="site.homeTo"
          class="docs-header__brand docs-header-drawer__brand"
          :style="brandStyle"
        >
          <component
            :is="site.logo.component"
            v-if="site.logo?.component"
            class="docs-header__logo docs-header__logo--component"
            aria-hidden="true"
          />
          <img
            v-else-if="site.logo?.src"
            class="docs-header__logo"
            :src="site.logo.src"
            :alt="site.logo.alt ?? `${site.title} logo`"
          >
          <strong v-if="site.logo ? site.logoLabel : true">
            {{ site.logo ? site.logoLabel : site.title }}
          </strong>
        </RouterLink>

        <VfInline
          v-else-if="!brandComponent"
          gap="0.85rem"
          align="center"
          class="docs-header-drawer__brand"
        >
          <component
            :is="site.logo.component"
            v-if="site.logo?.component"
            class="docs-header__logo docs-header__logo--component"
            aria-hidden="true"
          />
          <img
            v-else-if="site.logo?.src"
            class="docs-header__logo"
            :style="brandStyle"
            :src="site.logo.src"
            :alt="site.logo.alt ?? `${site.title} logo`"
          >
          <strong v-if="site.logo ? site.logoLabel : true">
            {{ site.logo ? site.logoLabel : site.title }}
          </strong>
        </VfInline>
      </template>

      <template #default>
        <div class="docs-header-drawer">
          <VfNavMenu
            v-if="mobileNavItems?.length"
            :items="mobileNavItems"
            :model-value="activeMobileNavValue"
            :aria-label="mobileNavAriaLabel ?? 'Navigation'"
          />
        </div>
      </template>

      <template #footer>
        <div class="docs-header-drawer__footer">
          <VfIconButton
            v-if="site.githubUrl"
            icon="github"
            variant="ghost"
            class="docs-header__github-button docs-header__github-button--mobile"
            aria-label="Open GitHub repository"
            @click="openGithubLink"
          />
          <VfThemeSwitch size="lg" static thumb-contrast="inverse" />
        </div>
      </template>
    </VfDrawer>

    <VfCommandPalette
      v-model:open="isSearchPaletteOpen"
      v-model="searchQuery"
      title="Search"
      placeholder="search"
      :items="filteredSearchItems"
      idle-text="Start typing to search docs"
      empty-text="No results found"
      @select="handleSearchSelect"
    />
  </div>
</template>
