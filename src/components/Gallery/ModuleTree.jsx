import React from 'react';
import Chart from 'react-apexcharts';

export const ModuleTree = ({ data, config }) => {
  if (!data || !config || !config.valueKey || !config.groupKey) return null;
  const { valueKey, groupKey } = config;

  const series = [{
    data: data.map(item => ({ x: item[groupKey], y: item[valueKey] }))
  }];

  const options = {
    chart: { type: 'treemap', background: 'transparent' },
    theme: { mode: 'dark' },
    colors: ['#646cff']
  };

  return <Chart options={options} series={series} type="treemap" height="100%" width="100%" />;
};
