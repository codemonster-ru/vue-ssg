import { createMarkdownComponentPlaygrounds } from '@codemonster-ru/vue-ssg-core/playground'

const SCRIPT_BEFORE_BACKTICK_RE = /<\/script>(\s*`)/gi
const SCRIPT_BEFORE_SINGLE_QUOTE_RE = /<\/script>(\s*')/gi
const SCRIPT_BEFORE_DOUBLE_QUOTE_RE = /<\/script>(\s*")/gi

function escapeClosingScriptTagsInScriptBlocks(source) {
  return source
    .replace(SCRIPT_BEFORE_BACKTICK_RE, '<\\/script>$1')
    .replace(SCRIPT_BEFORE_SINGLE_QUOTE_RE, '<\\/script>$1')
    .replace(SCRIPT_BEFORE_DOUBLE_QUOTE_RE, '<\\/script>$1')
}

export function createSafeMarkdownComponentPlaygrounds(options) {
  const result = createMarkdownComponentPlaygrounds(options)
  const demos = result.demos.map((demo) => ({
    ...demo,
    source: escapeClosingScriptTagsInScriptBlocks(demo.source)
  }))

  return {
    ...result,
    demos,
    plugin: {
      ...result.plugin,
      load(id) {
        if (!id.startsWith(result.virtualPrefix)) {
          return null
        }
        const demoId = id.slice(result.virtualPrefix.length).replace(/\.vue$/, '')
        const demo = demos.find((item) => item.id === demoId)
        return demo?.source ?? null
      }
    }
  }
}
