import * as path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
	clearScreen: false,
	root: path.resolve(import.meta.dirname, 'frontend'),
	build: {
		emptyOutDir: false,
		outDir: path.resolve(import.meta.dirname, 'dist'),
	},
	plugins: [viteSingleFile(), tailwindcss()],
});
