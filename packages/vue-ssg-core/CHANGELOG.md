# @codemonster-ru/vue-ssg-core

<!-- markdownlint-disable MD024 -->

## 1.3.2 - 2026-05-18

### Patch Changes

- Detect SSR at runtime instead of relying on `import.meta.env.SSR`, keeping server rendering behavior correct when the helper is bundled or reused outside Vite's static SSR replacement path.

## 1.3.1 - 2026-05-18

### Patch Changes

- Improve hash navigation during client hydration by waiting for generated anchors, applying sticky-header offsets, and avoiding browser scroll restoration races.
- Fall back to a client-only mount when the root container has no hydratable HTML, while keeping SSR output hydrated by default.
- Update `@codemonster-ru/vueforge-core` to `^1.18.7` and align `@unhead/vue` on `^2.1.13`.

## 1.3.0 - 2026-05-15

### Minor Changes

- Add a `./playground` export with helpers for scanning markdown `playground-src` component demos, generating virtual component registries, and wiring the matching Vite plugin.
- Extend playground docs content blocks with `renderMode`, optional `demoId` and optional `demoImport` so docs renderers can distinguish sandbox, component, and Vue module playgrounds.
- Include `src/playground.ts` in the package build output and add regression coverage for component and Vue module playground parsing.

## 1.2.0 - 2026-05-07

### Minor Changes

- Add `playground-src` markdown block transformation at docs render time: parse human-readable header metadata (`framework`, `height`, required `entry`) and nested `file=/...` code fences into the existing `playground` payload shape.
- Keep source markdown files unchanged on disk while supporting both dev and build flows through in-memory transformation.
- Add strict validation and actionable build-time errors with source file path for invalid `playground-src` blocks.

## 1.1.0 - 2026-05-06

### Minor Changes

- Add markdown playground block support via fenced code blocks with `playground`/`vf-playground` language and JSON payload (`files`, `entry`, optional `framework`, `autorun`, `showCode`, `height`).
- Extend `DocsContentBlock` with a typed `playground` variant to render interactive playground content in docs.

## 1.0.7 - 2026-05-01

### Patch Changes

- Prioritize `index.md` sidebar pages over sibling pages when `order` is equal, while still keeping `order` as the primary sort key and label sorting as fallback.

## 1.0.6 - 2026-04-30

### Patch Changes

- Update `@codemonster-ru/vueforge-core` dependency to `^1.17.4`.

## 1.0.5 - 2026-04-29

### Patch Changes

- Render markdown tables as structured `table` docs content blocks with inline cell HTML and normalized column alignment instead of falling back to raw HTML.

## 1.0.4 - 2026-04-29

### Patch Changes

- Merge docs sidebar page nodes with matching section nodes so `foo.md` and `foo/bar.md` render as one branch with an `Overview` child instead of duplicate siblings.

## 1.0.3 - 2026-04-29

### Patch Changes

- Treat nested `index.md` files as section overview pages, using frontmatter or the first H1 for page titles and `Overview` for default nav labels.
- Merge index pages into their sidebar section without duplicate sibling nodes while preserving child pages and directory-style markdown link normalization.

## 1.0.2 - 2026-04-28

### Patch Changes

- Normalize internal markdown links in docs content rendering so `.md` and `.mdx` links resolve to generated SSG routes, while preserving query/hash fragments and leaving external/hash-only links unchanged.

## 1.0.1 - 2026-04-19

### Patch Changes

- Fix markdown nested list rendering in docs content parser to prevent SSG build failures.
  Also update docs template list item rendering and add regression coverage for nested list cases.

## 1.0.0

### Major Changes

- First stable release of Vue SSG core and scaffolding CLI.
