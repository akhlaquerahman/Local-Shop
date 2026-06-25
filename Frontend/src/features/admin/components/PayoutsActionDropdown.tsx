import React, { useState } from 'react';
import { MoreHorizontal, Eye, Ban, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props {
  account: any;
  onViewDetails: () => void;
}

export const PayoutsActionDropdown: React.FC<Props> = ({ account, onViewDetails }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 text-text-secondary hover:text-text-primary hover:bg-surface/50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MoreHorizontal size={16} />
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-border shadow-xl rounded-xl z-50 py-1 overflow-hidden">
            <button 
              className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-surface/50 flex items-center gap-2"
              onClick={() => {
                setIsOpen(false);
                onViewDetails();
              }}
            >
              <Eye size={14} /> View Details
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-surface/50 flex items-center gap-2">
              <CheckCircle size={14} className="text-success" /> Approve Payout
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-surface/50 flex items-center gap-2">
              <Clock size={14} className="text-warning" /> Hold Payout
            </button>
            
            <div className="h-px bg-border my-1" />
            
            <button className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-danger/10 flex items-center gap-2 font-medium">
              <Ban size={14} /> Suspend Account
            </button>
          </div>
        </>
      )}
    </div>
  );
};
