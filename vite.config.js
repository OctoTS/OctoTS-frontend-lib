// vite.config.js
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      // Ścieżka do Twojego pliku źródłowego
      entry: resolve(__dirname, 'index.js'),
      
      // Nazwa zmiennej globalnej, pod którą będzie dostępna biblioteka
      // (np. w przeglądarce będzie to window.OctoTS)
      name: 'OctoTS', 
      
      // Nazwa pliku wyjściowego
      fileName: (format) => `octo-ts.${format}.js`
    }
  }
});