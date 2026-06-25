import React from 'react';
import { ClipboardList, Navigation, Phone, CheckCircle2, Package, MapPin, ExternalLink, RefreshCw } from 'lucide-react';
import { useAssignedDeliveries, useUpdateDeliveryStatus } from '../services/rider.queries';
import { useNotificationStore } from '@/store/notificationStore';
import { Button } from '@/components/ui/Button';

export const AssignedDeliveriesPage: React.FC = () => {
  const { data: assigned, isLoading, refetch } = useAssignedDeliveries();
  const statusMutation = useUpdateDeliveryStatus();
  const { addToast } = useNotificationStore();

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

  const openMaps = (address: string) => {
    window.open(`https://maps.google.com/?q=${encodeURIComponent(address)}`, '_blank');
  };

  const callPhone = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Active Workspace</h1>
          <p className="text-sm text-text-secondary">Manage your currently assigned deliveries</p>
        </div>
        <button onClick={() => refetch()} className="p-2 border border-border rounded hover:bg-surface"><RefreshCw size={16} className={isLoading ? 'animate-spin' : ''}/></button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
           {[1, 2].map(i => <div key={i} className="h-96 bg-surface rounded-xl"></div>)}
        </div>
      ) : !assigned || assigned.length === 0 ? (
        <div className="bg-surface border border-border border-dashed rounded-xl p-10 text-center flex flex-col items-center">
          <ClipboardList size={40} className="text-text-secondary/50 mb-3" />
          <h3 className="font-bold text-text-primary">No Active Assignments</h3>
          <p className="text-sm text-text-secondary">Head to the marketplace to accept nearby delivery opportunities.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {assigned.map((job: any) => (
            <div key={job._id} className="bg-surface border border-accent/20 rounded-xl overflow-hidden shadow-enterprise-md flex flex-col">
              <div className="bg-accent/5 px-5 py-3 border-b border-accent/20 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-accent text-sm">#{job.orderId?._id?.substring(0, 8) || 'N/A'}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${job.priority === 'urgent' ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>
                    {job.priority || 'Normal'}
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                  {job.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="p-5 flex-1 space-y-5">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1">
                    <MapPin size={12} /> Pickup Point
                  </h4>
                  <div className="bg-background border border-border rounded-lg p-3 flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                      <p className="font-bold text-sm text-text-primary">{job.shopId?.name}</p>
                      <p className="text-xs text-text-secondary line-clamp-2 mt-0.5">{job.pickupLocation?.address || job.shopId?.address || 'N/A'}</p>
                      <p className="text-xs text-text-primary font-medium mt-1">{job.shopId?.phone}</p>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
                      <Button size="sm" variant="outline" className="w-full sm:w-auto" onClick={() => openMaps(job.pickupLocation?.address || job.shopId?.address)} icon={<Navigation size={12}/>}>Navigate</Button>
                      <Button size="sm" variant="outline" className="w-full sm:w-auto" onClick={() => callPhone(job.shopId?.phone)} icon={<Phone size={12}/>}>Call</Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 size={12} /> Dropoff Point
                  </h4>
                  <div className="bg-background border border-border rounded-lg p-3 flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                      <p className="font-bold text-sm text-text-primary">{job.orderId?.customerName || 'Customer'}</p>
                      <p className="text-xs text-text-secondary line-clamp-2 mt-0.5">{job.dropoffLocation?.address || 'Customer Location'}</p>
                      <p className="text-xs text-text-primary font-medium mt-1">Payment: <span className="uppercase text-accent font-bold">{job.orderId?.paymentMethod || 'PREPAID'}</span></p>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
                      <Button size="sm" variant="outline" className="w-full sm:w-auto" onClick={() => openMaps(job.dropoffLocation?.address || 'N/A')} icon={<Navigation size={12}/>}>Navigate</Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-background border-t border-border p-4 flex flex-col gap-2">
                {job.status === 'assigned' && (
                  <Button className="w-full justify-center" onClick={() => handleUpdateStatus(job._id, 'arrived_at_pickup')}>Confirm Arrival at Store</Button>
                )}
                {job.status === 'arrived_at_pickup' && (
                  <Button className="w-full justify-center" onClick={() => handleUpdateStatus(job._id, 'picked_up')} icon={<Package size={16}/>}>Verify Pickup</Button>
                )}
                {job.status === 'picked_up' && (
                  <Button className="w-full justify-center" onClick={() => handleUpdateStatus(job._id, 'in_transit')}>Start Transit to Customer</Button>
                )}
                {job.status === 'in_transit' && (
                  <Button className="w-full justify-center" onClick={() => handleUpdateStatus(job._id, 'arrived_at_dropoff')}>Arrived at Dropoff</Button>
                )}
                {job.status === 'arrived_at_dropoff' && (
                  <div className="flex flex-col gap-2 w-full">
                    <input
                      type="text"
                      placeholder="Enter 6-digit Delivery Code from Customer"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="border border-border rounded-md px-3 py-2 text-sm text-center tracking-[0.2em] font-mono w-full"
                      maxLength={6}
                    />
                    <Button 
                      className="w-full justify-center bg-success border-success text-white hover:bg-success/90" 
                      onClick={() => handleUpdateStatus(job._id, 'delivered', verificationCode)} 
                      icon={<CheckCircle2 size={16}/>}
                      disabled={verificationCode.length !== 6}
                    >
                      Complete Delivery
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default AssignedDeliveriesPage;
