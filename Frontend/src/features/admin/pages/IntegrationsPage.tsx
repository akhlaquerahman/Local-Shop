import React, { useState } from 'react';
import { useAdminIntegrations } from '../services/admin.queries';
import { AdminDataTable } from '@/components/table/AdminDataTable';
import { PaginationState, SortingState } from '@tanstack/react-table';
import { Button } from '@/components/ui/Button';

export const IntegrationsPage: React.FC = () => {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useAdminIntegrations({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search,
    sortBy: sorting[0]?.id,
    sortOrder: sorting[0]?.desc ? 'desc' : 'asc'
  });

  const columns = [
    {
      header: 'Provider',
      accessorKey: 'provider',
      cell: (info: any) => <span className="font-bold text-text-primary">{info.getValue()}</span>
    },
    {
      header: 'Category',
      accessorKey: 'category',
    },
    {
      header: 'Environment',
      accessorKey: 'environment',
      cell: (info: any) => <span className="font-mono text-xs">{info.getValue()}</span>
    },
    {
      header: 'Last Sync',
      accessorKey: 'lastSync',
      cell: (info: any) => new Date(info.getValue()).toLocaleString()
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (info: any) => {
        const val = info.getValue();
        return (
          <span className={`px-2 py-1 text-xs font-bold rounded-full ${val === 'CONNECTED' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
            {val}
          </span>
        );
      }
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: () => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="h-8 text-xs px-2 py-1">Configure</Button>
          <Button size="sm" variant="outline" className="h-8 text-xs px-2 py-1 border-brand-primary/20 text-brand-primary hover:bg-brand-primary/10">Test</Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
            Integrations <span className="text-text-secondary text-lg font-medium">({data?.meta?.total || 0})</span>
          </h1>
          <p className="text-sm text-text-secondary mt-1">Manage 3rd party API connections.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-primary hover:bg-primary/90 text-white">Add Provider</Button>
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
export default IntegrationsPage;
