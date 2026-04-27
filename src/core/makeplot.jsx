import { createRoot } from 'react-dom/client';

// --- NIVO IMPORTS ---
import { ResponsiveBump } from '@nivo/bump';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveLine } from '@nivo/line';
import { ResponsiveStream } from '@nivo/stream';
import { ResponsiveScatterPlot } from '@nivo/scatterplot';
import { ResponsiveRadar } from '@nivo/radar';
import { ResponsiveHeatMap } from '@nivo/heatmap';
import { ResponsiveChoropleth, ResponsiveGeoMap } from '@nivo/geo';
import { ResponsiveNetwork } from '@nivo/network';
import { ResponsiveTreeMap } from '@nivo/treemap';
import { ResponsiveSunburst } from '@nivo/sunburst';
import { ResponsiveChord } from '@nivo/chord';
import { ResponsiveFunnel } from '@nivo/funnel';
import { ResponsiveParallelCoordinates } from '@nivo/parallel-coordinates';
import { ResponsiveSankey } from '@nivo/sankey';
import { ResponsiveSwarmPlot } from '@nivo/swarmplot';
import { ResponsiveMarimekko } from '@nivo/marimekko';
import { ResponsiveBullet } from '@nivo/bullet';
import { ResponsiveWaffle } from '@nivo/waffle';
import { ResponsiveCalendar, ResponsiveTimeRange } from '@nivo/calendar';
import { ResponsiveRadialBar } from '@nivo/radial-bar';

// --- INNE SILNIKI ---
import ReactECharts from 'echarts-for-react';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Chart } from 'react-chartjs-2';
import ReactApexChart from 'react-apexcharts';

// --- TRANSFORMERY ---
import { transformNivoData } from '../transformers/nivo.jsx';

ChartJS.register(...registerables);

const NivoComponents = {
    'bump': ResponsiveBump,
    'bar': ResponsiveBar,
    'pie': ResponsivePie,
    'line': ResponsiveLine,
    'stream': ResponsiveStream,
    'scatterplot': ResponsiveScatterPlot,
    'radar': ResponsiveRadar,
    'heatmap': ResponsiveHeatMap,
    'choropleth': ResponsiveChoropleth,
    'geomap': ResponsiveGeoMap,
    'network': ResponsiveNetwork,
    'treemap': ResponsiveTreeMap,
    'sunburst': ResponsiveSunburst,
    'chord': ResponsiveChord,
    'funnel': ResponsiveFunnel,
    'parallel': ResponsiveParallelCoordinates,
    'sankey': ResponsiveSankey,
    'swarmplot': ResponsiveSwarmPlot,
    'marimekko': ResponsiveMarimekko,
    'bullet': ResponsiveBullet,
    'waffle': ResponsiveWaffle,
    'calendar': ResponsiveCalendar,
    'timerange': ResponsiveTimeRange,
    'radialbar': ResponsiveRadialBar
};

export const makeplot = (chartType, data, mapping = {}, options = {}, engine = 'nivo') => {
    let chartElement;
    const type = chartType?.toLowerCase();
    
    let finalData = data;

    // 1. SILNIK NIVO
    if (engine === 'nivo') {
        const ChartComponent = NivoComponents[type];
        if (!ChartComponent) {
            const err = document.createElement('div');
            err.style.color = 'red'; 
            err.textContent = `Błąd Nivo: Nieobsługiwany typ "${type}".`;
            return err;
        }

        // --- TRANSFORMACJA DANYCH DLA NIVO ---
        finalData = transformNivoData(type, data, mapping);

        // --- TLUMACZENIE MAPPINGU NA PROPSY NIVO ---
        const nivoProps = { ...options };

        if (type === 'bar') {
            // Nivo Bar wymaga specjalnego wskazania kolumn
            nivoProps.indexBy = mapping.x || options.indexBy || 'id';
            nivoProps.keys = mapping.y ? [mapping.y] : options.keys || ['value'];
        }

        chartElement = (
            <div style={{ width: '100%', height: '100%' }}>
                <ChartComponent data={finalData} {...nivoProps} />
            </div>
        );
    }
    // 2. SILNIK ECHARTS
    else if (engine === 'echarts') {
        // Tu w przyszłości dodasz np: finalData = transformEchartsData(type, data, mapping);
        chartElement = (
            <ReactECharts option={options} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'svg' }} />
        );
    } 
    // 3. SILNIK CHART.JS
    else if (engine === 'chartjs') {
        // Tu w przyszłości dodasz np: finalData = transformChartJsData(type, data, mapping);
        chartElement = (
            <div style={{ position: 'relative', height: '100%', width: '100%' }}>
                <Chart type={type || 'line'} data={data} options={options} />
            </div>
        );
    }
    // 4. SILNIK APEXCHARTS
    else if (engine === 'apex') {
        // Tu w przyszłości dodasz np: finalData = transformApexData(type, data, mapping);
        chartElement = (
            <div style={{ height: '100%', width: '100%' }}>
                <ReactApexChart type={type || 'line'} series={data} options={options} height="100%" width="100%" />
            </div>
        );
    }
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