import React, { Suspense, lazy } from 'react';
import LoadingSpinner from '../ui/LoadingSpinner';

// Lazy load recharts as a single module
const RechartsLineChart = lazy(() => 
  import('recharts').then(module => ({
    default: function Chart({ data, height }: { data: any[], height: number }) {
      return (
        <module.ResponsiveContainer width="100%" height={height}>
          <module.LineChart data={data}>
            <module.CartesianGrid strokeDasharray="3 3" />
            <module.XAxis dataKey="time" />
            <module.YAxis label={{ value: 'kW', angle: -90, position: 'insideLeft' }} />
            <module.Tooltip />
            <module.Line type="monotone" dataKey="production" stroke="#10B981" strokeWidth={2} name="Production" />
            <module.Line type="monotone" dataKey="consumption" stroke="#3B82F6" strokeWidth={2} name="Consumption" />
            <module.Line type="monotone" dataKey="grid" stroke="#8B5CF6" strokeWidth={2} name="Grid" />
          </module.LineChart>
        </module.ResponsiveContainer>
      );
    }
  }))
);

interface LazyLineChartProps {
  data: any[];
  height?: number;
}

const LazyLineChart: React.FC<LazyLineChartProps> = ({ data, height = 300 }) => {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center" style={{ height: `${height}px` }}>
        <LoadingSpinner />
      </div>
    }>
      <RechartsLineChart data={data} height={height} />
    </Suspense>
  );
};

export default LazyLineChart;