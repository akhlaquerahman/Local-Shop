import React from 'react';
import { PieChartBaseProps } from '@/types/chart.types';
import PieChart from './PieChart';

export const DonutChart: React.FC<PieChartBaseProps> = (props) => {
  return <PieChart {...props} innerRadius={55} outerRadius={75} />;
};

export default DonutChart;
