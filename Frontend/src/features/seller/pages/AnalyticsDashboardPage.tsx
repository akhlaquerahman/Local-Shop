import React, { useState } from 'react';
import { Download, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { KPICard } from '@/components/ui/KPI';
import { DataTable } from '@/components/table';
import { Button } from '@/components/ui/Button';
import { useAnalyticsOverview, useRevenueTrend, useOrdersTrend, useProductAnalytics } from '../services/seller.queries';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

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

const AnalyticsDashboardPage: React.FC = () => {
  const { data: overview, isLoading: overviewLoading, refetch: refetchOverview } = useAnalyticsOverview();
  const { data: revenueTrend, isLoading: revenueLoading, refetch: refetchRevenue } = useRevenueTrend();
  const { data: ordersTrend, isLoading: ordersLoading, refetch: refetchOrders } = useOrdersTrend();
  const { data: productsData, isLoading: productsLoading, refetch: refetchProducts } = useProductAnalytics();

  const handleRefresh = () => {
    refetchOverview();
    refetchRevenue();
    refetchOrders();
    refetchProducts();
  };

  const columns = [
    { header: 'Product', accessorKey: 'name', cell: (row: any) => <span className="font-bold text-sm text-text-primary">{row.name}</span> },
    { header: 'Orders', accessorKey: 'orders', cell: (row: any) => <span>{row.orders}</span> },
    { header: 'Revenue', accessorKey: 'revenue', cell: (row: any) => <span className="text-success font-semibold">₹{row.revenue}</span> },
    { header: 'Conversion', accessorKey: 'conversionRate', cell: (row: any) => <span>{row.conversionRate}%</span> }
  ];

  return (
    <div className="space-y-6 text-left max-w-[1440px] mx-auto pb-20">
      {/* Unified Analytics Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Analytics Dashboard</h1>
          <p className="text-sm text-text-secondary">Track your shop's performance and growth</p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangeSelector />
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2"><RefreshCw size={14} /> Refresh</Button>
          <Button variant="outline" size="sm" className="gap-2"><Download size={14} /> Export CSV</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard title="Total Revenue" value={`₹${overview?.totalRevenue || 0}`} loading={overviewLoading} trend="+15%" />
        <KPICard title="Orders" value={overview?.orders || 0} loading={overviewLoading} trend="+5%" />
        <KPICard title="Customers" value={overview?.customers || 0} loading={overviewLoading} trend="+12%" />
        <KPICard title="Avg Order Value" value={`₹${Math.round(overview?.averageOrderValue || 0)}`} loading={overviewLoading} />
        <KPICard title="Conversion Rate" value={`${overview?.conversionRate || 0}%`} loading={overviewLoading} />
        <KPICard title="Refund Rate" value={`${overview?.refundRate || 0}%`} loading={overviewLoading} className="border-danger/20" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-6">Revenue Trend (Last 7 Days)</h3>
          <div className="h-64">
            {revenueLoading ? (
              <div className="w-full h-full bg-background animate-pulse rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrend || []} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                  <XAxis dataKey="date" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e1e2d', borderColor: '#2b2b40', borderRadius: '8px' }}
                    itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-6">Orders Trend (Last 7 Days)</h3>
          <div className="h-64">
            {ordersLoading ? (
              <div className="w-full h-full bg-background animate-pulse rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ordersTrend || []} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                  <XAxis dataKey="date" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e1e2d', borderColor: '#2b2b40', borderRadius: '8px' }}
                    itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorOrders)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider">Top Performing Products</h3>
          </div>
          <DataTable 
            columns={columns} 
            data={(productsData?.table || []).slice(0, 5)} 
            isLoading={productsLoading} 
            exportFileName="top-products"
          />
        </div>

        <div className="bg-surface border border-border rounded-xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider">Low Performing Products</h3>
          </div>
          <DataTable 
            columns={columns} 
            data={(productsData?.table || []).slice(-5).reverse()} 
            isLoading={productsLoading} 
            exportFileName="low-products"
          />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboardPage;
