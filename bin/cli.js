#!/usr/bin/env node
import { buildSite } from '../dist/render.js';

const input = process.argv[2] || 'content';
const output = process.argv[3] || 'dist';

buildSite(input, output).then(() => {
    console.log('🎉 The site has been successfully built!');
});
