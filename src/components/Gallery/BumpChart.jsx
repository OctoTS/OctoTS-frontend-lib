import React from 'react';
import { ResponsiveBump } from '@nivo/bump';

export const BumpChart = ({ data, config }) => {
  if (!data || !config || !config.valueKey || !config.groupKey || !config.timeKey) {
    return null;
  }

  const validData = data.filter(item => 
    item && 
    item[config.timeKey] && 
    item[config.groupKey] && 
    item[config.valueKey] !== undefined
  );

  if (validData.length === 0) {
    return null;
  }

  const uniqueGroups = Array.from(new Set(validData.map(d => d[config.groupKey])));

  const chartData = uniqueGroups.map(group => {
    const groupEntries = validData
      .filter(d => d[config.groupKey] === group)
      .sort((a, b) => new Date(a[config.timeKey]) - new Date(b[config.timeKey]));

    return {
      id: group,
      data: groupEntries.map((d) => ({
        x: d[config.timeKey].toString().includes('T') ? d[config.timeKey].split('T')[0] : d[config.timeKey].toString(),
        y: d[config.valueKey]
      }))
    };
  });

  const timePointsCount = chartData[0]?.data.length || 0;
  const dynamicWidth = Math.max(timePointsCount * 80, 500);

  return (
    <div style={{ height: '100%', width: dynamicWidth + 'px' }}>
      <ResponsiveBump
        data={chartData}
        margin={{ top: 20, right: 100, bottom: 80, left: 80 }}
        lineWidth={3}
        activeLineWidth={6}
        pointSize={10}
        activePointSize={16}
        colors={{ scheme: 'nivo' }}
        useMesh={true}
        enableGridX={false}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -45
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 10,
          legend: config.labelY || '',
          legendPosition: 'middle',
          legendOffset: -60,
          tickValues: 8
        }}
      />
    </div>
  );
};
