---
title: Installation
navTitle: Installation
description: Install the docs workspace and wire it into a Vue project.
order: 1
---

# Installation

Use the docs package together with the published CodeMonster UI libraries.

## Packages

Install the docs package and the shared UI dependencies:

```bash
npm install @codemonster-ru/vue-ssg-core
npm install @codemonster-ru/ui-vue @codemonster-ru/ui-layouts @codemonster-ru/ui-css @codemonster-ru/ui-tokens
```

## Shared Styles

Import the package styles once in your app entry so the foundation tokens and
layout surfaces are available everywhere.

## Theme Runtime

Register the CodeMonster UI plugin with a storage key and a default theme mode. That
lets `VfThemeSwitch` and the rest of the theme runtime work consistently across
the docs site.

## Development Cache

Use `npm run dev` for normal development. If a locally updated package leaves
stale optimized dependencies in Vite's cache, run `npm run dev:force` once to
rebuild them.
