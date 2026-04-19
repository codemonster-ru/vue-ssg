import { createViteSsgApp } from '@codemonster-ru/vue-ssg-core'
import App from './App.vue'
import { routes } from './routes'

export const createApp = createViteSsgApp(App, { routes })
