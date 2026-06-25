import React, { useState } from 'react';
import { KPICard } from '@/components/ui/KPI';
import { DataTable } from '@/components/table';
import { ColumnDef } from '@/types/table.types';
import { useAnalyticsOverview, useRevenueTrend, useOrdersTrend, useSellerOrders, useUpdateOrderStatus } from './services/seller.queries';
import { OrderStatus } from '@/domain/order';
import { useNotificationStore } from '@/store/notificationStore';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { 
  ShoppingBag, IndianRupee, Store, Package, Check, 
  X, Play, AlertCircle, RefreshCw, Download 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Date Range Component
const DateRangeSelector = () => (
  <select className="bg-background border border-border text-xs rounded-lg px-2 py-1.5 outline-none focus:border-primary text-text-primary">
    <option>Today</option>
    <option>Last 7 Days</option>
    <option>Last 30 Days</option>
    <option>This Month</option>
  </select>
);

export const SellerDashboard: React.FC = () => {
  const { addToast } = useNotificationStore();

  // Real Analytics Hooks
  const { data: overview, isLoading: overviewLoading, refetch: refetchOverview } = useAnalyticsOverview();
  const { data: revenueTrend, isLoading: revenueLoading, refetch: refetchRevenue } = useRevenueTrend();
  const { data: ordersTrend, isLoading: ordersLoading, refetch: refetchOrders } = useOrdersTrend();
  
  // Real Orders Data
  const { data: rawOrders, isLoading: ordersTableLoading, refetch: refetchTableOrders } = useSellerOrders({ search: '', status: 'all' });
  const updateMutation = useUpdateOrderStatus();
  
  const orders = (rawOrders || []).map((o: any) => ({
    id: o.orderId || o._id.substring(0, 8),
    _id: o._id,
    customerName: o.customerName || 'Customer',
    customerPhone: o.customerId?.phone || o.deliveryDetails?.deliveryAddress || 'No address',
    items: o.items || [],
    total: o.total || 0,
    status: o.status || 'pending',
  }));

  const handleRefresh = () => {
    refetchOverview();
    refetchRevenue();
    refetchOrders();
    refetchTableOrders();
    addToast({ title: 'Dashboard Refreshed', message: 'Latest analytics data loaded.', type: 'info' });
  };

  const pendingOrders = orders.filter((o: any) => o.status !== 'delivered' && o.status !== 'cancelled');

  const handleUpdateStatus = async (orderId: string, nextStatus: string) => {
    try {
      await updateMutation.mutateAsync({ id: orderId, status: nextStatus });
      addToast({
        title: 'Status Updated 📦',
        message: `Order marked as ${nextStatus.replace(/_/g, ' ')}`,
        type: nextStatus === 'cancelled' ? 'warning' : 'success',
      });
      refetchTableOrders();
    } catch (err: any) {
      addToast({ title: 'Error', message: err.message || 'Failed to update', type: 'error' });
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      id: 'id', header: 'Order Ref',
      cell: (row) => <span className="font-bold font-mono">{row.id}</span>,
      accessorKey: 'id',
    },
    {
      id: 'customerName', header: 'Customer',
      cell: (row) => (
        <div>
          <div className="font-bold text-text-primary">{row.customerName}</div>
          <div className="text-[10px] text-text-secondary">{row.customerPhone}</div>
        </div>
      ),
      accessorKey: 'customerName',
    },
    {
      id: 'total', header: 'Total',
      cell: (row) => <span className="font-bold">₹{row.total}</span>,
      accessorKey: 'total',
    },
    {
      id: 'status', header: 'Status',
      cell: (row) => {
        const colors: Record<string, string> = {
          pending: 'bg-accent/10 border-accent/20 text-accent',
          accepted: 'bg-info/10 border-info/20 text-blue-600',
          preparing: 'bg-warning/10 border-warning/20 text-warning',
          ready_for_pickup: 'bg-indigo-50 border-indigo-100 text-indigo-600',
          delivered: 'bg-success/10 border-success/20 text-success',
          cancelled: 'bg-danger/10 border-danger/20 text-danger',
        };
        return (
          <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase ${colors[row.status] || ''}`}>
            {row.status.replace(/_/g, ' ')}
          </span>
        );
      },
      accessorKey: 'status',
    },
    {
      id: 'actions', header: 'Actions',
      cell: (row) => {
        const isPending = updateMutation.isPending;
        return (
          <div className="flex items-center gap-1.5">
            {(row.status === 'pending' || row.status === 'placed') && (
              <button disabled={isPending} onClick={() => handleUpdateStatus(row._id, 'accepted')} className="p-1 hover:bg-success/15 text-success rounded border border-success/30"><Check size={12} /></button>
            )}
            {row.status === 'accepted' && (
              <button disabled={isPending} onClick={() => handleUpdateStatus(row._id, 'preparing')} className="p-1 hover:bg-warning/15 text-warning rounded border border-warning/30"><Play size={12} /></button>
            )}
            {row.status === 'preparing' && (
              <button disabled={isPending} onClick={() => handleUpdateStatus(row._id, 'ready_for_pickup')} className="p-1 hover:bg-success/15 text-success rounded border border-success/30"><Package size={12} /></button>
            )}
            {row.status !== 'delivered' && row.status !== 'cancelled' && (
              <button disabled={isPending} onClick={() => handleUpdateStatus(row._id, 'cancelled')} className="p-1 hover:bg-danger/15 text-danger rounded border border-danger/30"><X size={12} /></button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 text-left max-w-[1440px] mx-auto pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Dashboard</h1>
          <p className="text-sm text-text-secondary">Track your shop's performance and active orders</p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangeSelector />
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2"><RefreshCw size={14} /> Refresh</Button>
        </div>
      </div>

      {/* KPI Cards (Real Data from Analytics) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard title="Total Revenue" value={`₹${overview?.totalRevenue || 0}`} loading={overviewLoading} trend="+15%" icon="IndianRupee" />
        <KPICard title="Total Orders" value={overview?.orders || 0} loading={overviewLoading} trend="+5%" icon="ShoppingBag" />
        <KPICard title="Customers" value={overview?.customers || 0} loading={overviewLoading} trend="+12%" icon="Users" />
        <KPICard title="Avg Ticket Size" value={`₹${Math.round(overview?.averageOrderValue || 0)}`} loading={overviewLoading} icon="Store" />
        <KPICard title="Pending Queue" value={pendingOrders.length} change="Requires packing" changeType="warning" icon="Package" />
        <KPICard title="Refund Rate" value={`${overview?.refundRate || 0}%`} loading={overviewLoading} className="border-danger/20" trendType="danger" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-xl p-5 shadow-enterprise">
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
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '8px' }} itemStyle={{ color: '#10b981', fontWeight: 'bold' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5 shadow-enterprise">
          <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-6">Orders Volume (Last 7 Days)</h3>
          <div className="h-64">
            {ordersLoading ? (
              <div className="w-full h-full bg-background animate-pulse rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ordersTrend || []} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '8px' }} itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }} cursor={{ fill: 'var(--border)', opacity: 0.2 }} />
                  <Bar name="Orders" dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-surface border border-border rounded-xl flex flex-col shadow-enterprise">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider">Incoming Order Queue</h3>
            <p className="text-[10px] text-text-secondary">Process active customer dispatches</p>
          </div>
          {pendingOrders.length > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-warning font-bold">
              <AlertCircle size={12} /> Requires packing
            </span>
          )}
        </div>
        <DataTable
          data={orders}
          columns={columns}
          searchKey="id"
          searchPlaceholder="Search orders..."
          exportFileName="dashboard-orders"
        />
      </div>

    </div>
  );
};

export default SellerDashboard;
