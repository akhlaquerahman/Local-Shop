import React from 'react';
import { ColumnDef } from '@/types/table.types';
import { SearchFilter } from './TableFilters';
import ColumnVisibility from './ColumnVisibility';
import ExportButton from './ExportButton';

interface TableToolbarProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  visibleColumns: Set<string>;
  onColumnToggle: (colId: string) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  searchKey?: keyof T;
  isColumnPanelOpen: boolean;
  onToggleColumnPanel: () => void;
  exportFileName?: string;
}

export function TableToolbar<T>({
  data,
  columns,
  visibleColumns,
  onColumnToggle,
  searchTerm,
  onSearchChange,
  searchPlaceholder = 'Search...',
  searchKey,
  isColumnPanelOpen,
  onToggleColumnPanel,
  exportFileName = 'export-data',
}: TableToolbarProps<T>) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface p-4 border border-border rounded-lg">
      {/* Search Input */}
      <SearchFilter
        value={searchTerm}
        onChange={onSearchChange}
        placeholder={searchPlaceholder}
        className={!searchKey ? 'opacity-50 pointer-events-none' : ''}
      />

      {/* Action triggers */}
      <div className="flex items-center gap-2 self-end sm:self-auto">
        <ColumnVisibility
          columns={columns}
          visibleColumns={visibleColumns}
          onColumnToggle={onColumnToggle}
          isOpen={isColumnPanelOpen}
          onToggleOpen={onToggleColumnPanel}
        />
        
        <ExportButton
          data={data}
          columns={columns}
          visibleColumns={visibleColumns}
          fileName={exportFileName}
        />
      </div>
    </div>
  );
}
export default TableToolbar;
