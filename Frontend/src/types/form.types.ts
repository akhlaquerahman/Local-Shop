import { ReactNode } from 'react';

export interface FormPageProps {
  title: string;
  description?: string;
  onSubmit: (data: any) => void;
  children: ReactNode;
  actions?: ReactNode;
}

export interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export interface FormRowProps {
  columns?: 1 | 2 | 3 | 4;
  children: ReactNode;
  className?: string;
}

export interface FormActionsProps {
  onCancel?: () => void;
  cancelLabel?: string;
  submitLabel?: string;
  isSubmitting?: boolean;
  className?: string;
}
