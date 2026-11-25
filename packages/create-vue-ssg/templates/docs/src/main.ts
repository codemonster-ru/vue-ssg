import '@codemonster-ru/ui-tokens/tokens.css'
import '@codemonster-ru/ui-css/fonts.css'
import '@codemonster-ru/ui-css/styles.css'
import '@codemonster-ru/ui-codeblock/style.css'
import '@codemonster-ru/ui-playground/style.css'
import App from './App.vue'
import { createViteSsgApp } from './lib/createViteSsgApp'
import { routes } from './routes'
import './styles.css'

export const createApp = createViteSsgApp(App, { routes })
