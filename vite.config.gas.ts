import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
	clearScreen: false,
	esbuild: {
		minifyIdentifiers: false,
	},
	build: {
		emptyOutDir: false,
		lib: {
			entry: './main.ts',
			formats: ['es'],
			fileName: (_format, entryName) => `${entryName}.js`,
		},
	},
	plugins: [
		viteStaticCopy({
			targets: [
				{
					src: 'appsscript.json',
					dest: '.',
				},
			],
		}),
	],
});
