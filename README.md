OctoTS - frontend library
OctoTS-frontend-lib is a professional-grade React visualization engine. It is designed to transform time-series datasets into interactive dashboards using a collection of high-level components. This library abstracts the complexities of individual charting engines (Nivo, ECharts, ApexCharts, and Chart.js) into a unified, mapping-based interface.
1. Installation
Since this library is distributed directly via GitHub, you can add it to your project by running:
code
Code
npm install github:OctoTS/OctoTS-frontend-lib
2. Integration Guide
A. Import Required Styles
The library uses a dedicated CSS file for the grid system and chart containers. Import this at the very top of your entry file (e.g., main.jsx or App.jsx):
code
Code
import 'octots-frontend-lib/dist/octots-frontend-lib.css';
B. Implement OctoDashboard
The most efficient way to use the library is through the OctoDashboard component. It automatically handles the grid layout, card creation, and individual chart rendering.
code
Code
import { OctoDashboard } from 'octots-frontend-lib';

const data = [
  { date: '2025-01-01', group: 'Alpha', value: 100 },
  { date: '2025-01-01', group: 'Beta', value: 85 }
];

const layout = [
  {
    type: 'beeswarm',
    title: 'Activity Pulse',
    description: 'Visualizing event density',
    mapping: { groupKey: 'group', valueKey: 'value' }
  }
];

function MyPage() {
  return (
    <OctoDashboard 
      data={data} 
      layout={layout} 
      lang="en" 
    />
  );
}
3. Component API
OctoDashboard Props
Prop	Type	Description
data	Array<Object>	The dataset to visualize.
layout	Array<Object>	Configuration array for the dashboard grid.
lang	'en' | 'pl'	UI language for labels and messages.
Layout Object Structure
Each object in the layout array defines a specific chart card:
type: Identifier of the chart (e.g., beeswarm, calendar, bump, timeZoom, radar).
title: Header text for the specific chart card.
description: Footer text explaining the data context.
mapping: Configuration for data keys (e.g., { timeKey: 'date', groupKey: 'author', valueKey: 'lines' }).
4. Built-in Functionality
Data Mapping: The library is data-agnostic. It does not require specific column names in your source files; you simply define the mapping in the layout configuration.
Fullscreen Mode: Every chart card includes a built-in expansion button to view the visualization in a high-resolution overlay.
Requirements Panel: Users can expand a "Minimum required data" section on each card to see exactly which mapping keys are necessary for that specific visualization.
Grayscale Fallback: Charts that do not support the current data format are automatically visually dimmed to maintain dashboard stability.
5. Local Development and Building
To modify the library or add new visualizations:
Clone the repository: git clone https://github.com/OctoTS/OctoTS-frontend-lib.git
Install development dependencies: npm install
Run the build script to generate the production files in the dist folder:
npm run build
