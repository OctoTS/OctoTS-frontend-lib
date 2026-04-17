import React from 'react';
import ChartCard from './ChartCard';
import { 
  BeeswarmPlot, 
  CalendarActivity, 
  TimeZoomPlot, 
  BumpChart,
  VolatilityCandle,
  StatusRadar,
  RangeTrend,
  StepEvolution,
  StreamGraph,
  ProcessTimeline,
  HourlyCycle,
  ModuleTree,
  ResourcePolar,
  EfficiencyScatter,
  NetChangeBar
} from './Gallery';

const componentRegistry = {
  beeswarm: { component: BeeswarmPlot, lib: 'Nivo', req: ['groupKey', 'valueKey'] },
  calendar: { component: CalendarActivity, lib: 'Nivo', req: ['timeKey', 'valueKey'] },
  timeZoom: { component: TimeZoomPlot, lib: 'ECharts', req: ['timeKey', 'valueKey'] },
  bump: { component: BumpChart, lib: 'Nivo', req: ['groupKey', 'timeKey', 'valueKey'] },
  volatility: { component: VolatilityCandle, lib: 'ApexCharts', req: ['timeKey', 'valueKey'] },
  radar: { component: StatusRadar, lib: 'Chart.js', req: ['groupKey', 'valueKey'] },
  range: { component: RangeTrend, lib: 'ApexCharts', req: ['timeKey', 'valueKey'] },
  step: { component: StepEvolution, lib: 'Chart.js', req: ['timeKey', 'valueKey'] },
  stream: { component: StreamGraph, lib: 'Nivo', req: ['groupKey', 'timeKey', 'valueKey'] },
  timeline: { component: ProcessTimeline, lib: 'ECharts', req: ['groupKey', 'timeKey', 'valueKey'] },
  hourly: { component: HourlyCycle, lib: 'ECharts', req: ['timeKey', 'valueKey'] },
  tree: { component: ModuleTree, lib: 'ApexCharts', req: ['groupKey', 'valueKey'] },
  polar: { component: ResourcePolar, lib: 'Chart.js', req: ['groupKey', 'valueKey'] },
  scatter: { component: EfficiencyScatter, lib: 'Chart.js', req: ['valueKey'] },
  netChange: { component: NetChangeBar, lib: 'ApexCharts', req: ['valueKey'] }
};

const OctoDashboard = ({ data, layout, lang = 'en' }) => {
  if (!data) return null;

  return (
    <main className="dashboard-grid">
      {layout.map((config, index) => {
        const entry = componentRegistry[config.type];
        if (!entry) return null;

        const ChartComponent = entry.component;
        const missingKeys = entry.req.filter(key => !config.mapping || !config.mapping[key]);
        const isInvalid = missingKeys.length > 0;

        return (
          <ChartCard
            key={`${config.type}-${index}`}
            title={config.title}
            library={entry.lib}
            description={config.description}
            lang={lang}
            requirements={entry.req}
            validationError={isInvalid ? { missingKeys } : null}
          >
            {!isInvalid && (
              <ChartComponent 
                data={data} 
                config={config.mapping} 
                lang={lang} 
              />
            )}
          </ChartCard>
        );
      })}
    </main>
  );
};

export default OctoDashboard;
