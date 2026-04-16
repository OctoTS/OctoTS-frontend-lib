import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

export const StepEvolution = ({ data, config }) => {
  if (!data || !config || !config.valueKey || !config.timeKey) return null;
  const { valueKey, timeKey, labelY } = config;

  const chartData = {
    labels: data.map(item => item[timeKey].split('T')[0]),
    datasets: [{
      label: labelY || '',
      data: data.map(item => item[valueKey]),
      stepped: true,
      borderColor: '#646cff',
      backgroundColor: 'rgba(100, 108, 255, 0.1)',
      fill: true,
      pointRadius: 4,
      pointBackgroundColor: '#646cff'
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { grid: { color: '#333' }, ticks: { color: '#888' } },
      y: { grid: { color: '#333' }, ticks: { color: '#888' }, beginAtZero: true }
    },
    plugins: { legend: { display: false } }
  };

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <Line data={chartData} options={options} />
    </div>
  );
};
