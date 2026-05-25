import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const repoRoot = resolve(import.meta.dirname, '..')

const filesToSync = [
  {
    from: 'apps/demo/src/App.vue',
    to: 'packages/create-vue-ssg/templates/docs/src/App.vue'
  },
  {
    from: 'apps/demo/src/components/DocsDefaultHeader.vue',
    to: 'packages/create-vue-ssg/templates/docs/src/components/DocsDefaultHeader.vue'
  },
  {
    from: 'apps/demo/src/components/DocsMarkdownRenderer.vue',
    to: 'packages/create-vue-ssg/templates/docs/src/components/DocsMarkdownRenderer.vue'
  },
  {
    from: 'apps/demo/src/main.ts',
    to: 'packages/create-vue-ssg/templates/docs/src/main.ts'
  },
  {
    from: 'apps/demo/src/styles.css',
    to: 'packages/create-vue-ssg/templates/docs/src/styles.css'
  },
  {
    from: 'apps/demo/src/views/DocsHomeView.vue',
    to: 'packages/create-vue-ssg/templates/docs/src/views/DocsHomeView.vue'
  },
  {
    from: 'apps/demo/src/views/DocsNotFoundView.vue',
    to: 'packages/create-vue-ssg/templates/docs/src/views/DocsNotFoundView.vue'
  },
  {
    from: 'apps/demo/src/views/DocsPageView.vue',
    to: 'packages/create-vue-ssg/templates/docs/src/views/DocsPageView.vue'
  },
  {
    from: 'apps/demo/vite.config.ts',
    to: 'packages/create-vue-ssg/templates/docs/vite.config.ts'
  }
]

for (const file of filesToSync) {
  const fromPath = resolve(repoRoot, file.from)
  const toPath = resolve(repoRoot, file.to)

  if (!existsSync(fromPath)) {
    throw new Error(`Sync source not found: ${file.from}`)
  }

  mkdirSync(dirname(toPath), { recursive: true })
  copyFileSync(fromPath, toPath)
}

console.log(`Synced ${filesToSync.length} docs template file(s) from apps/demo.`)
