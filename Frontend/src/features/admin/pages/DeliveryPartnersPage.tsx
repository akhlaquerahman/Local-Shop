import React, { useState } from 'react';
import { useAdminRiders, useSuspendAdminRider } from '../services/admin.queries';
import { AdminDataTable } from '@/components/table/AdminDataTable';
import { PaginationState, SortingState } from '@tanstack/react-table';
import { Button } from '@/components/ui/Button';

export const DeliveryPartnersPage: React.FC = () => {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useAdminRiders({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search,
    sortBy: sorting[0]?.id,
    sortOrder: sorting[0]?.desc ? 'desc' : 'asc'
  });

  const suspendMutation = useSuspendAdminRider();

  const columns = [
    {
      header: 'Rider',
      accessorKey: 'name',
      cell: (info: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-surface flex-shrink-0">
            {info.row.original.profilePic ? (
              <img src={info.row.original.profilePic} alt={info.getValue()} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                {info.getValue().charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <span className="font-semibold text-text-primary">{info.getValue()}</span>
        </div>
      )
    },
    {
      header: 'Phone',
      accessorKey: 'phone',
    },
    {
      header: 'City',
      accessorKey: 'city',
    },
    {
      header: 'Vehicle',
      accessorKey: 'vehicle',
    },
    {
      header: 'Rating',
      accessorKey: 'rating',
      cell: (info: any) => `⭐ ${info.getValue()}`
    },
    {
      header: 'Active Deliveries',
      accessorKey: 'activeDeliveries',
    },
    {
      header: 'Completed Deliveries',
      accessorKey: 'completedDeliveries',
    },
    {
      header: 'Duty Status',
      accessorKey: 'dutyStatus',
      cell: (info: any) => (
        <span className={`px-2 py-1 text-xs font-bold rounded-full ${info.getValue() === 'ACTIVE' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
          {info.getValue()}
        </span>
      )
    },
    {
      header: 'KYC Status',
      accessorKey: 'kycStatus',
      cell: (info: any) => (
        <span className={`px-2 py-1 text-xs font-bold rounded-full ${info.getValue() === 'VERIFIED' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
          {info.getValue()}
        </span>
      )
    },
    {
      header: 'Action',
      id: 'actions',
      cell: (info: any) => {
        const isSuspended = info.row.original.status === 'SUSPENDED';
        return (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = `/admin/users/${info.row.original.id}`}
            >
              View
            </Button>
            <Button 
              variant={isSuspended ? 'outline' : 'danger'} 
              size="sm"
              onClick={() => suspendMutation.mutate(info.row.original.id)}
              disabled={suspendMutation.isPending}
            >
              {isSuspended ? 'Activate' : 'Suspend'}
            </Button>
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
            Delivery Partners <span className="text-text-secondary text-lg font-medium">({data?.meta?.total || 0})</span>
          </h1>
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
export default DeliveryPartnersPage;
