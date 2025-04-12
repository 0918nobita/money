import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import { ViteToml } from 'vite-plugin-toml';

export default defineConfig(({ mode }) => ({
    build: {
        rollupOptions: {
            plugins: [
                mode === 'analyze' &&
                    visualizer({
                        open: true,
                        filename: 'dist/stats.html',
                        gzipSize: true,
                        brotliSize: true,
                    }),
            ],
        },
    },
    plugins: [TanStackRouterVite({ target: 'react' }), react(), ViteToml()],
}));
