import React, { useState } from 'react';
import { useAdminProducts } from '../services/admin.queries';
import { AdminDataTable } from '@/components/table/AdminDataTable';
import { PaginationState, SortingState } from '@tanstack/react-table';
import { Button } from '@/components/ui/Button';

export const AdminProductsPage: React.FC = () => {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useAdminProducts({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search,
    sortBy: sorting[0]?.id,
    sortOrder: sorting[0]?.desc ? 'desc' : 'asc'
  });

  const columns = [
    {
      header: 'Product',
      accessorKey: 'productName',
      cell: ({ row, getValue }: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center shrink-0 border border-border overflow-hidden">
            {row.original.image ? (
              <img src={row.original.image} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs text-text-secondary">No img</span>
            )}
          </div>
          <span className="font-semibold text-text-primary whitespace-normal line-clamp-2 max-w-[200px]">{getValue()}</span>
        </div>
      )
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
      header: 'Stock',
      accessorKey: 'stock',
      cell: (info: any) => (
        <span className={info.getValue() < 10 ? 'text-danger font-bold' : ''}>
          {info.getValue()}
        </span>
      )
    },
    {
      header: 'Sales',
      accessorKey: 'sales',
    },
    {
      header: 'Revenue',
      accessorKey: 'revenue',
      cell: (info: any) => `₹${info.getValue().toLocaleString()}`
    },
    {
      header: 'Created Date',
      accessorKey: 'createdAt',
      cell: (info: any) => new Date(info.getValue()).toLocaleDateString()
    }
  ];

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
            Products <span className="text-text-secondary text-lg font-medium">({data?.meta?.total || 0})</span>
          </h1>
        </div>
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
export default AdminProductsPage;
