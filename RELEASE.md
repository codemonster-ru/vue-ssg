# Release Guide

This workspace publishes two npm packages:

- `@codemonster-ru/vue-ssg-core`
- `@codemonster-ru/create-vue-ssg`

Terminology in this guide:

- workspace: root private package (`@codemonster-ru/vue-ssg`)
- core package: `@codemonster-ru/vue-ssg-core`
- CLI package: `@codemonster-ru/create-vue-ssg`

## 1. Prepare Versions

Update versions in:

- `packages/vue-ssg-core/package.json`
- `packages/create-vue-ssg/package.json`

If `@codemonster-ru/create-vue-ssg` template depends on a new `vue-ssg-core` release, update:

- `packages/create-vue-ssg/templates/default/package.json` (`@codemonster-ru/vue-ssg-core` version)

## 2. Verify Before Publish

Run:

```bash
npm run release:check
```

This runs:

- package typechecks
- core build
- `npm pack --dry-run` for both packages

## 3. Configure Trusted Publisher (one-time)

- CI workflow: `.github/workflows/ci.yml`
- Release workflow: `.github/workflows/release.yml`

Configure npm Trusted Publisher for this repository/workflow:

- Provider: GitHub Actions
- Repository: this repo
- Workflow file: `.github/workflows/release.yml`
- Environment: (optional, if you use one)

No `NPM_TOKEN` secret is required in this mode.

## 4. Tag-based Automated Release (GitHub Actions + Changesets)

Release flow:

1. Add a changeset in feature PRs (`npm run changeset`).
2. Apply version updates (`npm run version:packages`) and commit them.
3. Create and push a release tag:

```bash
git tag vue-ssg-core-vX.Y.Z
git push origin vue-ssg-core-vX.Y.Z
```

For CLI package releases:

```bash
git tag create-vue-ssg-vX.Y.Z
git push origin create-vue-ssg-vX.Y.Z
```

4. `release.yml` runs per package tag, validates version/tag match, publishes the targeted package if not yet published, and creates a GitHub Release.

## 5. Smoke Test

In a clean directory:

```bash
npm create @codemonster-ru/vue-ssg@latest my-docs
cd my-docs
npm install
npm run dev
```
