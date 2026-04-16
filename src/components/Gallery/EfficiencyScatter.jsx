import React from 'react';
import { Scatter } from 'react-chartjs-2';
import { Chart as ChartJS, LinearScale, PointElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

export const EfficiencyScatter = ({ data, config }) => {
  if (!data || !config || !config.valueKey) return null;
  const { valueKey } = config;

  const chartData = {
    datasets: [{
      label: config.labelY || '',
      data: data.map((item, index) => ({ x: index, y: item[valueKey] })),
      backgroundColor: '#646cff'
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { grid: { color: '#f1f5f9' } },
      y: { grid: { color: '#f1f5f9' } }
    }
  };

  return <Scatter data={chartData} options={options} />;
};
