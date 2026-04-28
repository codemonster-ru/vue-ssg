# @codemonster-ru/create-vue-ssg

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
