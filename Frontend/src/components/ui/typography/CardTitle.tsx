import React from 'react';
import { BaseComponentProps } from '@/types/ui.types';

export const CardTitle: React.FC<BaseComponentProps> = ({ children, className = '', id }) => (
  <h3 id={id} className={`text-xs md:text-sm font-bold tracking-tight text-foreground ${className}`}>
    {children}
  </h3>
);

export default CardTitle;
