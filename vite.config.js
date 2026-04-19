import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': '"production"'
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'index.jsx'),
      name: 'MyPlotLib',
      fileName: () => `my-plot-lib.js`,
      formats: ['iife']
    },
    rollupOptions: {
    }
  }
});