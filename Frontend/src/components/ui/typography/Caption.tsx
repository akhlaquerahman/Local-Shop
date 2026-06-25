import React from 'react';
import { BaseComponentProps } from '@/types/ui.types';

export const Caption: React.FC<BaseComponentProps> = ({ children, className = '', id }) => (
  <span id={id} className={`text-[10px] text-text-secondary leading-normal ${className}`}>
    {children}
  </span>
);

export default Caption;
