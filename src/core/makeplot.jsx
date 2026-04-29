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
import ReactApexChart from 'react-apexcharts';

// --- TRANSFORMERY ---
import { transformNivoData } from '../transformers/nivo.jsx';
import { transformEchartsData } from '../transformers/echarts.jsx';

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

export const makeplot = (engine = 'nivo', chartType, data, mapping = {}, options = {}) => {
    console.log(engine);
    
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

        const unsupportedCharts = ['parallel', 'choropleth', 'geomap'];
        if (unsupportedCharts.includes(type.toLowerCase())) {
            console.warn(`[MakePlot] Wykres typu '${type}' nie jest obsługiwany przez tę bibliotekę.`);
            
            // Tworzymy klasyczny element DOM zamiast zwracać JSX (React)
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

        // ... (pobieranie komponentu ChartComponent i transformacja danych)
        let finalData = transformNivoData(type, data, mapping);
        const nivoProps = { ...options };

        switch (type) {
            case 'bar':
            case 'radar':
                nivoProps.indexBy = mapping.x || options.indexBy || 'id';
                nivoProps.keys = mapping.y ? [mapping.y] : options.keys || ['value'];
                break;

            case 'swarmplot':
                nivoProps.groupBy = mapping.x || options.groupBy || 'id';
                nivoProps.value = mapping.y || options.value || 'value';
                nivoProps.identity = mapping.id || mapping.x || 'id'; 
                if (!nivoProps.groups && finalData.length > 0) {
                    nivoProps.groups = Array.from(new Set(finalData.map(item => String(item[nivoProps.groupBy]))));
                }
                finalData = finalData.map(row => ({ ...row, [nivoProps.value]: Number(row[nivoProps.value]) || 0 }));
                break;
            
            // --- 2. NAPRAWA SUNBURST I TREEMAP ---
            case 'treemap':
                nivoProps.identity = 'id';
                nivoProps.value = 'value';
                break;

            case 'sunburst':
                nivoProps.id = 'id';
                nivoProps.value = 'value';
                nivoProps.cornerRadius = 2; // Czasem pomaga D3 narysować krawędzie
                break;

            // (resztę switcha, np. calendar, chord, bullet zostawiasz bez zmian. 
            // Możesz usunąć case dla parallel, choropleth i geomap, bo i tak do nich nie dojdziemy)

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
                
                // 1. Nivo musi umieć unikalnie zidentyfikować każdą "kulkę"
                nivoProps.identity = mapping.id || mapping.x || 'id'; 
                
                // 2. SwarmPlot absolutnie wymaga zdefiniowanej tablicy grup!
                if (!nivoProps.groups && finalData.length > 0) {
                    nivoProps.groups = Array.from(new Set(finalData.map(item => String(item[nivoProps.groupBy]))));
                }

                // 3. Upewniamy się, że wartość Y jest liczbą
                finalData = finalData.map(row => ({
                    ...row,
                    [nivoProps.value]: Number(row[nivoProps.value]) || 0
                }));
                break;

            case 'parallel':
                if (!nivoProps.variables && finalData.length > 0) {
                    // Wykluczamy klucz etykiety/kategorii
                    const excludeKey = mapping.id || mapping.x || 'id';
                    
                    // Szukamy kluczy, ale sprawdzamy, czy pierwszy wiersz to faktycznie liczba
                    // Wykluczymy tym samym ewentualne inne kolumny tekstowe z CSV
                    const keys = Object.keys(finalData[0]).filter(k => 
                        k !== excludeKey && !isNaN(parseFloat(finalData[0][k]))
                    );
                    
                    nivoProps.variables = keys.map(k => ({ 
                        id: k,       // Nowsze Nivo
                        key: k,      // Starsze Nivo
                        value: k,    // Akcesor wartości (rozwiązuje błąd pustych linii)
                        type: 'linear',
                        min: 'auto',
                        max: 'auto'
                    }));
                }

                // PANCERNE CZYSZCZENIE DANYCH:
                // Budujemy czyste obiekty tylko z tym, co potrzebuje Parallel i wymuszamy float
                finalData = finalData.map(row => {
                    const cleanRow = {};
                    nivoProps.variables.forEach(v => {
                        // Jeśli w komórce jest pusto lub błąd - wymuszamy 0, by skala nie padła
                        cleanRow[v.id] = parseFloat(row[v.id]) || 0; 
                    });
                    return cleanRow;
                });
                break;

            case 'marimekko':
                nivoProps.id = mapping.x || options.id || 'id';
                nivoProps.value = mapping.y || options.value || 'value';
                if (!nivoProps.dimensions) {
                    nivoProps.dimensions = [{ id: 'Domyślny wymiar', value: mapping.y || 'value' }];
                }
                break;

            case 'stream':
                // Wyciągamy klucze z mapowania lub opcji
                nivoProps.keys = mapping.y ? [mapping.y] : options.keys;
                
                if (nivoProps.keys && finalData.length > 0) {
                    // Wymuszamy konwersję wartości na liczby, by d3-shape nie wygenerowało NaN
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
        const echartsData = transformEchartsData(type, data, mapping);
        
        // --- BAZOWY OBIEKT KONFIGURACYJNY ---
        let option = {
            tooltip: { trigger: 'item' },
            legend: { top: 'bottom' },
            ...options // nadpisywanie opcjami z zewnątrz
        };

        // --- MAPOWANIE WYKRESÓW ---
        switch (type.toLowerCase()) {
            
            // 1. Wykresy Kartezjańskie (z osiami X i Y)
            case 'bar':
            case 'line':
            case 'scatter':
            case 'area':
                option.dataset = { source: data }; // Używamy surowych danych
                option.xAxis = { type: 'category' }; // Domyślnie kategorie na X
                option.yAxis = { type: 'value' };
                option.series = [{
                    type: type === 'area' ? 'line' : type,
                    areaStyle: type === 'area' ? {} : undefined,
                    encode: {
                        x: mapping.x || Object.keys(data[0])[0],
                        y: mapping.y || Object.keys(data[0])[1]
                    }
                }];
                // Obsługa podziału na serie (np. Miasta)
                if (mapping.series) {
                    option.series[0].encode.seriesName = mapping.series;
                }
                break;

            // 2. Wykresy Kołowe / Lejki
            case 'pie':
            case 'funnel':
                option.series = [{
                    type: type,
                    data: echartsData,
                    radius: type === 'pie' ? ['40%', '70%'] : undefined, // Robimy ładnego Donuta domyślnie
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }];
                break;

            // 3. Radar
            case 'radar':
                // Radar w ECharts jest specyficzny, wymaga definicji 'indicator'
                const keys = Object.keys(data[0]).filter(k => k !== mapping.x);
                option.radar = {
                    indicator: keys.map(k => ({ name: k }))
                };
                option.series = [{
                    type: 'radar',
                    data: data.map(row => ({
                        value: keys.map(k => Number(row[k]) || 0),
                        name: row[mapping.x]
                    }))
                }];
                break;

            // 4. Hierarchiczne
            case 'treemap':
            case 'sunburst':
                option.series = [{
                    type: type,
                    data: echartsData,
                    // Dodatkowe opcje wyglądu dla hierarchicznych
                    roam: false,
                    label: { show: true, formatter: '{b}' } 
                }];
                break;

            // 5. Sieciowe i Przepływy
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

            // 6. Heatmapa
            case 'heatmap':
                option.dataset = { source: data };
                option.xAxis = { type: 'category' };
                option.yAxis = { type: 'category' };
                option.visualMap = {
                    min: 0,
                    max: Math.max(...data.map(d => Number(d[mapping.value || Object.keys(d)[2]]) || 0)),
                    calculable: true,
                    orient: 'horizontal',
                    left: 'center',
                    bottom: '15%'
                };
                option.series = [{
                    type: 'heatmap',
                    encode: {
                        x: mapping.x || Object.keys(data[0])[0],
                        y: mapping.y || Object.keys(data[0])[1],
                        value: mapping.value || Object.keys(data[0])[2]
                    }
                }];
                break;

            default:
                console.warn(`[MakePlot] Wykres typu '${type}' nie ma specyficznej konfiguracji w ECharts, próbuję standardowego rysowania.`);
                option.dataset = { source: data };
                option.series = [{ type: type }];
                break;
        }

        // Zwracamy komponent ECharts
        const container = document.createElement('div');
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.minHeight = '300px';

        // 2. Importujemy narzędzie do renderowania Reacta (upewnij się, że masz to zaimportowane na górze pliku!)
        // import { createRoot } from 'react-dom/client'; 

        // 3. Renderujemy komponent ReactECharts wewnątrz naszego kontenera DOM
        const root = createRoot(container);
        root.render(
            <ReactECharts 
                option={option} 
                style={{ height: '100%', width: '100%' }} 
                opts={{ renderer: 'svg' }} 
            />
        );

        // 4. Zwracamy gotowy węzeł DOM, tak jak oczekuje tego HTML i appendChild
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