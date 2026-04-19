# Changesets

Create a release note entry before merge:

```bash
npm run changeset
```

Then, on release branch/main:

```bash
npm run version:packages
npm install
```

The release workflow can publish tagged package versions to npm.
