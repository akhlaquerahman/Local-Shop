import React, { useState } from 'react';
import { useAdminAdvertisements } from '../services/admin.queries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { AdminDataTable } from '@/components/table/AdminDataTable';
import { PaginationState, SortingState } from '@tanstack/react-table';
import { Button } from '@/components/ui/Button';
import { KPICard } from '@/components/ui/KPI';

export const AdvertisementsPage: React.FC = () => {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post(`/v1/admin/advertisements`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-advertisements'] });
      setIsModalOpen(false);
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    createMutation.mutate({
      title: formData.get('title'),
      imageUrl: formData.get('imageUrl'),
      redirectUrl: formData.get('redirectUrl'),
      location: formData.get('location')
    });
  };

  const { data, isLoading } = useAdminAdvertisements({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search,
    sortBy: sorting[0]?.id,
    sortOrder: sorting[0]?.desc ? 'desc' : 'asc'
  });

  const columns = [
    {
      header: 'Campaign',
      accessorKey: 'campaign',
      cell: (info: any) => <span className="font-semibold text-text-primary">{info.getValue()}</span>
    },
    {
      header: 'Advertiser',
      accessorKey: 'advertiser',
    },
    {
      header: 'Budget',
      accessorKey: 'budget',
      cell: (info: any) => <span className="font-bold text-text-primary">{info.getValue()}</span>
    },
    {
      header: 'Spend',
      accessorKey: 'spend',
      cell: (info: any) => <span className="text-warning">{info.getValue()}</span>
    },
    {
      header: 'CTR',
      accessorKey: 'ctr',
      cell: (info: any) => <span className="font-bold text-brand-primary">{info.getValue()}</span>
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (info: any) => {
        const val = info.getValue();
        return (
          <span className={`px-2 py-1 text-xs font-bold rounded-full ${val === 'ACTIVE' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
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
          <Button size="sm" variant="outline" className="h-8 text-xs px-2 py-1">View</Button>
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
            Advertisements <span className="text-text-secondary text-lg font-medium">({data?.meta?.total || 0})</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-primary hover:bg-primary/90 text-white" onClick={() => setIsModalOpen(true)}>Create Advertisement</Button>
          <Button variant="outline" className="bg-surface border-border hover:bg-white/5">Analytics</Button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface border border-border rounded-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4">Create Advertisement</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1">Campaign Title</label>
                <input name="title" required className="w-full bg-background border border-border rounded px-3 py-2 text-text-primary" />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Image URL</label>
                <input name="imageUrl" required className="w-full bg-background border border-border rounded px-3 py-2 text-text-primary" />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Redirect URL</label>
                <input name="redirectUrl" required className="w-full bg-background border border-border rounded px-3 py-2 text-text-primary" />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Location</label>
                <select name="location" className="w-full bg-background border border-border rounded px-3 py-2 text-text-primary">
                  <option value="HOME_TOP">Home Top</option>
                  <option value="SIDEBAR">Sidebar</option>
                  <option value="SEARCH_RESULTS">Search Results</option>
                </select>
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
        <KPICard title="Total Campaigns" value={data?.kpis?.campaigns || 0} loading={isLoading} />
        <KPICard title="Ad Revenue" value={`₹${(data?.kpis?.revenue || 0).toLocaleString()}`} loading={isLoading} className="border-success/20" />
        <KPICard title="Impressions" value={data?.kpis?.impressions || '0'} loading={isLoading} />
        <KPICard title="Clicks" value={data?.kpis?.clicks || '0'} loading={isLoading} className="border-brand-primary/20" />
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
export default AdvertisementsPage;
