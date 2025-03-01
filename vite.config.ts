import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
	esbuild: {
		minifyIdentifiers: false,
	},
	build: {
		rollupOptions: {
			input: './main.ts',
			output: {
				dir: './dist',
				entryFileNames: '[name].js',
			},
		},
	},
	plugins: [
		viteStaticCopy({
			targets: [
				{
					src: 'appsscript.json',
					dest: '.',
				},
				{
					src: 'index.html',
					dest: '.',
				},
			],
		}),
	],
});
