export interface ChartDataPoint {
  [key: string]: string | number;
}

export interface ChartBaseProps {
  data: ChartDataPoint[];
  xAxisKey: string;
  dataKeys: string[];
  colors?: string[];
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
}

export interface PieChartBaseProps {
  data: { name: string; value: number }[];
  colors?: string[];
  height?: number;
  showTooltip?: boolean;
  showLegend?: boolean;
  innerRadius?: number;
  outerRadius?: number;
}
