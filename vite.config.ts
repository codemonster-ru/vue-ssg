import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';

export default defineConfig({
    plugins: [vue(), dts({ include: ['src/entry-server.ts'] })],
    build: {
        outDir: 'dist-ssr',
        rollupOptions: {
            input: 'src/entry-server.ts',
            external: ['vue'],
        },
    },
});
