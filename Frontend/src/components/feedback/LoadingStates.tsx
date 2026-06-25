import React from 'react';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';

/**
 * 1. LoadingScreen
 * Full-viewport absolute spinner.
 */
export const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center flex-col space-y-3 select-none">
      <Loader2 size={32} className="animate-spin text-accent" />
      <span className="text-xs font-bold text-text-primary tracking-wide">Syncing localshop nodes...</span>
    </div>
  );
};

/**
 * 2. LoadingCard
 * Grid skeleton placeholders card.
 */
export const LoadingCard: React.FC = () => {
  return (
    <div className="border border-border rounded-lg bg-surface/30 p-5 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" variant="circle" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-3 w-1/3" variant="text" />
          <Skeleton className="h-2.5 w-1/4" variant="text" />
        </div>
      </div>
      <Skeleton className="h-12 w-full" variant="rect" />
    </div>
  );
};

/**
 * 3. LoadingTable
 * Row skeletons placeholders grid.
 */
export const LoadingTable: React.FC = () => {
  return (
    <div className="border border-border rounded-lg bg-surface/30 p-4 space-y-3.5">
      <Skeleton className="h-8 w-full" variant="rect" />
      <div className="space-y-2">
        <Skeleton className="h-7 w-full" variant="rect" />
        <Skeleton className="h-7 w-full" variant="rect" />
        <Skeleton className="h-7 w-full" variant="rect" />
      </div>
    </div>
  );
};
