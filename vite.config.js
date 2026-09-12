import { defineConfig } from 'vite';

export default defineConfig({
  base: '/docker-gen/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    port: 8080,
    open: true,
  },
  test: {
    globals: true,
  },
});
