import React, { useState } from 'react';
import { useAdminInventory } from '../services/admin.queries';
import { AdminDataTable } from '@/components/table/AdminDataTable';
import { PaginationState, SortingState } from '@tanstack/react-table';
import { Button } from '@/components/ui/Button';
import { KPICard } from '@/components/ui/KPI';

export const InventoryOverviewPage: React.FC = () => {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useAdminInventory({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search,
    sortBy: sorting[0]?.id,
    sortOrder: sorting[0]?.desc ? 'desc' : 'asc'
  });

  const columns = [
    {
      header: 'Product',
      accessorKey: 'product',
      cell: (info: any) => <span className="font-semibold text-text-primary whitespace-normal line-clamp-2">{info.getValue()}</span>
    },
    {
      header: 'SKU',
      accessorKey: 'sku',
    },
    {
      header: 'Brand',
      accessorKey: 'brand',
    },
    {
      header: 'Category',
      accessorKey: 'category',
    },
    {
      header: 'Seller',
      accessorKey: 'seller',
    },
    {
      header: 'City',
      accessorKey: 'city',
    },
    {
      header: 'Current Stock',
      accessorKey: 'currentStock',
      cell: (info: any) => (
        <span className={`font-bold ${info.getValue() <= 0 ? 'text-danger' : info.getValue() < 10 ? 'text-warning' : 'text-success'}`}>
          {info.getValue()}
        </span>
      )
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (info: any) => {
        const val = info.getValue();
        return (
          <span className={`px-2 py-1 text-xs font-bold rounded-full ${val === 'IN_STOCK' ? 'bg-success/10 text-success' : val === 'LOW_STOCK' ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'}`}>
            {val.replace('_', ' ')}
          </span>
        );
      }
    },
    {
      header: 'Last Updated',
      accessorKey: 'lastUpdated',
      cell: (info: any) => new Date(info.getValue()).toLocaleDateString()
    },
  ];

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
            Inventory <span className="text-text-secondary text-lg font-medium">({data?.meta?.total || 0})</span>
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Total Value" value={`₹${(data?.kpis?.totalValue || 0).toLocaleString()}`} loading={isLoading} />
        <KPICard title="Total SKUs" value={data?.kpis?.totalSkus || 0} loading={isLoading} />
        <KPICard title="Low Stock" value={data?.kpis?.lowStock || 0} loading={isLoading} className="border-warning/20" />
        <KPICard title="Out of Stock" value={data?.kpis?.outOfStock || 0} loading={isLoading} className="border-danger/20" />
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
export default InventoryOverviewPage;
