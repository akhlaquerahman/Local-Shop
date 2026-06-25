import React from 'react';
import { ChartBaseProps } from '@/types/chart.types';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend 
} from 'recharts';

export const RevenueChart: React.FC<ChartBaseProps> = ({
  data,
  xAxisKey,
  dataKeys,
  colors = ['var(--accent)'],
  height = 260,
  showGrid = true,
  showTooltip = true,
  showLegend = true,
}) => {
  return (
    <div style={{ width: '100%', height }} className="text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
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
            <Line 
              key={key}
              name={String(key).toUpperCase()} 
              type="monotone" 
              dataKey={key} 
              stroke={colors[index] || 'var(--primary)'} 
              strokeWidth={2}
              activeDot={{ r: 6 }} 
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;
