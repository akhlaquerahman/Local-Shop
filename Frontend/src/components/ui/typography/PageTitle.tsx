import React from 'react';
import { BaseComponentProps } from '@/types/ui.types';

export const PageTitle: React.FC<BaseComponentProps> = ({ children, className = '', id }) => (
  <h1 id={id} className={`text-xl md:text-2xl font-extrabold tracking-tight text-foreground ${className}`}>
    {children}
  </h1>
);

export default PageTitle;
