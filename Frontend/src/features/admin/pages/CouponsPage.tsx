import React, { useState } from 'react';
import { useAdminCoupons } from '../services/admin.queries';
import { AdminDataTable } from '@/components/table/AdminDataTable';
import { PaginationState, SortingState } from '@tanstack/react-table';
import { Button } from '@/components/ui/Button';
import { KPICard } from '@/components/ui/KPI';

export const CouponsPage: React.FC = () => {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useAdminCoupons({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search,
    sortBy: sorting[0]?.id,
    sortOrder: sorting[0]?.desc ? 'desc' : 'asc'
  });

  const columns = [
    {
      header: 'Coupon Code',
      accessorKey: 'code',
      cell: (info: any) => <span className="font-mono font-bold text-brand-primary bg-brand-primary/10 px-2 py-1 rounded">{info.getValue()}</span>
    },
    {
      header: 'Type',
      accessorKey: 'type',
      cell: (info: any) => <span className="capitalize">{info.getValue()}</span>
    },
    {
      header: 'Discount',
      accessorKey: 'discount',
      cell: (info: any) => <span className="font-bold text-success">{info.getValue()}</span>
    },
    {
      header: 'Usage',
      accessorKey: 'usageCount',
      cell: (info: any) => <span className="font-mono">{info.getValue()} / {info.row.original.usageLimit}</span>
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (info: any) => {
        const val = info.getValue();
        return (
          <span className={`px-2 py-1 text-xs font-bold rounded-full ${val === 'ACTIVE' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
            {val}
          </span>
        );
      }
    },
    {
      header: 'Expiry Date',
      accessorKey: 'expiryDate',
      cell: (info: any) => info.getValue() ? new Date(info.getValue()).toLocaleDateString() : 'Never'
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: () => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="h-8 text-xs px-2 py-1">Clone</Button>
          <Button size="sm" variant="outline" className="h-8 text-xs px-2 py-1 text-danger border-danger/20 hover:bg-danger/10">Deactivate</Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
            Coupons <span className="text-text-secondary text-lg font-medium">({data?.meta?.total || 0})</span>
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Active Coupons" value={data?.kpis?.activeCoupons || 0} loading={isLoading} className="border-success/20" />
        <KPICard title="Total Redemptions" value={data?.kpis?.redemptions || 0} loading={isLoading} />
        <KPICard title="Discount Value" value={data?.kpis?.discountValue || '₹0'} loading={isLoading} className="border-brand-primary/20" />
        <KPICard title="Expired" value={data?.kpis?.expired || 0} loading={isLoading} className="border-text-secondary/20" />
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
export default CouponsPage;
