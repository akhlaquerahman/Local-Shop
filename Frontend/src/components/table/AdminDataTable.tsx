import React, { useState, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  flexRender,
  ColumnDef,
  PaginationState,
  SortingState,
  ExpandedState
} from '@tanstack/react-table';
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Settings2, Download, ChevronDown, ChevronRight as ChevronRightIcon } from 'lucide-react';

interface AdminDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageCount: number;
  totalRecords: number;
  isLoading?: boolean;
  onPaginationChange?: (pagination: PaginationState) => void;
  onSortingChange?: (sorting: SortingState) => void;
  onSearchChange?: (search: string) => void;
  initialState?: {
    pagination?: PaginationState;
    sorting?: SortingState;
    expanded?: ExpandedState;
  };
  getSubRows?: (originalRow: TData) => TData[] | undefined;
}

export function AdminDataTable<TData, TValue>({
  columns,
  data,
  pageCount,
  totalRecords,
  isLoading,
  onPaginationChange,
  onSortingChange,
  onSearchChange,
  initialState,
  getSubRows
}: AdminDataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>(initialState?.sorting || []);
  const [pagination, setPagination] = useState<PaginationState>(
    initialState?.pagination || { pageIndex: 0, pageSize: 10 }
  );
  const [expanded, setExpanded] = useState<ExpandedState>(initialState?.expanded || {});
  const [searchTerm, setSearchTerm] = useState('');

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearchChange?.(searchTerm);
      // Reset to page 1 on new search
      setPagination(prev => ({ ...prev, pageIndex: 0 }));
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm, onSearchChange]);

  // Sync state changes with parent
  useEffect(() => {
    onPaginationChange?.(pagination);
  }, [pagination, onPaginationChange]);

  useEffect(() => {
    onSortingChange?.(sorting);
  }, [sorting, onSortingChange]);

  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: {
      sorting,
      pagination,
      expanded
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSubRows,
    manualPagination: true,
    manualSorting: true,
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface p-4 rounded-xl border border-border">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
          <input
            type="text"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary bg-background border border-border rounded-lg transition-colors flex-1 sm:flex-none justify-center">
            <Settings2 size={16} /> Columns
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary bg-background border border-border rounded-lg transition-colors flex-1 sm:flex-none justify-center">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-text-secondary uppercase bg-background/50 border-b border-border">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 font-semibold whitespace-nowrap cursor-pointer hover:bg-background/80 transition-colors"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-2">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: ' ↑',
                          desc: ' ↓',
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="h-48 text-center text-text-secondary">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      Loading records...
                    </div>
                  </td>
                </tr>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b border-border/50 hover:bg-background/50 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="h-48 text-center text-text-secondary">
                    No results found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-background/50">
          <div className="text-sm text-text-secondary">
            Showing <span className="font-medium text-text-primary">{table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}</span> to <span className="font-medium text-text-primary">{Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, totalRecords)}</span> of <span className="font-medium text-text-primary">{totalRecords}</span> results
          </div>
          <div className="flex items-center gap-2">
            <select
              value={table.getState().pagination.pageSize}
              onChange={e => table.setPageSize(Number(e.target.value))}
              className="bg-background border border-border text-text-primary text-sm rounded-lg focus:ring-primary focus:border-primary block p-2 outline-none"
            >
              {[10, 20, 30, 40, 50].map(pageSize => (
                <option key={pageSize} value={pageSize}>
                  Show {pageSize}
                </option>
              ))}
            </select>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="p-2 border border-border rounded-lg bg-background text-text-secondary hover:text-text-primary disabled:opacity-50 transition-colors"
              >
                <ChevronsLeft size={16} />
              </button>
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="p-2 border border-border rounded-lg bg-background text-text-secondary hover:text-text-primary disabled:opacity-50 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="flex items-center gap-1 text-sm text-text-secondary px-2">
                <div>Page</div>
                <strong>
                  {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                </strong>
              </span>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="p-2 border border-border rounded-lg bg-background text-text-secondary hover:text-text-primary disabled:opacity-50 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="p-2 border border-border rounded-lg bg-background text-text-secondary hover:text-text-primary disabled:opacity-50 transition-colors"
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
