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

function getFirstBlockByType(page, type) {
  const block = page.blocks.find((item) => item.type === type)
  assert.ok(block, `Expected ${type} block to be present`)
  return block
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

test('normalizes inline markdown links in paragraphs', () => {
  const page = resolveSinglePage(`[Core API](./api/core.md)`)
  const paragraphBlock = getFirstBlockByType(page, 'paragraph')

  assert.equal(paragraphBlock.html, '<a href="./api/core">Core API</a>')
})

test('normalizes inline markdown links in list items', () => {
  const page = resolveSinglePage(`- [Offset](../middleware/offset.md)`)
  const listBlock = getFirstListBlock(page)

  assert.equal(listBlock.items[0], '<a href="../middleware/offset">Offset</a>')
})

test('normalizes inline markdown links in blockquotes', () => {
  const page = resolveSinglePage(`> [Core API](./api/core.mdx)`)
  const blockquoteBlock = getFirstBlockByType(page, 'blockquote')

  assert.equal(blockquoteBlock.html, '<p><a href="./api/core">Core API</a></p>\n')
})

test('leaves external markdown links unchanged', () => {
  const page = resolveSinglePage(
    `[HTTPS](https://example.com/readme.md) [HTTP](http://example.com/readme.md) [Mail](mailto:test@example.com) [Tel](tel:+123) [CDN](//example.com/readme.md)`
  )
  const paragraphBlock = getFirstBlockByType(page, 'paragraph')

  assert.match(paragraphBlock.html, /href="https:\/\/example\.com\/readme\.md"/)
  assert.match(paragraphBlock.html, /href="http:\/\/example\.com\/readme\.md"/)
  assert.match(paragraphBlock.html, /href="mailto:test@example\.com"/)
  assert.match(paragraphBlock.html, /href="tel:\+123"/)
  assert.match(paragraphBlock.html, /href="\/\/example\.com\/readme\.md"/)
})

test('leaves hash-only markdown links unchanged', () => {
  const page = resolveSinglePage(`[Section](#section)`)
  const paragraphBlock = getFirstBlockByType(page, 'paragraph')

  assert.equal(paragraphBlock.html, '<a href="#section">Section</a>')
})

test('preserves query and hash while normalizing markdown links', () => {
  const page = resolveSinglePage(
    `[Usage](./api/core.md#usage) [Filtered](./api/core.md?x=1#usage)`
  )
  const paragraphBlock = getFirstBlockByType(page, 'paragraph')

  assert.match(paragraphBlock.html, /href="\.\/api\/core#usage"/)
  assert.match(paragraphBlock.html, /href="\.\/api\/core\?x=1#usage"/)
})

test('normalizes index markdown links to directory routes', () => {
  const page = resolveSinglePage(
    `[Overview](./index.md) [Guide](../guide/index.md) [Mdx](./guide/index.mdx)`
  )
  const paragraphBlock = getFirstBlockByType(page, 'paragraph')

  assert.match(paragraphBlock.html, /href="\."/)
  assert.match(paragraphBlock.html, /href="..\/guide"/)
  assert.match(paragraphBlock.html, /href="\.\/guide"/)
})
