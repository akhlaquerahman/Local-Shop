import React from 'react';
import { Search, Filter } from 'lucide-react';

interface SearchFilterProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * 1. SearchFilter
 */
export const SearchFilter: React.FC<SearchFilterProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
}) => {
  return (
    <div className={`relative flex-1 max-w-sm text-left ${className}`}>
      <Search className="absolute left-3 top-2.5 text-text-secondary" size={16} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-9 pr-4 py-2 border border-border bg-background rounded-md text-xs focus:ring-1 focus:ring-accent focus:border-accent outline-none font-medium"
      />
    </div>
  );
};

interface SelectFilterProps {
  value: string | number;
  onChange: (value: string) => void;
  options: { label: string; value: string | number }[];
  label?: string;
  className?: string;
}

/**
 * 2. SelectFilter
 */
export const SelectFilter: React.FC<SelectFilterProps> = ({
  value,
  onChange,
  options,
  label,
  className = '',
}) => {
  return (
    <div className={`flex flex-col text-left space-y-1 ${className}`}>
      {label && <span className="text-[10px] uppercase font-bold text-text-secondary">{label}</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-border bg-background px-3 py-2 rounded-md text-xs outline-none font-semibold text-text-primary cursor-pointer"
      >
        <option value="">All</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

interface StatusFilterProps {
  value: string;
  onChange: (value: string) => void;
  statuses: string[];
  className?: string;
}

/**
 * 3. StatusFilter
 * Horizontal list of pill filters.
 */
export const StatusFilter: React.FC<StatusFilterProps> = ({
  value,
  onChange,
  statuses,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-1.5 overflow-x-auto text-left py-1 scrollbar-none ${className}`}>
      <button
        onClick={() => onChange('all')}
        className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase transition-all select-none cursor-pointer
          ${value === 'all' || !value
            ? 'bg-primary border-primary text-primary-foreground' 
            : 'bg-surface border-border hover:bg-border/30 text-text-secondary hover:text-foreground'
          }`}
      >
        All Statuses
      </button>
      
      {statuses.map((status) => (
        <button
          key={status}
          onClick={() => onChange(status)}
          className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase transition-all select-none cursor-pointer whitespace-nowrap
            ${value === status 
              ? 'bg-primary border-primary text-primary-foreground' 
              : 'bg-surface border-border hover:bg-border/30 text-text-secondary hover:text-foreground'
            }`}
        >
          {status.replace(/_/g, ' ')}
        </button>
      ))}
    </div>
  );
};
