import type { Component } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import type { DocsPage } from './docsContent'

export interface CreateDocsRoutesInput {
  docsPages: DocsPage[]
  homeEnabled: boolean
  homeComponent: Component
  pageComponent: Component
  notFoundComponent?: Component
}

export function createDocsRoutes({
  docsPages,
  homeEnabled,
  homeComponent,
  pageComponent,
  notFoundComponent
}: CreateDocsRoutesInput): RouteRecordRaw[] {
  const docsPageRoutes: RouteRecordRaw[] = docsPages.map((page) => ({
    path: page.path,
    name: page.id,
    component: pageComponent
  }))

  const docsLandingRoute = [...docsPages].sort((left, right) => {
    if (left.order !== right.order) {
      return left.order - right.order
    }

    return left.path.localeCompare(right.path)
  })[0]

  const rootRoute: RouteRecordRaw = homeEnabled
    ? {
        path: '/',
        name: 'home',
        component: homeComponent
      }
    : docsLandingRoute
      ? {
          path: '/',
          name: 'home',
          redirect: docsLandingRoute.path
        }
      : {
          path: '/',
          name: 'home',
          component: homeComponent
        }

  const routes: RouteRecordRaw[] = [rootRoute, ...docsPageRoutes]

  if (notFoundComponent) {
    routes.push({
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: notFoundComponent
    })
  }

  return routes
}
