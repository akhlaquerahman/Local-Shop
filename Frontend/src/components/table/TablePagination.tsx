import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-text-secondary pt-2">
      <div className="flex items-center gap-2 select-none">
        <span>Show</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="border border-border bg-background px-2 py-1 rounded outline-none font-semibold text-text-primary cursor-pointer"
        >
          {[5, 10, 20, 50].map((size) => (
            <option key={size} value={size}>
              {size} records
            </option>
          ))}
        </select>
        <span>per page</span>
      </div>

      <div className="flex items-center gap-4 self-end sm:self-auto select-none">
        <span>
          Page <strong className="text-text-primary">{currentPage}</strong> of{' '}
          <strong className="text-text-primary">{totalPages}</strong>
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-2 border border-border bg-background hover:bg-surface rounded-md disabled:opacity-50 transition-colors cursor-pointer"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="p-2 border border-border bg-background hover:bg-surface rounded-md disabled:opacity-50 transition-colors cursor-pointer"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
export default TablePagination;
