# OctoTS Plot Lib 📊

A universal wrapper (library) for rendering charts in a pure browser environment (HTML/JS), utilizing the most popular charting engines under the hood. 

Instead of adding each library separately, **OctoTS Plot Lib** provides a single, unified `makeplot` function that allows you to render charts using:
* [Nivo](https://nivo.rocks/) (Default engine)
* [ECharts](https://echarts.apache.org/)
* [Chart.js](https://www.chartjs.org/)
* [ApexCharts](https://apexcharts.com/)

---

## 🚀 Installation & Usage

Currently, the library is fully ready to be used in pure HTML via a CDN link.

### CDN (Pure HTML/JS)
Simply add the following script to the `<head>` or `<body>` section of your HTML file:

```html
<script src="https://cdn.jsdelivr.net/gh/OctoTS/OctoTS-frontend-lib@refs/heads/main/dist/OctoTS-plot-lib.js"></script>
```
### NPM
⏳ **NPM package coming soon!** > A version installable via Node.js package managers will be available shortly.

## 💻 Quick Start (Usage Example)
The library exposes a global `window.makeplot` function that returns a ready-to-use DOM element `(div)` containing the rendered chart.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chart Test</title>
    <script src="https://cdn.jsdelivr.net/gh/OctoTS/OctoTS-frontend-lib@refs/heads/main/dist/OctoTS-plot-lib.js"></script>
</head>
<body>

    <div id="chart-container" style="width: 600px; height: 400px; border: 1px solid #ccc;"></div>

    <script>
        // 1. Prepare data (Nivo Bar example)
        const data = [
            { country: "AD", "hot dog": 137, burger: 96, sandwich: 108 },
            { country: "AE", "hot dog": 55, burger: 28, sandwich: 150 },
            { country: "AF", "hot dog": 109, burger: 23, sandwich: 99 }
        ];

        // 2. Prepare configuration options
        const options = {
            keys: ['hot dog', 'burger', 'sandwich'],
            indexBy: 'country',
            margin: { top: 50, right: 130, bottom: 50, left: 60 },
            padding: 0.3,
            colors: { scheme: 'nivo' }
        };

        // 3. Generate chart element
        // makeplot(chartType, data, options, engine)
        const plotElement = window.makeplot('bar', data, options, 'nivo');

        // 4. Append the generated chart to the container on the page
        const container = document.getElementById('chart-container');
        container.appendChild(plotElement);
    </script>
</body>
</html>
```
## 🛠 API
`makeplot(chartType, data, options, engine)`

The function creates and returns an HTML element (`<div>`) where a React framework operates and renders the appropriate chart.

### Parameters:

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `chartType` | `string` | *required* | The type of the chart (e.g., `'bar'`, `'line'`, `'pie'`).
| `data` | `Array / Object` | *required* | Chart data. The format depends on the chosen engine.
| `options` | `Object` | `{}` | Chart configuration (e.g., margins, colors, axes). Structure depends on the engine.
| `engine` | `string` | `'nivo'` | Rendering engine. Available options: `'nivo'`, `'echarts'`, `'chartjs'`, `'apex'`.

## 🧩 Supported Engines and Chart Types

1. ### Nivo (`engine: 'nivo'`)

    The default engine, optimized for React. Chart types supported out of the box (as the chartType value):
    - `bump`, `bar`, `pie`, `line`, `stream`, `scatterplot`, `radar`, `heatmap`, `choropleth`, `geomap`, `network`, `treemap`, `sunburst`, `chord`, `funnel`, `parallel` (Parallel Coordinates), `sankey`, `swarmplot`, `marimekko`, `bullet`, `waffle`, `calendar`, `timerange`, `radialbar`.
2. ### ECharts (`engine: 'echarts'`)

    Uses Apache ECharts. Note that ECharts holds its entire configuration (both type and data) within the options object.
    - Options go directly into the `option` prop.
    - The chart type is defined directly inside the `options` configuration object.
3. ### Chart.js (`engine: 'chartjs'`)

    Uses the popular Chart.js engine.
    - The type is passed in the `chartType` parameter (e.g., `'line'`, `'bar'`). If omitted, it defaults to `'line'`.
    - Uses standard Chart.js data and options structure.
4. ### ApexCharts (`engine: 'apex'`)

    Uses interactive ApexCharts.
    - The type is passed in the `chartType` parameter (e.g., `'area'`, `'candlestick'`).
    - The `data` variable is passed to the `series` prop, and `options` to the chart object configuration.

## ⚠️ Important Requirement

The DOM element (e.g., `div`) to which you append the generated chart (returned by `makeplot`) must have a defined height and width (e.g., in CSS: `height: 400px; width: 100%`). The function itself generates an element with `width: 100%; height: 100%` styles, so it will automatically adapt to its parent's size.