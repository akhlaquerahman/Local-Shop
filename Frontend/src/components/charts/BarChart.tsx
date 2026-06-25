import React from 'react';
import { ChartBaseProps } from '@/types/chart.types';
import { 
  ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend 
} from 'recharts';

export const BarChart: React.FC<ChartBaseProps> = ({
  data,
  xAxisKey,
  dataKeys,
  colors = ['var(--primary)'],
  height = 260,
  showGrid = true,
  showTooltip = true,
  showLegend = true,
}) => {
  return (
    <div style={{ width: '100%', height }} className="text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />}
          <XAxis dataKey={xAxisKey} stroke="var(--text-secondary)" fontSize={10} />
          <YAxis stroke="var(--text-secondary)" fontSize={10} />
          {showTooltip && (
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--surface)', 
                borderColor: 'var(--border)',
                fontSize: '11px',
                borderRadius: '6px'
              }} 
            />
          )}
          {showLegend && <Legend verticalAlign="top" height={36} iconType="circle" />}
          {dataKeys.map((key, index) => (
            <Bar 
              key={key}
              name={String(key).toUpperCase()} 
              dataKey={key} 
              fill={colors[index] || 'var(--primary)'} 
              radius={[4, 4, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChart;
