import test from 'node:test'
import assert from 'node:assert/strict'

import { resolveDocsContent } from '../dist/index.js'

const docsConfig = {
  title: 'Docs'
}

function resolveSinglePage(markdown) {
  const { docsPages } = resolveDocsContent({
    docsConfig,
    markdownFiles: {
      '/tmp/content/guide/nested.md': markdown
    }
  })

  assert.equal(docsPages.length, 1)
  return docsPages[0]
}

function getFirstListBlock(page) {
  const listBlock = page.blocks.find((block) => block.type === 'list')
  assert.ok(listBlock, 'Expected list block to be present')
  return listBlock
}

test('renders unordered list nested in unordered list', () => {
  const page = resolveSinglePage(`- Parent\n  - Child A\n  - Child B`)
  const listBlock = getFirstListBlock(page)

  assert.equal(listBlock.ordered, false)
  assert.equal(listBlock.items.length, 1)
  assert.match(listBlock.items[0], /Parent<ul>\s*<li>Child A<\/li>\s*<li>Child B<\/li>\s*<\/ul>/)
})

test('renders ordered list nested in unordered list', () => {
  const page = resolveSinglePage(`- Parent\n  1. First\n  2. Second`)
  const listBlock = getFirstListBlock(page)

  assert.equal(listBlock.ordered, false)
  assert.equal(listBlock.items.length, 1)
  assert.match(listBlock.items[0], /Parent<ol>\s*<li>First<\/li>\s*<li>Second<\/li>\s*<\/ol>/)
})

test('renders mixed list item with text and nested list', () => {
  const page = resolveSinglePage(`- Parent with **bold** text\n  - Child`)
  const listBlock = getFirstListBlock(page)

  assert.equal(listBlock.items.length, 1)
  assert.match(listBlock.items[0], /Parent with <strong>bold<\/strong> text<ul>\s*<li>Child<\/li>\s*<\/ul>/)
})
