import React from 'react';
import { useAdminGlobalCommission, useUpdateGlobalCommission } from '../../services/admin.queries';
import { Button } from '@/components/ui/Button';
import { Loader } from 'lucide-react';

export const GlobalRulesTab = () => {
  const { data, isLoading } = useAdminGlobalCommission();
  const updateMutation = useUpdateGlobalCommission();

  if (isLoading) return <Loader className="animate-spin text-primary" />;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-text-primary border-b border-border pb-2">Global Commission Rules</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        <div>
          <label className="text-xs font-bold text-text-secondary uppercase mb-1 block">Marketplace Commission %</label>
          <input type="number" defaultValue={data?.data?.marketplaceCommission} className="w-full bg-surface border border-border rounded-lg p-2 text-sm text-text-primary" />
        </div>
        <div>
          <label className="text-xs font-bold text-text-secondary uppercase mb-1 block">Delivery Commission %</label>
          <input type="number" defaultValue={data?.data?.deliveryCommission} className="w-full bg-surface border border-border rounded-lg p-2 text-sm text-text-primary" />
        </div>
        <div>
          <label className="text-xs font-bold text-text-secondary uppercase mb-1 block">Platform Convenience Fee (₹)</label>
          <input type="number" defaultValue={data?.data?.platformConvenienceFee} className="w-full bg-surface border border-border rounded-lg p-2 text-sm text-text-primary" />
        </div>
        <div>
          <label className="text-xs font-bold text-text-secondary uppercase mb-1 block">GST %</label>
          <input type="number" defaultValue={data?.data?.gst} className="w-full bg-surface border border-border rounded-lg p-2 text-sm text-text-primary" />
        </div>
        {/* Add more fields here */}
      </div>
      <Button className="bg-primary text-white">Save Global Rules</Button>
    </div>
  );
};
