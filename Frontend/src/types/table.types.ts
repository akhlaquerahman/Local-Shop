import { ReactNode } from 'react';

export interface ColumnDef<T> {
  id: string;
  header: string | ReactNode;
  cell: (row: T) => ReactNode;
  sortable?: boolean;
  accessorKey?: keyof T;
}

export interface SortConfig<T> {
  key: keyof T;
  direction: 'asc' | 'desc';
}

export interface TablePaginationConfig {
  currentPage: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export interface BulkAction<T> {
  label: string;
  icon?: ReactNode;
  onClick: (selectedRows: T[]) => void;
  variant?: 'danger' | 'primary' | 'secondary';
}

export interface TableToolbarProps<T> {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  visibleColumns: Set<string>;
  onColumnToggle: (colId: string) => void;
  columns: ColumnDef<T>[];
  onExportCSV: () => void;
}
