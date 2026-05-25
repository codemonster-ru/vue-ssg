/// <reference types="vite/client" />

declare module 'virtual:docs-markdown-playground/*' {
  import type { Component } from 'vue'
  const component: Component
  export default component
}

declare module '@codemonster-ru/vueforge-codeblock' {
  import type { DefineComponent } from 'vue'
  export const VfCodeBlock: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
}

declare module '@/generated/playgroundRegistry.generated' {
  import type { Component } from 'vue'
  export const docsVirtualPlaygroundRegistry: Record<string, Component>
  export const docsVirtualPlaygroundSourceRegistry: Record<string, string>
  export const docsVirtualPlaygroundSourceLanguageRegistry: Record<string, string>
  export const docsVirtualPlaygroundSourceFileRegistry: Record<string, string>
}
