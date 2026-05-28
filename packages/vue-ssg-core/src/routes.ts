import type { Component } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import type { DocsPageRouteMeta } from './docsContent'

export interface CreateDocsRoutesFromManifestInput {
  docsRoutes: DocsPageRouteMeta[]
  homeEnabled: boolean
  homeComponent: Component
  pageComponent: Component
  notFoundComponent?: Component
}

export function createDocsRoutesFromManifest({
  docsRoutes,
  homeEnabled,
  homeComponent,
  pageComponent,
  notFoundComponent
}: CreateDocsRoutesFromManifestInput): RouteRecordRaw[] {
  const docsPageRoutes: RouteRecordRaw[] = docsRoutes.map((page) => ({
    path: page.path,
    name: page.id,
    component: pageComponent
  }))

  const docsLandingRoute = [...docsRoutes].sort((left, right) => {
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
