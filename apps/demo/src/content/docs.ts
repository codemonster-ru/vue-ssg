import docsConfig from '../../ssg.config'
import {
  resolveDocsContent,
  type DocsContentBlock,
  type DocsPage
} from '@codemonster-ru/vue-ssg-core'

const markdownFiles = import.meta.glob('../../content/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true
}) as Record<string, string>

const resolvedDocsContent = resolveDocsContent({
  docsConfig,
  markdownFiles
})

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

interface DocsSearchItem {
  title: string
  breadcrumb: string
  snippet: string
  to: string
  keywords?: string
}

function toPageShell(page: DocsPage): DocsPageShell {
  return {
    id: page.id,
    path: page.path,
    sourcePath: page.sourcePath,
    isIndexPage: page.isIndexPage,
    title: page.title,
    navTitle: page.navTitle,
    description: page.description,
    order: page.order,
    section: page.section
  }
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

const docsPagePayloadById = new Map<string, Pick<DocsPage, 'blocks' | 'tableOfContents'>>()
const docsPagesByPath = new Map<string, DocsPageShell>()
const docsPages: DocsPageShell[] = resolvedDocsContent.docsPages.map((page) => {
  docsPagePayloadById.set(page.id, {
    blocks: page.blocks,
    tableOfContents: page.tableOfContents
  })
  return toPageShell(page)
})

for (const page of docsPages) {
  docsPagesByPath.set(page.path, page)
}

const docsSearchIndex: DocsSearchItem[] = resolvedDocsContent.docsPages.flatMap((page) => {
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

let docsSearchIndexPromise: Promise<DocsSearchItem[]> | null = null

export type { DocsContentBlock, DocsPage }

export { docsPages }
export const docsSidebar = resolvedDocsContent.docsSidebar
export const docsSite = resolvedDocsContent.docsSite
export const docsLayout = resolvedDocsContent.docsLayout
export const docsFooter = resolvedDocsContent.docsFooter
export const docsHome = resolvedDocsContent.docsHome
export const docsHeaderNav = resolvedDocsContent.docsHeaderNav
export const docsComponents = resolvedDocsContent.docsComponents
export const docsSiteTitle = resolvedDocsContent.docsSiteTitle
export const docsScrollOffset = resolvedDocsContent.docsScrollOffset

export function getDocsPageByPath(pathname: string): DocsPageShell {
  return docsPagesByPath.get(pathname) ?? docsPages[0]
}

export async function loadDocsPageByPath(pathname: string): Promise<DocsPage | undefined> {
  const pageShell = getDocsPageByPath(pathname)
  const payload = docsPagePayloadById.get(pageShell.id)

  if (!payload) {
    return undefined
  }

  return {
    ...pageShell,
    blocks: payload.blocks,
    tableOfContents: payload.tableOfContents
  }
}

export function loadDocsSearchIndex(): Promise<DocsSearchItem[]> {
  if (!docsSearchIndexPromise) {
    docsSearchIndexPromise = Promise.resolve(docsSearchIndex)
  }

  return docsSearchIndexPromise
}
