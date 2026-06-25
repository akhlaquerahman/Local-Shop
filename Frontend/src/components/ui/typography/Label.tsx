import React from 'react';
import { BaseComponentProps } from '@/types/ui.types';

export const Label: React.FC<BaseComponentProps & { htmlFor?: string }> = ({ 
  children, 
  className = '', 
  id,
  htmlFor
}) => (
  <label 
    id={id} 
    htmlFor={htmlFor}
    className={`block text-[11px] font-bold text-foreground select-none uppercase tracking-wide ${className}`}
  >
    {children}
  </label>
);

export default Label;
