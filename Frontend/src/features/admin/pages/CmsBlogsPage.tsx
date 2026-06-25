import React from 'react';
import { BookOpen } from 'lucide-react';

export const CmsBlogsPage: React.FC = () => {
  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Blog Editor</h1>
          <p className="text-sm text-text-secondary">Manage SEO content and marketplace articles</p>
        </div>
      </div>
      <div className="bg-surface border border-border rounded-xl p-8 text-center text-text-secondary">
        <BookOpen size={32} className="mx-auto mb-4 opacity-50" />
        <p>Blog post manager goes here.</p>
      </div>
    </div>
  );
};
export default CmsBlogsPage;
