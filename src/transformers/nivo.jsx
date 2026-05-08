/**
 * Plik: src/transformers/nivo.js
 * @param {string} type - Typ wykresu (np. 'line', 'pie', 'bar', 'stream')
 * @param {Array} data - Płaskie dane z CSV/JSON (tablica obiektów)
 * @param {Object} mapping - Obiekt wskazujący, z których kolumn korzystać (x, y, series itp.)
 */
const parseToArray = (val) => String(val || '').split(/[,;-]/).map(Number).filter(n => !isNaN(n));

export const transformNivoData = (type, data, mapping = {}) => {
    // console.log("data before", type, data);
    
    if (!data || data.length === 0) return [];

    switch (type?.toLowerCase()) {
        
        case 'bump':
        case 'line': {
            if (!mapping.x || !mapping.y) return [];
            const groupedBySeries = {};
            data.forEach(row => {
                const seriesName = mapping.series ? String(row[mapping.series]) : 'Seria Główna';
                if (!groupedBySeries[seriesName]) {
                    groupedBySeries[seriesName] = [];
                }
                groupedBySeries[seriesName].push({
                    x: String(row[mapping.x]),
                    y: Number(row[mapping.y]) || 0
                });
            });
            return Object.keys(groupedBySeries).map(key => ({
                id: key,
                data: groupedBySeries[key]
            }));
        }

        case 'scatterplot':
        case 'radialbar': {
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
        }

        case 'waffle': {
            if (!mapping.id || !mapping.value) return data;
            const totalSum = data.reduce((sum, row) => sum + (Math.max(0, Number(row[mapping.value])) || 0), 0);
            if (totalSum === 0) return [];

            let currentSum = 0;
            const result = data.map((row, index) => {
                const rawVal = Math.max(0, Number(row[mapping.value])) || 0;
                let percentVal = Math.round((rawVal / totalSum) * 100);
                
                if (index === data.length - 1) {
                    percentVal = 100 - currentSum;
                }
                currentSum += percentVal;

                return {
                    id: String(row[mapping.id] || 'Brak'),
                    label: String(row[mapping.id] || 'Brak'),
                    value: percentVal
                };
            });

            mapping.total = 100;
            return result;
        }

        case 'pie':
        case 'funnel': {
            if (!mapping.id || !mapping.value) return data;
            return data.map(row => ({
                id: String(row[mapping.id]),
                label: String(row[mapping.id]),
                value: Number(row[mapping.value]) || 0
            }));
        }

        case 'treemap':
        case 'sunburst': {
            const idKey = mapping.id || Object.keys(data[0])[0];
            const valKey = mapping.value || Object.keys(data[0])[1];
            const groupedData = {};
            
            data.forEach(row => {
                const key = String(row[idKey] || 'Nieznane');
                const val = parseFloat(row[valKey]) || 0; 
                if (val > 0) {
                    groupedData[key] = (groupedData[key] || 0) + val;
                }
            });

            const children = Object.entries(groupedData).map(([key, val]) => ({
                id: key,
                value: val
            }));

            if (children.length === 0) {
                children.push({ id: 'Brak poprawnych danych', value: 1 });
            }

            return { id: 'Root', children: children };
        }

        case 'network':
        case 'sankey': {
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
        }

        case 'calendar':
        case 'timerange': {
            if (!mapping.date || !mapping.value) return data;
            
            return data.map(row => {
                const rawDate = String(row[mapping.date]).trim();
                const d = new Date(rawDate);
                
                let formattedDay = rawDate;
                // Jeśli data jest poprawna, wymuszamy sztywny format Nivo: YYYY-MM-DD
                if (!isNaN(d.getTime())) {
                    const year = d.getFullYear();
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    formattedDay = `${year}-${month}-${day}`;
                }

                return {
                    day: formattedDay,
                    value: Number(row[mapping.value]) || 0
                };
            }).filter(item => item.value > 0); // Nivo lubi mieć tylko dni, w których faktycznie coś się działo
        }

        case 'chord': {
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
        }

        case 'bullet': {
            if (!mapping.id) return data;
            return data.map(row => ({
                id: String(row[mapping.id]),
                ranges: mapping.ranges ? parseToArray(row[mapping.ranges]) : [0, 50, 100],
                measures: mapping.measures ? parseToArray(row[mapping.measures]) : [0],
                markers: mapping.markers ? parseToArray(row[mapping.markers]) : [0]
            }));
        }

        case 'heatmap': {
            if (!mapping.x || !mapping.y) return data;
            return data.map(row => ({
                id: String(row[mapping.x]),
                data: [{
                    x: mapping.y,
                    y: Number(row[mapping.y]) || 0
                }]
            }));
        }

        case 'stream': {
            if (!mapping.x || !mapping.y || !mapping.series) return data;
            console.log("stream after if");
            
            const grouped = {};
            const allSeries = new Set();
            // Zbieramy wszystkie unikalne wartości osi X w kolejności ich występowania
            const xOrder = new Set(); 

            data.forEach(row => {
                const xVal = String(row[mapping.x]);
                const seriesName = String(row[mapping.series]);
                // Ważne: Wymuszamy liczby zmiennoprzecinkowe, usuwamy NaN
                const yVal = parseFloat(row[mapping.y]) || 0; 

                allSeries.add(seriesName);
                xOrder.add(xVal);
                
                if (!grouped[xVal]) grouped[xVal] = {}; 
                // Zbieramy wartości. Dla streama musimy uważać, by się nie znosiły, jeśli np. mamy kilka wpisów na ten sam timestamp dla jednego miasta.
                // Tu sumujemy wartości dla danego miasta w danym czasie.
                grouped[xVal][seriesName] = (grouped[xVal][seriesName] || 0) + Math.max(0, yVal); 
            });

            // Iterujemy po xOrder, żeby zachować chronologię na osi X
            console.log(Array.from(xOrder).map(xVal => {
                const obj = grouped[xVal];
                const cleanRow = {};
                allSeries.forEach(s => {
                    // Jeśli dla danego czasu miasto nie ma danych, wstawiamy twarde 0, żeby fala zeszła płynnie w dół, a nie urwała się nagle.
                    cleanRow[s] = obj[s] || 0; 
                });
                // console.log(cleanRow);
                
                return cleanRow;
            }));
            
            return Array.from(xOrder).map(xVal => {
                const obj = grouped[xVal];
                const cleanRow = {};
                allSeries.forEach(s => {
                    // Jeśli dla danego czasu miasto nie ma danych, wstawiamy twarde 0, żeby fala zeszła płynnie w dół, a nie urwała się nagle.
                    cleanRow[s] = obj[s] || 0; 
                });
                // console.log(cleanRow);
                
                return cleanRow;
            });
        }

        case 'bar':
        case 'radar':
        case 'swarmplot':
        case 'parallel':
        case 'marimekko': {
            return data;
        }

        default: {
            return data;
        }
    }
};