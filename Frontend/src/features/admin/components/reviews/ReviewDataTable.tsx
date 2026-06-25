import React, { useState } from 'react';
import { useAdminReviewsList } from '../../services/admin.queries';
import { AdminDataTable } from '@/components/table/AdminDataTable';
import { Button } from '@/components/ui/Button';
import { ReviewDetailsDrawer } from './ReviewDetailsDrawer';
import { PaginationState, SortingState } from '@tanstack/react-table';

export const ReviewDataTable = ({ activeTab, filters }: { activeTab: string, filters: any }) => {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);

  const queryParams: any = {
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    ...filters
  };

  if (activeTab === 'PRODUCT') queryParams.targetType = 'PRODUCT';
  if (activeTab === 'SHOP') queryParams.targetType = 'SHOP';
  if (activeTab === 'SELLER') queryParams.targetType = 'SELLER';
  if (activeTab === 'DELIVERY') queryParams.targetType = 'DELIVERY';
  if (activeTab === 'FLAGGED') queryParams.status = 'REPORTED';
  if (activeTab === 'HIDDEN') queryParams.status = 'HIDDEN';
  if (activeTab === 'PENDING') queryParams.status = 'PENDING';

  const { data, isLoading } = useAdminReviewsList(queryParams);

  const columns = [
    {
      header: 'Review ID',
      accessorKey: '_id',
      cell: (info: any) => <span className="font-mono text-xs">{info.getValue()?.slice(0, 8)}...</span>
    },
    {
      header: 'Type',
      accessorKey: 'reviewType',
      cell: (info: any) => (
        <span className="px-2 py-1 text-[10px] font-bold uppercase rounded-md bg-primary/10 text-primary">
          {info.getValue() || info.row.original.targetType || 'N/A'}
        </span>
      )
    },
    {
      header: 'Customer',
      accessorKey: 'customerName',
      cell: (info: any) => {
        const val = info.getValue() || info.row.original.customer?.name;
        const email = info.row.original.customer?.email;
        return val ? (
          <div>
            <span className="text-sm font-medium text-text-primary block">{val}</span>
            {email && <span className="text-[10px] text-text-secondary">{email}</span>}
          </div>
        ) : <span className="text-sm text-text-secondary">Unknown</span>;
      }
    },
    {
      header: 'Rating',
      accessorKey: 'rating',
      cell: (info: any) => {
        const rating = info.getValue();
        return <span className="text-warning font-bold">{rating}★</span>;
      }
    },
    {
      header: 'Review',
      accessorKey: 'comment',
      cell: (info: any) => {
        const text = info.getValue() || info.row.original.reviewText || info.row.original.title || '';
        return <span className="text-sm text-text-primary truncate max-w-[250px] inline-block font-medium">{text}</span>;
      }
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (info: any) => {
        const val = info.getValue()?.toUpperCase();
        const colors: any = {
          ACTIVE: 'bg-success/10 text-success',
          APPROVED: 'bg-success/10 text-success',
          HIDDEN: 'bg-text-secondary/20 text-text-secondary',
          REPORTED: 'bg-danger/10 text-danger',
          DELETED: 'bg-danger/20 text-danger',
          PENDING: 'bg-warning/10 text-warning'
        };
        return <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full ${colors[val] || 'bg-surface text-text-secondary'}`}>{val}</span>;
      }
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: (info: any) => (
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => setSelectedReviewId(info.row.original._id)}
          className="h-8 text-xs px-3 py-1 bg-surface border-border hover:bg-accent/10 hover:text-accent hover:border-accent/30 transition-colors"
        >
          View Details
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
      {selectedReviewId && (
        <ReviewDetailsDrawer 
          reviewId={selectedReviewId} 
          isOpen={true} 
          onClose={() => setSelectedReviewId(null)} 
        />
      )}
    </>
  );
};
