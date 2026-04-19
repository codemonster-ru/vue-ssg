import { createHead as createClientHead } from '@unhead/vue/client'
import { createHead as createServerHead } from '@unhead/vue/server'
import { createApp, createSSRApp, type Component } from 'vue'
import {
  createMemoryHistory,
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
  type Router
} from 'vue-router'

type CreateViteSsgContext = {
  app: ReturnType<typeof createApp>
  head: ReturnType<typeof createClientHead> | ReturnType<typeof createServerHead> | undefined
  initialState: Record<string, unknown>
  isClient: boolean
  onSSRAppRendered: (cb: () => void | Promise<void>) => void
  routePath?: string
  router: Router
  routes: RouteRecordRaw[]
  transformState?: (state: Record<string, unknown>) => Record<string, unknown>
  triggerOnSSRAppRendered: () => Promise<void[]>
}

type CreateViteSsgOptions = {
  hydration?: boolean
  rootContainer?: string
  useHead?: boolean
  transformState?: (state: Record<string, unknown>) => Record<string, unknown>
}

async function documentReady(): Promise<void> {
  if (typeof document === 'undefined' || document.readyState !== 'loading') {
    return
  }

  await new Promise<void>((resolve) => {
    document.addEventListener('DOMContentLoaded', () => resolve(), { once: true })
  })
}

async function nextFrame(): Promise<void> {
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
}

function isVisibleElement(element: HTMLElement | null): element is HTMLElement {
  return Boolean(element && element.offsetParent !== null)
}

function getStickyOffsetTop(): number {
  if (typeof document === 'undefined') {
    return 0
  }

  const header = document.querySelector<HTMLElement>('.vf-document-layout__header')
  const layoutSubheader = document.querySelector<HTMLElement>('.vf-document-layout__subheader')
  const contentSubheader = document.querySelector<HTMLElement>('.vf-document-layout__content-subheader')
  const topGap = 16
  let offset = topGap

  if (isVisibleElement(header)) {
    offset += header.getBoundingClientRect().height
  }

  if (isVisibleElement(layoutSubheader)) {
    offset += layoutSubheader.getBoundingClientRect().height
  }

  if (isVisibleElement(contentSubheader)) {
    offset += contentSubheader.getBoundingClientRect().height
  }

  return offset
}

function getInitialState(): Record<string, unknown> {
  if (typeof window === 'undefined') {
    return {}
  }

  return ((window as Window & { __INITIAL_STATE__?: Record<string, unknown> }).__INITIAL_STATE__ ?? {})
}

function ensureHistoryState(): void {
  if (typeof window === 'undefined') {
    return
  }

  if (window.history.state) {
    return
  }

  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`

  window.history.replaceState(
    {
      back: null,
      current,
      forward: null,
      position: window.history.length - 1,
      replaced: true,
      scroll: null
    },
    '',
    current
  )
}

export function createViteSsgApp(
  App: Component,
  routerOptions: { base?: string; routes: RouteRecordRaw[] },
  fn?: (context: CreateViteSsgContext) => Promise<void> | void,
  options?: CreateViteSsgOptions
) {
  const { rootContainer = '#app', transformState, useHead = true } = options ?? {}

  async function createSsgApp(routePath?: string): Promise<CreateViteSsgContext> {
    const app = import.meta.env.SSR || options?.hydration ? createSSRApp(App) : createApp(App)
    let head: CreateViteSsgContext['head']

    if (useHead) {
      head = import.meta.env.SSR ? createServerHead() : createClientHead()
      app.use(head)
    }

    const router = createRouter({
      history: import.meta.env.SSR
        ? createMemoryHistory(routerOptions.base)
        : createWebHistory(routerOptions.base),
      scrollBehavior: async (to, _from, savedPosition) => {
        if (savedPosition) {
          return savedPosition
        }

        if (to.hash) {
          const targetHash = decodeURIComponent(to.hash)

          await nextFrame()
          await nextFrame()

          const targetElement = document.querySelector<HTMLElement>(targetHash)

          if (targetElement) {
            const top = targetElement.getBoundingClientRect().top + window.scrollY - getStickyOffsetTop()

            return {
              left: 0,
              top: Math.max(0, top),
              behavior: 'smooth'
            }
          }
        }

        return { left: 0, top: 0 }
      },
      ...routerOptions
    })

    const appRenderCallbacks: Array<() => void | Promise<void>> = []
    const onSSRAppRendered = import.meta.env.SSR
      ? (cb: () => void | Promise<void>) => appRenderCallbacks.push(cb)
      : () => undefined
    const triggerOnSSRAppRendered = () => Promise.all(appRenderCallbacks.map((cb) => cb()))

    const context: CreateViteSsgContext = {
      app,
      head,
      initialState: {},
      isClient: !import.meta.env.SSR,
      onSSRAppRendered,
      routePath,
      router,
      routes: routerOptions.routes,
      transformState,
      triggerOnSSRAppRendered
    }

    if (!import.meta.env.SSR) {
      await documentReady()
      ensureHistoryState()
      context.initialState = transformState?.(getInitialState()) ?? getInitialState()
    }

    await fn?.(context)
    app.use(router)

    let entryRoutePath: string | undefined
    let isFirstRoute = true

    router.beforeEach((to) => {
      if (isFirstRoute || (entryRoutePath && entryRoutePath === to.path)) {
        isFirstRoute = false
        entryRoutePath = to.path
        to.meta.state = context.initialState
      }

      return true
    })

    if (import.meta.env.SSR) {
      const route = context.routePath ?? '/'
      await router.push(route)
      await router.isReady()
      context.initialState = (router.currentRoute.value.meta.state as Record<string, unknown>) || {}
    }

    return context
  }

  if (!import.meta.env.SSR) {
    ;(async () => {
      const { app, router } = await createSsgApp()
      await router.isReady()
      app.mount(rootContainer, true)
    })()
  }

  return createSsgApp
}
