import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ErrorStateProps {
  title?: string;
  description?: string;
  errorMessage?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Data loading failed',
  description = 'An error occurred while communicating with the service nodes.',
  errorMessage,
  onRetry,
  className = '',
}) => {
  return (
    <div className={`p-8 border border-danger/20 rounded-lg text-center bg-danger/5 select-none flex flex-col items-center justify-center space-y-4 max-w-md mx-auto ${className}`}>
      <div className="w-12 h-12 bg-danger/10 text-danger rounded-full flex items-center justify-center border border-danger/20">
        <AlertCircle size={20} />
      </div>
      
      <div className="space-y-1">
        <h3 className="text-xs font-bold text-text-primary">{title}</h3>
        <p className="text-[10px] text-text-secondary leading-relaxed">{description}</p>
        
        {errorMessage && (
          <pre className="text-[9px] font-mono bg-background border border-border p-2 rounded text-text-secondary overflow-x-auto text-left max-w-xs mt-2">
            {errorMessage}
          </pre>
        )}
      </div>

      {onRetry && (
        <Button 
          onClick={onRetry} 
          variant="outline" 
          size="sm"
          icon={<RefreshCw size={10} />}
          className="border-danger/30 text-danger hover:bg-danger/5"
        >
          Retry Connection
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
