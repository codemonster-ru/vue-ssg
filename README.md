# @codemonster-ru/vue-ssg

| Package                          | Version                                                                                                                                         | Downloads/month                                                                                                                                          | License                                                                                                                                     |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `@codemonster-ru/vue-ssg-core`   | [![npm version](https://img.shields.io/npm/v/%40codemonster-ru%2Fvue-ssg-core)](https://www.npmjs.com/package/@codemonster-ru/vue-ssg-core)     | [![npm downloads/month](https://img.shields.io/npm/dm/%40codemonster-ru%2Fvue-ssg-core)](https://www.npmjs.com/package/@codemonster-ru/vue-ssg-core)     | [![License](https://img.shields.io/npm/l/%40codemonster-ru%2Fvue-ssg-core)](https://www.npmjs.com/package/@codemonster-ru/vue-ssg-core)     |
| `@codemonster-ru/create-vue-ssg` | [![npm version](https://img.shields.io/npm/v/%40codemonster-ru%2Fcreate-vue-ssg)](https://www.npmjs.com/package/@codemonster-ru/create-vue-ssg) | [![npm downloads/month](https://img.shields.io/npm/dm/%40codemonster-ru%2Fcreate-vue-ssg)](https://www.npmjs.com/package/@codemonster-ru/create-vue-ssg) | [![License](https://img.shields.io/npm/l/%40codemonster-ru%2Fcreate-vue-ssg)](https://www.npmjs.com/package/@codemonster-ru/create-vue-ssg) |

Monorepo workspace for Codemonster SSG packages and local development.

## Workspace Packages

- `apps/demo` - `@codemonster-ru/ssg-demo` (local demo app and dogfooding shell)
- `packages/vue-ssg-core` - `@codemonster-ru/vue-ssg-core` (publishable SSG core API)
- `packages/create-vue-ssg` - `@codemonster-ru/create-vue-ssg` (project scaffolding CLI)

## Package Roles

- root (`@codemonster-ru/vue-ssg`, private): monorepo orchestration and shared scripts
- demo app (`@codemonster-ru/ssg-demo`, private): local app shell and dogfooding target
- `@codemonster-ru/vue-ssg-core`: publishable runtime/core package
- `@codemonster-ru/create-vue-ssg`: publishable scaffolding CLI package

## Scripts

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run check`
- `npm run release:check`
- `npm run changeset`
- `npm run version:packages`

## Command Scope

- Demo app checks: `npm run check`
- Workspace release checks: `npm run release:check`
- Only `vue-ssg-core`: `npm run -w @codemonster-ru/vue-ssg-core build`
- Only `create-vue-ssg`: `npm run -w @codemonster-ru/create-vue-ssg typecheck`

## Release

See [RELEASE.md](/Users/kolesnikov_k_a/Projects/Codemonster/JS/docs/RELEASE.md) for publish steps and order.

CI is configured in [ci.yml](/Users/kolesnikov_k_a/Projects/Codemonster/JS/docs/.github/workflows/ci.yml), and tag-based Trusted Publisher release flow in [release.yml](/Users/kolesnikov_k_a/Projects/Codemonster/JS/docs/.github/workflows/release.yml).
