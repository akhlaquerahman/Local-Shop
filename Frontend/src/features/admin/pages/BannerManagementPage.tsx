import React, { useState } from 'react';
import { useAdminBanners } from '../services/admin.queries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { AdminDataTable } from '@/components/table/AdminDataTable';
import { PaginationState, SortingState } from '@tanstack/react-table';
import { Button } from '@/components/ui/Button';
import { KPICard } from '@/components/ui/KPI';

export const BannerManagementPage: React.FC = () => {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post(`/v1/admin/banners`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      setIsModalOpen(false);
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    createMutation.mutate({
      title: formData.get('title'),
      imageUrl: formData.get('imageUrl'),
      position: formData.get('position'),
      isActive: formData.get('isActive') === 'true'
    });
  };

  const { data, isLoading } = useAdminBanners({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search,
    sortBy: sorting[0]?.id,
    sortOrder: sorting[0]?.desc ? 'desc' : 'asc'
  });

  const columns = [
    {
      header: 'Banner Preview',
      accessorKey: 'preview',
      cell: (info: any) => (
        <div className="w-24 h-12 rounded bg-surface border border-border flex items-center justify-center overflow-hidden">
          {info.getValue() ? (
            <img src={info.getValue()} alt="Banner" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs text-text-secondary">No Image</span>
          )}
        </div>
      )
    },
    {
      header: 'Placement',
      accessorKey: 'placement',
      cell: (info: any) => <span className="font-semibold text-text-primary">{info.getValue()}</span>
    },
    {
      header: 'Priority',
      accessorKey: 'priority',
      cell: (info: any) => <span className="font-mono">{info.getValue()}</span>
    },
    {
      header: 'Clicks',
      accessorKey: 'clicks',
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
          <span className={`px-2 py-1 text-xs font-bold rounded-full ${val === 'ACTIVE' ? 'bg-success/10 text-success' : 'bg-text-secondary/10 text-text-secondary'}`}>
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
          <Button size="sm" variant="outline" className="h-8 text-xs px-2 py-1">Edit</Button>
          <Button size="sm" variant="outline" className="h-8 text-xs px-2 py-1">Archive</Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
            Banner Management <span className="text-text-secondary text-lg font-medium">({data?.meta?.total || 0})</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-primary hover:bg-primary/90 text-white" onClick={() => setIsModalOpen(true)}>Upload Banner</Button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface border border-border rounded-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4">Upload Banner</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1">Title</label>
                <input name="title" required className="w-full bg-background border border-border rounded px-3 py-2 text-text-primary" />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Image URL</label>
                <input name="imageUrl" required className="w-full bg-background border border-border rounded px-3 py-2 text-text-primary" />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Position</label>
                <select name="position" className="w-full bg-background border border-border rounded px-3 py-2 text-text-primary">
                  <option value="home_main">Homepage Main</option>
                  <option value="home_middle">Homepage Middle</option>
                  <option value="category_top">Category Top</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Status</label>
                <select name="isActive" className="w-full bg-background border border-border rounded px-3 py-2 text-text-primary">
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
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
        <KPICard title="Active Banners" value={data?.kpis?.activeBanners || 0} loading={isLoading} className="border-success/20" />
        <KPICard title="Homepage Slots" value={data?.kpis?.homepageSlots || 0} loading={isLoading} />
        <KPICard title="Platform CTR" value={data?.kpis?.ctr || '0%'} loading={isLoading} className="border-brand-primary/20" />
        <KPICard title="Scheduled" value={data?.kpis?.scheduled || 0} loading={isLoading} className="border-warning/20" />
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
export default BannerManagementPage;
