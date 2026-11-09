import { defineConfig } from 'vite';

// The dev server needs a localhost websocket for hot reload; production builds must not allow it.
const prodCsp = { name: 'prod-csp', apply: 'build', transformIndexHtml: (html) => html.replace(' ws://localhost:*', '') };

export default defineConfig({ plugins: [prodCsp], build: { outDir: 'dist', target: 'es2022', chunkSizeWarningLimit: 1500 } });
