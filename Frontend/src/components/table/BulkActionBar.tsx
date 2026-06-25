import React from 'react';
import { BulkAction } from '@/types/table.types';

interface BulkActionBarProps<T> {
  selectedCount: number;
  actions: BulkAction<T>[];
  selectedRows: T[];
  onClearSelection: () => void;
}

export function BulkActionBar<T>({
  selectedCount,
  actions,
  selectedRows,
  onClearSelection,
}: BulkActionBarProps<T>) {
  if (selectedCount === 0 || actions.length === 0) return null;

  return (
    <div className="flex items-center justify-between bg-accent/5 border border-accent/20 px-4 py-3 rounded-lg animate-in fade-in duration-150 text-xs">
      <span className="font-semibold text-accent select-none">
        {selectedCount} row(s) selected
      </span>
      <div className="flex items-center gap-2">
        {actions.map((action, i) => (
          <button
            key={i}
            onClick={() => {
              action.onClick(selectedRows);
              onClearSelection();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all border cursor-pointer select-none ${
              action.variant === 'danger'
                ? 'bg-danger text-white border-danger hover:bg-danger/90'
                : 'bg-background border-border text-text-primary hover:bg-surface'
            }`}
          >
            {action.icon && <span className="flex-shrink-0">{action.icon}</span>}
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
export default BulkActionBar;
