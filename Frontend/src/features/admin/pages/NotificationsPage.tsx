import React, { useState } from 'react';
import { useAdminNotifications } from '../services/admin.queries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { AdminDataTable } from '@/components/table/AdminDataTable';
import { PaginationState, SortingState } from '@tanstack/react-table';
import { Button } from '@/components/ui/Button';
import { KPICard } from '@/components/ui/KPI';

export const NotificationsPage: React.FC = () => {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post(`/v1/admin/notifications`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      setIsModalOpen(false);
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    createMutation.mutate({
      title: formData.get('title'),
      message: formData.get('message'),
      type: formData.get('type') || 'all'
    });
  };

  const { data, isLoading } = useAdminNotifications({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search,
    sortBy: sorting[0]?.id,
    sortOrder: sorting[0]?.desc ? 'desc' : 'asc'
  });

  const columns = [
    {
      header: 'Campaign Name',
      accessorKey: 'campaignName',
      cell: (info: any) => <span className="font-semibold text-text-primary">{info.getValue()}</span>
    },
    {
      header: 'Audience',
      accessorKey: 'audience',
    },
    {
      header: 'Channel',
      accessorKey: 'channel',
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (info: any) => {
        const val = info.getValue();
        return (
          <span className={`px-2 py-1 text-xs font-bold rounded-full ${val === 'DELIVERED' ? 'bg-success/10 text-success' : val === 'SCHEDULED' ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'}`}>
            {val}
          </span>
        );
      }
    },
    {
      header: 'Scheduled Date',
      accessorKey: 'scheduledDate',
      cell: (info: any) => new Date(info.getValue()).toLocaleString()
    },
    {
      header: 'Delivered',
      accessorKey: 'deliveredCount',
      cell: (info: any) => <span className="font-mono">{info.getValue()}</span>
    },
    {
      header: 'CTR',
      accessorKey: 'ctr',
      cell: (info: any) => <span className="font-semibold text-brand-primary">{info.getValue()}</span>
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: () => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="h-8 text-xs px-2 py-1">Edit</Button>
          <Button size="sm" variant="outline" className="h-8 text-xs px-2 py-1">Pause</Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
            Broadcast Notifications <span className="text-text-secondary text-lg font-medium">({data?.meta?.total || 0})</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-primary hover:bg-primary/90 text-white" onClick={() => setIsModalOpen(true)}>Create Broadcast</Button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface border border-border rounded-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4">Create Broadcast</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1">Title</label>
                <input name="title" required className="w-full bg-background border border-border rounded px-3 py-2 text-text-primary" />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Message</label>
                <textarea name="message" required className="w-full bg-background border border-border rounded px-3 py-2 text-text-primary" />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Audience Type</label>
                <select name="type" className="w-full bg-background border border-border rounded px-3 py-2 text-text-primary">
                  <option value="all">All</option>
                  <option value="shop">Sellers</option>
                  <option value="delivery">Riders</option>
                  <option value="customer">Customers</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setIsModalOpen(false)} type="button">Cancel</Button>
                <Button className="bg-primary hover:bg-primary/90 text-white" type="submit" disabled={createMutation.isPending}>Send</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Total Broadcasts" value={data?.kpis?.totalBroadcasts || 0} loading={isLoading} />
        <KPICard title="Scheduled" value={data?.kpis?.scheduled || 0} loading={isLoading} className="border-warning/20" />
        <KPICard title="Delivered" value={data?.kpis?.delivered || 0} loading={isLoading} className="border-success/20" />
        <KPICard title="Failed" value={data?.kpis?.failed || 0} loading={isLoading} className="border-danger/20" />
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
export default NotificationsPage;
