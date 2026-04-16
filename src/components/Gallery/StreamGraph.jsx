import React from 'react';
import { ResponsiveStream } from '@nivo/stream';

export const StreamGraph = ({ data, config }) => {
  if (!data || !config || !config.valueKey || !config.groupKey || !config.timeKey) return null;
  const { valueKey, groupKey, timeKey } = config;

  const uniqueGroups = Array.from(new Set(data.map(item => item[groupKey])));
  
  const groupedByTime = data.reduce((acc, item) => {
    const time = item[timeKey]?.split('T')[0] || item[timeKey];
    if (!acc[time]) {
      acc[time] = { timestamp: time };
      uniqueGroups.forEach(g => acc[time][g] = 0);
    }
    acc[time][item[groupKey]] = (acc[time][item[groupKey]] || 0) + item[valueKey];
    return acc;
  }, {});

  const chartData = Object.values(groupedByTime).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  if (chartData.length < 2) return null;

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <ResponsiveStream
        data={chartData}
        keys={uniqueGroups}
        margin={{ top: 20, right: 20, bottom: 40, left: 20 }}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          legend: '',
        }}
        offsetType="silhouette"
        colors={{ scheme: 'nivo' }}
        fillOpacity={0.8}
      />
    </div>
  );
};
