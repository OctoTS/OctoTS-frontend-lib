import React from 'react';
import Chart from 'react-apexcharts';

export const NetChangeBar = ({ data, config }) => {
  if (!data || !config || !config.valueKey) return null;
  const { valueKey } = config;

  const series = [
    {
      name: 'Added',
      data: data.map(item => item[valueKey])
    },
    {
      name: 'Removed',
      data: data.map(item => -Math.floor(item[valueKey] * 0.35))
    }
  ];

  const options = {
    chart: { type: 'bar', stacked: true, background: 'transparent', toolbar: { show: false } },
    colors: ['#646cff', '#ff6384'],
    plotOptions: { bar: { borderRadius: 4 } },
    theme: { mode: 'dark' },
    xaxis: { labels: { show: false } },
    legend: { position: 'top' }
  };

  return <Chart options={options} series={series} type="bar" height="100%" width="100%" />;
};
