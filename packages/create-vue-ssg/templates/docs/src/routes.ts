import { createDocsRoutes } from '@codemonster-ru/vue-ssg-core'
import DocsHomeView from '@/views/DocsHomeView.vue'
import DocsNotFoundView from '@/views/DocsNotFoundView.vue'
import DocsPageView from '@/views/DocsPageView.vue'
import { docsHome, docsPages } from '@/content/docs'

export const routes = createDocsRoutes({
  docsPages,
  homeEnabled: docsHome.enabled,
  homeComponent: DocsHomeView,
  pageComponent: DocsPageView,
  notFoundComponent: DocsNotFoundView
})
