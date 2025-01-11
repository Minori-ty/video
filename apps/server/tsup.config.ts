import { defineConfig } from 'tsup';
import { resolve } from 'path';

export default defineConfig({
  entry: ['src/app.ts'],
  format: ['cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  tsconfig: resolve(__dirname, './tsconfig.json'),
  esbuildOptions(options) {
    options.alias = {
      '@': resolve(__dirname, './src'),
    };
  },
});
