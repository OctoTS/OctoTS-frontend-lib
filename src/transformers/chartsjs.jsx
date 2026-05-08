/**
 * Plik: src/transformers/chartjs.js
 */

export const transformChartjsData = (type, data, mapping) => {
    if (!data || data.length === 0) return { labels: [], datasets: [] };

    const labelKey = mapping.x || mapping.id || Object.keys(data[0])[0];
    const valueKey = mapping.y || mapping.value || Object.keys(data[0])[1];

    // Standardowe kolory Chart.js dla wykresów
    const bgColors = [
        'rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 
        'rgba(255, 206, 86, 0.6)', 'rgba(75, 192, 192, 0.6)', 
        'rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)'
    ];

    const chartData = {
        labels: [],
        datasets: [{
            label: valueKey,
            data: [],
            backgroundColor: bgColors,
            borderColor: bgColors.map(color => color.replace('0.6', '1')), // Wzmocnienie koloru dla obramowania
            borderWidth: 1
        }]
    };

    switch (type.toLowerCase()) {
        case 'scatter':
        case 'bubble':
            // Scatter/Bubble wymagają obiektów {x, y, r} zamiast płaskiej tablicy
            chartData.datasets[0].data = data.map(row => ({
                x: Number(row[labelKey]) || 0,
                y: Number(row[valueKey]) || 0,
                r: type === 'bubble' ? (Number(row[mapping.z || valueKey]) || 5) : undefined
            }));
            break;

        case 'radar':
            // Radar przyjmuje kolumny jako osie (podobnie jak ECharts)
            const keys = Object.keys(data[0]).filter(k => k !== labelKey);
            chartData.labels = keys;
            chartData.datasets = data.map((row, index) => ({
                label: row[labelKey],
                data: keys.map(k => Number(row[k]) || 0),
                backgroundColor: bgColors[index % bgColors.length],
                borderColor: bgColors[index % bgColors.length].replace('0.6', '1'),
                fill: true
            }));
            break;

        default:
            // Standardowe: Bar, Line, Pie, Doughnut, PolarArea
            data.forEach(row => {
                chartData.labels.push(String(row[labelKey]));
                chartData.datasets[0].data.push(Number(row[valueKey]) || 0);
            });
            break;
    }

    return chartData;
};