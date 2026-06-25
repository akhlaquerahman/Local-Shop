import React, { useState } from 'react';
import { Download, RefreshCw, BarChart2, TrendingUp } from 'lucide-react';
import { KPICard } from '@/components/ui/KPI';
import { DataTable } from '@/components/table';
import { Button } from '@/components/ui/Button';
import { useProductAnalytics } from '../services/seller.queries';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Date Range Component
const DateRangeSelector = () => (
  <select className="bg-background border border-border text-sm rounded-lg px-3 py-1.5 outline-none focus:border-primary">
    <option>Today</option>
    <option>Last 7 Days</option>
    <option>Last 30 Days</option>
    <option>This Month</option>
    <option>Custom Range</option>
  </select>
);

const ProductAnalyticsPage: React.FC = () => {
  const { data: analytics, isLoading, refetch } = useProductAnalytics();

  const columns = [
    { header: 'Product', accessorKey: 'name', cell: (row: any) => <span className="font-bold text-sm text-text-primary">{row.name}</span> },
    { header: 'Category', accessorKey: 'category', cell: (row: any) => <span className="text-sm">{row.category}</span> },
    { header: 'Views', accessorKey: 'views', cell: (row: any) => <span>{row.views}</span> },
    { header: 'Cart Adds', accessorKey: 'cartAdds', cell: (row: any) => <span>{row.cartAdds}</span> },
    { header: 'Orders', accessorKey: 'orders', cell: (row: any) => <span>{row.orders}</span> },
    { header: 'Revenue', accessorKey: 'revenue', cell: (row: any) => <span className="text-success font-semibold">₹{row.revenue}</span> },
    { header: 'Conversion', accessorKey: 'conversionRate', cell: (row: any) => <span>{row.conversionRate}%</span> },
    { header: 'Stock', accessorKey: 'stock', cell: (row: any) => (
        <span className={`font-bold ${row.stock < 10 ? 'text-danger' : 'text-success'}`}>{row.stock}</span>
      )
    }
  ];

  // Map data for charts
  const chartData = (analytics?.table || []).slice(0, 10).map((item: any) => ({
    name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
    views: item.views,
    purchases: item.orders
  }));

  return (
    <div className="space-y-6 text-left max-w-[1440px] mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Product Analytics</h1>
          <p className="text-sm text-text-secondary">Analyze individual product performance and conversion funnels</p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangeSelector />
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2"><RefreshCw size={14} /> Refresh</Button>
          <Button variant="outline" size="sm" className="gap-2"><Download size={14} /> Export CSV</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KPICard title="Total Views" value={analytics?.kpi?.views || 0} loading={isLoading} />
        <KPICard title="Cart Adds" value={analytics?.kpi?.cartAdds || 0} loading={isLoading} />
        <KPICard title="Orders" value={analytics?.kpi?.orders || 0} loading={isLoading} />
        <KPICard title="Revenue Generated" value={`₹${analytics?.kpi?.revenue || 0}`} loading={isLoading} />
        <KPICard title="Avg Conversion" value={`${analytics?.kpi?.conversionRate || 0}%`} loading={isLoading} className="border-accent/20" />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-6">Views vs Purchases (Top 10 Products)</h3>
          <div className="h-80">
            {isLoading ? (
              <div className="w-full h-full bg-background animate-pulse rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                  <XAxis dataKey="name" stroke="#888" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" orientation="left" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e1e2d', borderColor: '#2b2b40', borderRadius: '8px' }} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar yAxisId="left" dataKey="views" name="Views" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="purchases" name="Purchases" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider">Product Performance Details</h3>
        </div>
        <DataTable 
          columns={columns} 
          data={analytics?.table || []} 
          isLoading={isLoading} 
          exportFileName="product-analytics"
        />
      </div>
    </div>
  );
};

export default ProductAnalyticsPage;
