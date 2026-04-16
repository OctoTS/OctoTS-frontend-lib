import React from 'react';
import { ResponsiveSwarmPlot } from '@nivo/swarmplot';

const BeeswarmPlot = ({ data, config }) => {
  if (!data || !config || !config.valueKey || !config.groupKey) return null;

  const chartData = data.filter(item => item[config.groupKey] && item[config.valueKey] !== undefined).map((item, index) => ({
    id: `${item[config.groupKey]}-${index}`,
    group: item[config.groupKey],
    value: item[config.valueKey],
    volume: item[config.valueKey]
  }));

  if (chartData.length === 0) return null;

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <ResponsiveSwarmPlot
        data={chartData}
        groups={Array.from(new Set(chartData.map(d => d.group)))}
        value="value"
        size={{ key: 'volume', values: [Math.min(...chartData.map(d => d.value)), Math.max(...chartData.map(d => d.value))], sizes: [6, 20] }}
        forceStrength={4}
        simulationIterations={100}
        margin={{ top: 40, right: 40, bottom: 80, left: 50 }}
        axisBottom={{ tickSize: 10, tickPadding: 5, legend: config.labelX || '', legendPosition: 'middle', legendOffset: 32 }}
      />
    </div>
  );
};

export default BeeswarmPlot;
