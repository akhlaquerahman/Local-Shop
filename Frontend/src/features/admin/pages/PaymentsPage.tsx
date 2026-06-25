import React, { useState } from 'react';
import { useAdminPayments } from '../services/admin.queries';
import { AdminDataTable } from '@/components/table/AdminDataTable';
import { PaginationState, SortingState } from '@tanstack/react-table';
import { Button } from '@/components/ui/Button';
import { KPICard } from '@/components/ui/KPI';

export const PaymentsPage: React.FC = () => {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useAdminPayments({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search,
    sortBy: sorting[0]?.id,
    sortOrder: sorting[0]?.desc ? 'desc' : 'asc'
  });

  const columns = [
    {
      header: 'Transaction ID',
      accessorKey: 'transactionId',
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
      header: 'Gateway',
      accessorKey: 'gateway',
    },
    {
      header: 'Method',
      accessorKey: 'paymentMethod',
    },
    {
      header: 'Amount',
      accessorKey: 'amount',
      cell: (info: any) => <span className="font-semibold">₹{info.getValue().toLocaleString()}</span>
    },
    {
      header: 'Settlement',
      accessorKey: 'settlementStatus',
      cell: (info: any) => (
        <span className={`px-2 py-1 text-xs font-bold rounded-full ${info.getValue() === 'SETTLED' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
          {info.getValue()}
        </span>
      )
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
            className="h-8 text-xs px-3 py-1 bg-surface border-border hover:bg-accent/10 hover:text-accent hover:border-accent/30 transition-colors"
            onClick={() => {
              window.location.href = `/admin/payments/${info.row.original.id}`;
            }}
          >
            View Details
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
            Payments <span className="text-text-secondary text-lg font-medium">({data?.meta?.total || 0})</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-surface border-border hover:bg-white/5">Export CSV</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KPICard title="Total Volume" value={`₹${(data?.kpis?.totalVolume || 0).toLocaleString()}`} loading={isLoading} />
        <KPICard title="Successful" value={data?.kpis?.successful || 0} loading={isLoading} className="border-success/20" />
        <KPICard title="Failed" value={data?.kpis?.failed || 0} loading={isLoading} className="border-danger/20" />
        <KPICard title="Pending" value={data?.kpis?.pending || 0} loading={isLoading} className="border-warning/20" />
        <KPICard title="Disputes" value={0} loading={isLoading} />
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
export default PaymentsPage;
