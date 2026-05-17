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

let isClientAppMounted = false
const hashScrollWaitMs = 4000
const hashScrollStabilizeFrames = 10

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

function getHashTargetElement(hash: string): HTMLElement | null {
  if (typeof document === 'undefined') {
    return null
  }

  const id = decodeURIComponent(hash.replace(/^#/, ''))

  return id ? document.getElementById(id) : null
}

function getHashScrollPosition(hash: string): { left: number; top: number } | null {
  if (typeof window === 'undefined') {
    return null
  }

  const targetElement = getHashTargetElement(hash)

  if (!targetElement) {
    return null
  }

  const top = targetElement.getBoundingClientRect().top + window.scrollY - getStickyOffsetTop()

  return {
    left: 0,
    top: Math.max(0, top)
  }
}

function waitForHashTarget(hash: string): Promise<HTMLElement | null> {
  if (
    typeof document === 'undefined'
    || typeof MutationObserver === 'undefined'
    || !document.body
  ) {
    return Promise.resolve(null)
  }

  const initialTarget = getHashTargetElement(hash)

  if (initialTarget) {
    return Promise.resolve(initialTarget)
  }

  return new Promise((resolve) => {
    let observer: MutationObserver | null = null

    const stop = (target: HTMLElement | null) => {
      window.clearTimeout(timeout)
      window.clearInterval(interval)
      observer?.disconnect()
      resolve(target)
    }

    const findTarget = () => {
      const target = getHashTargetElement(hash)

      if (target) {
        stop(target)
      }
    }

    const timeout = window.setTimeout(() => {
      stop(null)
    }, hashScrollWaitMs)

    const interval = window.setInterval(findTarget, 50)
    observer = new MutationObserver(findTarget)

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
  })
}

async function scrollToHash(hash: string, behavior: ScrollBehavior = 'smooth'): Promise<boolean> {
  await nextFrame()
  await nextFrame()

  const target = await waitForHashTarget(hash)

  if (!target || typeof window === 'undefined') {
    return false
  }

  for (let attempt = 0; attempt < hashScrollStabilizeFrames; attempt += 1) {
    const position = getHashScrollPosition(hash)

    if (!position) {
      return false
    }

    window.scrollTo({
      ...position,
      behavior: attempt === 0 ? behavior : 'auto'
    })

    await nextFrame()

    if (attempt >= 2 && Math.abs(window.scrollY - position.top) < 2) {
      return true
    }
  }

  return true
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

function useManualScrollRestoration(): void {
  if (typeof window === 'undefined' || !('scrollRestoration' in window.history)) {
    return
  }

  window.history.scrollRestoration = 'manual'
}

function setRootVisibility(rootContainer: string, visible: boolean): void {
  if (typeof document === 'undefined') {
    return
  }

  const root = document.querySelector<HTMLElement>(rootContainer)

  if (!root) {
    return
  }

  root.style.visibility = visible ? '' : 'hidden'
}

function hasHydratableRoot(rootContainer: string): boolean {
  if (typeof document === 'undefined') {
    return false
  }

  const root = document.querySelector<HTMLElement>(rootContainer)

  return Boolean(root && root.innerHTML.trim().length > 0)
}

function isSsrRuntime(): boolean {
  return typeof window === 'undefined'
}

export function createViteSsgApp(
  App: Component,
  routerOptions: { base?: string; routes: RouteRecordRaw[] },
  fn?: (context: CreateViteSsgContext) => Promise<void> | void,
  options?: CreateViteSsgOptions
) {
  const {
    hydration = true,
    rootContainer = '#app',
    transformState,
    useHead = true
  } = options ?? {}

  async function createSsgApp(routePath?: string): Promise<CreateViteSsgContext> {
    const isSsr = isSsrRuntime()
    const shouldHydrate = isSsr || (hydration && hasHydratableRoot(rootContainer))
    const app = shouldHydrate ? createSSRApp(App) : createApp(App)
    let head: CreateViteSsgContext['head']

    if (useHead) {
      head = isSsr ? createServerHead() : createClientHead()
      app.use(head)
    }

    const router = createRouter({
      history: isSsr
        ? createMemoryHistory(routerOptions.base)
        : createWebHistory(routerOptions.base),
      scrollBehavior: async (to, _from, savedPosition) => {
        if (!isClientAppMounted) {
          return false
        }

        if (savedPosition) {
          return savedPosition
        }

        if (to.hash) {
          const scrolled = await scrollToHash(to.hash)
          return scrolled ? false : { left: 0, top: 0 }
        }

        return { left: 0, top: 0 }
      },
      ...routerOptions
    })

    const appRenderCallbacks: Array<() => void | Promise<void>> = []
    const onSSRAppRendered = isSsr
      ? (cb: () => void | Promise<void>) => appRenderCallbacks.push(cb)
      : () => undefined
    const triggerOnSSRAppRendered = () => Promise.all(appRenderCallbacks.map((cb) => cb()))

    const context: CreateViteSsgContext = {
      app,
      head,
      initialState: {},
      isClient: !isSsr,
      onSSRAppRendered,
      routePath,
      router,
      routes: routerOptions.routes,
      transformState,
      triggerOnSSRAppRendered
    }

    if (!isSsr) {
      await documentReady()
      useManualScrollRestoration()
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

    if (isSsr) {
      const route = context.routePath ?? '/'
      await router.push(route)
      await router.isReady()
      context.initialState = (router.currentRoute.value.meta.state as Record<string, unknown>) || {}
    }

    return context
  }

  if (!isSsrRuntime()) {
    ;(async () => {
      const hasInitialHash = Boolean(window.location.hash)

      if (hasInitialHash) {
        setRootVisibility(rootContainer, false)
      }

      const { app, router } = await createSsgApp()
      await router.isReady()
      app.mount(rootContainer, true)
      isClientAppMounted = true

      if (window.location.hash) {
        await scrollToHash(window.location.hash, 'auto')
      }

      if (hasInitialHash) {
        setRootVisibility(rootContainer, true)
      }
    })()
  }

  return createSsgApp
}
