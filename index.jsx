// src/index.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';

// --- NIVO IMPORTS ---
import { ResponsiveBump } from '@nivo/bump';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveLine } from '@nivo/line';
import { ResponsiveStream } from '@nivo/stream';

// --- ECHARTS IMPORTS ---
import ReactECharts from 'echarts-for-react';

// --- CHART.JS IMPORTS ---
import { Chart as ChartJS, registerables } from 'chart.js';
import { Chart } from 'react-chartjs-2';

// --- APEXCHARTS IMPORTS ---
import ReactApexChart from 'react-apexcharts';

ChartJS.register(...registerables);

const NivoComponents = {
    'bump': ResponsiveBump,
    'bar': ResponsiveBar,
    'pie': ResponsivePie,
    'line': ResponsiveLine,
    'stream': ResponsiveStream
};

export const makeplot = (chartType, data, options = {}, engine = 'nivo') => {
    let chartElement;
    const type = chartType?.toLowerCase();

    // 1. SILNIK NIVO
    if (engine === 'nivo') {
        const ChartComponent = NivoComponents[type];
        if (!ChartComponent) {
            const err = document.createElement('div');
            err.style.color = 'red'; err.textContent = `Błąd Nivo: Nieobsługiwany typ "${type}".`;
            return err;
        }
        chartElement = (
            <div style={{ width: '100%', height: '100%' }}>
                <ChartComponent data={data} {...options} />
            </div>
        );
    } 
    // 2. SILNIK ECHARTS
    else if (engine === 'echarts') {
        chartElement = (
            <ReactECharts option={options} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'svg' }} />
        );
    } 
    // 3. SILNIK CHART.JS
    else if (engine === 'chartjs') {
        chartElement = (
            <div style={{ position: 'relative', height: '100%', width: '100%' }}>
                <Chart type={type || 'line'} data={data} options={options} />
            </div>
        );
    }
    // 4. SILNIK APEXCHARTS
    else if (engine === 'apex') {
        chartElement = (
            <div style={{ height: '100%', width: '100%' }}>
                {/* Apex wymaga rozdzielenia options i series(danych) */}
                <ReactApexChart 
                    type={type || 'line'} 
                    series={data} 
                    options={options} 
                    height="100%" 
                    width="100%" 
                />
            </div>
        );
    }
    // BŁĄD SILNIKA
    else {
        const err = document.createElement('div');
        err.style.color = 'red'; err.textContent = `Błąd: Nieobsługiwany silnik "${engine}".`;
        return err;
    }

    const container = document.createElement('div');
    container.style.width = '100%';
    container.style.height = '100%';

    const root = createRoot(container);
    root.render(chartElement);

    return container;
};

if (typeof window !== 'undefined') {
    window.makeplot = makeplot;
}