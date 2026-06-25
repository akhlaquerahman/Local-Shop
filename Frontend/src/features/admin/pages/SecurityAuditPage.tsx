import React, { useState } from 'react';
import { useAdminAuditLogs } from '../services/admin.queries';
import { AdminDataTable } from '@/components/table/AdminDataTable';
import { PaginationState, SortingState } from '@tanstack/react-table';
import { Button } from '@/components/ui/Button';
import { KPICard } from '@/components/ui/KPI';

export const SecurityAuditPage: React.FC = () => {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useAdminAuditLogs({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search,
    sortBy: sorting[0]?.id,
    sortOrder: sorting[0]?.desc ? 'desc' : 'asc'
  });

  const columns = [
    {
      header: 'Timestamp',
      accessorKey: 'timestamp',
      cell: (info: any) => <span className="font-mono text-sm">{new Date(info.getValue()).toLocaleString()}</span>
    },
    {
      header: 'User',
      accessorKey: 'user',
      cell: (info: any) => <span className="font-semibold text-text-primary">{info.getValue()}</span>
    },
    {
      header: 'Action',
      accessorKey: 'action',
      cell: (info: any) => <span className="text-xs font-bold uppercase bg-surface border border-border px-2 py-1 rounded">{info.getValue()}</span>
    },
    {
      header: 'Module',
      accessorKey: 'module',
    },
    {
      header: 'IP Address',
      accessorKey: 'ip',
      cell: (info: any) => <span className="font-mono text-xs">{info.getValue()}</span>
    },
    {
      header: 'Result',
      accessorKey: 'result',
      cell: (info: any) => {
        const val = info.getValue();
        return (
          <span className={`px-2 py-1 text-xs font-bold rounded-full ${val === 'SUCCESS' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
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
          <Button size="sm" variant="outline" className="h-8 text-xs px-2 py-1">Details</Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
            Security Audit Trail <span className="text-text-secondary text-lg font-medium">({data?.meta?.total || 0})</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-surface border-border hover:bg-white/5">Export CSV</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Total Events" value={data?.kpis?.totalEvents?.toLocaleString() || 0} loading={isLoading} />
        <KPICard title="Critical Events" value={data?.kpis?.criticalEvents || 0} loading={isLoading} className="border-danger/20" />
        <KPICard title="Failed Actions" value={data?.kpis?.failedActions || 0} loading={isLoading} className="border-warning/20" />
        <KPICard title="Impersonation Events" value={data?.kpis?.impersonationEvents || 0} loading={isLoading} className="border-brand-primary/20" />
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
export default SecurityAuditPage;
