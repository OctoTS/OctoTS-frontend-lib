import React from 'react';
import { PolarArea } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);

export const ResourcePolar = ({ data, config }) => {
  if (!data || !config || !config.valueKey || !config.groupKey) return null;
  const { valueKey, groupKey } = config;

  const uniqueGroups = Array.from(new Set(data.map(item => item[groupKey])));
  const groupSums = uniqueGroups.map(group => 
    data.filter(item => item[groupKey] === group)
        .reduce((sum, current) => sum + current[valueKey], 0)
  );

  const chartData = {
    labels: uniqueGroups,
    datasets: [{
      data: groupSums,
      backgroundColor: [
        'rgba(100, 108, 255, 0.5)',
        'rgba(255, 99, 132, 0.5)',
        'rgba(255, 205, 86, 0.5)',
        'rgba(75, 192, 192, 0.5)',
        'rgba(54, 162, 235, 0.5)'
      ],
      borderWidth: 1
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        grid: { color: '#e2e8f0' },
        ticks: { display: false }
      }
    }
  };

  return <PolarArea data={chartData} options={options} />;
};
