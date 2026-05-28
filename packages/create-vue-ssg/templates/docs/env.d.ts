/// <reference types="vite/client" />

declare module 'virtual:docs-markdown-playground/*' {
  import type { Component } from 'vue'
  const component: Component
  export default component
}

declare module '@codemonster-ru/vueforge-codeblock/view' {
  import type { DefineComponent } from 'vue'
  export const VfCodeBlock: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
}

declare module '@/generated/playgroundRegistry.generated' {
  export const docsVirtualPlaygroundRegistry: Record<string, unknown>
  export const docsVirtualPlaygroundSourceRegistry: Record<string, string>
  export const docsVirtualPlaygroundSourceLanguageRegistry: Record<string, string>
  export const docsVirtualPlaygroundSourceFileRegistry: Record<string, string>
}

declare module './ssg.base.config.mjs' {
  import type { DocsConfig } from '@/content/config'
  export function createDocsBaseConfig(currentYear: number): DocsConfig
}
