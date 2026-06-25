import React from 'react';
import { Package, ScanBarcode } from 'lucide-react';

export const PickupQueuePage: React.FC = () => {
  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto pb-20">
      <div>
        <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Pickup Queue</h1>
        <p className="text-sm text-text-secondary">Scan and confirm packages at the store</p>
      </div>

      <div className="bg-surface border border-border rounded-xl p-8 text-center space-y-3">
        <div className="w-16 h-16 bg-background border border-dashed border-border rounded-full flex items-center justify-center mx-auto mb-4 text-text-secondary/50">
          <ScanBarcode size={24} />
        </div>
        <h3 className="font-bold text-text-primary">No active pickups</h3>
        <p className="text-sm text-text-secondary max-w-sm mx-auto">
          Arrive at the store and use this screen to verify the order ID against the package label.
        </p>
      </div>
    </div>
  );
};
export default PickupQueuePage;
