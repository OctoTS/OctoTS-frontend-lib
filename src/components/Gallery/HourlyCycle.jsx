import React from 'react';
import ReactECharts from 'echarts-for-react';

export const HourlyCycle = ({ data, config, lang = 'en' }) => {
  if (!data || !config || !config.valueKey || !config.timeKey) return null;
  const { valueKey, timeKey } = config;

  const dayLabels = lang === 'pl'
    ? ['Nd', 'So', 'Pt', 'Cz', 'Śr', 'Wt', 'Pn']
    : ['Sun', 'Sat', 'Fri', 'Thu', 'Wed', 'Tue', 'Mon'];

  const dayMapping = { 1: 6, 2: 5, 3: 4, 4: 3, 5: 2, 6: 1, 0: 0 };

  const activityMatrix = {};
  let maxActivityValue = 0;

  data.forEach(item => {
    const date = new Date(item[timeKey]);
    if (isNaN(date.getTime())) return;

    const hour = date.getHours();
    const day = date.getDay();
    const yIndex = dayMapping[day];
    const value = item[valueKey];

    const key = `${hour}-${yIndex}`;
    activityMatrix[key] = (activityMatrix[key] || 0) + value;
    
    if (activityMatrix[key] > maxActivityValue) {
      maxActivityValue = activityMatrix[key];
    }
  });

  const heatmapData = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
      heatmapData.push([hour, dayIdx, activityMatrix[`${hour}-${dayIdx}`] || 0]);
    }
  }

  const option = {
    tooltip: { position: 'top' },
    grid: { height: '65%', top: '5%', bottom: '25%', containLabel: true },
    xAxis: { 
      type: 'category', 
      data: Array.from({ length: 24 }, (_, i) => i + 'h'),
      splitArea: { show: true }
    },
    yAxis: { 
      type: 'category', 
      data: dayLabels,
      splitArea: { show: true }
    },
    visualMap: {
      min: 0,
      max: maxActivityValue || 10,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '5%', 
      inRange: { color: ['#ebf5fb', '#3498db'] }
    },
    series: [{
      name: lang === 'pl' ? 'Aktywność' : 'Activity',
      type: 'heatmap',
      data: heatmapData,
      label: { show: false },
      emphasis: {
        itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' }
      }
    }]
  };

  return <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />;
};
