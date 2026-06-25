import React from 'react';
import { useAdminRatings } from '../services/admin.queries';
import { KPICard } from '@/components/ui/KPI';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const RatingsAnalyticsPage: React.FC = () => {
  const { data, isLoading } = useAdminRatings();

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
            Ratings Analytics
          </h1>
          <p className="text-sm text-text-secondary mt-1">Platform-wide rating insights and trends.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Average Rating" value={data?.kpis?.averageRating || '0.0'} loading={isLoading} className="border-brand-primary/20" />
        <KPICard title="Total Reviews" value={data?.kpis?.totalReviews || 0} loading={isLoading} />
        <KPICard title="5-Star Reviews" value={data?.kpis?.fiveStarReviews || 0} loading={isLoading} className="border-success/20" />
        <KPICard title="Reported" value={data?.kpis?.reportedReviews || 0} loading={isLoading} className="border-danger/20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Rating Distribution */}
        <div className="p-6 rounded-xl bg-surface border border-border">
          <h3 className="text-lg font-bold text-text-primary mb-4">Rating Distribution</h3>
          {isLoading ? (
            <div className="h-64 flex items-center justify-center text-text-secondary">Loading chart...</div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.charts?.distribution || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="name" stroke="#888888" />
                  <YAxis stroke="#888888" />
                  <Tooltip cursor={{ fill: '#2a2a2a' }} contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#333' }} />
                  <Bar dataKey="count" fill="#ffb400" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Future Chart Container */}
        <div className="p-6 rounded-xl bg-surface border border-border flex items-center justify-center flex-col">
          <h3 className="text-lg font-bold text-text-primary mb-2">Monthly Trends</h3>
          <p className="text-sm text-text-secondary text-center">More analytics visualizations will be added here in future updates based on category and seller insights.</p>
        </div>
      </div>
    </div>
  );
};
export default RatingsAnalyticsPage;
