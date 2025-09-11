import { renderToString } from '@vue/server-renderer';
import { markdownToHtml } from '@codemonster-ru/markus';
import fs from 'fs';
import path from 'path';
import { createApp } from '../dist-ssr/entry-server.js';

export async function buildSite(inputDir: string, outDir: string) {
    const files = fs.readdirSync(inputDir);

    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir);
    }

    for (const file of files) {
        if (!file.endsWith('.md')) continue;

        const filePath = path.join(inputDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const html = markdownToHtml(content);

        const { app } = createApp({ html });

        const appHtml = await renderToString(app);
        const rendered = `<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8" />
    </head>
    <body>
        ${appHtml}
    </body>
</html>`;

        const outPath = path.join(outDir, file.replace('.md', '.html'));

        fs.writeFileSync(outPath, rendered, 'utf-8');
    }
}
