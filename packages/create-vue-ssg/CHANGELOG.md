# @codemonster-ru/create-vue-ssg

<!-- markdownlint-disable MD024 -->

## 2.0.7 - 2026-06-12

### Patch Changes

- Update generated templates to depend on
  `@codemonster-ru/vue-ssg-core@^2.1.0`.
- Update the generated docs template to depend on
  `@codemonster-ru/vueforge-codeblock@^3.5.0`.

## 2.0.6 - 2026-06-03

### Patch Changes

- Update generated templates to depend on `@codemonster-ru/vue-ssg-core@^2.0.4`.
- Update generated docs template VueForge dependency baselines:
  - `@codemonster-ru/vueforge-codeblock@^3.4.2`
  - `@codemonster-ru/vueforge-core@^1.22.2`
  - replace deprecated `@codemonster-ru/vueiconify` with
    `@codemonster-ru/vueforge-icons@^1.4.0`
  - `@codemonster-ru/vueforge-layouts@^1.13.2`
  - `@codemonster-ru/vueforge-playground@^2.4.2`
- Use Vite's regular dependency cache for normal development and expose
  `npm run dev:force` for explicit cache rebuilds.
- Configure docs template Vite dependency optimization for VueForge packages to
  avoid stale optimized dependency reload loops after local package updates.

## 2.0.5 - 2026-06-02

### Patch Changes

- Update generated template dependency baseline to `@codemonster-ru/vue-ssg-core@^2.0.3`.
- Align generated docs entrypoint style imports with new VueForge package exports (`@codemonster-ru/vueforge-core/{base,theme}.css` and `@codemonster-ru/vueforge-layouts/base.css`) to prevent build failures after dependency updates.

## 2.0.4 - 2026-05-29

### Patch Changes

- Sync docs template renderer with `apps/demo` source-of-truth to satisfy `sync-docs-template` CI parity check.

## 2.0.3 - 2026-05-29

### Patch Changes

- Sync docs template markdown renderer with skeleton-gated playground loading pattern to improve perceived loading behavior and keep parity with demo updates.

## 2.0.2 - 2026-05-29

### Patch Changes

- Update generated `docs` and `demo` dependency baselines to current `@codemonster-ru/vueforge-*` versions:
  - `@codemonster-ru/vueforge-core@^1.19.0`
  - `@codemonster-ru/vueforge-codeblock@^3.1.0`
  - `@codemonster-ru/vueforge-playground@^2.1.0`

## 2.0.1 - 2026-05-28

### Patch Changes

- Sync docs template and demo markdown renderer/playground registry to:
  - use `@codemonster-ru/vueforge-codeblock/view` and `@codemonster-ru/vueforge-playground/ui` imports
  - use `markRaw(...)` for registry components to avoid Vue component reactivity wrapping
- Keep docs template sync parity with `apps/demo` for CI `sync-docs-template` checks.

## 2.0.0 - 2026-05-28

### Major Changes

- Migrate the generated `docs` template to shell/page split architecture:
  - route metadata is separated from page payload
  - page payload is loaded lazily per route
  - search index is loaded on-demand
- Align generated docs template routing with `@codemonster-ru/vue-ssg-core@2` manifest-based API.
- Sync `apps/demo` and docs template source-of-truth files for the new runtime model.
- Update generated docs template dependencies to current `@codemonster-ru/*` versions compatible with the new imports/exports layout.

## 1.6.2 - 2026-05-27

### Patch Changes

- Pin VueForge package versions in the generated `docs` template (`@codemonster-ru/vueforge-codeblock`, `@codemonster-ru/vueforge-core`, `@codemonster-ru/vueforge-layouts`, `@codemonster-ru/vueforge-playground`) to avoid implicit range updates in scaffolded projects.

## 1.6.1 - 2026-05-27

### Patch Changes

- Sync `docs` template markdown renderer with demo updates: lazy-load `VfPlayground` and configure `VfCodeBlock` language allowlist/fallback.
- Sync `docs` template Vite build config with demo chunking strategy (`manualChunks`) to split large playground/codeblock bundles from the main app chunk.
- Preserve executable mode for `bin/create-vue-ssg.js` in the release commit.

## 1.6.0 - 2026-05-26

### Minor Changes

- Sync more docs shell files from `apps/demo` into the generated `docs` template (`App.vue`, `styles.css`, and docs views) to keep scaffolded UI aligned with the demo source of truth.
- Extend `scripts/sync-docs-template.mjs` coverage and enforce template sync in CI via a dedicated sync step plus `git diff --exit-code` verification.
- Document the docs template sync policy in `@codemonster-ru/create-vue-ssg` README.

## 1.5.6 - 2026-05-26

### Patch Changes

- Update generated templates to depend on `@codemonster-ru/vue-ssg-core@^1.3.3`.
- Update generated docs templates to current VueForge package versions.
- Sync docs template playground registry generation and renderer with demo updates (safe markdown playground source escaping, generated registry path alignment, and component docs tab rendering).

## 1.5.5 - 2026-05-18

### Patch Changes

- Update generated templates to depend on `@codemonster-ru/vue-ssg-core@^1.3.2`.
- Sync the docs template `createViteSsgApp` helper with the core runtime SSR detection fix.

## 1.5.4 - 2026-05-18

### Patch Changes

- Update generated templates to depend on `@codemonster-ru/vue-ssg-core@^1.3.1`.
- Sync the docs template `createViteSsgApp` helper with the core hash-navigation and hydration fixes.
- Update generated docs templates to current VueForge package versions.

## 1.5.3 - 2026-05-15

### Patch Changes

- Include the generated markdown playground registry in the docs template so fresh scaffolded docs apps can typecheck before the first generator run.
- Add a docs template type shim for `@codemonster-ru/vueforge-codeblock` to keep generated projects type-safe with the current package declarations.

## 1.5.2 - 2026-05-15

### Patch Changes

- Update generated docs templates to depend on `@codemonster-ru/vue-ssg-core@^1.3.0` and current VueForge packages.
- Add markdown component playground generation to the docs template, including the generated registry placeholder and Vite plugin wiring.
- Keep docs template rendering aligned with the demo app for component-mode playground blocks.

## 1.5.1 - 2026-05-07

### Patch Changes

- Update generated templates to depend on `@codemonster-ru/vue-ssg-core@^1.2.0`.

## 1.5.0 - 2026-05-06

### Minor Changes

- Update generated templates to depend on `@codemonster-ru/vue-ssg-core@^1.1.0`.
- Add markdown playground rendering support to the generated `docs` template using `@codemonster-ru/vueforge-playground`.
- Add release-time template sync so duplicated docs files are copied from `apps/demo` before packaging.

## 1.4.4 - 2026-05-01

### Patch Changes

- Update generated templates to depend on `@codemonster-ru/vue-ssg-core@^1.0.7`.

## 1.4.3 - 2026-04-30

### Patch Changes

- Update generated templates to depend on `@codemonster-ru/vue-ssg-core@^1.0.6`.
- Update generated docs template to depend on `@codemonster-ru/vue-codeblock@^2.0.0` and `@codemonster-ru/vueforge-core@^1.17.4`.

## 1.4.2 - 2026-04-29

### Patch Changes

- Update generated docs templates to render structured markdown table blocks with `VfTable`, including inline cell content and column alignment.
- Update generated templates to depend on `@codemonster-ru/vue-ssg-core@^1.0.5`.

## 1.4.1 - 2026-04-29

### Patch Changes

- Update generated templates to depend on `@codemonster-ru/vue-ssg-core@^1.0.3`.
- Preserve canonical trailing-slash package index URLs in the `docs` template sidebar, package cards, and page lookup.

## 1.4.0 - 2026-04-25

### Minor Changes

- Add optional `landingPath` in `docs` template package metadata (`content/packages/<slug>/metadata.json`) to control each package card landing page.
- Update docs template home card routing to prioritize `landingPath` when provided, with graceful fallback to the first available package page.
- Document `landingPath` usage in `create-vue-ssg` README.

## 1.3.1 - 2026-04-23

### Patch Changes

- Add PNG favicons (`32x32`, `192x192`) and `apple-touch-icon` metadata to the `docs` template `<head>`.
- Add Apache `.htaccess` rewrite rules in the `docs` template for clean URL-to-HTML mapping and SPA fallback.

## 1.3.0 - 2026-04-22

### Minor Changes

- Add dynamic page titles to generated templates:
  `default` now uses route meta titles, and `docs` now renders page-specific `<title>`.
- Improve docs home package card layout/hover animation for consistent card height and cleaner arrow transition.
- Replace `Array.prototype.at()` usage in docs content parsing to keep compatibility with older TypeScript lib targets.
- Exclude template local build/install artifacts from npm publish by cleaning template `dist` and `node_modules` in `prepack`.

## 1.2.1 - 2026-04-22

### Patch Changes

- Update `@codemonster-ru/vueiconify` to `^1.3.1` in the `docs` template.
- Replace package card hover icon from `arrowRight` to `arrowRightLong` on the `docs` template home page.

## 1.2.0 - 2026-04-22

### Minor Changes

- Port Docs Hub homepage visuals and sidebar behavior into the `docs` template.
- Update package docs routes and URL rules in the `docs` template content/config.

## 1.1.1 - 2026-04-19

### Patch Changes

- Fix markdown nested list rendering in docs content parser to prevent SSG build failures.
  Also update docs template list item rendering and add regression coverage for nested list cases.

## 1.1.0 - 2026-04-19

### Minor Changes

- Add a new `docs` template that scaffolds the same docs UI shell used by `apps/demo`.
- Support `--template docs` in the scaffold CLI.
- Include full docs starter files (layout, styles, content, and components).
- Update template docs and scaffold validation messages.

## 1.0.0

### Major Changes

- First stable release of Vue SSG core and scaffolding CLI.
