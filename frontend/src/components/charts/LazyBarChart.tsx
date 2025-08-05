import React, { Suspense, lazy } from 'react';
import LoadingSpinner from '../ui/LoadingSpinner';

// Lazy load recharts as a single module
const RechartsBarChart = lazy(() => 
  import('recharts').then(module => ({
    default: function Chart({ data, height, dataKey, color }: { data: Array<Record<string, unknown>>, height: number, dataKey: string, color: string }) {
      return (
        <module.ResponsiveContainer width="100%" height={height}>
          <module.BarChart data={data}>
            <module.CartesianGrid strokeDasharray="3 3" />
            <module.XAxis dataKey="name" />
            <module.YAxis />
            <module.Tooltip />
            <module.Bar dataKey={dataKey} fill={color} />
          </module.BarChart>
        </module.ResponsiveContainer>
      );
    }
  }))
);

interface LazyBarChartProps {
  data: Array<Record<string, unknown>>;
  height?: number;
  dataKey?: string;
  color?: string;
}

const LazyBarChart: React.FC<LazyBarChartProps> = ({ 
  data, 
  height = 300, 
  dataKey = 'value',
  color = '#3B82F6'
}) => {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center" style={{ height: `${height}px` }}>
        <LoadingSpinner />
      </div>
    }>
      <RechartsBarChart data={data} height={height} dataKey={dataKey} color={color} />
    </Suspense>
  );
};

export default LazyBarChart;