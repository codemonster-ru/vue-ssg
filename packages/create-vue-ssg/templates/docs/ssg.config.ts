import { defineDocsConfig } from '@codemonster-ru/vue-ssg-core'
import DocsLogoIcon from './src/components/DocsLogoIcon.vue'
import { createDocsBaseConfig } from './ssg.base.config'

const currentYear = new Date().getFullYear()
const baseConfig = createDocsBaseConfig(currentYear)

export default defineDocsConfig({
  ...baseConfig,
  site: {
    ...(baseConfig.site ?? {}),
    logo: {
      ...(baseConfig.site?.logo ?? {}),
      component: DocsLogoIcon
    }
  }
})
