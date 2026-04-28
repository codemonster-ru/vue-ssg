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

test('resolves nested index pages as section overview pages', () => {
  const { docsPages } = resolveDocsContent({
    docsConfig,
    markdownFiles: {
      '/tmp/content/packages/floater.js/latest/index.md': '# Floater latest\n\n[Overview](./index.md)',
      '/tmp/content/packages/floater.js/latest/getting-started.md': '# Getting started',
      '/tmp/content/packages/floater.js/latest/api/core.md': '# Core API'
    }
  })

  const indexPage = docsPages.find((page) => page.path === '/packages/floater.js/latest')
  assert.ok(indexPage, 'Expected latest index page to be present')
  assert.equal(indexPage.id, 'packages-floater.js-latest-index')
  assert.equal(indexPage.title, 'Floater latest')
  assert.equal(indexPage.navTitle, 'Overview')
  assert.deepEqual(indexPage.section, ['packages', 'floater.js', 'latest'])

  const paragraphBlock = getFirstBlockByType(indexPage, 'paragraph')
  assert.equal(paragraphBlock.html, '<a href=".">Overview</a>')
})

test('falls back to overview title and nav title for index pages without frontmatter or h1', () => {
  const { docsPages } = resolveDocsContent({
    docsConfig,
    markdownFiles: {
      '/tmp/content/packages/floater.js/latest/index.md': 'Install the package.'
    }
  })

  assert.equal(docsPages.length, 1)
  assert.equal(docsPages[0].title, 'Overview')
  assert.equal(docsPages[0].navTitle, 'Overview')
})

test('keeps frontmatter priority for index page title and nav title', () => {
  const { docsPages } = resolveDocsContent({
    docsConfig,
    markdownFiles: {
      '/tmp/content/packages/floater.js/latest/index.md': `---
title: Stable release
navTitle: Start here
---
# Floater latest`
    }
  })

  assert.equal(docsPages.length, 1)
  assert.equal(docsPages[0].title, 'Stable release')
  assert.equal(docsPages[0].navTitle, 'Start here')
})

function resolveMiddlewareSidebar(markdownFiles) {
  const { docsSidebar } = resolveDocsContent({
    docsConfig,
    markdownFiles
  })

  const apiNode = docsSidebar.find((item) => item.value === 'api')
  assert.ok(apiNode?.children, 'Expected api section')

  const middlewareNodes = apiNode.children.filter((item) => item.label === 'Middleware')
  assert.equal(middlewareNodes.length, 1)

  return middlewareNodes[0]
}

test('merges a page and folder with the same path into one sidebar node', () => {
  const middlewareNode = resolveMiddlewareSidebar({
    '/tmp/content/api/middleware.md': '# Middleware',
    '/tmp/content/api/middleware/offset.md': '# Offset',
    '/tmp/content/api/middleware/flip.md': '# Flip'
  })

  assert.ok(middlewareNode.children, 'Expected middleware children')
  assert.deepEqual(
    middlewareNode.children.map((item) => [item.value, item.label, item.to]),
    [
      ['api-middleware', 'Overview', '/api/middleware'],
      ['api-middleware-flip', 'Flip', '/api/middleware/flip'],
      ['api-middleware-offset', 'Offset', '/api/middleware/offset']
    ]
  )
})

test('keeps sidebar output stable when folder children are processed before the page', () => {
  const pageFirstNode = resolveMiddlewareSidebar({
    '/tmp/content/api/middleware.md': '# Middleware',
    '/tmp/content/api/middleware/offset.md': '# Offset',
    '/tmp/content/api/middleware/flip.md': '# Flip'
  })
  const childrenFirstNode = resolveMiddlewareSidebar({
    '/tmp/content/api/middleware/offset.md': '# Offset',
    '/tmp/content/api/middleware/flip.md': '# Flip',
    '/tmp/content/api/middleware.md': '# Middleware'
  })

  assert.deepEqual(childrenFirstNode, pageFirstNode)
})

test('builds sidebar for index pages without duplicate latest siblings', () => {
  const { docsSidebar } = resolveDocsContent({
    docsConfig,
    markdownFiles: {
      '/tmp/content/packages/floater.js/latest/index.md': '# Floater latest',
      '/tmp/content/packages/floater.js/latest/getting-started.md': '# Getting started',
      '/tmp/content/packages/floater.js/latest/api/core.md': '# Core API'
    }
  })

  const packagesNode = docsSidebar.find((item) => item.value === 'packages')
  assert.ok(packagesNode?.children, 'Expected packages section')

  const packageNode = packagesNode.children.find((item) => item.value === 'packages-floater.js')
  assert.ok(packageNode?.children, 'Expected floater.js section')

  const latestNodes = packageNode.children.filter((item) => item.value === 'packages-floater.js-latest')
  assert.equal(latestNodes.length, 1)

  const latestNode = latestNodes[0]
  assert.equal(latestNode.label, 'Latest')
  assert.ok(latestNode.children, 'Expected latest children')
  assert.deepEqual(
    latestNode.children.map((item) => [item.value, item.label, item.to]),
    [
      ['packages-floater.js-latest-getting-started', 'Getting Started', '/packages/floater.js/latest/getting-started'],
      ['packages-floater.js-latest-index', 'Overview', '/packages/floater.js/latest'],
      ['packages-floater.js-latest-api', 'Api', undefined]
    ]
  )
})
