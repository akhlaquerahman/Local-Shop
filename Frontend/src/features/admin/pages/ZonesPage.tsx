import React, { useState } from 'react';
import { useAdminZones } from '../services/admin.queries';
import { AdminDataTable } from '@/components/table/AdminDataTable';
import { PaginationState, SortingState } from '@tanstack/react-table';
import { Button } from '@/components/ui/Button';

export const ZonesPage: React.FC = () => {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useAdminZones({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search,
    sortBy: sorting[0]?.id,
    sortOrder: sorting[0]?.desc ? 'desc' : 'asc'
  });

  const columns = [
    {
      header: 'Zone Name',
      accessorKey: 'zoneName',
      cell: (info: any) => <span className="font-semibold text-text-primary">{info.getValue()}</span>
    },
    {
      header: 'City',
      accessorKey: 'city',
    },
    {
      header: 'Stores',
      accessorKey: 'stores',
    },
    {
      header: 'Customers',
      accessorKey: 'customers',
    },
    {
      header: 'Riders',
      accessorKey: 'riders',
    },
    {
      header: 'Orders Today',
      accessorKey: 'ordersToday',
    },
    {
      header: 'Revenue',
      accessorKey: 'revenue',
      cell: (info: any) => `₹${info.getValue().toLocaleString()}`
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (info: any) => (
        <span className={`px-2 py-1 text-xs font-bold rounded-full ${info.getValue() === 'ACTIVE' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
          {info.getValue()}
        </span>
      )
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
            Zones <span className="text-text-secondary text-lg font-medium">({data?.meta?.total || 0})</span>
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
export default ZonesPage;
