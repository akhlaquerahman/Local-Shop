import React, { useState } from 'react';
import { useAdminDisputes } from '../services/admin.queries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { AdminDataTable } from '@/components/table/AdminDataTable';
import { PaginationState, SortingState } from '@tanstack/react-table';
import { Button } from '@/components/ui/Button';
import { KPICard } from '@/components/ui/KPI';

export const DisputesCenterPage: React.FC = () => {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => api.put(`/v1/admin/disputes/${id}`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-disputes'] })
  });

  const { data, isLoading } = useAdminDisputes({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search,
    sortBy: sorting[0]?.id,
    sortOrder: sorting[0]?.desc ? 'desc' : 'asc'
  });

  const columns = [
    {
      header: 'Dispute ID',
      accessorKey: 'disputeId',
      cell: (info: any) => <span className="font-mono text-sm font-semibold">{info.getValue()}</span>
    },
    {
      header: 'Order ID',
      accessorKey: 'orderId',
      cell: (info: any) => <span className="font-mono text-sm text-text-secondary">{info.getValue()?.substring(0,8).toUpperCase()}</span>
    },
    {
      header: 'Customer',
      accessorKey: 'customer',
    },
    {
      header: 'Against',
      accessorKey: 'against',
      cell: (info: any) => <span className="text-brand-primary">{info.getValue()}</span>
    },
    {
      header: 'Priority',
      accessorKey: 'priority',
      cell: (info: any) => (
        <span className={`px-2 py-1 text-xs font-bold rounded-full ${info.getValue() === 'HIGH' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'}`}>
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
          <span className={`px-2 py-1 text-xs font-bold rounded-full ${val === 'RESOLVED' ? 'bg-success/10 text-success' : val === 'ESCALATED' ? 'bg-danger/10 text-danger' : 'bg-brand-primary/10 text-brand-primary'}`}>
            {val}
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
      header: 'Assigned Admin',
      accessorKey: 'assignedAdmin',
      cell: (info: any) => <span className="text-xs">{info.getValue()}</span>
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: (info: any) => {
        const row = info.row.original;
        return (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="h-8 text-xs px-2 py-1" onClick={() => updateMutation.mutate({ id: row.id, status: 'resolved' })}>Resolve</Button>
            <Button size="sm" variant="outline" className="h-8 text-xs px-2 py-1 bg-danger/10 text-danger hover:bg-danger/20 border-danger/20" onClick={() => updateMutation.mutate({ id: row.id, status: 'escalated' })}>Escalate</Button>
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
            Disputes Center <span className="text-text-secondary text-lg font-medium">({data?.meta?.total || 0})</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-surface border-border hover:bg-white/5">Export Log</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Open Cases" value={data?.kpis?.openCases || 0} loading={isLoading} className="border-danger/20" />
        <KPICard title="In Review" value={data?.kpis?.inReview || 0} loading={isLoading} className="border-warning/20" />
        <KPICard title="Escalated" value={data?.kpis?.escalated || 0} loading={isLoading} className="border-brand-primary/20" />
        <KPICard title="Resolved" value={data?.kpis?.resolved || 0} loading={isLoading} className="border-success/20" />
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
export default DisputesCenterPage;
