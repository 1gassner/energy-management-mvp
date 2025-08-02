import React, { Suspense, lazy } from 'react';
import LoadingSpinner from '../ui/LoadingSpinner';

// Lazy load recharts as a single module
const RechartsPieChart = lazy(() => 
  import('recharts').then(module => ({
    default: function Chart({ data, height }: { data: any[], height: number }) {
      return (
        <module.ResponsiveContainer width="100%" height={height}>
          <module.PieChart>
            <module.Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry: any, index: number) => (
                <module.Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </module.Pie>
            <module.Tooltip />
          </module.PieChart>
        </module.ResponsiveContainer>
      );
    }
  }))
);

interface LazyPieChartProps {
  data: any[];
  height?: number;
}

const LazyPieChart: React.FC<LazyPieChartProps> = ({ data, height = 300 }) => {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center" style={{ height: `${height}px` }}>
        <LoadingSpinner />
      </div>
    }>
      <RechartsPieChart data={data} height={height} />
    </Suspense>
  );
};

export default LazyPieChart;