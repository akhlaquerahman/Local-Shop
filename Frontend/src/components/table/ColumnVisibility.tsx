import { SlidersHorizontal } from 'lucide-react';
import { ColumnDef } from '@/types/table.types';

interface ColumnVisibilityProps<T> {
  columns: ColumnDef<T>[];
  visibleColumns: Set<string>;
  onColumnToggle: (colId: string) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export function ColumnVisibility<T>({
  columns,
  visibleColumns,
  onColumnToggle,
  isOpen,
  onToggleOpen,
}: ColumnVisibilityProps<T>) {
  return (
    <div className="relative">
      <button
        onClick={onToggleOpen}
        className="flex items-center gap-1.5 border border-border bg-background px-3 py-2 rounded-md hover:bg-surface text-xs font-semibold select-none"
      >
        <SlidersHorizontal size={14} />
        <span className="hidden md:inline">Columns</span>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-md shadow-enterprise-lg p-2 z-20 text-left">
          <div className="text-[10px] text-text-secondary border-b border-border pb-1 mb-1 font-bold select-none">
            Toggle Columns
          </div>
          <div className="space-y-1">
            {columns.map((col) => (
              <label key={col.id} className="flex items-center gap-2 text-xs p-1 hover:bg-border/20 rounded cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={visibleColumns.has(col.id)}
                  onChange={() => onColumnToggle(col.id)}
                  className="rounded border-border text-accent focus:ring-accent"
                />
                <span>{typeof col.header === 'string' ? col.header : col.id}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
export default ColumnVisibility;
