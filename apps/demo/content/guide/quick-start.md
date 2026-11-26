---
title: Quick Start
navTitle: Quick Start
description: Minimal bootstrap example for a docs app built on CodeMonster UI.
order: 2
---

## Quick Start

Import the shared styles in the app entry. Use the theme provider in the app
tree to make the active theme available to components.

## App Entry

```ts
import { createApp } from 'vue'
import '@codemonster-ru/ui-tokens/tokens.css'
import '@codemonster-ru/ui-css/fonts.css'
import '@codemonster-ru/ui-css/styles.css'

createApp(App).mount('#app')
```

## Theme Defaults

Set `default-theme="system"` and a dedicated `storage-key` on the theme provider
so the docs app starts from system preferences and remembers user selection.

## Layout Composition

Build the site shell with `CmDocumentLayout`, then feed it sidebar items,
current page HTML and a table of contents generated from markdown headings.

## Markdown Blocks

The docs renderer keeps common markdown structures as typed content blocks so
the Vue layer can use CodeMonster UI components where they fit.

| Block | Renderer | Notes |
| :--- | :------: | ----: |
| `table` | `CmTable` | structured |
| `code` | `CodeBlock` | highlighted |
| `playground` | `VfPlayground` | interactive |
| `blockquote` | native | prose |

## Vue Demo Block

For Vue demos, keep markdown and runnable source in the same block.

````playground-src
mode: component
framework: vue
height: 360
entry: /App.vue

```vue file=/App.vue
<template>
  <main class="demo">
    <CmCard>
      <h2>Vue runtime smoke</h2>
      <p>Bundled by Vite, rendered without iframe runtime.</p>
      <CmBadge variant="outline">CodeMonster UI</CmBadge>
      <CmButton>Smoke passed</CmButton>
    </CmCard>
  </main>
</template>

<script setup>
import { CmBadge, CmButton, CmCard } from '@codemonster-ru/ui-vue'
</script>

<style scoped>
.demo {
  padding: var(--cm-space-6);
  display: grid;
  align-content: start;
  gap: var(--cm-space-4);
  background: linear-gradient(
    180deg,
    color-mix(in oklab, var(--cm-color-background-canvas) 92%, var(--cm-color-text-link) 8%),
    var(--cm-color-background-canvas)
  );
}

h2 {
  margin: 0 0 12px;
  font-size: 42px;
  line-height: 1.1;
}

p {
  margin: 0 0 20px;
}

.cm-button {
  width: 100%;
  justify-content: center;
  margin-top: 20px;
}
</style>
```

````

## Sandbox Playground Block (Legacy)

Use this mode for editable runtime sandbox scenarios. The example below is theme-aware, so it follows host light/dark toggles:

```playground
{
  "entry": "/index.html",
  "framework": "html",
  "height": 360,
  "files": {
    "/index.html": "<!doctype html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"UTF-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <style>\n      :root { color-scheme: light dark; }\n      html, body { margin: 0; min-height: 100%; }\n      body {\n        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;\n        background: var(--cm-color-background-canvas, Canvas);\n        color: var(--cm-color-text-primary, CanvasText);\n        transition: background-color .2s ease, color .2s ease;\n      }\n      .legacy-demo { padding: 28px; }\n      .legacy-demo h1, .legacy-demo p { color: inherit; }\n      .legacy-demo h1 { margin: 0 0 8px; font-size: 56px; line-height: 1.05; }\n      .legacy-demo p { margin: 0; font-size: 24px; opacity: 0.9; }\n    </style>\n  </head>\n  <body>\n    <main class=\"legacy-demo\">\n      <h1>Hello Playground</h1>\n      <p>Legacy sandbox preview (iframe runtime).</p>\n    </main>\n  </body>\n</html>"
  }
}
```
