import { createDocsRoutesFromManifest } from '@codemonster-ru/vue-ssg-core'
import DocsHomeView from '@/views/DocsHomeView.vue'
import DocsNotFoundView from '@/views/DocsNotFoundView.vue'
import DocsPageView from '@/views/DocsPageView.vue'
import { docsHome, docsPages } from '@/content/docs'

const docsRoutes = docsPages.map((page) => ({
  id: page.id,
  path: page.path,
  sourcePath: page.sourcePath,
  isIndexPage: page.isIndexPage,
  title: page.title,
  navTitle: page.navTitle,
  description: page.description,
  order: page.order,
  section: page.section
}))

export const routes = createDocsRoutesFromManifest({
  docsRoutes,
  homeEnabled: docsHome.enabled,
  homeComponent: DocsHomeView,
  pageComponent: DocsPageView,
  notFoundComponent: DocsNotFoundView
})
