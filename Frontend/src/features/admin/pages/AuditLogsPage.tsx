import React from 'react';
import { History } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Security Audit Trail</h1>
          <p className="text-sm text-text-secondary">Chronological history of all admin actions</p>
        </div>
      </div>
      <div className="bg-surface border border-border rounded-xl p-8 text-center text-text-secondary">
        <History size={32} className="mx-auto mb-4 opacity-50" />
        <p>Audit logs viewer goes here.</p>
      </div>
    </div>
  );
};
export default AuditLogsPage;
