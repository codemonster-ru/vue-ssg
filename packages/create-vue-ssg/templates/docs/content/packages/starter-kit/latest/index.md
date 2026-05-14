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
    <VfCard outlined>
      <h2>Vue runtime smoke</h2>
      <p>Bundled by Vite, rendered without iframe runtime.</p>
      <VfBadge outlined>vueforge-core</VfBadge>
      <VfButton color="accent">Smoke passed</VfButton>
    </VfCard>
  </main>
</template>

<script setup>
import { VfBadge, VfButton, VfCard } from '@codemonster-ru/vueforge-core'
</script>

<style scoped>
.demo {
  padding: var(--vf-layout-space-layout-lg);
  display: grid;
  align-content: start;
  gap: var(--vf-layout-space-layout-base);
  background: linear-gradient(
    180deg,
    color-mix(in oklab, var(--vf-color-bg) 92%, var(--vf-color-brand-primary) 8%),
    var(--vf-color-bg)
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

.vf-button {
  width: 100%;
  justify-content: center;
  margin-top: 20px;
}
</style>
```

````
