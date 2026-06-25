import React from 'react';
import { Download } from 'lucide-react';
import { ColumnDef } from '@/types/table.types';

interface ExportButtonProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  visibleColumns: Set<string>;
  fileName?: string;
  className?: string;
}

export function ExportButton<T>({
  data,
  columns,
  visibleColumns,
  fileName = 'export-data',
  className = '',
}: ExportButtonProps<T>) {
  const handleExportCSV = () => {
    const activeCols = columns.filter((col) => visibleColumns.has(col.id));
    
    const headerRow = activeCols
      .map((col) => (typeof col.header === 'string' ? col.header : col.id))
      .join(',');

    const dataRows = data.map((row) =>
      activeCols
        .map((col) => {
          if (col.accessorKey) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return `"${String((row as any)[col.accessorKey] || '').replace(/"/g, '""')}"`;
          }
          return `"${String(col.id)}"`;
        })
        .join(',')
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [headerRow, ...dataRows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${fileName}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleExportCSV}
      className={`flex items-center gap-1.5 border border-border bg-background px-3 py-2 rounded-md hover:bg-surface text-xs font-semibold select-none ${className}`}
    >
      <Download size={14} />
      <span className="hidden md:inline">Export CSV</span>
    </button>
  );
}
export default ExportButton;
