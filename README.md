# Vue SSG

[![CI status on main](https://github.com/codemonster-ru/vue-ssg/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/codemonster-ru/vue-ssg/actions/workflows/ci.yml)

Vue SSG is a Vue and Vite toolkit for building static sites from Markdown. It includes
a runtime for content and routes and a CLI for scaffolding new projects.

[Get started](#get-started) · [Documentation](./packages/create-vue-ssg/README.md) · [Packages](#packages)

## Get started

Use Node.js 24, the version tested in CI. Create a documentation site with the `docs` template.

```bash
npm create @codemonster-ru/vue-ssg@latest my-docs -- --template docs
cd my-docs
npm install
npm run dev
```

Edit the Markdown files in `content/`. Run `npm run build` to generate the site in
`dist/`. Omit `-- --template docs` for the minimal starter.

See the [CLI guide](./packages/create-vue-ssg/README.md) for template options and the
[Core reference](./packages/vue-ssg-core/README.md) for runtime APIs.

## Packages

| Package | npm (`latest`) | Use |
| --- | --- | --- |
| [`@codemonster-ru/create-vue-ssg`](./packages/create-vue-ssg/README.md) | [![npm version for the scaffolding CLI](https://img.shields.io/npm/v/%40codemonster-ru%2Fcreate-vue-ssg/latest)](https://www.npmjs.com/package/@codemonster-ru/create-vue-ssg) | Scaffold a new site from a template |
| [`@codemonster-ru/vue-ssg-core`](./packages/vue-ssg-core/README.md) | [![npm version for Vue SSG Core](https://img.shields.io/npm/v/%40codemonster-ru%2Fvue-ssg-core/latest)](https://www.npmjs.com/package/@codemonster-ru/vue-ssg-core) | Load content and generate routes in a Vue and Vite SSG application |

## Development

Run `npm ci` at the repository root. `npm run dev` serves the workspace demo in
`apps/demo`, and `npm run build` builds the Core package and the demo. Run
`npm run check` for demo checks or `npm run release:check` for package release checks.

- Run `npm run -w @codemonster-ru/vue-ssg-core build` to build Core on its own.
- Run `npm run -w @codemonster-ru/create-vue-ssg typecheck` to type-check the CLI.
- Follow the [release guide](./RELEASE.md) for versioning, changelog dates, and publishing.
  See [CI](./.github/workflows/ci.yml) and the [release workflow](./.github/workflows/release.yml).

## Support and contributing

Use [GitHub Issues](https://github.com/codemonster-ru/vue-ssg/issues) for questions,
feature requests, and reproducible bugs.

Part of [CodeMonster](https://github.com/codemonster-ru). Licensed under the [MIT License](./LICENSE).
