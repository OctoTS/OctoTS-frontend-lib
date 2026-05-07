import { createRoot } from 'react-dom/client';

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

import ReactECharts from 'echarts-for-react';
import ReactApexChart from 'react-apexcharts';

import { transformNivoData } from '../transformers/nivo.jsx';
import { transformEchartsData } from '../transformers/echarts.jsx';

import { Chart as ChartJS, registerables } from 'chart.js';
import { Chart as ReactChartjs } from 'react-chartjs-2';
import { transformChartjsData } from '../transformers/chartsjs.jsx';

import { guessMapping } from './detector.js';

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

const aggregateData = (data, groupByField, method = 'avg') => {
    if (!groupByField || !data || data.length === 0) return data;

    const grouped = {};
    const numericKeys = Object.keys(data[0]).filter(k => 
        k !== groupByField && !isNaN(parseFloat(data[0][k]))
    );

    data.forEach(row => {
        const key = row[groupByField];
        if (!grouped[key]) {
            grouped[key] = { count: 0, sums: {}, firstRow: { ...row } };
            numericKeys.forEach(nk => grouped[key].sums[nk] = 0);
        }
        grouped[key].count += 1;
        numericKeys.forEach(nk => {
            grouped[key].sums[nk] += (Number(row[nk]) || 0);
        });
    });

    return Object.values(grouped).map(group => {
        const finalRow = { ...group.firstRow };
        numericKeys.forEach(nk => {
            finalRow[nk] = method === 'avg' ? (group.sums[nk] / group.count) : group.sums[nk];
        });
        return finalRow;
    });
};

export const makeplot = (engine = 'nivo', chartType, data, mapping = {}, options = {}) => {
    let chartElement;
    const type = chartType?.toLowerCase();
    const columns = data.length > 0 ? Object.keys(data[0]) : [];

    let finalMapping = { ...mapping };
    if (options.autodetect === true) {
        const detected = guessMapping(data, columns);
        finalMapping = { ...detected, ...mapping };
    }
    
    let finalData = [...data];
    const skipAggregation = ['scatter', 'bubble', 'swarmplot'].includes(type);

    if (!skipAggregation && options.aggregate !== false && finalData.length > 0) {
        const groupKey = finalMapping.x || finalMapping.id || Object.keys(finalData[0])[0];
        finalData = aggregateData(finalData, groupKey, options.aggregate || 'avg');
    }

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

        finalData = transformNivoData(type, finalData, finalMapping);
        const nivoProps = { ...options };

        switch (type) {
            case 'bar':
            case 'radar':
                nivoProps.indexBy = finalMapping.x || options.indexBy || 'id';
                nivoProps.keys = finalMapping.y ? [finalMapping.y] : options.keys || ['value'];
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
                nivoProps.groupBy = finalMapping.x || options.groupBy || 'id';
                nivoProps.value = finalMapping.y || options.value || 'value';
                nivoProps.identity = finalMapping.id || finalMapping.x || 'id'; 
                if (!nivoProps.groups && finalData.length > 0) {
                    nivoProps.groups = Array.from(new Set(finalData.map(item => String(item[nivoProps.groupBy]))));
                }
                finalData = finalData.map(row => ({
                    ...row,
                    [nivoProps.value]: Number(row[nivoProps.value]) || 0
                }));
                break;
            case 'marimekko':
                nivoProps.id = finalMapping.x || options.id || 'id';
                nivoProps.value = finalMapping.y || options.value || 'value';
                if (!nivoProps.dimensions) {
                    nivoProps.dimensions = [{ id: 'Default', value: finalMapping.y || 'value' }];
                }
                break;
            case 'stream':
                nivoProps.keys = finalMapping.y ? [finalMapping.y] : options.keys;
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
    else if (engine === 'echarts') {
        const echartsData = transformEchartsData(type, finalData, finalMapping);
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
                        x: finalMapping.x || firstRowKeys[0],
                        y: finalMapping.y || firstRowKeys[1]
                    }
                }];
                if (finalMapping.series) {
                    option.series[0].encode.seriesName = finalMapping.series;
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
                const radarKeys = firstRowKeys.filter(k => k !== finalMapping.x);
                option.radar = {
                    indicator: radarKeys.map(k => ({ name: k }))
                };
                option.series = [{
                    type: 'radar',
                    data: finalData.map(row => ({
                        value: radarKeys.map(k => Number(row[k]) || 0),
                        name: row[finalMapping.x]
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
                    max: Math.max(...finalData.map(d => Number(d[finalMapping.value || Object.keys(d)[2]]) || 0)),
                    calculable: true,
                    orient: 'horizontal',
                    left: 'center',
                    bottom: '15%'
                };
                option.series = [{
                    type: 'heatmap',
                    encode: {
                        x: finalMapping.x || firstRowKeys[0],
                        y: finalMapping.y || firstRowKeys[1],
                        value: finalMapping.value || firstRowKeys[2]
                    }
                }];
                break;
            default:
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
    else if (engine === 'chartjs') {
        const chartData = transformChartjsData(type, finalData, finalMapping);
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
            plugins: { legend: { position: 'bottom' } },
            ...options
        };
        const container = document.createElement('div');
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.minHeight = '300px';
        const root = createRoot(container);
        root.render(<ReactChartjs type={chartType} data={chartData} options={chartOptions} />);
        return container;
    } 
    else if (engine === 'apexcharts') {
        let apexType = type;
        if (apexType === 'polararea') apexType = 'polarArea';
        if (apexType === 'doughnut') apexType = 'donut'; 
        if (apexType === 'radialbar') apexType = 'radialBar';
        let apexSeries = [];
        let apexOptions = {
            chart: { toolbar: { show: false } },
            legend: { position: 'bottom' },
            ...options
        };
        const firstRowKeys = finalData.length > 0 ? Object.keys(finalData[0]) : [];
        const groupKey = finalMapping.x || finalMapping.id || firstRowKeys[0];
        const valueKey = finalMapping.y || finalMapping.value || firstRowKeys[1];

        if (['pie', 'donut', 'polarArea', 'radialBar'].includes(apexType)) {
            apexSeries = finalData.map(row => Number(row[valueKey]) || 0);
            apexOptions.labels = finalData.map(row => String(row[groupKey]));
        } 
        else if (apexType === 'radar') {
            const radarKeys = firstRowKeys.filter(k => k !== groupKey && !isNaN(parseFloat(finalData[0][k])));
            apexOptions.xaxis = { categories: radarKeys };
            apexSeries = finalData.map(row => ({
                name: String(row[groupKey]),
                data: radarKeys.map(k => Number(row[k]) || 0)
            }));
        } 
        else {
            apexSeries = [{
                name: finalMapping.series || 'Value',
                data: finalData.map(row => ({
                    x: String(row[groupKey]),
                    y: Number(row[valueKey]) || 0
                }))
            }];
            if (!apexOptions.xaxis) apexOptions.xaxis = { type: 'category' };
        }
        const container = document.createElement('div');
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.minHeight = '300px';
        const root = createRoot(container);
        root.render(<ReactApexChart options={apexOptions} series={apexSeries} type={apexType} height="100%" width="100%" />);
        return container;
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
