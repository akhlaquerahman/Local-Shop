import React from 'react';
import { BaseComponentProps } from '@/types/ui.types';

/**
 * 1. StatsGrid
 * 1 col mobile, 2 cols tablet, 4 cols desktop.
 */
export const StatsGrid: React.FC<BaseComponentProps> = ({ children, className = '' }) => (
  <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full ${className}`}>
    {children}
  </div>
);

/**
 * 2. CardGrid
 * 1 col mobile, 2 cols tablet, 3 cols desktop.
 */
export const CardGrid: React.FC<BaseComponentProps> = ({ children, className = '' }) => (
  <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full ${className}`}>
    {children}
  </div>
);

/**
 * 3. FormGrid
 * Standard fields row alignments.
 */
export const FormGrid: React.FC<BaseComponentProps & { cols?: 1 | 2 | 3 | 4 }> = ({ 
  children, 
  className = '', 
  cols = 2 
}) => {
  const colStyles = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${colStyles[cols]} gap-4 w-full ${className}`}>
      {children}
    </div>
  );
};

/**
 * 4. AnalyticsGrid
 * 1 col mobile, 3-column distribution on large screens (e.g. 2/3 main, 1/3 sidebar).
 */
export const AnalyticsGrid: React.FC<BaseComponentProps> = ({ children, className = '' }) => (
  <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 w-full ${className}`}>
    {children}
  </div>
);
