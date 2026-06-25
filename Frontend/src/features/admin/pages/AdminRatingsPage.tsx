import React from 'react';
import { Star } from 'lucide-react';

export const AdminRatingsPage: React.FC = () => {
  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Ratings Analytics</h1>
          <p className="text-sm text-text-secondary">Platform-wide sentiment analysis</p>
        </div>
      </div>
      <div className="bg-surface border border-border rounded-xl p-8 text-center text-text-secondary">
        <Star size={32} className="mx-auto mb-4 opacity-50" />
        <p>Ratings charts will be rendered here.</p>
      </div>
    </div>
  );
};
export default AdminRatingsPage;
