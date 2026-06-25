import React from 'react';
import { WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const OfflineState: React.FC = () => {
  return (
    <div className="p-8 text-center bg-surface border border-border rounded-lg select-none flex flex-col items-center justify-center space-y-4 max-w-sm mx-auto">
      <div className="w-12 h-12 bg-border flex items-center justify-center rounded-full text-text-secondary">
        <WifiOff size={20} />
      </div>
      <div className="space-y-1">
        <h3 className="text-xs font-bold text-text-primary">Connection Offline</h3>
        <p className="text-[10px] text-text-secondary leading-relaxed">
          Your browser link is disconnected from host nodes. Verify local routing signals.
        </p>
      </div>
      <Button onClick={() => window.location.reload()} variant="outline" size="sm" className="w-full">
        Check Connection Status
      </Button>
    </div>
  );
};

export default OfflineState;
