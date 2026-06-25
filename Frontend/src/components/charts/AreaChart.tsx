import React from 'react';
import { ChartBaseProps } from '@/types/chart.types';
import { 
  ResponsiveContainer, AreaChart as RechartsAreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend 
} from 'recharts';

export const AreaChart: React.FC<ChartBaseProps> = ({
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
        <RechartsAreaChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
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
            <Area 
              key={key}
              name={String(key).toUpperCase()} 
              type="monotone" 
              dataKey={key} 
              stroke={colors[index] || 'var(--accent)'} 
              fill={colors[index] || 'var(--accent)'} 
              fillOpacity={0.1}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AreaChart;
