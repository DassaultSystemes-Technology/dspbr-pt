import { defineConfig } from 'vite';
import { resolve } from 'path';

const shaderPlugin = {
  name: 'glsl-loader',
  transform(code: string, id: string) {
    if (/\.(glsl|frag|vert)$/.test(id)) {
      return { code: `export default ${JSON.stringify(code)};`, map: null };
    }
  },
};

export default defineConfig(({ command }) => ({
  publicDir: command === 'serve' ? resolve(__dirname, '../../assets') : false,

  resolve: {
    alias: {
      'dspbr-pt':        resolve(__dirname, '../lib/index.ts'),
      'dspbr-pt-viewer': resolve(__dirname, '../viewer/main.ts'),
    },
  },

  plugins: [shaderPlugin],

  build: {
    outDir: resolve(__dirname, '../../dist'),
    emptyOutDir: false,
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        simple: resolve(__dirname, 'simple.html'),
      },
    },
  },

  server: {
    open: true,
    fs: {
      allow: [resolve(__dirname, '../..'), resolve(__dirname, '../../assets')],
    },
  },
}));
