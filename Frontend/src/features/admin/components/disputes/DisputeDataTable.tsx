import React, { useState } from 'react';
import { useAdminDisputesList } from '../../services/admin.queries';
import { AdminDataTable } from '@/components/table/AdminDataTable';
import { Button } from '@/components/ui/Button';
import { DisputeDetailsDrawer } from './DisputeDetailsDrawer';
import { PaginationState, SortingState } from '@tanstack/react-table';

export const DisputeDataTable = ({ activeTab }: { activeTab: string }) => {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null);

  const queryParams: any = {
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  };

  if (activeTab) {
    queryParams.status = activeTab;
  }

  const { data, isLoading } = useAdminDisputesList(queryParams);

  const columns = [
    {
      header: 'Dispute ID',
      accessorKey: 'disputeId',
      cell: (info: any) => <span className="font-mono font-bold text-xs">{info.getValue()}</span>
    },
    {
      header: 'Target Type',
      accessorKey: 'targetType',
      cell: (info: any) => (
        <span className="px-2 py-1 text-[10px] font-bold uppercase rounded-md bg-surface border border-border">
          {info.getValue()}
        </span>
      )
    },
    {
      header: 'Customer',
      accessorKey: 'customer.firstName',
      cell: (info: any) => {
        const c = info.row.original.customer;
        return c ? <span className="text-sm font-medium">{c.firstName} {c.lastName}</span> : <span className="text-sm text-text-secondary">Unknown</span>;
      }
    },
    {
      header: 'Priority',
      accessorKey: 'priority',
      cell: (info: any) => {
        const priority = info.getValue();
        const colors: any = {
          LOW: 'bg-surface text-text-secondary',
          MEDIUM: 'bg-warning/10 text-warning',
          HIGH: 'bg-danger/10 text-danger',
          URGENT: 'bg-danger text-white'
        };
        return <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md ${colors[priority]}`}>{priority}</span>;
      }
    },
    {
      header: 'Reason',
      accessorKey: 'reason',
      cell: (info: any) => <span className="text-sm text-text-primary font-medium">{info.getValue()}</span>
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (info: any) => {
        const val = info.getValue();
        const colors: any = {
          OPEN: 'text-primary',
          IN_REVIEW: 'text-warning',
          ESCALATED: 'text-danger',
          RESOLVED: 'text-success',
          DISMISSED: 'text-text-secondary'
        };
        return <span className={`text-[11px] font-bold uppercase ${colors[val]}`}>{val}</span>;
      }
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: (info: any) => (
        <Button 
          size="sm" 
          onClick={() => setSelectedDisputeId(info.row.original._id)}
          className="h-8 text-xs bg-primary text-white hover:bg-primary/90"
        >
          Investigate
        </Button>
      )
    }
  ];

  return (
    <>
      <AdminDataTable
        columns={columns}
        data={data?.data || []}
        pageCount={data?.meta?.totalPages || -1}
        totalRecords={data?.meta?.total || 0}
        isLoading={isLoading}
        onPaginationChange={setPagination}
        onSortingChange={setSorting}
        initialState={{ pagination, sorting }}
      />
      {selectedDisputeId && (
        <DisputeDetailsDrawer 
          disputeId={selectedDisputeId} 
          isOpen={true} 
          onClose={() => setSelectedDisputeId(null)} 
        />
      )}
    </>
  );
};
