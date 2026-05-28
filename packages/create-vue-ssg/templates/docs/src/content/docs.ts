import docsConfig from '../../ssg.config'
import shellManifest from './generated/docs-shell-manifest.json'
import routeManifest from './generated/docs-route-manifest.json'
import type { DocsContentBlock } from '@codemonster-ru/vue-ssg-core'
import type { VfNavMenuItem, VfTableOfContentsItem } from '@codemonster-ru/vueforge-core'
import type {
  DocsComponentsConfig,
  DocsFooterConfig,
  DocsHeaderNavConfig,
  DocsHomeConfig,
  DocsLayoutConfig,
  DocsSiteConfig
} from './config'

export interface DocsPage {
  id: string
  path: string
  sourcePath: string
  isIndexPage: boolean
  title: string
  navTitle: string
  description?: string
  order: number
  section: string[]
  blocks: DocsContentBlock[]
  tableOfContents: VfTableOfContentsItem[]
}
export type { DocsContentBlock }

export interface DocsPageShell {
  id: string
  path: string
  sourcePath: string
  isIndexPage: boolean
  title: string
  navTitle: string
  description?: string
  order: number
  section: string[]
}

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

interface DocsSearchItem {
  title: string
  breadcrumb: string
  snippet: string
  to: string
  keywords?: string
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

  return restPath ? `/${packageKey}/${restPath}` : `/${packageKey}/`
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

const docsPages: DocsPageShell[] = (routeManifest.docsRoutes as DocsPageShell[]).map((page) => ({
  ...page,
  path: toPublicDocsPath(page.path)
}))

const docsPagesByPath = new Map<string, DocsPageShell>()

for (const page of docsPages) {
  docsPagesByPath.set(page.path, page)
  docsPagesByPath.set(normalizePath(page.path), page)
}

const docsSidebar = mapSidebarToPublicPaths(shellManifest.docsSidebar as VfNavMenuItem[])

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

function toTitleCase(value: string): string {
  return value
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

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

const pagePayloadModules = import.meta.glob('./generated/docs-page-payloads/*.json') as Record<string, () => Promise<unknown>>
const pagePayloadCache = new Map<string, Promise<{ blocks: DocsContentBlock[]; tableOfContents: VfTableOfContentsItem[] } | undefined>>()

function getPayloadModulePath(routeId: string): string {
  return `./generated/docs-page-payloads/${routeId}.json`
}

export function getDocsPageByPath(pathname: string): DocsPageShell {
  const normalizedPath = toPublicDocsPath(pathname)

  return docsPagesByPath.get(normalizedPath) ?? docsPages[0]
}

export function loadDocsPagePayload(routeId: string): Promise<{ blocks: DocsContentBlock[]; tableOfContents: VfTableOfContentsItem[] } | undefined> {
  const cached = pagePayloadCache.get(routeId)

  if (cached) {
    return cached
  }

  const moduleLoader = pagePayloadModules[getPayloadModulePath(routeId)]

  if (!moduleLoader) {
    const missing = Promise.resolve(undefined)
    pagePayloadCache.set(routeId, missing)
    return missing
  }

  const pending = moduleLoader()
    .then((module) => {
      const data = (module as { default?: { blocks?: DocsContentBlock[]; tableOfContents?: VfTableOfContentsItem[] } }).default

      if (!data) {
        return undefined
      }

      return {
        blocks: data.blocks ?? [],
        tableOfContents: data.tableOfContents ?? []
      }
    })

  pagePayloadCache.set(routeId, pending)
  return pending
}

export async function loadDocsPageByPath(pathname: string): Promise<DocsPage | undefined> {
  const page = getDocsPageByPath(pathname)
  const payload = await loadDocsPagePayload(page.id)

  if (!payload) {
    return undefined
  }

  return {
    ...page,
    blocks: payload.blocks,
    tableOfContents: payload.tableOfContents
  }
}

const searchIndexModules = import.meta.glob('./generated/docs-search-index.json') as Record<string, () => Promise<unknown>>
let docsSearchIndexPromise: Promise<DocsSearchItem[]> | null = null

export function loadDocsSearchIndex(): Promise<DocsSearchItem[]> {
  if (docsSearchIndexPromise) {
    return docsSearchIndexPromise
  }

  const loader = searchIndexModules['./generated/docs-search-index.json']

  if (!loader) {
    docsSearchIndexPromise = Promise.resolve([])
    return docsSearchIndexPromise
  }

  docsSearchIndexPromise = loader().then((module) => {
    const data = (module as { default?: DocsSearchItem[] }).default
    return Array.isArray(data) ? data : []
  })

  return docsSearchIndexPromise
}

export { docsPages, docsSidebar }
export const docsSite = shellManifest.docsSite as DocsSiteConfig
export const docsLayout = shellManifest.docsLayout as Required<DocsLayoutConfig>
export const docsFooter = shellManifest.docsFooter as DocsFooterConfig
export const docsHome = shellManifest.docsHome as Required<DocsHomeConfig>
export const docsHeaderNav = shellManifest.docsHeaderNav as Required<DocsHeaderNavConfig>
export const docsComponents = (docsConfig.components ?? shellManifest.docsComponents) as DocsComponentsConfig
export const docsSiteTitle = shellManifest.docsSiteTitle
export const docsScrollOffset = shellManifest.docsScrollOffset
export const docsPackagesCatalog = docsPackages
