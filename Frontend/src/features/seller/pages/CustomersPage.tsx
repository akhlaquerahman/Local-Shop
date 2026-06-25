import React, { useState } from 'react';
import { Search, User, Mail, Phone, Calendar, Download } from 'lucide-react';
import { KPICard } from '@/components/ui/KPI';
import { DataTable } from '@/components/table';
import { useCustomers, useCustomerStats } from '../services/seller.queries';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '@/store/notificationStore';

export const CustomersPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const { data: stats, isLoading: statsLoading } = useCustomerStats();
  const { data: customers, isLoading: customersLoading } = useCustomers();
  const navigate = useNavigate();
  const { addToast } = useNotificationStore();

  const columns = [
    {
      header: 'Customer',
      accessorKey: 'customerName',
      cell: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
            {row.customerName?.charAt(0) || 'G'}
          </div>
          <span className="font-bold text-text-primary text-sm">{row.customerName || 'Guest User'}</span>
        </div>
      )
    },
    {
      header: 'Orders',
      accessorKey: 'orders',
      cell: (row: any) => <span className="font-medium">{row.orders}</span>
    },
    {
      header: 'Revenue',
      accessorKey: 'revenue',
      cell: (row: any) => <span className="font-semibold text-success">₹{row.revenue}</span>
    },
    {
      header: 'Last Order',
      accessorKey: 'lastOrder',
      cell: (row: any) => (
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <Calendar size={14} />
          {new Date(row.lastOrder).toLocaleDateString()}
        </div>
      )
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row: any) => (
        <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${row.orders > 1 ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>
          {row.orders > 1 ? 'RETURNING' : 'NEW'}
        </span>
      )
    },
    {
      header: 'Actions',
      accessorKey: 'actions',
      cell: (row: any) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="text-xs px-2 py-1 h-auto" onClick={() => {
            addToast({ title: 'Navigating', message: `Viewing orders for ${row.customerName || 'Customer'}`, type: 'info' });
            navigate('/seller/orders');
          }}>View Orders</Button>
        </div>
      )
    }
  ];

  const filteredData = customers?.filter((c: any) => c.customerName?.toLowerCase().includes(search.toLowerCase())) || [];

  return (
    <div className="space-y-6 text-left max-w-[1440px] mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Customers</h1>
          <p className="text-sm text-text-secondary">Understand your buyer base and their lifetime value</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KPICard title="Total Customers" value={stats?.totalCustomers || 0} loading={statsLoading} />
        <KPICard title="Returning" value={stats?.returningCustomers || 0} loading={statsLoading} className="border-success/20" />
        <KPICard title="New" value={(stats?.totalCustomers || 0) - (stats?.returningCustomers || 0)} loading={statsLoading} />
        <KPICard title="Lifetime Revenue" value={`₹${stats?.lifetimeRevenue || 0}`} loading={statsLoading} />
        <KPICard title="Avg Order Value" value={`₹${Math.round(stats?.avgOrderValue || 0)}`} loading={statsLoading} />
      </div>

      <div className="bg-surface border border-border rounded-xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
            <input 
              type="text" 
              placeholder="Search by customer name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <DataTable 
          columns={columns} 
          data={filteredData.map((d: any) => ({ ...d, id: d._id }))} 
          isLoading={customersLoading}
          exportFileName="customers-export"
        />
      </div>
    </div>
  );
};
export default CustomersPage;
