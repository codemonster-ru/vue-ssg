import { defineConfig } from 'tsup';

export default defineConfig({
    format: ['cjs', 'esm'],
    entry: ['./src/render.ts'],
    dts: true,
    shims: true,
    skipNodeModulesBundle: true,
    clean: true,
});
