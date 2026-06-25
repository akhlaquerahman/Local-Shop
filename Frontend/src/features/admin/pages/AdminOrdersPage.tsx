import React, { useState } from 'react';
import { useAdminOrders } from '../services/admin.queries';
import { AdminDataTable } from '@/components/table/AdminDataTable';
import { PaginationState, SortingState } from '@tanstack/react-table';
import { Button } from '@/components/ui/Button';
import { KPICard } from '@/components/ui/KPI';
import { AdminOrderDetailsDrawer } from '../components/AdminOrderDetailsDrawer';

export const AdminOrdersPage: React.FC = () => {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');
  const [viewingOrderId, setViewingOrderId] = useState<string | null>(null);

  const { data, isLoading } = useAdminOrders({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search,
    sortBy: sorting[0]?.id,
    sortOrder: sorting[0]?.desc ? 'desc' : 'asc'
  });

  const columns = [
    {
      header: 'Order ID',
      accessorKey: 'orderId',
      cell: (info: any) => <span className="font-mono font-bold text-text-primary">{info.getValue()}</span>
    },
    {
      header: 'Customer',
      accessorKey: 'customer',
    },
    {
      header: 'Store',
      accessorKey: 'store',
    },
    {
      header: 'City',
      accessorKey: 'city',
    },
    {
      header: 'Items',
      accessorKey: 'items',
    },
    {
      header: 'Amount',
      accessorKey: 'amount',
      cell: (info: any) => <span className="font-semibold">₹{info.getValue().toLocaleString()}</span>
    },
    {
      header: 'Payment Status',
      accessorKey: 'paymentStatus',
      cell: (info: any) => {
        const val = info.getValue()?.toUpperCase() || 'PENDING';
        return (
          <span className={`px-2 py-1 text-xs font-bold rounded-full ${val === 'COMPLETED' ? 'bg-success/10 text-success' : val === 'FAILED' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'}`}>
            {val}
          </span>
        );
      }
    },
    {
      header: 'Delivery Status',
      accessorKey: 'deliveryStatus',
      cell: (info: any) => {
        const val = info.getValue()?.toUpperCase() || 'NEW';
        return (
          <span className={`px-2 py-1 text-xs font-bold rounded-full ${val === 'DELIVERED' ? 'bg-success/10 text-success' : val === 'CANCELLED' ? 'bg-danger/10 text-danger' : 'bg-brand-primary/10 text-brand-primary'}`}>
            {val.replace(/_/g, ' ')}
          </span>
        );
      }
    },
    {
      header: 'Created At',
      accessorKey: 'createdAt',
      cell: (info: any) => new Date(info.getValue()).toLocaleString()
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: (info: any) => (
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8 text-xs px-2 py-1"
            onClick={() => setViewingOrderId(info.row.original.id)}
          >
            View
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
            Orders <span className="text-text-secondary text-lg font-medium">({data?.meta?.total || 0})</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-surface border-border hover:bg-white/5">Export</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KPICard title="Today's Orders" value={data?.kpis?.todaysOrders || 0} loading={isLoading} />
        <KPICard title="In Progress" value={data?.kpis?.inProgress || 0} loading={isLoading} className="border-brand-primary/20" />
        <KPICard title="Delivered" value={data?.kpis?.delivered || 0} loading={isLoading} className="border-success/20" />
        <KPICard title="Cancelled" value={data?.kpis?.cancelled || 0} loading={isLoading} className="border-danger/20" />
        <KPICard title="Revenue" value={`₹${(data?.kpis?.revenue || 0).toLocaleString()}`} loading={isLoading} />
      </div>

      <AdminDataTable
        columns={columns}
        data={data?.data || []}
        pageCount={data?.meta?.totalPages || -1}
        totalRecords={data?.meta?.total || 0}
        isLoading={isLoading}
        onPaginationChange={setPagination}
        onSortingChange={setSorting}
        onSearchChange={setSearch}
        initialState={{ pagination, sorting }}
      />
      
      {viewingOrderId && (
        <AdminOrderDetailsDrawer 
          orderId={viewingOrderId} 
          onClose={() => setViewingOrderId(null)} 
        />
      )}
    </div>
  );
};
export default AdminOrdersPage;
