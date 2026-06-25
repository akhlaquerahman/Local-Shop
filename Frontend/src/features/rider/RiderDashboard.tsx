import React, { useEffect } from 'react';
import { useNotificationStore } from '@/store/notificationStore';
import { Button } from '@/components/ui/Button';
import { KPICard } from '@/components/ui/KPI';
import { 
  MapPin, Clock, IndianRupee, Navigation, CheckCircle2, 
  ChevronRight, Compass, ShieldCheck, AlertCircle, RefreshCw
} from 'lucide-react';
import { 
  useRiderDashboard, 
  useAvailableDeliveries, 
  useAssignedDeliveries,
  useUpdateDeliveryStatus,
  useRequestDelivery
} from './services/rider.queries';
import { useRiderSocket } from './services/rider.socket';

export const RiderDashboard: React.FC = () => {
  const { addToast } = useNotificationStore();
  const { socket, isConnected } = useRiderSocket();

  const { data: dashboard, isLoading: dashLoading, refetch: refetchDash } = useRiderDashboard();
  const { data: available, isLoading: availLoading, refetch: refetchAvail } = useAvailableDeliveries();
  const { data: assigned, isLoading: assignLoading, refetch: refetchAssign } = useAssignedDeliveries();

  const requestMutation = useRequestDelivery();
  const statusMutation = useUpdateDeliveryStatus();

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => {
      refetchDash();
      refetchAvail();
      refetchAssign();
    };
    socket.on('delivery_status_updated', handleUpdate);
    socket.on('delivery_available', handleUpdate);
    return () => {
      socket.off('delivery_status_updated', handleUpdate);
      socket.off('delivery_available', handleUpdate);
    };
  }, [socket, refetchDash, refetchAvail, refetchAssign]);

  const stats = dashboard || { earnings: 0, completedDeliveries: 0, activeDeliveries: 0, acceptanceRate: 100, onlineTime: 0 };
  const activeJobs = assigned || [];
  const availableOffers = available || [];

  const handleRequestDelivery = async (id: string) => {
    try {
      await requestMutation.mutateAsync(id);
      addToast({ title: 'Request Sent', message: 'Delivery requested successfully.', type: 'success' });
    } catch (err: any) {
      addToast({ title: 'Error', message: err.message || 'Failed to request delivery', type: 'error' });
    }
  };

  const [verificationCode, setVerificationCode] = React.useState('');

  const handleUpdateStatus = async (id: string, status: string, code?: string) => {
    try {
      await statusMutation.mutateAsync({ id, status, verificationCode: code });
      addToast({ title: 'Status Updated', message: `Delivery marked as ${status.replace(/_/g, ' ')}`, type: 'success' });
      if (status === 'delivered') setVerificationCode('');
    } catch (err: any) {
      addToast({ title: 'Error', message: err.message || 'Failed to update status', type: 'error' });
    }
  };

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto pb-20">
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KPICard title="Today's Earnings" value={`₹${stats.earnings}`} loading={dashLoading} />
        <KPICard title="Completed" value={stats.completedDeliveries} loading={dashLoading} />
        <KPICard title="Active Jobs" value={stats.activeDeliveries} loading={dashLoading} />
        <KPICard title="Acceptance" value={`${stats.acceptanceRate}%`} loading={dashLoading} />
        <KPICard title="Online Time" value={`${stats.onlineTime}h`} loading={dashLoading} />
      </div>

      {activeJobs.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">Current Active Delivery</h3>
          {activeJobs.map((job: any) => (
            <div key={job._id} className="bg-surface border border-accent/20 rounded-lg p-5 shadow-enterprise-md space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-3 gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-accent">{job.status.replace(/_/g, ' ')}</span>
                  <h2 className="text-sm font-bold text-text-primary mt-0.5">Order #{job.orderId?._id?.substring(0, 8) || 'N/A'}</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {job.status === 'assigned' && (
                    <Button onClick={() => handleUpdateStatus(job._id, 'arrived_at_pickup')} size="sm">Arrived at Pickup</Button>
                  )}
                  {job.status === 'arrived_at_pickup' && (
                    <Button onClick={() => handleUpdateStatus(job._id, 'picked_up')} size="sm">Confirm Pick Up</Button>
                  )}
                  {job.status === 'picked_up' && (
                    <Button onClick={() => handleUpdateStatus(job._id, 'in_transit')} size="sm">Start Transit</Button>
                  )}
                  {job.status === 'in_transit' && (
                    <Button onClick={() => handleUpdateStatus(job._id, 'arrived_at_dropoff')} size="sm">Arrived at Dropoff</Button>
                  )}
                  {job.status === 'arrived_at_dropoff' && (
                    <div className="flex flex-col gap-2 w-full mt-2">
                      <input
                        type="text"
                        placeholder="Enter 6-digit Code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="border border-border rounded-md px-2 py-1 text-xs text-center tracking-widest font-mono w-full"
                        maxLength={6}
                      />
                      <Button onClick={() => handleUpdateStatus(job._id, 'delivered', verificationCode)} size="sm" variant="primary" className="bg-success border-success text-white w-full" disabled={verificationCode.length !== 6}>Complete Delivery</Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-4 relative pl-4 border-l border-border">
                  <div className="space-y-1 relative">
                    <span className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-border flex items-center justify-center border-2 border-background text-[8px] font-extrabold">A</span>
                    <div className="font-bold text-text-secondary">Pickup: {job.shopId?.name}</div>
                    <p className="text-[10px] text-text-secondary leading-relaxed">{job.pickupLocation?.address || job.shopId?.address || 'N/A'}</p>
                  </div>
                  <div className="space-y-1 relative pt-2">
                    <span className="absolute -left-6 top-3 w-3.5 h-3.5 rounded-full bg-accent text-white flex items-center justify-center border-2 border-background text-[8px] font-extrabold">B</span>
                    <div className="font-bold text-text-secondary">Dropoff</div>
                    <p className="text-[10px] text-text-secondary leading-relaxed">{job.dropoffLocation?.address || 'Customer Address'}</p>
                  </div>
                </div>

                <div className="bg-background border border-border rounded-lg p-4 flex flex-col justify-center">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="border-r border-border py-1">
                      <div className="text-[9px] uppercase font-bold text-text-secondary">Payout</div>
                      <div className="font-bold text-xs text-text-primary">₹{job.deliveryFee || 0}</div>
                    </div>
                    <div className="border-r border-border py-1">
                      <div className="text-[9px] uppercase font-bold text-text-secondary">Distance</div>
                      <div className="font-bold text-xs text-text-primary">{job.distanceKm || 0} km</div>
                    </div>
                    <div className="py-1">
                      <div className="text-[9px] uppercase font-bold text-text-secondary">Est. Time</div>
                      <div className="font-bold text-xs text-text-primary">{job.etaMinutes || 0} min</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-surface border border-border border-dashed rounded-lg p-8 text-center text-text-secondary select-none">
          <Compass className="mx-auto text-text-secondary mb-3 animate-spin-slow" size={32} />
          <h3 className="text-xs font-bold text-text-primary">Awaiting active task routes</h3>
          <p className="text-[10px] text-text-secondary max-w-xs mx-auto mt-1 leading-relaxed">
            Toggle your availability status to "On Duty" and accept one of the nearby offers listed below.
          </p>
        </div>
      )}

      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2">
            Nearby pickup requests
            {availLoading && <RefreshCw size={12} className="animate-spin" />}
          </h3>
          <span className="flex items-center gap-1.5 px-2 py-1 bg-success/10 text-success rounded-full text-[9px] font-bold tracking-wider">
            <span className={`w-1.5 h-1.5 rounded-full bg-success ${isConnected ? 'animate-pulse' : ''}`}></span>
            {isConnected ? 'LIVE' : 'CONNECTING...'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableOffers.length === 0 ? (
            <div className="md:col-span-2 border border-border rounded-lg bg-surface/30 p-6 text-center text-text-secondary text-xs">
              No new order dispatches are currently pending in your coordinates.
            </div>
          ) : (
            availableOffers.map((offer: any) => (
              <div key={offer._id} className="bg-surface border border-border hover:border-primary/50 transition-colors rounded-lg p-4 cursor-pointer flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-xs text-text-primary">{offer.shopId?.name}</h4>
                    <span className="text-xs font-black text-text-primary">₹{offer.deliveryFee || 0}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-start gap-2 text-[10px] text-text-secondary">
                      <MapPin size={12} className="mt-0.5 shrink-0" />
                      <span className="line-clamp-1">{offer.pickupLocation?.address || offer.shopId?.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-text-secondary">
                      <Clock size={12} className="shrink-0" />
                      <span>{offer.distanceKm || 0}km • {offer.etaMinutes || 0} min ETA</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-border flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Priority: {offer.priority || 'Normal'}</span>
                  <Button size="sm" onClick={() => handleRequestDelivery(offer._id)} disabled={requestMutation.isPending}>
                    Accept Offer
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
export default RiderDashboard;
