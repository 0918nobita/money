import fs from 'node:fs';
import path from 'node:path';
import typescript from '@rollup/plugin-typescript';
import gas from 'rollup-plugin-google-apps-script';
import { defineConfig } from 'vite';

export default defineConfig({
	build: {
		rollupOptions: {
			input: './main.ts',
			output: {
				dir: './dist',
				entryFileNames: '[name].js',
			},
		},
		minify: false,
	},
	plugins: [
		typescript(),
		gas(),
		{
			name: 'google-apps-script',
			writeBundle() {
				const srcFile = path.resolve(import.meta.dirname, 'appsscript.json');

				const destDir = path.resolve(import.meta.dirname, 'dist');
				const destFile = path.resolve(destDir, 'appsscript.json');

				if (!fs.existsSync(destDir)) {
					fs.mkdirSync(destDir);
				}

				fs.copyFileSync(srcFile, destFile);

				console.log('Copied appsscript.json');
			},
		},
	],
});
