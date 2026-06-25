import React from 'react';
import { HelpCircle } from 'lucide-react';

export const CmsFaqPage: React.FC = () => {
  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">FAQ Setup</h1>
          <p className="text-sm text-text-secondary">Customer and Seller help center articles</p>
        </div>
      </div>
      <div className="bg-surface border border-border rounded-xl p-8 text-center text-text-secondary">
        <HelpCircle size={32} className="mx-auto mb-4 opacity-50" />
        <p>FAQ categories and Q&A manager goes here.</p>
      </div>
    </div>
  );
};
export default CmsFaqPage;
