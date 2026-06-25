import React from 'react';
import { Download, RefreshCw, Users, UserPlus, UserCheck } from 'lucide-react';
import { KPICard } from '@/components/ui/KPI';
import { DataTable } from '@/components/table';
import { Button } from '@/components/ui/Button';
import { useCustomerAnalytics } from '../services/seller.queries';

const DateRangeSelector = () => (
  <select className="bg-background border border-border text-sm rounded-lg px-3 py-1.5 outline-none focus:border-primary">
    <option>All Time</option>
    <option>Last 30 Days</option>
    <option>This Month</option>
    <option>This Year</option>
  </select>
);

const CustomerAnalyticsPage: React.FC = () => {
  const { data: analytics, isLoading, refetch } = useCustomerAnalytics();

  const columns = [
    { header: 'Customer', accessorKey: 'name', cell: (row: any) => <span className="font-bold text-sm text-text-primary">{row.name || 'Guest User'}</span> },
    { header: 'Orders', accessorKey: 'orders', cell: (row: any) => <span>{row.orders}</span> },
    { header: 'Lifetime Revenue', accessorKey: 'revenue', cell: (row: any) => <span className="text-success font-semibold">₹{row.revenue}</span> },
    { header: 'Last Order', accessorKey: 'lastOrderDate', cell: (row: any) => <span className="text-xs text-text-secondary">{new Date(row.lastOrderDate).toLocaleDateString()}</span> },
    { header: 'Segment', accessorKey: 'status', cell: (row: any) => (
        <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${row.status === 'Returning' ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary'}`}>
          {row.status}
        </span>
      ) 
    }
  ];

  return (
    <div className="space-y-6 text-left max-w-[1440px] mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Customer Analytics</h1>
          <p className="text-sm text-text-secondary">Analyze buyer behavior, retention, and lifetime value</p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangeSelector />
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2"><RefreshCw size={14} /> Refresh</Button>
          <Button variant="outline" size="sm" className="gap-2"><Download size={14} /> Export CSV</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KPICard title="Total Customers" value={analytics?.kpi?.totalCustomers || 0} loading={isLoading} icon={<Users className="text-primary" />} />
        <KPICard title="New Customers" value={analytics?.kpi?.newCustomers || 0} loading={isLoading} icon={<UserPlus className="text-success" />} />
        <KPICard title="Returning Customers" value={analytics?.kpi?.returningCustomers || 0} loading={isLoading} icon={<UserCheck className="text-accent" />} />
        <KPICard title="Customer Lifetime Value" value={`₹${analytics?.kpi?.customerLifetimeValue || 0}`} loading={isLoading} />
        <KPICard title="Repeat Purchase Rate" value={`${analytics?.kpi?.repeatPurchaseRate || 0}%`} loading={isLoading} className="border-accent/20" />
      </div>

      <div className="bg-surface border border-border rounded-xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider">Top Customers by Revenue</h3>
        </div>
        <DataTable 
          columns={columns} 
          data={analytics?.table || []} 
          isLoading={isLoading} 
          exportFileName="customer-analytics"
        />
      </div>
    </div>
  );
};

export default CustomerAnalyticsPage;
