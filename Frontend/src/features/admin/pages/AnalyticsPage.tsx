import React from 'react';
import { useAdminAnalytics } from '../services/admin.queries';
import { KPICard } from '@/components/ui/KPI';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const { data, isLoading } = useAdminAnalytics();

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
            Platform Analytics
          </h1>
          <p className="text-sm text-text-secondary mt-1">High-level GMV and order trends.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KPICard title="GMV" value={data?.kpis?.gmvi || data?.kpis?.gmv || '₹0'} loading={isLoading} className="border-success/20" />
        <KPICard title="Platform Revenue" value={data?.kpis?.revenue || '₹0'} loading={isLoading} className="border-brand-primary/20" />
        <KPICard title="Total Orders" value={data?.kpis?.orders?.toLocaleString() || 0} loading={isLoading} />
        <KPICard title="Customers" value={data?.kpis?.customers?.toLocaleString() || 0} loading={isLoading} />
        <KPICard title="Active Sellers" value={data?.kpis?.sellers?.toLocaleString() || 0} loading={isLoading} className="border-warning/20" />
      </div>

      <div className="mt-6 p-6 rounded-xl bg-surface border border-border">
        <h3 className="text-lg font-bold text-text-primary mb-4">7-Day Revenue Trend</h3>
        {isLoading ? (
          <div className="h-80 flex items-center justify-center text-text-secondary">Loading chart...</div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.charts?.revenueTrend || []}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffb400" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ffb400" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="name" stroke="#888888" />
                <YAxis stroke="#888888" />
                <Tooltip contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#333' }} />
                <Area type="monotone" dataKey="revenue" stroke="#ffb400" fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};
export default AnalyticsPage;
