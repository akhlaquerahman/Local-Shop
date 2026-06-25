import React from 'react';
import { BaseComponentProps } from '@/types/ui.types';

interface MobileActionBarProps extends BaseComponentProps {
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
}

export const MobileActionBar: React.FC<MobileActionBarProps> = ({
  primaryAction,
  secondaryAction,
  className = '',
}) => {
  return (
    <div className={`md:hidden fixed bottom-16 left-0 right-0 bg-surface/95 border-t border-border backdrop-blur p-4 flex gap-3 z-30 select-none shadow-enterprise-md ${className}`}>
      {secondaryAction && <div className="flex-1">{secondaryAction}</div>}
      {primaryAction && <div className="flex-1">{primaryAction}</div>}
    </div>
  );
};

export default MobileActionBar;
