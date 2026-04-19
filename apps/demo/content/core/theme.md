---
title: Theme Runtime
navTitle: Theme
description: Theme provider, storage and mode switching in the docs app.
order: 1
---

# Theme Runtime

`vueforge-core` provides the runtime pieces needed for light, dark and system
theme modes.

## Provider

Wrap the app in `VfThemeProvider` so theme-aware components can read the
current mode and react to updates.

## Switch

Place `VfThemeSwitch` in the header or another persistent area of the docs UI
to let readers switch between light and dark modes.

## Body Typography

Apply `font-family: var(--vf-font-family-base)` on `body` in the consuming app
so regular HTML content follows the same type system as the components.
