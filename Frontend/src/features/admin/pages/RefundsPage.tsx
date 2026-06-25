import React, { useState } from 'react';
import { useAdminRefunds } from '../services/admin.queries';
import { AdminDataTable } from '@/components/table/AdminDataTable';
import { PaginationState, SortingState } from '@tanstack/react-table';
import { Button } from '@/components/ui/Button';
import { KPICard } from '@/components/ui/KPI';

export const RefundsPage: React.FC = () => {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useAdminRefunds({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search,
    sortBy: sorting[0]?.id,
    sortOrder: sorting[0]?.desc ? 'desc' : 'asc'
  });

  const columns = [
    {
      header: 'Refund ID',
      accessorKey: 'refundId',
      cell: (info: any) => <span className="font-mono text-sm font-semibold">{info.getValue()}</span>
    },
    {
      header: 'Order ID',
      accessorKey: 'orderId',
      cell: (info: any) => <span className="font-mono text-sm">{info.getValue()?.substring(0,8).toUpperCase()}</span>
    },
    {
      header: 'Customer',
      accessorKey: 'customer',
    },
    {
      header: 'Reason',
      accessorKey: 'reason',
    },
    {
      header: 'Amount',
      accessorKey: 'amount',
      cell: (info: any) => <span className="font-semibold text-danger">-₹{info.getValue().toLocaleString()}</span>
    },
    {
      header: 'Evidence',
      accessorKey: 'evidence',
      cell: (info: any) => (
        <span className="text-xs text-brand-primary underline cursor-pointer">{info.getValue()}</span>
      )
    },
    {
      header: 'Created At',
      accessorKey: 'createdAt',
      cell: (info: any) => new Date(info.getValue()).toLocaleString()
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (info: any) => {
        const val = info.getValue();
        return (
          <span className={`px-2 py-1 text-xs font-bold rounded-full ${val === 'APPROVED' ? 'bg-success/10 text-success' : val === 'REJECTED' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'}`}>
            {val}
          </span>
        );
      }
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: (info: any) => {
        const orderId = info.row.original.orderId;
        return (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="h-8 text-xs px-3 py-1 bg-surface border-border hover:bg-accent/10 hover:text-accent hover:border-accent/30 transition-colors"
              onClick={() => {
                if (orderId && orderId !== 'N/A') {
                  window.location.href = `/admin/orders/${orderId}`;
                } else {
                  alert('No associated order details found for this refund.');
                }
              }}
            >
              View Details
            </Button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
            Refunds <span className="text-text-secondary text-lg font-medium">({data?.meta?.total || 0})</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-surface border-border hover:bg-white/5">Export CSV</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Total Refunded" value={`₹${(data?.kpis?.totalRefundAmount || 0).toLocaleString()}`} loading={isLoading} />
        <KPICard title="Pending Review" value={data?.kpis?.pendingReview || 0} loading={isLoading} className="border-warning/20" />
        <KPICard title="Approved" value={data?.kpis?.approved || 0} loading={isLoading} className="border-success/20" />
        <KPICard title="Rejected" value={data?.kpis?.rejected || 0} loading={isLoading} className="border-danger/20" />
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
    </div>
  );
};
export default RefundsPage;
