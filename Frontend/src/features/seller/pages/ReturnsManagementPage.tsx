import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Package, CheckCircle, XCircle, Eye, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNotificationStore } from '@/store/notificationStore';

export const ReturnsManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToast } = useNotificationStore();
  const [activeTab, setActiveTab] = useState('REQUESTED');
  const [assigningReturnId, setAssigningReturnId] = useState<string | null>(null);
  const [selectedRiderId, setSelectedRiderId] = useState<string>('');

  const { data: riders = [] } = useQuery({
    queryKey: ['seller-riders'],
    queryFn: () => api.get('/v1/seller/riders').then(res => res.data.data),
  });

  const { data: returns = [], isLoading } = useQuery({
    queryKey: ['seller-returns'],
    queryFn: () => api.get('/v1/seller/returns').then(res => res.data.data),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.put(`/v1/seller/returns/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-returns'] });
      addToast({ title: 'Approved', message: 'Return request approved', type: 'success' });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string, reason: string }) => api.put(`/v1/seller/returns/${id}/reject`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-returns'] });
      addToast({ title: 'Rejected', message: 'Return request rejected', type: 'success' });
    }
  });

  const assignRiderMutation = useMutation({
    mutationFn: ({ id, riderId }: { id: string, riderId: string }) => api.put(`/v1/seller/returns/${id}/assign-rider`, { riderId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-returns'] });
      addToast({ title: 'Rider Assigned', message: 'Delivery boy has been assigned for pickup', type: 'success' });
    }
  });

  const markReceivedMutation = useMutation({
    mutationFn: (id: string) => api.put(`/v1/seller/returns/${id}/mark-received`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-returns'] });
      addToast({ title: 'Item Received', message: 'Self-return picked up and received successfully', type: 'success' });
    }
  });

  const processRefundMutation = useMutation({
    mutationFn: (id: string) => api.put(`/v1/seller/returns/${id}/process-refund`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-returns'] });
      addToast({ title: 'Refund Completed', message: 'Refund has been successfully processed', type: 'success' });
    }
  });

  const filteredReturns = returns.filter((r: any) => r.status === activeTab || (activeTab === 'ALL'));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-text-primary">Returns & Replacements</h1>
        <p className="text-sm text-text-secondary mt-1">Manage return and replacement requests from customers.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto border-b border-border">
        {['ALL', 'REQUESTED', 'APPROVED', 'REJECTED', 'PICKUP_IN_PROGRESS', 'ITEM_RECEIVED', 'REFUND_COMPLETED', 'CLOSED'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === tab ? 'border-accent text-accent' : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredReturns.map((req: any) => (
          <div key={req._id} className="bg-surface border border-border rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${req.requestType === 'REPLACEMENT' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                  {req.requestType}
                </span>
                <h3 className="font-bold text-text-primary mt-2">Order #{req.orderId}</h3>
                <p className="text-sm font-semibold text-text-secondary mt-1">Reason: {req.reason}</p>
                <p className="text-xs text-text-secondary mt-1">{req.description}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold uppercase text-text-secondary">{req.status.replace(/_/g, ' ')}</span>
                <p className="text-lg font-black text-text-primary mt-1">₹{req.refundAmount}</p>
              </div>
            </div>

            {req.evidenceImages && req.evidenceImages.length > 0 && (
              <div className="mt-4 flex gap-2 overflow-x-auto">
                {req.evidenceImages.map((img: string, idx: number) => (
                  <img key={idx} src={img} alt="Evidence" className="w-16 h-16 rounded-lg border border-border object-cover" />
                ))}
              </div>
            )}

            {req.status === 'REQUESTED' && (
              <div className="mt-5 flex gap-3 pt-4 border-t border-border">
                <Button variant="outline" className="flex-1 border-danger text-danger hover:bg-danger/10" onClick={() => {
                  const reason = prompt('Enter rejection reason:');
                  if (reason) rejectMutation.mutate({ id: req._id, reason });
                }}>
                  Reject
                </Button>
                <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white border-transparent" onClick={() => approveMutation.mutate(req._id)}>
                  Approve
                </Button>
              </div>
            )}

            {req.status === 'APPROVED' && (
              <div className="mt-4 pt-4 border-t border-border">
                {assigningReturnId === req._id ? (
                  <div className="flex gap-2 items-center flex-wrap bg-surface p-3 rounded-xl border border-border">
                    <select 
                      className="flex-1 p-2 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
                      value={selectedRiderId}
                      onChange={(e) => setSelectedRiderId(e.target.value)}
                    >
                      <option value="">Select Delivery Boy</option>
                      {riders.map((rider: any) => (
                        <option key={rider._id} value={rider._id}>{rider.name || rider.email}</option>
                      ))}
                    </select>
                    <Button 
                      className="bg-accent text-white" 
                      onClick={() => {
                        if (selectedRiderId) {
                          assignRiderMutation.mutate({ id: req._id, riderId: selectedRiderId });
                          setAssigningReturnId(null);
                        } else {
                          addToast({ title: 'Selection Required', message: 'Please select a delivery boy', type: 'error' });
                        }
                      }}
                    >
                      Confirm
                    </Button>
                    <Button variant="outline" className="border-border text-text-secondary" onClick={() => setAssigningReturnId(null)}>Cancel</Button>
                  </div>
                ) : (
                  <div className="flex gap-3 flex-wrap">
                    <Button variant="outline" className="flex-1 border-accent text-accent hover:bg-accent/10" onClick={() => {
                      setAssigningReturnId(req._id);
                      setSelectedRiderId('');
                    }}>
                      Assign Deliveryboy
                    </Button>
                    <Button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white border-transparent" onClick={() => markReceivedMutation.mutate(req._id)}>
                      Self Return (Item Received)
                    </Button>
                  </div>
                )}
              </div>
            )}

            {req.status === 'ITEM_RECEIVED' && (
              <div className="mt-4 pt-4 border-t border-border flex justify-end">
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white px-6" 
                  onClick={() => processRefundMutation.mutate(req._id)}
                  disabled={processRefundMutation.isPending}
                >
                  Process Refund (Complete)
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReturnsManagementPage;
