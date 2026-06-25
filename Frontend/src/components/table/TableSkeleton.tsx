import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export const TableSkeleton: React.FC = () => {
  return (
    <div className="border border-border rounded-lg bg-surface/30 overflow-hidden space-y-4 p-4">
      <div className="flex justify-between items-center gap-4">
        <Skeleton className="h-8 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
      <div className="space-y-2.5">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
};

export default TableSkeleton;
