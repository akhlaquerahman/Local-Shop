import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { api as axios } from '@/lib/axios';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  PaginationState
} from '@tanstack/react-table';
import { Search, RefreshCw, FileDown, Plus, LayoutGrid } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import DocumentInspector from '../components/DocumentInspector';

const API_BASE = '/admin/database';

export const DocumentExplorer = () => {
  const { collectionName } = useParams();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [schema, setSchema] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [globalFilter, setGlobalFilter] = useState('');
  
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 100,
  });

  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  const fetchSchema = async () => {
    try {
      const res = await axios.get(`${API_BASE}/schema/${collectionName}`);
      if (res.data.success) {
        setSchema(res.data.data);
      }
    } catch (error) {
      console.error('Failed to load schema', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/collection/${collectionName}`, {
        params: {
          page: pagination.pageIndex + 1,
          limit: pagination.pageSize,
          search: globalFilter
        }
      });
      if (res.data.success) {
        setData(res.data.data.documents);
        setTotal(res.data.data.pagination.total);
      }
    } catch (error) {
      console.error('Failed to load documents', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (collectionName) {
      fetchSchema();
      // Reset pagination when collection changes
      setPagination(prev => ({ ...prev, pageIndex: 0 }));
    }
  }, [collectionName]);

  useEffect(() => {
    if (collectionName) {
      fetchData();
    }
  }, [collectionName, pagination, globalFilter]);

  const columns = useMemo<ColumnDef<any>[]>(() => {
    if (!schema.length) return [];
    
    // Create columns dynamically, prioritizing ID and simple types
    const cols: ColumnDef<any>[] = schema
      .filter(s => ['String', 'Number', 'Date', 'Boolean', 'ObjectId'].includes(s.type))
      .slice(0, 8) // Limit to first 8 columns to avoid horizontal overflow nightmare
      .map(s => ({
        header: s.path,
        accessorKey: s.path,
        cell: info => {
          const val = info.getValue();
          if (val === null || val === undefined) return <span className="text-text-tertiary">-</span>;
          if (typeof val === 'boolean') return val ? 'True' : 'False';
          if (s.type === 'Date') return new Date(val as string).toLocaleString();
          if (typeof val === 'object') return JSON.stringify(val);
          return String(val);
        }
      }));
      
    // Ensure _id is first
    const idIndex = cols.findIndex(c => c.header === '_id');
    if (idIndex > -1) {
      const idCol = cols.splice(idIndex, 1)[0];
      cols.unshift(idCol);
    }

    return cols;
  }, [schema]);

  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(total / pagination.pageSize),
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  return (
    <div className="flex flex-col h-full bg-background relative">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 bg-surface border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 text-primary rounded-lg">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-text">{collectionName}</h1>
            <p className="text-xs text-text-secondary">{total.toLocaleString()} total documents</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-lg text-text focus:outline-none focus:border-primary transition-colors w-64"
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
            />
          </div>
          <button 
            onClick={fetchData}
            className="p-2 text-text-secondary hover:text-text hover:bg-surface-hover rounded-lg transition-colors border border-border"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-text-secondary border border-border bg-surface hover:bg-surface-hover rounded-lg transition-colors">
            <FileDown className="w-4 h-4" /> Export
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> New Document
          </button>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="flex-1 overflow-auto bg-surface m-4 rounded-xl border border-border">
        {loading && data.length === 0 ? (
          <div className="p-4 space-y-3">
            {[...Array(10)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-text-tertiary uppercase bg-surface-hover/50 border-b border-border sticky top-0 z-10">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="px-6 py-4 font-medium whitespace-nowrap">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border">
              {table.getRowModel().rows.map(row => (
                <tr 
                  key={row.id} 
                  className="hover:bg-surface-hover/40 transition-colors cursor-pointer"
                  onClick={() => setSelectedDocId(row.original._id)}
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-6 py-3 max-w-[200px] truncate text-text-secondary">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
              {data.length === 0 && !loading && (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-text-tertiary">
                    No documents found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Footer */}
      <div className="px-6 py-3 bg-surface border-t border-border flex items-center justify-between text-sm text-text-secondary">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            className="bg-background border border-border rounded px-2 py-1 focus:outline-none focus:border-primary"
            value={table.getState().pagination.pageSize}
            onChange={e => {
              table.setPageSize(Number(e.target.value));
            }}
          >
            {[100, 500, 1000].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-4">
          <span>
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 rounded border border-border disabled:opacity-50 hover:bg-surface-hover"
            >
              Previous
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 rounded border border-border disabled:opacity-50 hover:bg-surface-hover"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Slide-over Inspector */}
      {selectedDocId && (
        <DocumentInspector 
          collectionName={collectionName!} 
          docId={selectedDocId} 
          onClose={() => setSelectedDocId(null)}
          onRefresh={fetchData}
        />
      )}
    </div>
  );
};

export default DocumentExplorer;
