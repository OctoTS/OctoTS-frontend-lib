import { createRoot } from 'react-dom/client';

import { ResponsiveBump } from '@nivo/bump';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveLine } from '@nivo/line';
import { ResponsiveStream } from '@nivo/stream';


const ChartComponents = {
    'bump': ResponsiveBump,
    'bar': ResponsiveBar,
    'pie': ResponsivePie,
    'line': ResponsiveLine,
    'stream': ResponsiveStream
};

export const makeplot = (chartType, data, options = {}) => {
    const ChartComponent = ChartComponents[chartType?.toLowerCase()];

    if (!ChartComponent) {
        const errorMsg = `Błąd: Nieobsługiwany typ wykresu "${chartType}". Dostępne typy to: ${Object.keys(ChartComponents).join(', ')}`;
        const errorDiv = document.createElement('div');
        errorDiv.style.color = 'red';
        errorDiv.style.padding = '10px';
        errorDiv.textContent = errorMsg;
        return errorDiv;
    }

    const chartElement = (
        <div style={{ width: '100%', height: '100%' }}>
            <ChartComponent data={data} {...options} />
        </div>
    );

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