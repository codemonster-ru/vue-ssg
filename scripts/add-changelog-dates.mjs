import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function getChangedChangelogPaths() {
  try {
    const output = execSync('git diff --name-only -- packages/*/CHANGELOG.md', {
      encoding: 'utf8'
    }).trim()

    return output ? output.split('\n').filter(Boolean) : []
  } catch {
    return []
  }
}

function addDateToVersionHeading(changelogPath, version, releaseDate) {
  const absoluteChangelogPath = resolve(process.cwd(), changelogPath)
  const changelogText = readFileSync(absoluteChangelogPath, 'utf8')
  const alreadyDatedPattern = new RegExp(`^##\\s+v?${escapeRegExp(version)}\\s+-\\s+\\d{4}-\\d{2}-\\d{2}\\s*$`, 'm')

  if (alreadyDatedPattern.test(changelogText)) {
    return false
  }

  const headingPattern = new RegExp(`^##\\s+v?${escapeRegExp(version)}\\s*$`, 'm')

  if (!headingPattern.test(changelogText)) {
    return false
  }

  const updatedChangelogText = changelogText.replace(headingPattern, `## ${version} - ${releaseDate}`)
  writeFileSync(absoluteChangelogPath, updatedChangelogText, 'utf8')
  return true
}

const today = new Date().toISOString().slice(0, 10)
const changedChangelogPaths = getChangedChangelogPaths()
let updatedCount = 0

for (const changelogPath of changedChangelogPaths) {
  const packageDir = dirname(changelogPath)
  const packageJsonPath = resolve(process.cwd(), packageDir, 'package.json')
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
  const version = packageJson.version

  if (typeof version !== 'string' || version.length === 0) {
    continue
  }

  if (addDateToVersionHeading(changelogPath, version, today)) {
    updatedCount += 1
  }
}

if (updatedCount > 0) {
  console.log(`Added release dates to ${updatedCount} changelog file(s).`)
}
