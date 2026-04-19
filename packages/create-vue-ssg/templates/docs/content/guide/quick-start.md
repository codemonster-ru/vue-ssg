---
title: Quick Start
navTitle: Quick Start
description: Minimal bootstrap example for a docs app built on VueForge.
order: 2
---

# Quick Start

Once the dependencies are installed, register VueForge in the app entry and
import the shared styles.

## App Entry

```ts
import { createApp } from 'vue'
import VueForge from '@codemonster-ru/vueforge-core'
import '@codemonster-ru/vueforge-core/styles.css'
import '@codemonster-ru/vueforge-layouts/styles.css'

createApp(App).use(VueForge).mount('#app')
```

## Theme Defaults

Use `defaultTheme: 'system'` and a dedicated `themeStorageKey` so the docs app
starts from system preferences and remembers user selection.

## Layout Composition

Build the site shell with `VfDocumentLayout`, then feed it sidebar items,
current page HTML and a table of contents generated from markdown headings.
