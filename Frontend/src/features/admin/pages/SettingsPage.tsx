import React from 'react';
import { Sliders } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Platform Configuration</h1>
          <p className="text-sm text-text-secondary">Global feature toggles and app settings</p>
        </div>
      </div>
      <div className="bg-surface border border-border rounded-xl p-8 text-center text-text-secondary">
        <Sliders size={32} className="mx-auto mb-4 opacity-50" />
        <p>Platform settings panel goes here.</p>
      </div>
    </div>
  );
};
export default SettingsPage;
