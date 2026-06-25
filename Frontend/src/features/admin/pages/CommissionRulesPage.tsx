import React, { useState } from 'react';
import { useAdminCommissions } from '../services/admin.queries';
import { AdminDataTable } from '@/components/table/AdminDataTable';
import { PaginationState, SortingState } from '@tanstack/react-table';
import { Button } from '@/components/ui/Button';
import { KPICard } from '@/components/ui/KPI';

export const CommissionRulesPage: React.FC = () => {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useAdminCommissions({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search,
    sortBy: sorting[0]?.id,
    sortOrder: sorting[0]?.desc ? 'desc' : 'asc'
  });

  const columns = [
    {
      header: 'Rule Name',
      accessorKey: 'name',
      cell: (info: any) => <span className="font-semibold text-text-primary">{info.getValue()}</span>
    },
    {
      header: 'Scope',
      accessorKey: 'scope',
    },
    {
      header: 'Commission %',
      accessorKey: 'commissionPercent',
      cell: (info: any) => <span className="font-bold">{info.getValue()}%</span>
    },
    {
      header: 'Effective Date',
      accessorKey: 'modified',
      cell: (info: any) => new Date(info.getValue()).toLocaleDateString()
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
      header: 'Actions',
      id: 'actions',
      cell: () => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="h-8 text-xs px-2 py-1">Edit</Button>
          <Button size="sm" variant="outline" className="h-8 text-xs px-2 py-1">Disable</Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
            Commission Rules <span className="text-text-secondary text-lg font-medium">({data?.meta?.total || 0})</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-primary hover:bg-primary/90 text-white">Create Rule</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Global Commission" value={data?.kpis?.globalCommission || '0%'} loading={isLoading} />
        <KPICard title="Active Rules" value={data?.kpis?.activeRules || 0} loading={isLoading} className="border-success/20" />
        <KPICard title="Category Overrides" value={data?.kpis?.categoryOverrides || 0} loading={isLoading} />
        <KPICard title="Seller Overrides" value={data?.kpis?.sellerOverrides || 0} loading={isLoading} />
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
export default CommissionRulesPage;
