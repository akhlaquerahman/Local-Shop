import React from 'react';
import { BaseComponentProps } from '@/types/ui.types';

export const PageContainer: React.FC<BaseComponentProps> = ({ children, className = '' }) => (
  <div className={`max-w-7xl mx-auto w-full px-4 md:px-6 py-5 pb-16 md:pb-6 space-y-6 ${className}`}>
    {children}
  </div>
);

export default PageContainer;
