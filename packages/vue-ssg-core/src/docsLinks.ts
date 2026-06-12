const DOCS_URL_ORIGIN = 'https://docs.local'

export function resolveDocsRouteHref(href: string, pagePath: string): string | null {
  const normalizedHref = href.trim()

  if (!normalizedHref) {
    return null
  }

  if (normalizedHref.startsWith('#')) {
    return normalizedHref
  }

  if (
    normalizedHref.startsWith('//') ||
    /^[a-z][a-z\d+.-]*:/i.test(normalizedHref)
  ) {
    return null
  }

  const baseUrl = new URL(pagePath, DOCS_URL_ORIGIN)
  const targetUrl = new URL(normalizedHref, baseUrl)

  if (targetUrl.origin !== DOCS_URL_ORIGIN) {
    return null
  }

  targetUrl.pathname = targetUrl.pathname
    .replace(/\/index\.(?:md|mdx)$/i, '/')
    .replace(/\.(?:md|mdx)$/i, '')

  return `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`
}
