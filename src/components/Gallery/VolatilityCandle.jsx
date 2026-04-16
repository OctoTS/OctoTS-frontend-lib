import React from 'react';
import Chart from 'react-apexcharts';

export const VolatilityCandle = ({ data, config }) => {
  if (!data || !config || !config.valueKey || !config.timeKey) return null;
  const { valueKey, timeKey } = config;

  const series = [{
    data: data.map(item => ({
      x: new Date(item[timeKey]).getTime(),
      y: [
        item[valueKey],
        item[valueKey] + 15,
        item[valueKey] - 10,
        item[valueKey] + 5
      ]
    }))
  }];

  const options = {
    chart: { type: 'candlestick', background: 'transparent', toolbar: { show: false } },
    xaxis: { type: 'datetime', labels: { style: { colors: '#888' } } },
    yaxis: { labels: { style: { colors: '#888' } } },
    theme: { mode: 'dark' },
    plotOptions: {
      candlestick: { colors: { upward: '#646cff', downward: '#ff6384' } }
    }
  };

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <Chart options={options} series={series} type="candlestick" height="100%" />
    </div>
  );
};
