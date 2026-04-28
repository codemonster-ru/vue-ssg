# @codemonster-ru/vue-ssg-core

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
