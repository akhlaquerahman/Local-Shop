import React, { useState } from 'react';
import { Compass, MapPin, Navigation, IndianRupee, Clock, Search, Filter } from 'lucide-react';
import { useAvailableDeliveries, useRequestDelivery } from '../services/rider.queries';
import { useNotificationStore } from '@/store/notificationStore';
import { Button } from '@/components/ui/Button';

export const AvailableDeliveriesPage: React.FC = () => {
  const { data: available, isLoading } = useAvailableDeliveries();
  const requestMutation = useRequestDelivery();
  const { addToast } = useNotificationStore();
  const [filterDist, setFilterDist] = useState<number>(10);

  const handleAccept = async (id: string) => {
    try {
      await requestMutation.mutateAsync(id);
      addToast({ title: 'Success', message: 'Delivery requested successfully.', type: 'success' });
    } catch (err: any) {
      addToast({ title: 'Error', message: err.message || 'Failed to request delivery', type: 'error' });
    }
  };

  const filtered = available?.filter((d: any) => (d.distanceKm || 0) <= filterDist) || [];

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Delivery Marketplace</h1>
          <p className="text-sm text-text-secondary">Find and accept nearby delivery requests</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-surface border border-border rounded-lg px-3 py-2 flex items-center gap-2 text-sm">
            <Filter size={16} className="text-text-secondary" />
            <select className="bg-transparent outline-none font-bold" value={filterDist} onChange={(e) => setFilterDist(Number(e.target.value))}>
              <option value={3}>Within 3 km</option>
              <option value={5}>Within 5 km</option>
              <option value={10}>Within 10 km</option>
              <option value={50}>Any Distance</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
           {[1, 2, 3].map(i => <div key={i} className="h-64 bg-surface rounded-xl"></div>)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-surface border border-dashed border-border rounded-xl p-10 text-center flex flex-col items-center">
          <Compass size={40} className="text-text-secondary/50 mb-3 animate-pulse" />
          <h3 className="font-bold text-text-primary">No Deliveries Available</h3>
          <p className="text-sm text-text-secondary">There are no pending requests in your area right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((job: any) => (
            <div key={job._id} className="bg-surface border border-border rounded-xl p-5 space-y-4 shadow-sm hover:border-primary/30 transition-colors flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full w-fit">
                      {job.priority || 'Normal'}
                    </span>
                    <span className="text-xs font-bold text-text-secondary">Order #{job.orderId?.orderId || job.orderId?._id?.substring(0, 8)}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-text-primary">Earn ₹{job.deliveryFee || 0}</div>
                    <div className="text-[10px] text-text-secondary font-bold">Total: ₹{job.orderId?.total || 0}</div>
                  </div>
                </div>
                
                <div className="relative pl-6 space-y-4 border-l-2 border-dashed border-border ml-2 py-1">
                  <div className="relative">
                    <div className="absolute -left-[29px] top-0 w-4 h-4 rounded-full bg-surface border-2 border-text-primary" />
                    <p className="text-[10px] font-bold text-text-secondary uppercase">Pickup</p>
                    <p className="font-bold text-sm text-text-primary">{job.shopId?.name}</p>
                    <p className="text-xs text-text-secondary line-clamp-1">
                      {typeof job.pickupLocation?.address === 'string' ? job.pickupLocation.address : 
                       typeof job.shopId?.address === 'string' ? job.shopId.address : 
                       (job.shopId?.address?.street || 'Shop Location')}
                    </p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[29px] top-0 w-4 h-4 rounded-full bg-surface border-2 border-success" />
                    <p className="text-[10px] font-bold text-text-secondary uppercase">Dropoff</p>
                    <p className="text-xs font-bold text-text-primary line-clamp-1">
                      {job.orderId?.deliveryDetails?.deliveryAddress?.split(',')[job.orderId?.deliveryDetails?.deliveryAddress?.split(',').length - 2]?.trim() || 'Delivery City'}
                    </p>
                    <p className="text-xs text-text-secondary line-clamp-2">
                      {job.orderId?.deliveryDetails?.deliveryAddress || job.dropoffLocation?.address || 'Customer Location'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex gap-2 items-center">
                <div className="flex-1 bg-background rounded-lg border border-border p-2 flex flex-col items-center justify-center gap-0.5 text-xs font-bold text-text-secondary">
                  <span className="flex items-center gap-1"><Navigation size={12}/> {job.distanceKm || 0} km</span>
                  <span className="text-[10px] font-normal">{job.etaMinutes || 0} min</span>
                </div>
                <Button 
                  className="flex-[2] h-full" 
                  onClick={() => handleAccept(job._id)} 
                  disabled={requestMutation.isPending}
                >
                  Accept Delivery
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default AvailableDeliveriesPage;
