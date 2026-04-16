import React from 'react';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export const StatusRadar = ({ data, config }) => {
  if (!data || !config || !config.valueKey || !config.groupKey) return null;
  const { valueKey, groupKey, labelY } = config;

  const groupStats = data.reduce((acc, curr) => {
    acc[curr[groupKey]] = (acc[curr[groupKey]] || 0) + curr[valueKey];
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(groupStats),
    datasets: [{
      label: labelY || '',
      data: Object.values(groupStats),
      backgroundColor: 'rgba(100, 108, 255, 0.2)',
      borderColor: '#646cff',
    }]
  };

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <Radar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
    </div>
  );
};
