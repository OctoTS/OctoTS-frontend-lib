import React from 'react';
import ReactECharts from 'echarts-for-react';

export const TimeZoomPlot = ({ data, config }) => {
  if (!data || !config || !config.valueKey || !config.timeKey) return null;

  const { valueKey, timeKey, labelX, labelY } = config;

  const xAxisData = data.map(d => d[timeKey]);
  const seriesData = data.map(d => d[valueKey]);

  const option = {
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: xAxisData
    },
    yAxis: { 
      type: 'value',
      name: labelY || ''
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '60px',
      top: '15%',
      containLabel: true
    },
    dataZoom: [
      { type: 'slider', bottom: '10px', height: 25 },
      { type: 'inside' }
    ],
    series: [{
      name: labelY || 'Value',
      type: 'line',
      smooth: true,
      areaStyle: { opacity: 0.2 },
      data: seriesData,
      color: '#3498db'
    }]
  };

  return <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />;
};
