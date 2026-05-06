import test from 'node:test'
import assert from 'node:assert/strict'

import { resolveDocsContent } from '../dist/index.js'

const docsConfig = {
  title: 'Docs'
}

function resolveSinglePage(markdown, sourcePath = '/tmp/content/guide/playground.md') {
  const { docsPages } = resolveDocsContent({
    docsConfig,
    markdownFiles: {
      [sourcePath]: markdown
    }
  })

  assert.equal(docsPages.length, 1)
  return docsPages[0]
}

test('transforms playground-src block into playground block', () => {
  const markdown = `\`\`\`\`playground-src
framework: vanilla
height: 360
entry: /main.js

\`\`\`html file=/index.html
<div id="app"></div>
\`\`\`

\`\`\`css file=/styles.css
#app { color: red; }
\`\`\`

\`\`\`js file=/main.js
console.log('ok')
\`\`\`
\`\`\`\``
  const page = resolveSinglePage(markdown)
  const playground = page.blocks.find((block) => block.type === 'playground')

  assert.ok(playground, 'Expected playground block to be present')
  assert.equal(playground.framework, 'vanilla')
  assert.equal(playground.height, 360)
  assert.equal(playground.entry, '/main.js')
  assert.deepEqual(Object.keys(playground.files).sort(), ['/index.html', '/main.js', '/styles.css'])
  assert.equal(playground.files['/main.js'], "console.log('ok')\n")
})

test('throws clear error when playground-src entry is missing in files', () => {
  const markdown = `\`\`\`playground-src
entry: /main.js

\`\`\`js file=/other.js
console.log('missing entry')
\`\`\`
\`\`\``

  assert.throws(
    () => resolveSinglePage(markdown, '/tmp/content/guide/invalid-playground.md'),
    /Invalid playground-src in \/tmp\/content\/guide\/invalid-playground\.md: entry "\/main\.js" is not present in files/
  )
})
