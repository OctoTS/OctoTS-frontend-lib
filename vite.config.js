import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'OctoTSLib',
      formats: ['es'],
      fileName: 'octots-frontend-lib'
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'apexcharts',
        'react-apexcharts',
        'chart.js',
        'react-chartjs-2',
        'echarts',
        'echarts-for-react',
        '@nivo/swarmplot',
        '@nivo/calendar',
        '@nivo/bump'
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  }
});
