import React from 'react';
import { useAdminReviewAnalytics } from '../../services/admin.queries';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const ReviewAnalyticsChart: React.FC = () => {
  const { data, isLoading } = useAdminReviewAnalytics();

  if (isLoading) {
    return <div className="h-64 flex items-center justify-center">Loading Analytics...</div>;
  }

  const chartData = data?.trendData || [];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-text-primary">Rating Trend</h3>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="date" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333' }} />
            <Legend />
            <Bar dataKey="1Star" stackId="a" fill="#ef4444" name="1 Star" />
            <Bar dataKey="2Star" stackId="a" fill="#f97316" name="2 Star" />
            <Bar dataKey="3Star" stackId="a" fill="#eab308" name="3 Star" />
            <Bar dataKey="4Star" stackId="a" fill="#84cc16" name="4 Star" />
            <Bar dataKey="5Star" stackId="a" fill="#22c55e" name="5 Star" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
