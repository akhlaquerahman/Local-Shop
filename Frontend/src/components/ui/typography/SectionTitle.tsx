import React from 'react';
import { BaseComponentProps } from '@/types/ui.types';

export const SectionTitle: React.FC<BaseComponentProps> = ({ children, className = '', id }) => (
  <h2 id={id} className={`text-base md:text-lg font-bold tracking-tight text-foreground ${className}`}>
    {children}
  </h2>
);

export default SectionTitle;
