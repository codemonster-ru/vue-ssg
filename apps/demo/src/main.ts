import VueForgeLayouts from '@codemonster-ru/vueforge-layouts'
import '@codemonster-ru/vueforge-codeblock/style.css'
import '@codemonster-ru/vueforge-core/styles.css'
import '@codemonster-ru/vueforge-layouts/styles.css'
import '@codemonster-ru/vueforge-playground/style.css'
import App from './App.vue'
import { createViteSsgApp } from './lib/createViteSsgApp'
import { routes } from './routes'
import './styles.css'

export const createApp = createViteSsgApp(App, { routes }, ({ app }) => {
  app.use(VueForgeLayouts, {
    defaultTheme: 'system',
    themeStorageKey: 'codemonster-docs-theme'
  })
})
