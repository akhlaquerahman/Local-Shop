import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { RefreshCw, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNotificationStore } from '@/store/notificationStore';

export const ReturnsDashboardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToast } = useNotificationStore();
  const [activeTab, setActiveTab] = useState('ALL');

  const { data: returns = [], isLoading } = useQuery({
    queryKey: ['admin-returns'],
    queryFn: () => api.get('/v1/admin/returns').then(res => res.data.data),
  });

  const overrideApprove = useMutation({
    mutationFn: (id: string) => api.put(`/v1/admin/returns/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-returns'] });
      addToast({ title: 'Approved', message: 'Admin override applied', type: 'success' });
    }
  });

  const overrideReject = useMutation({
    mutationFn: ({ id, reason }: { id: string, reason: string }) => api.put(`/v1/admin/returns/${id}/reject`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-returns'] });
      addToast({ title: 'Rejected', message: 'Admin override applied', type: 'success' });
    }
  });

  const processRefund = useMutation({
    mutationFn: (id: string) => api.put(`/v1/admin/returns/${id}/refund`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-returns'] });
      addToast({ title: 'Refund Completed', message: 'Funds added to user wallet/account', type: 'success' });
    }
  });

  const assignRider = useMutation({
    mutationFn: ({ id, riderId }: { id: string, riderId: string }) => api.put(`/v1/admin/returns/${id}/assign-rider`, { riderId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-returns'] });
      addToast({ title: 'Rider Assigned', message: 'Pickup task created', type: 'success' });
    }
  });

  const closeCase = useMutation({
    mutationFn: (id: string) => api.put(`/v1/admin/returns/${id}/close`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-returns'] });
      addToast({ title: 'Case Closed', message: 'Return case closed successfully', type: 'info' });
    }
  });

  const filteredReturns = returns.filter((r: any) => activeTab === 'ALL' || r.status === activeTab);

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-text-primary">Returns & Refunds Hub</h1>
          <p className="text-sm text-text-secondary mt-1">Supervise enterprise return workflows, disputes, and manual refunds.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface p-5 rounded-xl border border-border">
          <p className="text-sm font-bold text-text-secondary uppercase">Total Requests</p>
          <p className="text-2xl font-black text-text-primary mt-1">{returns.length}</p>
        </div>
        <div className="bg-surface p-5 rounded-xl border border-border">
          <p className="text-sm font-bold text-text-secondary uppercase">Pending Review</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{returns.filter((r: any) => r.status === 'REQUESTED').length}</p>
        </div>
        <div className="bg-surface p-5 rounded-xl border border-border">
          <p className="text-sm font-bold text-text-secondary uppercase">Refunds Pending</p>
          <p className="text-2xl font-black text-purple-600 mt-1">{returns.filter((r: any) => r.status === 'REFUND_INITIATED' || (r.status === 'ITEM_RECEIVED' && r.requestType === 'RETURN')).length}</p>
        </div>
        <div className="bg-surface p-5 rounded-xl border border-border">
          <p className="text-sm font-bold text-text-secondary uppercase">Closed</p>
          <p className="text-2xl font-black text-green-600 mt-1">{returns.filter((r: any) => r.status === 'CLOSED').length}</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto border-b border-border pb-1 scrollbar-none">
        {['ALL', 'REQUESTED', 'APPROVED', 'REJECTED', 'ITEM_RECEIVED', 'REFUND_COMPLETED', 'CLOSED'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-bold rounded-lg transition-all ${
              activeTab === tab ? 'bg-accent text-white' : 'bg-surface border border-border text-text-secondary hover:bg-background'
            }`}
          >
            {tab.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredReturns.map((req: any) => (
          <div key={req._id} className="bg-surface border border-border rounded-xl p-5">
            <div className="flex justify-between items-start border-b border-border pb-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${req.requestType === 'REPLACEMENT' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {req.requestType}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-background border border-border font-bold uppercase text-text-secondary">
                    {req.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <h3 className="font-bold text-text-primary text-lg">Order #{req.orderId}</h3>
                <p className="text-sm font-semibold text-text-secondary mt-1">Reason: {req.reason}</p>
                <p className="text-sm text-text-primary mt-1">{req.description}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-text-secondary uppercase font-bold">Refund Amount</p>
                <p className="text-xl font-black text-text-primary mt-1">₹{req.refundAmount}</p>
                <p className="text-[10px] text-text-secondary mt-1">via {req.refundMethod}</p>
              </div>
            </div>

            {req.evidenceImages && req.evidenceImages.length > 0 && (
              <div className="mb-4 flex gap-2 overflow-x-auto">
                {req.evidenceImages.map((img: string, idx: number) => (
                  <img key={idx} src={img} alt="Evidence" className="w-16 h-16 rounded-lg border border-border object-cover" />
                ))}
              </div>
            )}

            {/* Admin only views the returns, no status update options */}
            <div className="mt-4 flex flex-wrap gap-2 text-sm text-text-secondary">
               {req.assignedRider && (
                 <p className="bg-surface border border-border px-3 py-1 rounded">Rider Assigned: {req.assignedRider}</p>
               )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReturnsDashboardPage;
