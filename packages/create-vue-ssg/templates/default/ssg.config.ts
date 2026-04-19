import { defineDocsConfig } from '@codemonster-ru/vue-ssg-core'

export default defineDocsConfig({
  site: {
    title: '__PROJECT_NAME__'
  },
  home: {
    enabled: true,
    title: 'Welcome to __PROJECT_NAME__',
    description: 'Edit ssg.config.ts and content/*.md to shape your site.'
  }
})
