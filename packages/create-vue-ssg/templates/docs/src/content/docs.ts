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

export type { DocsContentBlock, DocsPage }

export const docsPages = resolvedDocsContent.docsPages
export const docsSidebar = resolvedDocsContent.docsSidebar
export const docsSite = resolvedDocsContent.docsSite
export const docsLayout = resolvedDocsContent.docsLayout
export const docsFooter = resolvedDocsContent.docsFooter
export const docsHome = resolvedDocsContent.docsHome
export const docsHeaderNav = resolvedDocsContent.docsHeaderNav
export const docsComponents = resolvedDocsContent.docsComponents
export const docsSiteTitle = resolvedDocsContent.docsSiteTitle
export const docsScrollOffset = resolvedDocsContent.docsScrollOffset

export const getDocsPageByPath = resolvedDocsContent.getDocsPageByPath
