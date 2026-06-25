import React from 'react';
import { FormRowProps } from '@/types/form.types';

export const FormRow: React.FC<FormRowProps> = ({ 
  columns = 2, 
  children, 
  className = '' 
}) => {
  const colStyles = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${colStyles[columns]} gap-4 w-full ${className}`}>
      {children}
    </div>
  );
};

export default FormRow;
