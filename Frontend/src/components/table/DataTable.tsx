import React, { useState, useMemo } from 'react';
import { ColumnDef, SortConfig, BulkAction } from '@/types/table.types';
import TableToolbar from './TableToolbar';
import TablePagination from './TablePagination';
import BulkActionBar from './BulkActionBar';
import TableSkeleton from './TableSkeleton';
import { ArrowUpDown } from 'lucide-react';

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  searchPlaceholder?: string;
  searchKey?: keyof T;
  bulkActions?: BulkAction<T>[];
  exportFileName?: string;
  isLoading?: boolean;
  emptyState?: React.ReactNode;
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  searchPlaceholder = 'Search records...',
  searchKey,
  bulkActions = [],
  exportFileName = 'export-data',
  isLoading = false,
  emptyState,
}: DataTableProps<T>) {
  // Local States
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set(columns.map((c) => c.id)));
  const [isColumnPanelOpen, setIsColumnPanelOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 1. Column panel toggle
  const handleColumnToggle = (colId: string) => {
    const nextVisible = new Set(visibleColumns);
    if (nextVisible.has(colId)) {
      if (nextVisible.size > 1) {
        nextVisible.delete(colId);
      }
    } else {
      nextVisible.add(colId);
    }
    setVisibleColumns(nextVisible);
  };

  // 2. Search filtering
  const filteredData = useMemo(() => {
    if (!searchTerm || !searchKey) return data;
    return data.filter((item) => {
      const value = item[searchKey];
      if (value === undefined || value === null) return false;
      return String(value).toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [data, searchTerm, searchKey]);

  // 3. Sorting
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    const sorted = [...filteredData];
    sorted.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredData, sortConfig]);

  // 4. Pagination boundaries
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;

  // Row selection
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(paginatedData.map((row) => row.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id: string | number, checked: boolean) => {
    const nextSelected = new Set(selectedIds);
    if (checked) {
      nextSelected.add(id);
    } else {
      nextSelected.delete(id);
    }
    setSelectedIds(nextSelected);
  };

  const getSelectedRows = (): T[] => {
    return data.filter((row) => selectedIds.has(row.id));
  };

  const handleSort = (key: keyof T) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <div className="space-y-4">
      {/* Search and Column Settings Toolbar */}
      <TableToolbar
        data={sortedData}
        columns={columns}
        visibleColumns={visibleColumns}
        onColumnToggle={handleColumnToggle}
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setCurrentPage(1);
        }}
        searchPlaceholder={searchPlaceholder}
        searchKey={searchKey}
        isColumnPanelOpen={isColumnPanelOpen}
        onToggleColumnPanel={() => setIsColumnPanelOpen(!isColumnPanelOpen)}
        exportFileName={exportFileName}
      />

      {/* Floating bulk actions banner */}
      <BulkActionBar
        selectedCount={selectedIds.size}
        actions={bulkActions}
        selectedRows={getSelectedRows()}
        onClearSelection={() => setSelectedIds(new Set())}
      />

      {/* Table grid frame */}
      <div className="border border-border rounded-lg bg-surface/30 overflow-hidden shadow-enterprise">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface border-b border-border text-text-secondary font-semibold">
                {bulkActions.length > 0 && (
                  <th className="p-4 w-12 text-center select-none">
                    <input
                      type="checkbox"
                      checked={paginatedData.length > 0 && selectedIds.size === paginatedData.length}
                      onChange={handleSelectAll}
                      className="rounded border-border text-accent focus:ring-accent cursor-pointer"
                    />
                  </th>
                )}
                {columns
                  .filter((col) => visibleColumns.has(col.id))
                  .map((col) => (
                    <th key={col.id} className="p-4 font-semibold select-none">
                      {col.sortable && col.accessorKey ? (
                        <button
                          onClick={() => handleSort(col.accessorKey!)}
                          className="flex items-center gap-1 hover:text-text-primary transition-colors font-semibold cursor-pointer"
                        >
                          <span>{col.header}</span>
                          <ArrowUpDown size={12} />
                        </button>
                      ) : (
                        <span>{col.header}</span>
                      )}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.filter((c) => visibleColumns.has(c.id)).length + (bulkActions.length > 0 ? 1 : 0)}
                    className="p-8 text-center text-text-secondary select-none"
                  >
                    {emptyState ? emptyState : 'No matching records found'}
                  </td>
                </tr>
              ) : (
                paginatedData.map((row) => (
                  <tr key={row.id} className="bg-background hover:bg-surface/35 transition-colors">
                    {bulkActions.length > 0 && (
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(row.id)}
                          onChange={(e) => handleSelectRow(row.id, e.target.checked)}
                          className="rounded border-border text-accent focus:ring-accent cursor-pointer"
                        />
                      </td>
                    )}
                    {columns
                      .filter((col) => visibleColumns.has(col.id))
                      .map((col) => (
                        <td key={col.id} className="p-4 text-text-primary font-medium">
                          {col.cell(row)}
                        </td>
                      ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination controls */}
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
      />
    </div>
  );
}
export default DataTable;
