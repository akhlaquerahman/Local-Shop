import React, { useState } from 'react';
import { useAdminPermissions } from '../services/admin.queries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { AdminDataTable } from '@/components/table/AdminDataTable';
import { PaginationState, SortingState } from '@tanstack/react-table';
import { Button } from '@/components/ui/Button';
import { KPICard } from '@/components/ui/KPI';

export const PermissionsPage: React.FC = () => {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post(`/v1/admin/permissions`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-permissions'] });
      setIsModalOpen(false);
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    createMutation.mutate({
      resource: formData.get('resource'),
      action: formData.get('action'),
      description: formData.get('description')
    });
  };

  const { data, isLoading } = useAdminPermissions({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search,
    sortBy: sorting[0]?.id,
    sortOrder: sorting[0]?.desc ? 'desc' : 'asc'
  });

  const columns = [
    {
      header: 'Module Resource',
      accessorKey: 'resource',
      cell: (info: any) => <span className="font-bold text-text-primary uppercase tracking-wider">{info.getValue()}</span>
    },
    {
      header: 'Action',
      accessorKey: 'action',
      cell: (info: any) => {
        const val = info.getValue();
        let colorClass = 'bg-surface border-border text-text-secondary';
        if(val.includes('create') || val.includes('add')) colorClass = 'bg-success/10 text-success border-success/20';
        else if(val.includes('delete') || val.includes('remove')) colorClass = 'bg-danger/10 text-danger border-danger/20';
        else if(val.includes('update') || val.includes('edit')) colorClass = 'bg-warning/10 text-warning border-warning/20';
        else if(val.includes('read') || val.includes('view')) colorClass = 'bg-brand-primary/10 text-brand-primary border-brand-primary/20';
        
        return <span className={`px-2 py-1 text-xs font-bold rounded border ${colorClass}`}>{val}</span>;
      }
    },
    {
      header: 'Description',
      accessorKey: 'description',
      cell: (info: any) => <span className="text-sm text-text-secondary">{info.getValue()}</span>
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: () => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="h-8 text-xs px-2 py-1">Matrix</Button>
          <Button size="sm" variant="outline" className="h-8 text-xs px-2 py-1">Edit</Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
            Permissions Matrix <span className="text-text-secondary text-lg font-medium">({data?.meta?.total || 0})</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-primary hover:bg-primary/90 text-white" onClick={() => setIsModalOpen(true)}>Add Policy</Button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface border border-border rounded-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4">Add Permission</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1">Resource</label>
                <input name="resource" required className="w-full bg-background border border-border rounded px-3 py-2 text-text-primary" placeholder="e.g. USERS" />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Action</label>
                <input name="action" required className="w-full bg-background border border-border rounded px-3 py-2 text-text-primary" placeholder="e.g. read:users" />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Description</label>
                <input name="description" required className="w-full bg-background border border-border rounded px-3 py-2 text-text-primary" />
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
        <KPICard title="Total Policies" value={data?.kpis?.permissions || 0} loading={isLoading} />
        <KPICard title="Modules" value={data?.kpis?.modules || 0} loading={isLoading} className="border-brand-primary/20" />
        <KPICard title="Active Roles" value={data?.kpis?.roles || 0} loading={isLoading} className="border-success/20" />
        <KPICard title="Restricted" value={data?.kpis?.restricted || 0} loading={isLoading} className="border-danger/20" />
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
export default PermissionsPage;
