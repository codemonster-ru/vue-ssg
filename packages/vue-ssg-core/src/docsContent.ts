import { Parser, type Tokens, marked } from 'marked'
import GithubSlugger from 'github-slugger'
import type { VfNavMenuItem, VfTableOfContentsItem } from '@codemonster-ru/vueforge-core'
import type {
  DocsComponentsConfig,
  DocsConfig,
  DocsFooterConfig,
  DocsHeaderNavConfig,
  DocsHomeConfig,
  DocsLayoutConfig,
  DocsSiteConfig
} from './config'

export type DocsContentBlock =
  | {
      type: 'heading'
      depth: 1 | 2 | 3 | 4 | 5 | 6
      id: string
      html: string
    }
  | {
      type: 'paragraph'
      html: string
    }
  | {
      type: 'code'
      code: string
      language: string
    }
  | {
      type: 'list'
      ordered: boolean
      items: string[]
    }
  | {
      type: 'blockquote'
      html: string
    }
  | {
      type: 'html'
      html: string
    }

export interface DocsPage {
  id: string
  path: string
  sourcePath: string
  title: string
  navTitle: string
  description?: string
  order: number
  section: string[]
  blocks: DocsContentBlock[]
  tableOfContents: VfTableOfContentsItem[]
}

interface Frontmatter {
  title?: string
  navTitle?: string
  description?: string
  order?: number
}

interface NavNode {
  label: string
  order: number
  path?: string
  children: Map<string, NavNode>
}

type TokensList = Tokens.Generic[]

export interface ResolveDocsContentInput {
  docsConfig: DocsConfig
  markdownFiles: Record<string, string>
}

export interface ResolvedDocsContent {
  docsPages: DocsPage[]
  docsSidebar: VfNavMenuItem[]
  docsSite: DocsSiteConfig
  docsLayout: Required<DocsLayoutConfig>
  docsFooter: DocsFooterConfig
  docsHome: Required<DocsHomeConfig>
  docsHeaderNav: Required<DocsHeaderNavConfig>
  docsComponents: DocsComponentsConfig
  docsSiteTitle: string
  docsScrollOffset: number
  getDocsPageByPath: (pathname: string) => DocsPage
}

function parseFrontmatter(source: string): { data: Frontmatter; content: string } {
  if (!source.startsWith('---\n')) {
    return { data: {}, content: source }
  }

  const frontmatterEnd = source.indexOf('\n---\n', 4)

  if (frontmatterEnd === -1) {
    return { data: {}, content: source }
  }

  const rawFrontmatter = source.slice(4, frontmatterEnd)
  const content = source.slice(frontmatterEnd + 5)
  const data: Frontmatter = {}

  for (const line of rawFrontmatter.split('\n')) {
    const separatorIndex = line.indexOf(':')

    if (separatorIndex === -1) {
      continue
    }

    const key = line.slice(0, separatorIndex).trim()
    const rawValue = line.slice(separatorIndex + 1).trim()
    const normalizedValue = rawValue.replace(/^['"]|['"]$/g, '')

    if (key === 'order') {
      const numericValue = Number(normalizedValue)
      data.order = Number.isFinite(numericValue) ? numericValue : 0
      continue
    }

    if (key === 'title' || key === 'navTitle' || key === 'description') {
      data[key] = normalizedValue
    }
  }

  return { data, content }
}

function toTitleCase(value: string): string {
  return value
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function normalizeDocPath(sourcePath: string): string {
  const relativePath = sourcePath.replace(/^.*\/(?:content|docs)\//, '').replace(/\.md$/, '')

  if (relativePath === 'index') {
    return '/'
  }

  if (relativePath.endsWith('/index')) {
    return `/${relativePath.replace(/\/index$/, '')}`
  }

  return `/${relativePath}`
}

function toValueFromPath(path: string): string {
  return path === '/' ? 'index' : path.replace(/^\//, '').replace(/\//g, '-')
}

function renderInline(tokens: Tokens.Generic[] | undefined): string {
  return Parser.parseInline(tokens ?? [])
}

function renderBlockTokens(tokens: TokensList | undefined): string {
  return Parser.parse(tokens ?? [])
}

function renderListItemTokens(tokens: TokensList | undefined): string {
  return Parser.parse(tokens ?? [])
}

function renderMarkdown(markdown: string, tocLevels: Set<number>): {
  blocks: DocsContentBlock[]
  tableOfContents: VfTableOfContentsItem[]
} {
  const tokens = marked.lexer(markdown) as TokensList
  const headingSlugger = new GithubSlugger()
  const tableOfContents: VfTableOfContentsItem[] = []
  const blocks: DocsContentBlock[] = []

  for (const token of tokens) {
    switch (token.type) {
      case 'space':
        break
      case 'heading': {
        const id = headingSlugger.slug(token.text)
        const html = renderInline(token.tokens)

        blocks.push({
          type: 'heading',
          depth: token.depth as 1 | 2 | 3 | 4 | 5 | 6,
          id,
          html
        })

        if (tocLevels.has(token.depth)) {
          tableOfContents.push({
            id,
            label: token.text,
            level: token.depth - 1
          })
        }
        break
      }
      case 'paragraph':
        blocks.push({
          type: 'paragraph',
          html: renderInline(token.tokens)
        })
        break
      case 'code':
        blocks.push({
          type: 'code',
          code: token.text,
          language: token.lang?.trim() || 'text'
        })
        break
      case 'list':
        blocks.push({
          type: 'list',
          ordered: token.ordered,
          items: token.items.map((item: Tokens.ListItem) => renderListItemTokens(item.tokens))
        })
        break
      case 'blockquote':
        blocks.push({
          type: 'blockquote',
          html: renderBlockTokens(token.tokens)
        })
        break
      default:
        blocks.push({
          type: 'html',
          html: renderBlockTokens([token])
        })
        break
    }
  }

  return { blocks, tableOfContents }
}

function parsePage(sourcePath: string, source: string, tocLevels: Set<number>): DocsPage {
  const { data: frontmatter, content } = parseFrontmatter(source)
  const path = normalizeDocPath(sourcePath)
  const pathSegments = path === '/' ? [] : path.replace(/^\//, '').split('/')
  const section = pathSegments.slice(0, -1)
  const filename = pathSegments[pathSegments.length - 1] ?? 'index'
  const fallbackTitle = filename === 'index' ? 'Overview' : toTitleCase(filename)
  const title = frontmatter.title?.trim() || fallbackTitle
  const navTitle = frontmatter.navTitle?.trim() || title
  const { blocks, tableOfContents } = renderMarkdown(content, tocLevels)

  return {
    id: toValueFromPath(path),
    path,
    sourcePath,
    title,
    navTitle,
    description: frontmatter.description?.trim(),
    order: frontmatter.order ?? 0,
    section,
    blocks,
    tableOfContents
  }
}

function sortNodes(nodes: NavNode[]): NavNode[] {
  return [...nodes].sort((left, right) => {
    if (left.order !== right.order) {
      return left.order - right.order
    }

    return left.label.localeCompare(right.label)
  })
}

function buildSidebar(pages: DocsPage[], docsConfig: DocsConfig): VfNavMenuItem[] {
  const root = new Map<string, NavNode>()

  for (const page of pages) {
    let current = root
    let currentPath = ''

    for (const segment of page.section) {
      currentPath = `${currentPath}/${segment}`
      const sectionConfig = docsConfig.sectionLabels?.[segment]

      if (!current.has(segment)) {
        current.set(segment, {
          label: sectionConfig?.label ?? toTitleCase(segment),
          order: sectionConfig?.order ?? 1_000,
          path: currentPath,
          children: new Map()
        })
      }

      current = current.get(segment)!.children
    }

    current.set(page.id, {
      label: page.navTitle,
      order: page.order,
      path: page.path,
      children: new Map()
    })
  }

  const toItems = (nodes: Map<string, NavNode>): VfNavMenuItem[] =>
    sortNodes([...nodes.values()]).map((node) => {
      const item: VfNavMenuItem = {
        value: toValueFromPath(node.path ?? node.label),
        label: node.label
      }

      const children = toItems(node.children)

      if (children.length > 0) {
        item.children = children
      } else if (node.path) {
        item.to = node.path
      }

      return item
    })

  return toItems(root)
}

export function resolveDocsContent({ docsConfig, markdownFiles }: ResolveDocsContentInput): ResolvedDocsContent {
  const tocLevels = new Set(docsConfig.toc?.levels ?? [2, 3, 4])

  const docsPages = Object.entries(markdownFiles)
    .map(([sourcePath, source]) => parsePage(sourcePath, source, tocLevels))
    .filter((page) => page.path !== '/')
    .sort((left, right) => left.path.localeCompare(right.path))

  const docsSidebar = buildSidebar(docsPages, docsConfig)
  const docsSite: DocsSiteConfig = {
    title: docsConfig.site?.title ?? docsConfig.title ?? 'docs',
    description: docsConfig.site?.description,
    githubUrl: docsConfig.site?.githubUrl,
    homeTo: docsConfig.site?.homeTo ?? '/',
    favicon: docsConfig.site?.favicon,
    logo: docsConfig.site?.logo,
    logoLabel: docsConfig.site?.logoLabel
  }
  const docsLayout: Required<DocsLayoutConfig> = {
    variant: docsConfig.layout?.variant ?? 'sidebar-content-aside',
    fillViewport: docsConfig.layout?.fillViewport ?? true,
    stickyHeader: docsConfig.layout?.stickyHeader ?? true,
    stickySidebar: docsConfig.layout?.stickySidebar ?? true,
    stickyAside: docsConfig.layout?.stickyAside ?? true,
    edgeNotches: docsConfig.layout?.edgeNotches ?? false,
    hideSidebarOnMobile: docsConfig.layout?.hideSidebarOnMobile ?? true,
    hideAsideOnMobile: docsConfig.layout?.hideAsideOnMobile ?? true
  }
  const docsFooter: DocsFooterConfig = {
    left: docsConfig.footer?.left ?? 'Codemonster documentation',
    right: docsConfig.footer?.right
  }
  const docsHome: Required<DocsHomeConfig> = {
    enabled: docsConfig.home?.enabled ?? true,
    title: docsConfig.home?.title ?? 'Build docs fast',
    description: docsConfig.home?.description ?? 'Write markdown, keep the same UI stack, and ship clean developer docs.',
    showGrid: docsConfig.home?.showGrid ?? true,
    primaryAction: docsConfig.home?.primaryAction ?? {
      label: 'Get Started',
      to: '/guide/installation'
    },
    secondaryAction: docsConfig.home?.secondaryAction ?? {
      label: 'View on GitHub',
      href: docsConfig.site?.githubUrl
    }
  }
  const docsHeaderNav: Required<DocsHeaderNavConfig> = {
    items: docsConfig.headerNav?.items ?? [],
    ariaLabel: docsConfig.headerNav?.ariaLabel ?? 'Header navigation'
  }
  const docsComponents: DocsComponentsConfig = docsConfig.components ?? {}
  const docsSiteTitle = docsSite.title
  const docsScrollOffset = docsConfig.toc?.scrollOffset ?? 96

  function getDocsPageByPath(pathname: string): DocsPage {
    const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/$/, '')

    return docsPages.find((page) => page.path === normalizedPath) ?? docsPages[0]
  }

  return {
    docsPages,
    docsSidebar,
    docsSite,
    docsLayout,
    docsFooter,
    docsHome,
    docsHeaderNav,
    docsComponents,
    docsSiteTitle,
    docsScrollOffset,
    getDocsPageByPath
  }
}
