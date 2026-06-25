import React from 'react';
import { ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';

export const AccessDenied: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="p-8 text-center bg-danger/5 border border-danger/10 rounded-lg select-none flex flex-col items-center justify-center space-y-4 max-w-sm mx-auto">
      <div className="w-12 h-12 bg-danger/10 text-danger rounded-full flex items-center justify-center border border-danger/25">
        <ShieldX size={20} />
      </div>
      <div className="space-y-1">
        <h3 className="text-xs font-bold text-text-primary">Access Denied</h3>
        <p className="text-[10px] text-text-secondary leading-relaxed">
          Your current profile coordinates do not possess permissions to edit or read this administrative module.
        </p>
      </div>
      <Button 
        onClick={() => navigate(-1)} 
        variant="outline" 
        size="sm" 
        className="w-full border-danger/20 text-danger hover:bg-danger/10"
      >
        Return
      </Button>
    </div>
  );
};

export default AccessDenied;
