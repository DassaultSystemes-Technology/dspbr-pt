import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['index.ts'],
  format: ['esm'],
  dts: true,
  splitting: true,
  clean: true,
  esbuildOptions(options) {
    options.loader = {
      ...options.loader,
      '.glsl': 'text',
      '.frag': 'text',
      '.vert': 'text',
    };
  },
});
