import React from 'react';
import { FormPageProps } from '@/types/form.types';

export const FormPage: React.FC<FormPageProps> = ({
  title,
  description,
  onSubmit,
  children,
  actions,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-3xl w-full text-left bg-surface border border-border p-6 rounded-lg shadow-enterprise">
      <div className="border-b border-border pb-3">
        <h2 className="text-sm font-bold text-foreground">{title}</h2>
        {description && <p className="text-[10px] text-text-secondary mt-0.5">{description}</p>}
      </div>
      <div className="space-y-5">{children}</div>
      {actions && <div className="border-t border-border pt-4 flex justify-end">{actions}</div>}
    </form>
  );
};

export default FormPage;
