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
import ReactApexChart from 'react-apexcharts';

// --- TRANSFORMERY ---
import { transformNivoData } from '../transformers/nivo.jsx';
import { transformEchartsData } from '../transformers/echarts.jsx';

import { Chart as ChartJS, registerables } from 'chart.js';
import { Chart as ReactChartjs } from 'react-chartjs-2';
import { transformChartjsData } from '../transformers/chartsjs.jsx';

// Rejestracja wszystkich kontrolerów i elementów Chart.js
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
// --- FUNKCJA POMOCNICZA DO AGREGACJI (ŚREDNIA) ---
const aggregateData = (data, groupByField, valueField, method = 'avg') => {
    if (!groupByField || !valueField || !data || data.length === 0) return data;

    const grouped = {};

    data.forEach(row => {
        const key = row[groupByField];
        const val = Number(row[valueField]) || 0;

        if (!grouped[key]) {
            grouped[key] = { sum: 0, count: 0, firstRow: { ...row } };
        }
        grouped[key].sum += val;
        grouped[key].count += 1;
    });

    return Object.values(grouped).map(group => {
        let finalValue = group.sum;
        if (method === 'avg') {
            finalValue = group.sum / group.count;
        }
        return {
            ...group.firstRow,
            [valueField]: finalValue
        };
    });
};

// --- GŁÓWNA FUNKCJA MAKEPLOT ---
export const makeplot = (engine = 'nivo', chartType, data, mapping = {}, options = {}) => {
    let chartElement;
    const type = chartType?.toLowerCase();
    
    // 1. Zabezpieczamy dane i od razu robimy agregację
    // 1. Zabezpieczamy dane i od razu robimy agregację
    let finalData = [...data];
    // DODANO swarmplot DO POMIJANYCH:
    const skipAggregation = ['scatter', 'bubble', 'swarmplot'].includes(type);

    if (!skipAggregation && options.aggregate !== false && finalData.length > 0) {
        const groupKey = mapping.x || mapping.id || Object.keys(finalData[0])[0];
        const valueKey = mapping.y || mapping.value || Object.keys(finalData[0])[1];
        finalData = aggregateData(finalData, groupKey, valueKey, options.aggregate || 'avg');
    }

    // ==========================================
    // 1. SILNIK NIVO
    // ==========================================
    if (engine === 'nivo') {
        const ChartComponent = NivoComponents[type];
        if (!ChartComponent) {
            const err = document.createElement('div');
            err.style.color = 'red'; 
            err.textContent = `Błąd Nivo: Nieobsługiwany typ "${type}".`;
            return err;
        }

        const unsupportedCharts = ['parallel', 'choropleth', 'geomap'];
        if (unsupportedCharts.includes(type)) {
            console.warn(`[MakePlot] Wykres typu '${type}' nie jest obsługiwany przez tę bibliotekę.`);
            const errorContainer = document.createElement('div');
            errorContainer.style.display = 'flex';
            errorContainer.style.alignItems = 'center';
            errorContainer.style.justifyContent = 'center';
            errorContainer.style.height = '100%';
            errorContainer.style.width = '100%';
            errorContainer.style.backgroundColor = '#ffeeee';
            errorContainer.style.color = '#cc0000';
            errorContainer.style.borderRadius = '4px';
            errorContainer.style.padding = '10px';
            errorContainer.style.textAlign = 'center';
            errorContainer.style.boxSizing = 'border-box';
            errorContainer.innerHTML = `Wykres typu <b>${type}</b> nie jest obecnie obsługiwany.`;
            return errorContainer;
        }

        // Transformacja pod Nivo z użyciem ZAGREGOWANYCH danych
        finalData = transformNivoData(type, finalData, mapping);
        const nivoProps = { ...options };

        switch (type) {
            case 'bar':
            case 'radar':
                nivoProps.indexBy = mapping.x || options.indexBy || 'id';
                nivoProps.keys = mapping.y ? [mapping.y] : options.keys || ['value'];
                break;

            case 'treemap':
                nivoProps.identity = 'id';
                nivoProps.value = 'value';
                break;

            case 'sunburst':
                nivoProps.id = 'id';
                nivoProps.value = 'value';
                nivoProps.cornerRadius = 2;
                break;

            case 'calendar':
            case 'timerange':
                if (!nivoProps.from) nivoProps.from = finalData[0]?.day || '2023-01-01';
                if (!nivoProps.to) nivoProps.to = finalData[finalData.length - 1]?.day || '2023-12-31';
                break;

            case 'chord':
                nivoProps.keys = finalData.keys;
                finalData = finalData.matrix; 
                break;

            case 'swarmplot':
                nivoProps.groupBy = mapping.x || options.groupBy || 'id';
                nivoProps.value = mapping.y || options.value || 'value';
                nivoProps.identity = mapping.id || mapping.x || 'id'; 
                if (!nivoProps.groups && finalData.length > 0) {
                    nivoProps.groups = Array.from(new Set(finalData.map(item => String(item[nivoProps.groupBy]))));
                }
                finalData = finalData.map(row => ({
                    ...row,
                    [nivoProps.value]: Number(row[nivoProps.value]) || 0
                }));
                break;

            case 'marimekko':
                nivoProps.id = mapping.x || options.id || 'id';
                nivoProps.value = mapping.y || options.value || 'value';
                if (!nivoProps.dimensions) {
                    nivoProps.dimensions = [{ id: 'Domyślny wymiar', value: mapping.y || 'value' }];
                }
                break;

            case 'stream':
                nivoProps.keys = mapping.y ? [mapping.y] : options.keys;
                if (nivoProps.keys && finalData.length > 0) {
                    finalData = finalData.map(row => {
                        const cleanRow = { ...row };
                        nivoProps.keys.forEach(key => {
                            cleanRow[key] = Number(cleanRow[key]) || 0;
                        });
                        return cleanRow;
                    });
                }
                break;
        }

        chartElement = (
            <div style={{ width: '100%', height: '100%' }}>
                <ChartComponent data={finalData} {...nivoProps} />
            </div>
        );
    }
    // ==========================================
    // 2. SILNIK ECHARTS
    // ==========================================
    else if (engine === 'echarts') {
        // Przekazujemy finalData (zagregowane) zamiast data
        const echartsData = transformEchartsData(type, finalData, mapping);
        
        let option = {
            tooltip: { trigger: 'item' },
            legend: { top: 'bottom' },
            ...options 
        };

        const firstRowKeys = finalData.length > 0 ? Object.keys(finalData[0]) : [];

        switch (type) {
            case 'bar':
            case 'line':
            case 'scatter':
            case 'area':
                option.dataset = { source: finalData }; 
                option.xAxis = { type: 'category' }; 
                option.yAxis = { type: 'value' };
                option.series = [{
                    type: type === 'area' ? 'line' : type,
                    areaStyle: type === 'area' ? {} : undefined,
                    encode: {
                        x: mapping.x || firstRowKeys[0],
                        y: mapping.y || firstRowKeys[1]
                    }
                }];
                if (mapping.series) {
                    option.series[0].encode.seriesName = mapping.series;
                }
                break;

            case 'pie':
            case 'funnel':
                option.series = [{
                    type: type,
                    data: echartsData,
                    radius: type === 'pie' ? ['40%', '70%'] : undefined, 
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }];
                break;

            case 'radar':
                const radarKeys = firstRowKeys.filter(k => k !== mapping.x);
                option.radar = {
                    indicator: radarKeys.map(k => ({ name: k }))
                };
                option.series = [{
                    type: 'radar',
                    data: finalData.map(row => ({
                        value: radarKeys.map(k => Number(row[k]) || 0),
                        name: row[mapping.x]
                    }))
                }];
                break;

            case 'treemap':
            case 'sunburst':
                option.series = [{
                    type: type,
                    data: echartsData,
                    roam: false,
                    label: { show: true, formatter: '{b}' } 
                }];
                break;

            case 'network':
            case 'graph':
                option.series = [{
                    type: 'graph',
                    layout: 'force',
                    data: echartsData.data,
                    links: echartsData.links,
                    roam: true,
                    label: { show: true }
                }];
                break;

            case 'sankey':
                option.series = [{
                    type: 'sankey',
                    data: echartsData.data,
                    links: echartsData.links,
                    emphasis: { focus: 'adjacency' },
                    lineStyle: { color: 'gradient', curveness: 0.5 }
                }];
                break;

            case 'heatmap':
                option.dataset = { source: finalData };
                option.xAxis = { type: 'category' };
                option.yAxis = { type: 'category' };
                option.visualMap = {
                    min: 0,
                    max: Math.max(...finalData.map(d => Number(d[mapping.value || Object.keys(d)[2]]) || 0)),
                    calculable: true,
                    orient: 'horizontal',
                    left: 'center',
                    bottom: '15%'
                };
                option.series = [{
                    type: 'heatmap',
                    encode: {
                        x: mapping.x || firstRowKeys[0],
                        y: mapping.y || firstRowKeys[1],
                        value: mapping.value || firstRowKeys[2]
                    }
                }];
                break;

            default:
                console.warn(`[MakePlot] Wykres typu '${type}' nie ma specyficznej konfiguracji w ECharts.`);
                option.dataset = { source: finalData };
                option.series = [{ type: type }];
                break;
        }

        const container = document.createElement('div');
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.minHeight = '300px';

        const root = createRoot(container);
        root.render(
            <ReactECharts 
                option={option} 
                style={{ height: '100%', width: '100%' }} 
                opts={{ renderer: 'svg' }} 
            />
        );
        return container;
    }
    // ==========================================
    // 3. SILNIK CHART.JS
    // ==========================================
    else if (engine === 'chartjs') {
        // Używamy finalData
        const chartData = transformChartjsData(type, finalData, mapping);
        
        let chartType = type;
        if (chartType === 'polararea') chartType = 'polarArea';
        if (chartType === 'area') {
            chartType = 'line';
            chartData.datasets.forEach(ds => ds.fill = true); 
        }
        if (chartType === 'donut') chartType = 'doughnut';

        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            },
            ...options
        };

        const container = document.createElement('div');
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.minHeight = '300px';

        const root = createRoot(container);
        root.render(
            <ReactChartjs 
                type={chartType}
                data={chartData} 
                options={chartOptions} 
            />
        );
        return container;
    } 
    // ==========================================
    // FALLBACK
    // ==========================================
    else {
        const err = document.createElement('div');
        err.style.color = 'red'; err.textContent = `Błąd: Nieobsługiwany silnik "${engine}".`;
        return err;
    }

    // Wykonuje się tylko dla Nivo (inne silniki mają własne return)
    const container = document.createElement('div');
    container.style.width = '100%';
    container.style.height = '100%';

    const root = createRoot(container);
    root.render(chartElement);

    return container;
};