/**
 * Plik: src/transformers/nivo.js
 * * @param {string} type - Typ wykresu (np. 'line', 'pie', 'bar')
 * @param {Array} data - Płaskie dane z CSV (tablica obiektów)
 * @param {Object} mapping - Obiekt wskazujący, z których kolumn korzystać
 */
const parseToArray = (val) => String(val || '').split(/[,;-]/).map(Number).filter(n => !isNaN(n));

export const transformNivoData = (type, data, mapping = {}) => {
    if (!data || data.length === 0) return [];

    switch (type?.toLowerCase()) {
        // --- GRUPA 1: Wykresy oparte na seriach ---
        // (Line, Bump, ScatterPlot, RadialBar)
        case 'line':
        case 'bump':
        case 'scatterplot':
        case 'radialbar':
            if (!mapping.x || !mapping.y) return data;
            
            if (mapping.series) {
                const grouped = data.reduce((acc, row) => {
                    const seriesName = row[mapping.series] || 'Brak serii';
                    if (!acc[seriesName]) acc[seriesName] = [];
                    acc[seriesName].push({ x: row[mapping.x], y: row[mapping.y] });
                    return acc;
                }, {});

                return Object.keys(grouped).map(key => ({
                    id: String(key),
                    data: grouped[key]
                }));
            } else {
                return [{
                    id: String(mapping.y),
                    data: data.map(row => ({ x: row[mapping.x], y: row[mapping.y] }))
                }];
            }

        // --- GRUPA 2: Wykresy kategoria-wartość (oraz mapy) ---
        // (Pie, Funnel, Waffle, Choropleth, GeoMap)
        // Uwaga dla map: Wymagają one podania geometrii GeoJSON w opcjach wykresu (props 'features')
        case 'pie':
        case 'funnel':
        case 'waffle':
        case 'choropleth':
        case 'geomap':
            if (!mapping.id || !mapping.value) return data;
            return data.map(row => ({
                id: String(row[mapping.id]),
                label: String(row[mapping.id]),
                value: Number(row[mapping.value]) || 0
            }));

        // --- GRUPA 3: Wykresy hierarchiczne ---
        // (TreeMap, Sunburst)
        case 'treemap':
        case 'sunburst': {
            const idKey = mapping.id || Object.keys(data[0])[0];
            const valKey = mapping.value || Object.keys(data[0])[1];

            const groupedData = {};
            data.forEach(row => {
                const key = String(row[idKey] || 'Nieznane');
                // Wymuszamy float, na wypadek gdyby z CSV przyszły ułamki tekstowe
                const val = parseFloat(row[valKey]) || 0; 
                
                if (val > 0) {
                    groupedData[key] = (groupedData[key] || 0) + val;
                }
            });

            const children = Object.entries(groupedData).map(([key, val]) => ({
                id: key,
                value: val
            }));

            // Zabezpieczenie na wypadek całkowitego braku danych
            if (children.length === 0) {
                children.push({ id: 'Brak poprawnych danych', value: 1 });
            }

            const result = {
                id: 'Root',
                children: children
            };

            // Wypisujemy dane do konsoli, by sprawdzić co się wygenerowało!
            console.log(`[Transform] Dane wygenerowane dla ${type}:`, result);
            
            return result;
        }

        // --- GRUPA 4: Grafy węzłów i przepływy ---
        // (Network, Sankey)
        case 'network':
        case 'sankey':
            if (!mapping.source || !mapping.target) return { nodes: [], links: [] };
            const nodesSet = new Set();
            const links = data.map(row => {
                nodesSet.add(String(row[mapping.source]));
                nodesSet.add(String(row[mapping.target]));
                return {
                    source: String(row[mapping.source]),
                    target: String(row[mapping.target]),
                    value: mapping.value ? Number(row[mapping.value]) : 1
                };
            });
            return {
                nodes: Array.from(nodesSet).map(id => ({ id })),
                links
            };

        // --- GRUPA 5: Kalendarze ---
        // (Calendar, TimeRange)
        case 'calendar':
        case 'timerange':
            if (!mapping.date || !mapping.value) return data;
            return data.map(row => ({
                day: String(row[mapping.date]),
                value: Number(row[mapping.value]) || 0
            }));

        // --- GRUPA 6: Macierze (Chord) ---
        // Przekształca płaskie relacje w macierz 2D wymaganą przez Nivo Chord
        case 'chord':
            if (!mapping.source || !mapping.target || !mapping.value) return { matrix: [], keys: [] };
            const uniqueNodes = Array.from(new Set(data.flatMap(d => [String(d[mapping.source]), String(d[mapping.target])])));
            const matrix = uniqueNodes.map(() => uniqueNodes.map(() => 0));
            
            data.forEach(row => {
                const i = uniqueNodes.indexOf(String(row[mapping.source]));
                const j = uniqueNodes.indexOf(String(row[mapping.target]));
                if (i !== -1 && j !== -1) {
                    matrix[i][j] = Number(row[mapping.value]) || 0;
                }
            });
            return { matrix, keys: uniqueNodes };

        // --- GRUPA 7: Wskaźniki kulowe (Bullet) ---
        // --- GRUPA 7: Wskaźniki kulowe (Bullet) ---
        case 'bullet':
            if (!mapping.id) return data;
            return data.map(row => ({
                id: String(row[mapping.id]),
                ranges: mapping.ranges ? parseToArray(row[mapping.ranges]) : [0, 50, 100],
                measures: mapping.measures ? parseToArray(row[mapping.measures]) : [0],
                markers: mapping.markers ? parseToArray(row[mapping.markers]) : [0]
            }));

        // --- GRUPA 8: HeatMap (Nowe API Nivo v0.80+) ---
        // Wymaga zagnieżdżonych danych: [{ id: 'wiersz', data: [{ x: 'kolumna', y: wartosc }] }]
        case 'heatmap':
            if (!mapping.x || !mapping.y) return data;
            return data.map(row => ({
                id: String(row[mapping.x]),
                data: [{
                    x: mapping.y, // Nazwa kolumny (np. 'Zysk')
                    y: Number(row[mapping.y]) || 0
                }]
            }));

        // --- GRUPA 9: Wykresy płaskie (wspierane przez wewn. opcje Nivo) ---
        case 'bar':
        case 'radar':
        case 'stream':
        case 'swarmplot':
        case 'parallel':
        case 'marimekko':
            return data;

        default:
            return data;
    }
};