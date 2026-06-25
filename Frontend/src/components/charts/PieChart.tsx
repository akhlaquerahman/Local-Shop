import React from 'react';
import { PieChartBaseProps } from '@/types/chart.types';
import { 
  ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend 
} from 'recharts';

export const PieChart: React.FC<PieChartBaseProps> = ({
  data,
  colors = ['var(--accent)', 'var(--primary)', 'var(--text-secondary)', 'var(--border)'],
  height = 260,
  showTooltip = true,
  showLegend = true,
  innerRadius = 0,
  outerRadius = 80,
}) => {
  return (
    <div style={{ width: '100%', height }} className="text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
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
          {showLegend && <Legend verticalAlign="bottom" height={36} iconType="circle" />}
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={outerRadius}
            innerRadius={innerRadius}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChart;
