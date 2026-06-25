import React from 'react';
import { FormSectionProps } from '@/types/form.types';

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  className = '',
}) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-5 border-b border-border pb-6 last:border-0 last:pb-0 ${className}`}>
      <div className="md:col-span-1 space-y-1 text-left">
        <h3 className="text-xs font-bold text-foreground">{title}</h3>
        {description && <p className="text-[10px] text-text-secondary leading-relaxed">{description}</p>}
      </div>
      <div className="md:col-span-2 space-y-4 bg-background border border-border/80 p-4 rounded-md">
        {children}
      </div>
    </div>
  );
};

export default FormSection;
