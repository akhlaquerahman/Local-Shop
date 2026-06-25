import React from 'react';
import { CardVariant, BaseComponentProps } from '@/types/ui.types';

interface BaseCardProps extends BaseComponentProps {
  variant?: CardVariant;
  onClick?: () => void;
}

export const BaseCard: React.FC<BaseCardProps> = ({ 
  variant = 'default', 
  className = '', 
  children,
  onClick,
  id
}) => {
  const styles = {
    default: 'bg-surface border border-border shadow-enterprise',
    outlined: 'bg-background border border-border',
    elevated: 'bg-background border border-border/70 shadow-enterprise-md hover:shadow-enterprise-lg',
  };

  return (
    <div 
      id={id}
      onClick={onClick}
      className={`rounded-lg p-5 transition-all duration-200 ${styles[variant]} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

export default BaseCard;
