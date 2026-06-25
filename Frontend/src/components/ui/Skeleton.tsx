import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
}

/**
 * Loading skeleton component for visual loading states.
 */
export const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'rect' }) => {
  const baseStyles = 'animate-pulse bg-border/70';
  
  const styles = {
    text: 'h-3 w-3/4 rounded',
    rect: 'h-20 w-full rounded-md',
    circle: 'h-10 w-10 rounded-full',
  };

  return (
    <div 
      className={`${baseStyles} ${styles[variant]} ${className}`} 
    />
  );
};

export default Skeleton;
