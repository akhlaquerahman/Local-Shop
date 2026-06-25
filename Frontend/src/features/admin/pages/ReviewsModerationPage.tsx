import React, { useState } from 'react';
import { useAdminReviews } from '../services/admin.queries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { AdminDataTable } from '@/components/table/AdminDataTable';
import { PaginationState, SortingState } from '@tanstack/react-table';
import { Button } from '@/components/ui/Button';
import { KPICard } from '@/components/ui/KPI';

export const ReviewsModerationPage: React.FC = () => {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => api.put(`/v1/admin/reviews/${id}`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
  });

  const { data, isLoading } = useAdminReviews({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search,
    sortBy: sorting[0]?.id,
    sortOrder: sorting[0]?.desc ? 'desc' : 'asc'
  });

  const columns = [
    {
      header: 'Review ID',
      accessorKey: 'reviewId',
      cell: (info: any) => <span className="font-mono text-sm">{info.getValue()}</span>
    },
    {
      header: 'Customer',
      accessorKey: 'customer',
    },
    {
      header: 'Product',
      accessorKey: 'product',
      cell: (info: any) => <span className="font-semibold text-text-primary whitespace-normal line-clamp-1 max-w-[150px]">{info.getValue()}</span>
    },
    {
      header: 'Seller',
      accessorKey: 'seller',
    },
    {
      header: 'Rating',
      accessorKey: 'rating',
      cell: (info: any) => `⭐ ${info.getValue()}`
    },
    {
      header: 'Review Text',
      accessorKey: 'reviewText',
      cell: (info: any) => <span className="text-sm italic text-text-secondary whitespace-normal line-clamp-2 max-w-[250px]">"{info.getValue()}"</span>
    },
    {
      header: 'Reports',
      accessorKey: 'reportedCount',
      cell: (info: any) => (
        <span className={`font-bold ${info.getValue() > 0 ? 'text-danger' : 'text-text-secondary'}`}>
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
          <span className={`px-2 py-1 text-xs font-bold rounded-full ${val === 'APPROVED' ? 'bg-success/10 text-success' : val === 'HIDDEN' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'}`}>
            {val}
          </span>
        );
      }
    },
    {
      header: 'Date',
      accessorKey: 'date',
      cell: (info: any) => new Date(info.getValue()).toLocaleDateString()
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: (info: any) => {
        const row = info.row.original;
        return (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="h-8 text-xs px-2 py-1 bg-success/10 text-success hover:bg-success/20 border-success/20" onClick={() => updateMutation.mutate({ id: row.id, status: 'approved' })}>Approve</Button>
            <Button size="sm" variant="outline" className="h-8 text-xs px-2 py-1 bg-danger/10 text-danger hover:bg-danger/20 border-danger/20" onClick={() => updateMutation.mutate({ id: row.id, status: 'hidden' })}>Hide</Button>
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
            Reviews Moderation <span className="text-text-secondary text-lg font-medium">({data?.meta?.total || 0})</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-surface border-border hover:bg-white/5">Export</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Pending Reviews" value={data?.kpis?.pendingReviews || 0} loading={isLoading} className="border-warning/20" />
        <KPICard title="Reported" value={data?.kpis?.reportedReviews || 0} loading={isLoading} className="border-danger/20" />
        <KPICard title="Hidden" value={data?.kpis?.hiddenReviews || 0} loading={isLoading} className="border-text-secondary/20" />
        <KPICard title="Approved" value={data?.kpis?.approvedReviews || 0} loading={isLoading} className="border-success/20" />
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
export default ReviewsModerationPage;
