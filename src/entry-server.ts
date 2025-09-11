import { createSSRApp } from 'vue';
import App from './App.vue';

export function createApp(props: { html: string }) {
    const app = createSSRApp(App, props);

    return { app };
}
