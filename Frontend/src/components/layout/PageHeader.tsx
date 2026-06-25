import React from 'react';
import { PageTitle } from '@/components/ui/typography/PageTitle';
import { Caption } from '@/components/ui/typography/Caption';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, actions }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4 w-full text-left">
    <div className="space-y-1 min-w-0">
      <Breadcrumbs />
      <PageTitle>{title}</PageTitle>
      {description && <Caption className="block">{description}</Caption>}
    </div>
    {actions && (
      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap flex-shrink-0 self-start sm:self-auto pt-1 sm:pt-0">
        {actions}
      </div>
    )}
  </div>
);

export default PageHeader;
