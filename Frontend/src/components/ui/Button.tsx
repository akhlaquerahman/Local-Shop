import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

/**
 * Standard enterprise UI-kit button with variants and loading spinners.
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyle = 
    'inline-flex items-center justify-center font-semibold rounded-md transition-all outline-none border focus:ring-1 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed select-none';
  
  const variants = {
    primary: 'bg-primary border-primary text-primary-foreground hover:bg-primary/95',
    secondary: 'bg-secondary border-border text-secondary-foreground hover:bg-border/30',
    outline: 'bg-transparent border-border text-foreground hover:bg-surface',
    ghost: 'bg-transparent border-transparent text-text-secondary hover:bg-surface hover:text-foreground',
    danger: 'bg-danger border-danger text-white hover:bg-danger/90 focus:ring-danger',
  };

  const sizes = {
    sm: 'px-2.5 py-1.5 text-[10px] gap-1.5',
    md: 'px-4 py-2 text-xs gap-2',
    lg: 'px-6 py-2.5 text-sm gap-2.5',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading && <Loader2 size={12} className="animate-spin text-current" />}
      {!isLoading && icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
