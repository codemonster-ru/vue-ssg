import test from 'node:test'
import assert from 'node:assert/strict'

import { resolveDocsRouteHref } from '../dist/index.js'

test('resolves relative docs links from the current page route', () => {
  assert.equal(
    resolveDocsRouteHref('installation', '/annabel/getting-started'),
    '/annabel/installation'
  )
  assert.equal(
    resolveDocsRouteHref('../configuration', '/annabel/basics/routing'),
    '/annabel/configuration'
  )
})

test('preserves query and hash fragments', () => {
  assert.equal(
    resolveDocsRouteHref('./api.md?mode=full#usage', '/annabel/getting-started'),
    '/annabel/api?mode=full#usage'
  )
  assert.equal(resolveDocsRouteHref('#usage', '/annabel/getting-started'), '#usage')
})

test('normalizes index markdown links to directory routes', () => {
  assert.equal(
    resolveDocsRouteHref('./index.md', '/annabel/getting-started'),
    '/annabel/'
  )
  assert.equal(
    resolveDocsRouteHref('../guide/index.mdx', '/annabel/basics/routing'),
    '/annabel/guide/'
  )
})

test('keeps absolute application routes inside the router', () => {
  assert.equal(
    resolveDocsRouteHref('/vueforge-core/components/button', '/annabel/getting-started'),
    '/vueforge-core/components/button'
  )
})

test('rejects external and non-navigation links', () => {
  assert.equal(resolveDocsRouteHref('https://example.com/docs.md', '/annabel/getting-started'), null)
  assert.equal(
    resolveDocsRouteHref(' https://example.com/docs.md ', '/annabel/getting-started'),
    null
  )
  assert.equal(resolveDocsRouteHref('//example.com/docs.md', '/annabel/getting-started'), null)
  assert.equal(resolveDocsRouteHref('\\\\example.com/docs.md', '/annabel/getting-started'), null)
  assert.equal(resolveDocsRouteHref('mailto:test@example.com', '/annabel/getting-started'), null)
  assert.equal(resolveDocsRouteHref('tel:+123', '/annabel/getting-started'), null)
  assert.equal(resolveDocsRouteHref('', '/annabel/getting-started'), null)
  assert.equal(resolveDocsRouteHref('   ', '/annabel/getting-started'), null)
})
