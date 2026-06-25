import React from 'react';
import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';

export const NotFoundState: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="p-8 text-center select-none flex flex-col items-center justify-center space-y-4 max-w-sm mx-auto">
      <div className="w-12 h-12 bg-surface border border-border rounded-full flex items-center justify-center text-text-secondary">
        <FileQuestion size={20} />
      </div>
      <div className="space-y-1">
        <h3 className="text-xs font-bold text-text-primary">Page Not Found</h3>
        <p className="text-[10px] text-text-secondary leading-relaxed">
          The requested page path does not exist on the platform register. Check the address bar for typos.
        </p>
      </div>
      <Button onClick={() => navigate(-1)} variant="outline" size="sm" className="w-full">
        Go Back
      </Button>
    </div>
  );
};

export default NotFoundState;
