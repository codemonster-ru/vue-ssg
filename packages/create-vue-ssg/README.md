# @codemonster-ru/create-vue-ssg

[![npm version](https://img.shields.io/npm/v/%40codemonster-ru%2Fcreate-vue-ssg)](https://www.npmjs.com/package/@codemonster-ru/create-vue-ssg)
[![npm downloads/month](https://img.shields.io/npm/dm/%40codemonster-ru%2Fcreate-vue-ssg)](https://www.npmjs.com/package/@codemonster-ru/create-vue-ssg)
[![License](https://img.shields.io/npm/l/%40codemonster-ru%2Fcreate-vue-ssg)](https://www.npmjs.com/package/@codemonster-ru/create-vue-ssg)

Scaffold command for Codemonster SSG projects.

## Usage

```bash
npm create @codemonster-ru/vue-ssg@latest my-docs
```

Markdown content is loaded from `content/**/*.md` in the generated project.

## Docs Template Sync Policy

- `apps/demo` is the source of truth for the `docs` template shell.
- Before publishing `@codemonster-ru/create-vue-ssg`, sync demo changes into the template:

```bash
node scripts/sync-docs-template.mjs
```

- CI enforces this policy and fails when the synced output differs.

## Options

- `--template <name>`: template to use (`default` or `docs`)
- `default`: minimal starter template
- `docs`: full docs shell matching `apps/demo`
- `--force`: allow scaffolding into a non-empty target directory

For the `docs` template package cards, you can set a custom landing page in each
`content/packages/<slug>/metadata.json` via `landingPath` (for example,
`"landingPath": "getting-started"`).

Examples:

```bash
npm create @codemonster-ru/vue-ssg@latest my-docs -- --template default
npm create @codemonster-ru/vue-ssg@latest my-docs -- --template docs
npm create @codemonster-ru/vue-ssg@latest my-docs -- --force
```
