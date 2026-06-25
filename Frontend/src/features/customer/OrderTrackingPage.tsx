import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  MapPin, Phone, MessageCircle, Clock, CheckCircle,
  Package, Truck, ArrowLeft, Bike, Store, Home, AlertCircle, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNotificationStore } from '@/store/notificationStore';
import { useOrderDetails } from '@/hooks/queries';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet setup
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Icons
const riderIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const storeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const TIMELINE_STEPS = [
  { status: 'pending', label: 'Order Placed', icon: <Package size={20} /> },
  { status: 'packed', label: 'Packed', icon: <CheckCircle size={20} /> },
  { status: 'picked_up', label: 'Shipped', icon: <Truck size={20} /> },
  { status: 'arrived_at_destination', label: 'Out For Delivery', icon: <Bike size={20} /> },
  { status: 'delivered', label: 'Delivered', icon: <Home size={20} /> }
];

export const OrderTrackingPage: React.FC = () => {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const { addToast } = useNotificationStore();

  const { data: order, isLoading, isError } = useOrderDetails(orderId as string);
  
  // Map coordinates simulation for visualization
  const [riderPos, setRiderPos] = useState<[number, number]>([28.5355, 77.2641]);
  const storePos: [number, number] = [28.5350, 77.2650];
  const customerPos: [number, number] = [28.5380, 77.2600];

  useEffect(() => {
    if (order && !['delivered', 'cancelled'].includes(order.status)) {
      const interval = setInterval(() => {
        setRiderPos(prev => [
          prev[0] + (customerPos[0] - prev[0]) * 0.05,
          prev[1] + (customerPos[1] - prev[1]) * 0.05
        ]);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [order?.status]);

  if (isLoading) return <div className="p-10 text-center animate-pulse text-text-primary">Loading Tracking Data...</div>;
  if (isError || !order) return <div className="p-10 text-center text-danger font-bold flex justify-center items-center gap-2"><AlertCircle /> Order not found or access denied.</div>;

  const orderStages = ['pending', 'accepted', 'preparing', 'packed', 'ready_for_pickup', 'assigned_to_rider', 'arrived_at_pickup', 'picked_up', 'in_transit', 'arrived_at_destination', 'delivered'];
  const currentIdx = orderStages.indexOf(order.status);
  const isDelivered = order.status === 'delivered';
  const showMap = !isDelivered && order.status !== 'cancelled' && currentIdx >= orderStages.indexOf('assigned_to_rider');

  return (
    <div className="max-w-4xl mx-auto w-full pb-20 space-y-6 text-left">
      {/* Tracker Header */}
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => navigate(-1)} className="p-2 bg-surface border border-border rounded-lg text-text-secondary hover:text-text-primary hover:bg-border transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight">Track Order</h1>
          <p className="text-sm text-text-secondary font-mono mt-0.5">#{order.orderId || order.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Content (Map & Status) */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Status Alert Banner */}
          <div className={`p-4 rounded-2xl flex items-start gap-4 ${isDelivered ? 'bg-success/10 border border-success/20 text-success' : 'bg-accent/10 border border-accent/20 text-accent-light'}`}>
            <div className={`p-2 rounded-full ${isDelivered ? 'bg-success/20' : 'bg-accent/20'} mt-1`}>
              {isDelivered ? <Home size={20} /> : <Clock size={20} />}
            </div>
            <div>
              <h2 className="text-lg font-bold">{isDelivered ? 'Order Delivered Successfully' : 'Estimated Delivery Time'}</h2>
              <p className={`text-3xl font-black mt-1 ${isDelivered ? 'text-success' : 'text-accent'}`}>{isDelivered ? 'Done' : (order.eta || '15-20 Mins')}</p>
              {!isDelivered && <p className="text-sm font-medium mt-1 opacity-90">Arriving today, {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>}
            </div>
          </div>

          {/* Leaflet Live Map */}
          {showMap && (
            <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm h-72 relative z-0">
              <MapContainer center={riderPos} zoom={15} scrollWheelZoom={false} className="w-full h-full">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
                <Marker position={storePos} icon={storeIcon}><Popup>Shop: {order.shopName}</Popup></Marker>
                <Marker position={customerPos}><Popup>Your Delivery Address</Popup></Marker>
                <Marker position={riderPos} icon={riderIcon}><Popup>Rider ({order.deliveryDetails?.riderName})</Popup></Marker>
                <Polyline positions={[storePos, customerPos]} color="#9ca3af" dashArray="5, 10" />
              </MapContainer>
            </div>
          )}

          {/* Rider Info Block */}
          {!isDelivered && order.deliveryDetails?.riderName && (
            <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center text-accent border border-accent/20">
                    <Bike size={24} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success rounded-full border-2 border-surface flex items-center justify-center">
                    <Shield size={10} className="text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-text-primary text-lg">{order.deliveryDetails.riderName}</h3>
                  <p className="text-sm text-text-secondary">Delivery Partner</p>
                </div>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <Button variant="outline" className="flex-1 md:flex-none border-border hover:border-accent text-accent">
                  <MessageCircle size={16} className="mr-2" /> Message
                </Button>
                <a href={`tel:${order.deliveryDetails.riderPhone}`} className="flex-1 md:flex-none">
                  <Button className="w-full bg-success hover:bg-success/90 text-white shadow-none">
                    <Phone size={16} className="mr-2" /> Call
                  </Button>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar (Timeline) */}
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm h-full">
            <h3 className="font-black text-text-primary mb-6 text-lg border-b border-border pb-3">Tracking History</h3>
            
            <div className="relative pl-6 space-y-8 before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-border before:to-border/10">
              {TIMELINE_STEPS.map((step, idx) => {
                const stepIdx = orderStages.indexOf(step.status);
                const isCompleted = currentIdx >= stepIdx || order.status === 'delivered';
                const isCurrent = currentIdx === stepIdx || (step.status === 'delivered' && order.status === 'delivered');
                
                return (
                  <div key={step.status} className="relative flex items-start gap-4">
                    <div className={`absolute -left-[30px] flex items-center justify-center w-7 h-7 rounded-full border-4 shadow shrink-0 z-10 ${isCompleted ? 'bg-accent border-accent-light' : 'bg-background border-border'}`}>
                      {isCompleted && <CheckCircle size={12} className="text-white" />}
                    </div>
                    
                    <div>
                      <h4 className={`text-sm font-black ${isCurrent ? 'text-accent' : isCompleted ? 'text-text-primary' : 'text-text-secondary'}`}>{step.label}</h4>
                      {isCompleted && (
                        <p className="text-xs font-semibold text-text-secondary mt-1">
                          {new Date(order.updatedAt || order.createdAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderTrackingPage;
