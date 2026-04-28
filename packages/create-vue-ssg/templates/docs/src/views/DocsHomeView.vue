<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { VfCard } from '@codemonster-ru/vueforge-core'
import { VueIconify, icons } from '@codemonster-ru/vueiconify'
import { docsComponents, docsHome, docsPackagesCatalog, docsPages, docsSite } from '@/content/docs'

interface DocsPackageCard {
  packageName: string
  packageDisplayName: string
  packageMark: string
  description: string
  to: string
}

const router = useRouter()

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, ' ')
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function toPackageDisplayName(packageName: string): string {
  const rawName = packageName.replace(/^@[^/]+\//, '').trim()

  if (!rawName) {
    return rawName
  }

  const acronymMap: Record<string, string> = {
    api: 'API',
    css: 'CSS',
    html: 'HTML',
    js: 'js',
    md: 'MD',
    mdx: 'MDX',
    ssg: 'SSG',
    ui: 'UI',
    ux: 'UX'
  }

  const formatToken = (token: string): string => {
    const normalized = token.trim()

    if (!normalized) {
      return ''
    }

    const lower = normalized.toLowerCase()
    if (acronymMap[lower]) {
      return acronymMap[lower]
    }

    return `${lower.charAt(0).toUpperCase()}${lower.slice(1)}`
  }

  return rawName
    .replace(/[_-]+/g, ' ')
    .split(/\s+/)
    .map((word) => word.split('.').map(formatToken).join('.'))
    .join(' ')
}

function toPackageMark(displayName: string): string {
  const words = displayName
    .replace(/[^\w.\s-]/g, ' ')
    .replace(/[._-]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)

  if (words.length === 0) {
    return 'PKG'
  }

  const normalize = (value: string) => value.replace(/[^a-zA-Z0-9]/g, '')
  const normalizedWords = words.map(normalize).filter(Boolean)

  if (normalizedWords.length === 0) {
    return 'PKG'
  }

  const mark = normalizedWords.length >= 3
    ? normalizedWords.slice(0, 3).map((word) => word.charAt(0)).join('')
    : normalizedWords.length === 2
      ? normalizedWords[0].charAt(0) + normalizedWords[1].slice(0, 2)
      : normalizedWords[0].slice(0, 3)

  const upper = mark.toUpperCase()
  if (upper.length >= 3) {
    return upper.slice(0, 3)
  }

  return upper.padEnd(3, 'X')
}

const packageCards = computed<DocsPackageCard[]>(() =>
  docsPackagesCatalog
    .flatMap((pkg) => {
      const packageRootPath = `/${pkg.packageKey}/`
      const packagePathPrefix = packageRootPath.replace(/\/$/, '')
      const packagePages = docsPages.filter((page) =>
        page.path === packageRootPath ||
        page.path === packagePathPrefix ||
        page.path.startsWith(packageRootPath)
      )

      if (packagePages.length === 0) {
        return []
      }

      const fallbackLanding = [...packagePages].sort((left, right) => {
        if (left.order !== right.order) {
          return left.order - right.order
        }

        return left.path.localeCompare(right.path)
      })[0]
      const explicitLandingPath = pkg.landingPath
        ? (pkg.landingPath === 'index' || pkg.landingPath === '.'
            ? packageRootPath
            : `${packagePathPrefix}/${pkg.landingPath}`)
        : null
      const explicitLanding = explicitLandingPath
        ? packagePages.find((page) => page.path === explicitLandingPath)
        : undefined
      const resolvedLanding = explicitLanding ?? fallbackLanding

      const summaryBlock = resolvedLanding.blocks.find((block) =>
        block.type === 'paragraph' || block.type === 'blockquote' || block.type === 'html'
      )
      const summaryText = normalizeText(
        summaryBlock && typeof summaryBlock !== 'string' && 'html' in summaryBlock
          ? stripHtml(summaryBlock.html)
          : ''
      )

      return [{
        packageName: pkg.packageName,
        packageDisplayName: toPackageDisplayName(pkg.packageName),
        packageMark: toPackageMark(toPackageDisplayName(pkg.packageName)),
        description: pkg.description || summaryText || 'Package documentation from the Codemonster ecosystem.',
        to: resolvedLanding.path
      }]
    })
)

function openPackageDocs(to: string): void {
  void router.push(to)
}
</script>

<template>
  <component
    :is="docsComponents.Home"
    v-if="docsComponents.Home"
    :site="docsSite"
  />

  <main v-else class="docs-home">
    <section
      class="docs-home__hero"
      :class="{
        'docs-home__hero--gridless': !docsHome.showGrid
      }"
    >
      <div class="docs-home__hero-copy">
        <h1>{{ docsHome.title }}</h1>
        <p>{{ docsHome.description }}</p>
      </div>
    </section>

    <section v-if="docsHome.showGrid && packageCards.length > 0" class="docs-home__packages">
      <div class="docs-home__packages-grid">
        <VfCard
          v-for="card in packageCards"
          :key="card.packageName"
          compact
          class="docs-home__package-card"
          tabindex="0"
          role="link"
          @click="openPackageDocs(card.to)"
          @keydown.enter.prevent="openPackageDocs(card.to)"
          @keydown.space.prevent="openPackageDocs(card.to)"
        >
          <template #header>
            <div class="docs-home__package-header">
              <div class="docs-home__package-mark">{{ card.packageMark }}</div>
              <h3 class="docs-home__package-title">{{ card.packageDisplayName }}</h3>
            </div>
          </template>

          <div class="docs-home__package-body">
            <p class="docs-home__package-description">{{ card.description }}</p>
            <div class="docs-home__package-arrow" aria-hidden="true">
              <VueIconify :icon="icons.arrowRightLong" :size="28" />
            </div>
          </div>
        </VfCard>
      </div>
    </section>
  </main>
</template>
