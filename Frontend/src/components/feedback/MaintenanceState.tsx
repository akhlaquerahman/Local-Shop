import React from 'react';
import { Settings } from 'lucide-react';

export const MaintenanceState: React.FC = () => {
  return (
    <div className="p-8 text-center bg-warning/5 border border-warning/10 rounded-lg select-none flex flex-col items-center justify-center space-y-4 max-w-sm mx-auto">
      <div className="w-12 h-12 bg-warning/10 text-warning rounded-full flex items-center justify-center border border-warning/25">
        <Settings size={20} className="animate-spin-slow" />
      </div>
      <div className="space-y-1">
        <h3 className="text-xs font-bold text-text-primary">System Under Upgrades</h3>
        <p className="text-[10px] text-text-secondary leading-relaxed">
          Ledger synchronizers are executing standard security rebuilds. Access features within 15 minutes.
        </p>
      </div>
    </div>
  );
};

export default MaintenanceState;
