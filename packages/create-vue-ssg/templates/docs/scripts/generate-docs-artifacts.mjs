import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolveDocsContent } from '@codemonster-ru/vue-ssg-core'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const contentDir = path.join(rootDir, 'content')
const generatedDir = path.join(rootDir, 'src/content/generated')
const payloadDir = path.join(generatedDir, 'docs-page-payloads')
const currentYear = new Date().getFullYear()
const { createJiti } = await import('jiti')
const jiti = createJiti(import.meta.url)
const { createDocsBaseConfig } = jiti('../ssg.base.config.ts')
const docsConfig = createDocsBaseConfig(currentYear)

async function collectMarkdownFiles(dir, acc = []) {
  const entries = await readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const absPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      await collectMarkdownFiles(absPath, acc)
      continue
    }

    if (entry.isFile() && entry.name.endsWith('.md')) {
      acc.push(absPath)
    }
  }

  return acc
}

function normalizePathForRuntime(value) {
  const normalizedPath = value.replace(/\\/g, '/')
  const match = normalizedPath.match(/^\/packages\/([^/]+)\/latest(?:\/(.+))?$/)

  if (!match) {
    return normalizedPath
  }

  const packageKey = match[1]
  const restPath = match[2]

  return restPath ? `/${packageKey}/${restPath}` : `/${packageKey}/`
}

function normalizeSidebarPaths(items) {
  return items.map((item) => {
    const next = { ...item }

    if (typeof next.to === 'string') {
      next.to = normalizePathForRuntime(next.to)
    }

    if (Array.isArray(next.children)) {
      next.children = normalizeSidebarPaths(next.children)
    }

    return next
  })
}

function normalizeSearchText(value) {
  return (value ?? '').replace(/\s+/g, ' ').trim()
}

function stripHtml(value) {
  return value.replace(/<[^>]*>/g, ' ')
}

function getPageSnippet(page) {
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

async function main() {
  const markdownPaths = await collectMarkdownFiles(contentDir)
  const markdownFiles = {}

  for (const markdownPath of markdownPaths) {
    const source = await readFile(markdownPath, 'utf8')
    const relative = path.relative(rootDir, markdownPath).replace(/\\/g, '/')
    markdownFiles[`../../${relative}`] = source
  }

  const resolved = resolveDocsContent({ docsConfig, markdownFiles })

  await rm(generatedDir, { recursive: true, force: true })
  await mkdir(payloadDir, { recursive: true })

  const shellManifest = {
    docsSidebar: normalizeSidebarPaths(resolved.docsSidebar),
    docsSite: resolved.docsSite,
    docsLayout: resolved.docsLayout,
    docsFooter: resolved.docsFooter,
    docsHome: resolved.docsHome,
    docsHeaderNav: resolved.docsHeaderNav,
    docsComponents: {},
    docsSiteTitle: resolved.docsSiteTitle,
    docsScrollOffset: resolved.docsScrollOffset
  }

  const docsRoutes = resolved.docsPages.map((page) => ({
    id: page.id,
    path: normalizePathForRuntime(page.path),
    sourcePath: page.sourcePath,
    isIndexPage: page.isIndexPage,
    title: page.title,
    navTitle: page.navTitle,
    description: page.description,
    order: page.order,
    section: page.section
  }))

  const searchIndex = resolved.docsPages.flatMap((page) => {
    const runtimePath = normalizePathForRuntime(page.path)
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

    const pageItem = {
      title: page.title,
      breadcrumb: sectionLabel || 'Documentation',
      snippet: pageSnippet,
      to: runtimePath,
      keywords: pageKeywords
    }

    const headingItems = page.tableOfContents.map((heading) => ({
      title: heading.label,
      breadcrumb: pageBreadcrumb,
      snippet: pageSnippet,
      to: `${runtimePath}#${heading.id}`,
      keywords: `${page.title} ${pageKeywords}`.trim()
    }))

    return [pageItem, ...headingItems]
  })

  for (const page of resolved.docsPages) {
    await writeFile(
      path.join(payloadDir, `${page.id}.json`),
      JSON.stringify({
        id: page.id,
        blocks: page.blocks,
        tableOfContents: page.tableOfContents
      })
    )
  }

  await writeFile(path.join(generatedDir, 'docs-shell-manifest.json'), JSON.stringify(shellManifest))
  await writeFile(path.join(generatedDir, 'docs-route-manifest.json'), JSON.stringify({ docsRoutes }))
  await writeFile(path.join(generatedDir, 'docs-search-index.json'), JSON.stringify(searchIndex))
}

await main()
