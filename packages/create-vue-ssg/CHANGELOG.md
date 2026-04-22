# @codemonster-ru/create-vue-ssg

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
