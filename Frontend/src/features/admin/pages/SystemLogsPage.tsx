import React, { useState } from 'react';
import { useAdminSystemLogs } from '../services/admin.queries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { AdminDataTable } from '@/components/table/AdminDataTable';
import { PaginationState, SortingState } from '@tanstack/react-table';
import { Button } from '@/components/ui/Button';
import { KPICard } from '@/components/ui/KPI';

export const SystemLogsPage: React.FC = () => {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post(`/v1/admin/system-logs`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-system-logs'] });
      setIsModalOpen(false);
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    createMutation.mutate({
      source: formData.get('source'),
      level: formData.get('level'),
      message: formData.get('message')
    });
  };

  const { data, isLoading } = useAdminSystemLogs({
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
      header: 'Service',
      accessorKey: 'service',
      cell: (info: any) => <span className="font-semibold text-text-primary">{info.getValue()}</span>
    },
    {
      header: 'Severity',
      accessorKey: 'severity',
      cell: (info: any) => {
        const val = info.getValue();
        return (
          <span className={`px-2 py-1 text-xs font-bold rounded-full ${val === 'CRITICAL' ? 'bg-danger/10 text-danger' : val === 'WARNING' ? 'bg-warning/10 text-warning' : 'bg-brand-primary/10 text-brand-primary'}`}>
            {val}
          </span>
        );
      }
    },
    {
      header: 'Message',
      accessorKey: 'message',
      cell: (info: any) => <span className="text-sm font-mono text-text-secondary whitespace-normal line-clamp-1 max-w-[300px]">{info.getValue()}</span>
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (info: any) => {
        const val = info.getValue();
        return (
          <span className={`px-2 py-1 text-xs font-bold rounded-full ${val === 'RESOLVED' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
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
          <Button size="sm" variant="outline" className="h-8 text-xs px-2 py-1">View Stack</Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
            Developer System Logs <span className="text-text-secondary text-lg font-medium">({data?.meta?.total || 0})</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-surface border-border hover:bg-white/5">Download Logs</Button>
          <Button className="bg-primary hover:bg-primary/90 text-white" onClick={() => setIsModalOpen(true)}>Simulate Log</Button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface border border-border rounded-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4">Simulate System Log</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1">Service/Source</label>
                <input name="source" required className="w-full bg-background border border-border rounded px-3 py-2 text-text-primary" placeholder="e.g. Payment Gateway" />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Severity</label>
                <select name="level" className="w-full bg-background border border-border rounded px-3 py-2 text-text-primary">
                  <option value="INFO">Info</option>
                  <option value="WARNING">Warning</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Message</label>
                <textarea name="message" required className="w-full bg-background border border-border rounded px-3 py-2 text-text-primary" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setIsModalOpen(false)} type="button">Cancel</Button>
                <Button className="bg-primary hover:bg-primary/90 text-white" type="submit" disabled={createMutation.isPending}>Save</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Errors Today" value={data?.kpis?.errorsToday || 0} loading={isLoading} />
        <KPICard title="Critical Errors" value={data?.kpis?.criticalErrors || 0} loading={isLoading} className="border-danger/20" />
        <KPICard title="Warnings" value={data?.kpis?.warnings || 0} loading={isLoading} className="border-warning/20" />
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
export default SystemLogsPage;
