#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const templatesRoot = resolve(__dirname, '../templates')
const args = process.argv.slice(2)
const positionalArgs: string[] = []
let templateName = 'default'
let force = false

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index]

  if (arg === '--force' || arg === '-f') {
    force = true
    continue
  }

  if (arg === '--template' || arg === '-t') {
    const value = args[index + 1]

    if (!value) {
      console.error('Missing value for --template')
      process.exit(1)
    }

    templateName = value
    index += 1
    continue
  }

  if (arg.startsWith('--template=')) {
    templateName = arg.split('=')[1] || 'default'
    continue
  }

  if (arg.startsWith('-')) {
    console.error(`Unknown option: ${arg}`)
    process.exit(1)
  }

  positionalArgs.push(arg)
}

const templateDir = resolve(templatesRoot, templateName)

if (!existsSync(templateDir)) {
  console.error(`Unknown template "${templateName}". Available templates: default`)
  process.exit(1)
}

const targetArg = positionalArgs[0]
const targetDir = resolve(process.cwd(), targetArg || 'codemonster-docs')
const projectName = basename(targetDir)
const packageName = toPackageName(projectName)

function ensureDir(dir: string): void {
  mkdirSync(dir, { recursive: true })
}

function hasFiles(dir: string): boolean {
  return readdirSync(dir).length > 0
}

function copyDir(source: string, target: string): void {
  ensureDir(target)

  for (const entry of readdirSync(source)) {
    const sourcePath = join(source, entry)
    const targetPath = join(target, entry)
    const stats = statSync(sourcePath)

    if (stats.isDirectory()) {
      copyDir(sourcePath, targetPath)
      continue
    }

    if (targetPath === join(targetDir, 'package.json')) {
      const packageJson = JSON.parse(readFileSync(sourcePath, 'utf8')) as {
        name?: string
      }

      packageJson.name = packageName
      writeFileSync(targetPath, `${JSON.stringify(packageJson, null, 2)}\n`, 'utf8')
      continue
    }

    const text = readFileSync(sourcePath, 'utf8').replaceAll('__PROJECT_NAME__', projectName)
    writeFileSync(targetPath, text, 'utf8')
  }
}

if (existsSync(targetDir) && hasFiles(targetDir) && !force) {
  console.error(`Target directory is not empty: ${targetDir}`)
  console.error('Use --force to scaffold into a non-empty directory.')
  process.exit(1)
}

type PackageManager = {
  install: string
  dev: string
}

function toPackageName(value: string): string {
  const normalized = value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[._-]+/, '')
    .replace(/[._-]+$/, '')

  if (!normalized) {
    return 'ssg-app'
  }

  if (!/^[a-z0-9]/.test(normalized)) {
    return `ssg-${normalized}`
  }

  return normalized
}

function detectPackageManager(): PackageManager {
  const userAgent = process.env.npm_config_user_agent ?? ''

  if (userAgent.startsWith('pnpm/')) {
    return {
      install: 'pnpm install',
      dev: 'pnpm dev'
    }
  }

  if (userAgent.startsWith('yarn/')) {
    return {
      install: 'yarn',
      dev: 'yarn dev'
    }
  }

  if (userAgent.startsWith('bun/')) {
    return {
      install: 'bun install',
      dev: 'bun run dev'
    }
  }

  return {
    install: 'npm install',
    dev: 'npm run dev'
  }
}

const packageManager = detectPackageManager()

copyDir(templateDir, targetDir)

console.log(`\nScaffolded docs project in ${targetDir}\n`)
console.log('Next steps:')
console.log(`  cd ${targetArg || 'codemonster-docs'}`)
console.log(`  ${packageManager.install}`)
console.log(`  ${packageManager.dev}`)
