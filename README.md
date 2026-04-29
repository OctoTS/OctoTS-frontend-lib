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

    <div id="chart-container" style="width: 600px; height: 400px; border: 1px solid #ccc; border-radius: 8px;"></div>

    <script>
        // 1. Prepare flat data
        const data = [
            { author: "Krzysiek", commits: 150, bugs: 5 },
            { author: "Ania", commits: 200, bugs: 2 },
            { author: "Marek", commits: 80, bugs: 12 },
            { author: "Krzysiek", commits: 50, bugs: 1 } // The library will auto-aggregate this!
        ];

        // 2. Map data keys to chart axes
        const mapping = {
            x: 'author',
            y: 'commits'
        };

        // 3. Prepare additional options (engine-specific config & aggregation)
        const options = {
            aggregate: 'avg', // Can be 'avg' or omitted. Set to false to disable auto-aggregation.
            // You can also pass engine-specific options here (e.g., margins for Nivo or colors)
        };

        // 4. Generate chart element
        // Signature: makeplot(engine, chartType, data, mapping, options)
        const plotElement = window.makeplot('apexcharts', 'bar', data, mapping, options);

        // 5. Append the generated chart to the container on the page
        const container = document.getElementById('chart-container');
        container.appendChild(plotElement);
    </script>
</body>
</html>
```
## 📥 Data Loading (loadData API)

Instead of hardcoding data, OctoTS Plot Lib comes with a built-in asynchronous helper function `window.loadData()` that parses external data sources into the exact flat array format required by `makeplot`.

**⚠️ Supported File Formats**: Currently, `loadData()` exclusively supports parsing **CSV** format.

### API: `await window.loadData(source)`
- **Returns**: A `Promise` that resolves to an `Array of Objects` (parsed flat data).

### Accepted `source` formats:
- **URL (String)**: A direct link to a CSV or JSON (in future) file (e.g., `"https://..."` or a relative path `"/data/file.csv"` if running on a local server).

- **File / Blob Object**: A local file uploaded by the user directly via an HTML `<input type="file">`.

### Code Snippet: Loading Data from URL & File Input

```html
<input type="file" id="csvFileInput" accept=".csv, .json" />
<div id="dashboard" style="height: 400px; width: 100%;"></div>

<script>
    // Example 1: Loading from a URL
    async function renderFromUrl() {
        try {
            // Fetch and parse data from a remote CSV
            const data = await window.loadData("https://raw.githubusercontent.com/OctoTS/OctoTS-demo/refs/heads/metrics-data-1/metrics.csv");
            
            // Render chart directly with fetched data
            const chartNode = window.makeplot('nivo', 'bar', data, { x: 'timestamp', y: 'lines_of_code' });
            document.getElementById('dashboard').appendChild(chartNode);
        } catch (error) {
            console.error("Failed to load data:", error);
        }
    }

    // Example 2: Loading from a local file via Input
    document.getElementById('csvFileInput').addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Pass the File object directly to loadData
        const localData = await window.loadData(file);
        
        // Clear previous chart and render new one
        document.getElementById('dashboard').innerHTML = '';
        const localChartNode = window.makeplot('echarts', 'line', localData, { x: 'timestamp', y: 'lines_of_code' });
        document.getElementById('dashboard').appendChild(localChartNode);
    });

    // Run URL example on load
    renderFromUrl();
</script>
```



## 🛠 Plotting API
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

## ⚙️ Data Aggregation Feature

By default, **OctoTS Plot Lib** automatically groups and aggregates your data based on the key provided in `mapping.x` (or `mapping.id`). Numeric columns are averaged (`avg`) by default unless disabled via `options: { aggregate: false }`. This means you can feed raw tabular data straight into the library without pre-processing it!


## ⚠️ Important Requirement

The DOM element (e.g., `div`) to which you append the generated chart (returned by `makeplot`) must have a defined height and width (e.g., in CSS: `height: 400px; width: 100%`). The function itself generates an element with `width: 100%; height: 100%` styles, so it will automatically adapt to its parent's size.