import React from 'react';
import { BaseComponentProps } from '@/types/ui.types';

export const BodyText: React.FC<BaseComponentProps> = ({ children, className = '', id }) => (
  <p id={id} className={`text-xs text-text-primary leading-relaxed ${className}`}>
    {children}
  </p>
);

export default BodyText;
