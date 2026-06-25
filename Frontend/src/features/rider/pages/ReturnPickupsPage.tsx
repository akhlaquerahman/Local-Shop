import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Package, MapPin, CheckCircle, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNotificationStore } from '@/store/notificationStore';

export const ReturnPickupsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToast } = useNotificationStore();
  const [activeTab, setActiveTab] = useState('ASSIGNED');
  const [proofImage, setProofImage] = useState<string>('');
  const [activePickupId, setActivePickupId] = useState<string | null>(null);

  const { data: pickups = [], isLoading } = useQuery({
    queryKey: ['rider-pickups'],
    queryFn: () => api.get('/v1/rider/return-pickups').then(res => res.data.data),
  });

  const startPickupMutation = useMutation({
    mutationFn: (id: string) => api.put(`/v1/rider/return-pickups/${id}/start`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rider-pickups'] });
      addToast({ title: 'Pickup Started', message: 'You are marked as arriving.', type: 'info' });
    }
  });

  const completePickupMutation = useMutation({
    mutationFn: ({ id, packagePhoto }: { id: string, packagePhoto: string }) => 
      api.put(`/v1/rider/return-pickups/${id}/complete`, { packagePhoto }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rider-pickups'] });
      addToast({ title: 'Pickup Completed', message: 'Item marked as received.', type: 'success' });
      setActivePickupId(null);
      setProofImage('');
    }
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProofImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const filteredPickups = pickups.filter((p: any) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'ASSIGNED') return p.status === 'PICKUP_ASSIGNED';
    return p.status === activeTab;
  });

  return (
    <div className="space-y-6 pb-20 overflow-x-hidden">
      <div>
        <h1 className="text-2xl font-black text-text-primary">Return Pickups</h1>
        <p className="text-sm text-text-secondary mt-1">Manage items to be picked up from customers.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto border-b border-border scrollbar-none">
        {['ALL', 'ASSIGNED', 'APPROVED', 'PICKUP_IN_PROGRESS', 'ITEM_RECEIVED', 'REFUND_COMPLETED', 'CLOSED'].map(tab => (
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
        {filteredPickups.map((pickup: any) => (
          <div key={pickup._id} className="bg-surface border border-border rounded-xl p-5">
            <div className="flex justify-between items-start border-b border-border pb-4 mb-4">
              <div>
                <h3 className="font-bold text-text-primary text-lg">Order #{pickup.orderId}</h3>
                <p className="text-sm text-text-secondary font-medium mt-1">Type: {pickup.requestType}</p>
                {pickup.reason && <p className="text-sm font-semibold text-text-secondary mt-1">Reason: {pickup.reason}</p>}
                {pickup.description && <p className="text-xs text-text-secondary mt-1">{pickup.description}</p>}
              </div>
              <div className="text-right">
                <span className="text-[10px] px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-bold uppercase mb-2 inline-block">
                  {pickup.status.replace(/_/g, ' ')}
                </span>
                <p className="text-xs text-text-secondary uppercase font-bold mt-2">Refund Amount</p>
                <p className="text-xl font-black text-text-primary">₹{pickup.refundAmount || 0}</p>
                {pickup.refundMethod && <p className="text-[10px] text-text-secondary">via {pickup.refundMethod}</p>}
              </div>
            </div>

            {pickup.evidenceImages && pickup.evidenceImages.length > 0 && (
              <div className="mb-4 flex gap-2 overflow-x-auto">
                {pickup.evidenceImages.map((img: string, idx: number) => (
                  <img key={idx} src={img} alt="Evidence" className="w-16 h-16 rounded-lg border border-border object-cover" />
                ))}
              </div>
            )}

            {['PICKUP_ASSIGNED', 'APPROVED', 'REQUESTED'].includes(pickup.status) && (
              <Button className="w-full mt-4 bg-accent text-white" onClick={() => startPickupMutation.mutate(pickup._id)}>
                Start Pickup (Mark In Progress)
              </Button>
            )}

            {pickup.status === 'PICKUP_IN_PROGRESS' && (
              <div className="mt-4 p-4 bg-background border border-border rounded-lg space-y-4">
                <p className="text-sm font-bold text-text-primary text-center">Verify and Upload Proof</p>
                {proofImage ? (
                  <img src={proofImage} alt="Proof" className="w-full h-32 object-cover rounded-lg" />
                ) : (
                  <label className="w-full h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer text-text-secondary hover:text-accent">
                    <UploadCloud size={24} />
                    <span className="text-xs font-bold mt-2">Take Package Photo</span>
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} />
                  </label>
                )}
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 text-white" 
                  disabled={!proofImage}
                  onClick={() => completePickupMutation.mutate({ id: pickup._id, packagePhoto: proofImage })}
                >
                  Confirm Pickup Complete
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReturnPickupsPage;
