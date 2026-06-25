import React from 'react';
import { Activity } from 'lucide-react';

export const HealthStatusPage: React.FC = () => {
  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Infrastructure Health</h1>
          <p className="text-sm text-text-secondary">Uptime and latency metrics for DB, Cache, and APIs</p>
        </div>
      </div>
      <div className="bg-surface border border-border rounded-xl p-8 text-center text-text-secondary">
        <Activity size={32} className="mx-auto mb-4 opacity-50" />
        <p>System metrics dashboard goes here.</p>
      </div>
    </div>
  );
};
export default HealthStatusPage;
