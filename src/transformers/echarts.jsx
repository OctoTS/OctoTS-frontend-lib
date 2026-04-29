export const transformEchartsData = (type, data, mapping) => {
    if (!data || data.length === 0) return [];

    switch (type.toLowerCase()) {
        case 'pie':
        case 'funnel':
            return data.map(row => ({
                name: String(row[mapping.id || mapping.x || Object.keys(row)[0]]),
                value: Number(row[mapping.value || mapping.y || Object.keys(row)[1]]) || 0
            }));

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

            return Object.entries(groupedData).map(([key, val]) => ({
                name: key,
                value: val
            }));
        }

        case 'network':
        case 'graph':
        case 'sankey':
            if (data.nodes && data.links) return data; // Jeśli ktoś podał już gotowe dane
            
            // Generowanie z płaskiej listy krawędzi: { source: 'A', target: 'B', value: 10 }
            const nodes = new Set();
            const links = data.map(row => {
                const src = String(row[mapping.source || 'source']);
                const tgt = String(row[mapping.target || 'target']);
                nodes.add(src);
                nodes.add(tgt);
                return {
                    source: src,
                    target: tgt,
                    value: Number(row[mapping.value || 'value']) || 1
                };
            });
            return {
                data: Array.from(nodes).map(n => ({ name: n })),
                links: links
            };

        default:
            // Dla Bar, Line, Scatter, Heatmap, itp. zwracamy surowe dane (użyjemy dataset)
            return data;
    }
};