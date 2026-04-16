import React from 'react';
import ReactECharts from 'echarts-for-react';

export const ProcessTimeline = ({ data, config }) => {
  if (!data || !config || !config.valueKey || !config.timeKey || !config.groupKey) return null;
  const { valueKey, timeKey, groupKey } = config;

  const groups = Array.from(new Set(data.map(item => item[groupKey])));
  
  const chartData = data.map(item => {
    const start = new Date(item[timeKey]).getTime();
    return {
      name: item[groupKey],
      value: [
        groups.indexOf(item[groupKey]),
        start,
        start + 3600000, // +1 hour duration to make it visible
        item[valueKey]
      ]
    };
  });

  const option = {
    tooltip: {
      formatter: (params) => `${params.name}: ${params.value[3]}`
    },
    xAxis: { 
      type: 'time',
      splitLine: { show: false }
    },
    yAxis: { 
      data: groups,
      splitLine: { show: true }
    },
    series: [{
      type: 'custom',
      renderItem: (params, api) => {
        const categoryIndex = api.value(0);
        const start = api.coord([api.value(1), categoryIndex]);
        const end = api.coord([api.value(2), categoryIndex]);
        const height = api.size([0, 1])[1] * 0.6;

        return {
          type: 'rect',
          shape: {
            x: start[0],
            y: start[1] - height / 2,
            width: Math.max(end[0] - start[0], 10), // min 10px width
            height: height
          },
          style: api.style()
        };
      },
      itemStyle: { opacity: 0.8, color: '#646cff' },
      encode: { x: [1, 2], y: 0 },
      data: chartData
    }]
  };

  return <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />;
};
