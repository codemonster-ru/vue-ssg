import docsConfig from '../../ssg.config'
import {
  resolveDocsContent,
  type DocsContentBlock,
  type DocsPage
} from '@codemonster-ru/vue-ssg-core'
import type { VfNavMenuItem } from '@codemonster-ru/vueforge-core'

const markdownFiles = import.meta.glob('../../content/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true
}) as Record<string, string>

const packageMetadataFiles = import.meta.glob('../../content/**/metadata.json', {
  import: 'default',
  eager: true
}) as Record<string, {
  package?: string
  description?: string
  latest?: string
  repo?: string
  landingPath?: string
}>

const resolvedDocsContent = resolveDocsContent({
  docsConfig,
  markdownFiles
})

export interface DocsPackage {
  packageName: string
  description?: string
  pathBase: string
  landingPath?: string
  latest: string
  repo?: string
  slug: string
  packageKey: string
}

function toTitleCase(value: string): string {
  return value
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function normalizePath(pathname: string): string {
  if (pathname === '/') {
    return pathname
  }

  return pathname.replace(/\/+$/, '')
}

export function toPublicDocsPath(pathname: string): string {
  const normalizedPath = normalizePath(pathname)
  const match = normalizedPath.match(/^\/packages\/([^/]+)\/latest(?:\/(.+))?$/)

  if (!match) {
    return normalizedPath
  }

  const packageKey = match[1]
  const restPath = match[2]

  return restPath ? `/${packageKey}/${restPath}` : `/${packageKey}`
}

function mapSidebarToPublicPaths(items: VfNavMenuItem[]): VfNavMenuItem[] {
  return items.map((item) => {
    const nextItem: VfNavMenuItem = {
      ...item
    }

    if (typeof item.to === 'string') {
      nextItem.to = toPublicDocsPath(item.to)
    }

    if (item.children) {
      nextItem.children = mapSidebarToPublicPaths(item.children)
    }

    return nextItem
  })
}

const docsPages: DocsPage[] = resolvedDocsContent.docsPages.map((page) => ({
  ...page,
  path: toPublicDocsPath(page.path)
}))

const docsPagesByPath = new Map(docsPages.map((page) => [page.path, page] as const))

const docsSidebar = mapSidebarToPublicPaths(resolvedDocsContent.docsSidebar)

const docsPackages: DocsPackage[] = Object.entries(packageMetadataFiles)
  .flatMap(([sourcePath, metadata]) => {
    const normalizedSourcePath = sourcePath.replace(/\\/g, '/')
    const match = normalizedSourcePath.match(/\/content\/(.+)\/metadata\.json$/)

    if (!match) {
      return []
    }

    const slug = match[1]
    const latest = (metadata.latest ?? 'latest').trim() || 'latest'
    const landingPath = typeof metadata.landingPath === 'string'
      ? metadata.landingPath.trim().replace(/^\/+|\/+$/g, '')
      : undefined
    const slugMatch = slug.match(/^packages\/([^/]+)$/)
    const slugSegments = slug.split('/')
    const slugTail = slugSegments[slugSegments.length - 1] || slug
    const packageKey = slugMatch?.[1] ?? slugTail
    const fallbackName = slugTail

    return [{
      packageName: metadata.package?.trim() || toTitleCase(fallbackName),
      description: metadata.description?.trim(),
      pathBase: `/${packageKey}`,
      landingPath,
      latest,
      repo: metadata.repo,
      slug,
      packageKey
    }]
  })
  .sort((left, right) => left.packageName.localeCompare(right.packageName))

export type { DocsContentBlock, DocsPage }

export { docsPages, docsSidebar }
export const docsSite = resolvedDocsContent.docsSite
export const docsLayout = resolvedDocsContent.docsLayout
export const docsFooter = resolvedDocsContent.docsFooter
export const docsHome = resolvedDocsContent.docsHome
export const docsHeaderNav = resolvedDocsContent.docsHeaderNav
export const docsComponents = resolvedDocsContent.docsComponents
export const docsSiteTitle = resolvedDocsContent.docsSiteTitle
export const docsScrollOffset = resolvedDocsContent.docsScrollOffset
export const docsPackagesCatalog = docsPackages

export function getDocsPageByPath(pathname: string): DocsPage {
  const normalizedPath = toPublicDocsPath(pathname)

  return docsPagesByPath.get(normalizedPath) ?? docsPages[0]
}
