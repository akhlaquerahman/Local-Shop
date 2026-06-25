import React from 'react';
import { SectionTitle } from '@/components/ui/typography/SectionTitle';
import { Caption } from '@/components/ui/typography/Caption';

interface ContentSectionProps {
  title?: string;
  subtitle?: string;
  actionArea?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const ContentSection: React.FC<ContentSectionProps> = ({
  title,
  subtitle,
  actionArea,
  children,
  className = '',
}) => (
  <div className={`space-y-3 text-left ${className}`}>
    {(title || subtitle || actionArea) && (
      <div className="flex items-center justify-between border-b border-border/50 pb-2">
        <div className="space-y-0.5 min-w-0">
          {title && <SectionTitle>{title}</SectionTitle>}
          {subtitle && <Caption className="block">{subtitle}</Caption>}
        </div>
        {actionArea && <div className="flex-shrink-0 ml-4">{actionArea}</div>}
      </div>
    )}
    <div className="w-full">{children}</div>
  </div>
);

export default ContentSection;
