---
title: Starter Kit
order: 1
---

## Starter Kit

Welcome to your first package docs.

## Overview

Use this page as the package landing section.

## Next steps

- Add more markdown files under `content/packages/starter-kit/latest`.
- Update `metadata.json` with the real package name and repository URL.
- Add more package folders under `content/packages`.

## Vue Playground Demo

Keep Vue demo source in markdown so synced docs stay self-contained.

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
