import React from 'react';
import { Search, Filter, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterField {
  id: string;
  label: string;
  type: 'select' | 'date' | 'text';
  options?: FilterOption[];
}

interface FilterToolbarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  filters?: FilterField[];
  activeFilters?: Record<string, string>;
  onFilterChange?: (id: string, val: string) => void;
  onResetFilters?: () => void;
  actions?: React.ReactNode;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  searchQuery,
  onSearchChange,
  filters = [],
  activeFilters = {},
  onFilterChange,
  onResetFilters,
  actions
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 mb-2">
      <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto hide-scrollbar">
        {/* Search */}
        <div className="relative min-w-[200px] flex-shrink-0">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder="Search records..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-brand-primary/50 transition-colors"
          />
        </div>

        {/* Dynamic Filters */}
        {filters.map((filter) => (
          <div key={filter.id} className="min-w-[150px] flex-shrink-0">
            {filter.type === 'select' && filter.options ? (
              <select
                value={activeFilters[filter.id] || ''}
                onChange={(e) => onFilterChange?.(filter.id, e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-brand-primary/50 appearance-none"
              >
                <option value="">{filter.label}</option>
                {filter.options.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : filter.type === 'date' ? (
              <input
                type="date"
                value={activeFilters[filter.id] || ''}
                onChange={(e) => onFilterChange?.(filter.id, e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-brand-primary/50"
              />
            ) : null}
          </div>
        ))}

        {/* Reset Filters */}
        {(Object.keys(activeFilters).some(k => activeFilters[k] !== '') || searchQuery) && (
          <button
            onClick={() => {
              onSearchChange('');
              onResetFilters?.();
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg transition-colors flex-shrink-0"
            title="Reset Filters"
          >
            <RefreshCcw size={14} />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
        {actions}
      </div>
    </div>
  );
};
