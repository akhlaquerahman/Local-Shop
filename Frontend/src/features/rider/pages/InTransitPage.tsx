import React, { useEffect } from 'react';
import { useInTransitDelivery, useUpdateDeliveryStatus } from '../services/rider.queries';
import { useNotificationStore } from '@/store/notificationStore';
import { Button } from '@/components/ui/Button';
import { Navigation, Phone, ShieldCheck, MapPin, AlertTriangle, Loader2 } from 'lucide-react';
import { useRiderSocket } from '../services/rider.socket';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export const InTransitPage: React.FC = () => {
  const { data: job, isLoading, refetch } = useInTransitDelivery();
  const statusMutation = useUpdateDeliveryStatus();
  const { addToast } = useNotificationStore();
  const { socket } = useRiderSocket();

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => refetch();
    socket.on('delivery_status_updated', handleUpdate);
    return () => {
      socket.off('delivery_status_updated', handleUpdate);
    };
  }, [socket, refetch]);

  const handleStatus = async (status: string) => {
    try {
      await statusMutation.mutateAsync({ id: job._id, status });
      addToast({ title: 'Success', message: `Status updated to ${status.replace(/_/g, ' ')}`, type: 'success' });
      refetch();
    } catch (err: any) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  const openMaps = (address: string) => window.open(`https://maps.google.com/?q=${encodeURIComponent(address)}`, '_blank');
  const callPhone = (phone: string) => window.open(`tel:${phone}`, '_self');

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-accent" size={40} /></div>;
  }

  if (!job) {
    return (
      <div className="space-y-6 text-left max-w-7xl mx-auto pb-20">
        <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Active Route</h1>
        <div className="bg-surface border border-dashed border-border rounded-xl p-10 text-center flex flex-col items-center">
          <Navigation size={40} className="text-text-secondary/50 mb-3" />
          <h3 className="font-bold text-text-primary">No Active Delivery</h3>
          <p className="text-sm text-text-secondary">You don't have any delivery currently in transit.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface p-4 rounded-xl border border-border shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-black text-text-primary">Delivery #{job._id.substring(0, 8)}</span>
            <span className="px-2 py-0.5 bg-accent/10 text-accent text-[10px] font-bold uppercase rounded">{job.priority || 'NORMAL'}</span>
          </div>
          <p className="text-xs font-bold text-text-secondary uppercase">Order #{job.orderId?._id?.substring(0, 8)} • <span className="text-success">{job.status.replace(/_/g, ' ')}</span></p>
        </div>
        <div className="flex items-center gap-4 text-sm font-bold">
          <div className="text-center">
            <span className="block text-[10px] text-text-secondary uppercase">COD to Collect</span>
            <span className="text-lg text-text-primary">₹{job.orderId?.paymentMethod === 'cod' ? job.orderId?.total : 0}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MAP */}
        <div className="bg-surface border border-border rounded-xl p-0 relative h-[400px] lg:h-auto min-h-[400px] flex items-center justify-center overflow-hidden">
          <MapContainer 
            center={[28.6139, 77.2090]} // Mock Center for New Delhi
            zoom={13} 
            style={{ height: '100%', width: '100%', zIndex: 1 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* Mock Coordinates for Rider/Shop/Customer */}
            <Marker position={[28.62, 77.21]}>
              <Popup><b>Pickup Location</b></Popup>
            </Marker>
            <Marker position={[28.61, 77.20]}>
              <Popup><b>Dropoff Location</b></Popup>
            </Marker>
            <Polyline positions={[[28.62, 77.21], [28.61, 77.20]]} color="#10b981" weight={4} dashArray="5, 10" />
          </MapContainer>
          <div className="absolute bottom-4 left-4 right-4 z-10 bg-surface/90 backdrop-blur-sm p-4 rounded-xl border border-border shadow-lg flex justify-between items-center">
            <div>
              <h3 className="font-bold text-text-primary text-sm">GPS Active Route</h3>
              <p className="text-xs text-text-secondary">Distance: {job.distanceKm || 0} km • ETA: {job.etaMinutes || 0} mins</p>
            </div>
            <Button onClick={() => openMaps(job.dropoffLocation?.address || 'Customer')} size="sm" variant="outline" className="bg-background border-accent/30 text-accent hover:bg-accent/5">Open Maps</Button>
          </div>
        </div>

        {/* CUSTOMER & ACTION DETAILS */}
        <div className="space-y-4">
          <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
            <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-wider border-b border-border pb-2">Customer Dropoff Details</h3>
            <div className="flex justify-between items-start gap-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <MapPin size={20} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-text-primary">{job.orderId?.customerName || 'Customer'}</h4>
                  <p className="text-xs text-text-secondary leading-relaxed mt-1">{job.dropoffLocation?.address || 'Customer Delivery Location'}</p>
                  <p className="text-[10px] font-medium text-text-secondary mt-1 bg-background p-1.5 rounded inline-block">Instruction: Leave at door if no response</p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => callPhone('1234567890')} icon={<Phone size={14}/>} className="shrink-0 bg-background">Call</Button>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
            <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-wider border-b border-border pb-2">Order Summary</h3>
            <div className="text-sm flex justify-between items-center py-1">
              <span className="text-text-secondary">Payment Method</span>
              <span className="font-bold uppercase text-accent">{job.orderId?.paymentMethod || 'PREPAID'}</span>
            </div>
            <div className="text-sm flex justify-between items-center py-1">
              <span className="text-text-secondary">Items Count</span>
              <span className="font-bold">{job.orderId?.items?.length || 1} Items</span>
            </div>
            <div className="text-sm flex justify-between items-center py-1 border-t border-border mt-2 pt-3">
              <span className="text-text-primary font-bold">Total Bill</span>
              <span className="font-black text-text-primary text-lg">₹{job.orderId?.total || 0}</span>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
            <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-2">Workflow Actions</h3>
            {job.status === 'in_transit' && (
              <Button className="w-full justify-center h-12 text-sm" onClick={() => handleStatus('arrived_at_dropoff')} disabled={statusMutation.isPending}>
                Reached Customer Location
              </Button>
            )}
            {job.status === 'arrived_at_dropoff' && (
              <Button className="w-full justify-center h-12 text-sm bg-success border-success text-white hover:bg-success/90" onClick={() => handleStatus('delivered')} disabled={statusMutation.isPending} icon={<ShieldCheck size={18}/>}>
                Verify OTP & Mark Delivered
              </Button>
            )}
            <Button variant="outline" className="w-full justify-center h-12 text-sm text-error border-error/30 hover:bg-error/5" onClick={() => handleStatus('failed')} disabled={statusMutation.isPending} icon={<AlertTriangle size={16}/>}>
              Report Delivery Issue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default InTransitPage;
