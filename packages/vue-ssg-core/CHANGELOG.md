# @codemonster-ru/vue-ssg-core

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
