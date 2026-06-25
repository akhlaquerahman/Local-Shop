import React from 'react';
import { useAdminSettings } from '../services/admin.queries';
import { Button } from '@/components/ui/Button';

export const PlatformSettingsPage: React.FC = () => {
  const { data, isLoading } = useAdminSettings();

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
            Platform Settings
          </h1>
          <p className="text-sm text-text-secondary mt-1">Global marketplace configurations and policies.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white">Save Changes</Button>
      </div>

      {isLoading ? (
        <div className="text-text-secondary p-8 bg-surface border border-border rounded-xl">Loading settings...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl bg-surface border border-border space-y-4">
            <h3 className="text-lg font-bold text-text-primary border-b border-border pb-2">General Settings</h3>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-secondary">Site Name</label>
              <input type="text" className="w-full bg-background border border-border rounded-md px-3 py-2 text-text-primary" defaultValue={data?.data?.general?.siteName} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-secondary">Timezone</label>
              <input type="text" className="w-full bg-background border border-border rounded-md px-3 py-2 text-text-primary" defaultValue={data?.data?.general?.timezone} />
            </div>
          </div>

          <div className="p-6 rounded-xl bg-surface border border-border space-y-4">
            <h3 className="text-lg font-bold text-text-primary border-b border-border pb-2">Security</h3>
            <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded">
              <span className="text-sm font-semibold">Require 2FA for Admins</span>
              <span className={`px-2 py-1 text-xs font-bold rounded ${data?.data?.security?.require2FA ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                {data?.data?.security?.require2FA ? 'ON' : 'OFF'}
              </span>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-secondary">Session Timeout (minutes)</label>
              <input type="number" className="w-full bg-background border border-border rounded-md px-3 py-2 text-text-primary" defaultValue={data?.data?.security?.sessionTimeout} />
            </div>
          </div>

          <div className="p-6 rounded-xl bg-surface border border-border space-y-4 md:col-span-2">
            <h3 className="text-lg font-bold text-text-primary border-b border-border pb-2">Marketplace Rules</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded">
                <span className="text-sm font-semibold">Auto-Approve Sellers</span>
                <span className={`px-2 py-1 text-xs font-bold rounded ${data?.data?.marketplace?.autoApproveSellers ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                  {data?.data?.marketplace?.autoApproveSellers ? 'ON' : 'MANUAL'}
                </span>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-text-secondary">Global Base Commission (%)</label>
                <input type="number" className="w-full bg-background border border-border rounded-md px-3 py-2 text-text-primary" defaultValue={data?.data?.marketplace?.globalCommission} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default PlatformSettingsPage;
