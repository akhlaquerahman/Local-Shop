import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, CheckCircle, Package, Truck, Store, MapPin, 
  Bike, FileText, ArrowRightLeft, User, Phone, Home, Star 
} from 'lucide-react';
import apiClient from '@/lib/apiClient';
import { Button } from '@/components/ui/Button';
import { Order, OrderStatus } from '@/domain/order';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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

interface OrderDetailsDrawerProps {
  order: Order;
  onClose: () => void;
}

const TIMELINE_STEPS = [
  { status: 'pending', label: 'Order Placed' },
  { status: 'packed', label: 'Packed' },
  { status: 'picked_up', label: 'Shipped' },
  { status: 'arrived_at_destination', label: 'Out For Delivery' },
  { status: 'delivered', label: 'Delivered' }
];

function formatDate(dateStr?: string | Date) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('en-IN', { 
    day: 'numeric', month: 'short', year: 'numeric', 
    hour: '2-digit', minute: '2-digit' 
  });
}

export const OrderDetailsDrawer: React.FC<OrderDetailsDrawerProps> = ({ order, onClose }) => {
  const navigate = useNavigate();

  const [showRiderReview, setShowRiderReview] = useState(false);
  const [riderRating, setRiderRating] = useState(5);
  const [riderComment, setRiderComment] = useState('');
  const [submittingRiderReview, setSubmittingRiderReview] = useState(false);
  const [riderReviewSuccess, setRiderReviewSuccess] = useState(false);

  const submitRiderReview = async () => {
    try {
      setSubmittingRiderReview(true);
      await apiClient.post('/reviews/rider', {
        riderId: order.deliveryDetails?.riderId || 'unknown',
        orderId: order.orderId || order.id,
        rating: riderRating,
        title: 'Rider Review',
        comment: riderComment
      });
      setRiderReviewSuccess(true);
      setTimeout(() => setShowRiderReview(false), 2000);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingRiderReview(false);
    }
  };

  // Helper to determine active steps
  const orderStages = ['pending', 'accepted', 'preparing', 'packed', 'ready_for_pickup', 'assigned_to_rider', 'arrived_at_pickup', 'picked_up', 'in_transit', 'arrived_at_destination', 'delivered'];
  const currentIdx = orderStages.indexOf(order.status);
  
  return (
    <>
      <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full md:w-[900px] bg-surface shadow-enterprise-xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header Fixed */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/50">
          <div>
            <h2 className="text-xl font-black text-text-primary">Order {order.orderId || order.id}</h2>
            <p className="text-xs text-text-secondary mt-0.5">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs"
              onClick={() => navigate(`/app/orders/${order.orderId || order.id}/invoice`)}
            >
              <FileText size={14} className="mr-1.5" /> Invoice
            </Button>
            <button onClick={onClose} className="p-2 hover:bg-border rounded-full text-text-secondary hover:text-text-primary transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* LEFT COLUMN: Products & Timeline */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Enterprise Timeline */}
              <div className="bg-background border border-border rounded-2xl p-5">
                <h3 className="font-bold text-text-primary mb-5 flex items-center gap-2">
                  <Truck size={16} className="text-accent" /> Order Status
                </h3>
                <div className="relative pl-4 space-y-6 before:absolute before:inset-0 before:ml-[23px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-border before:to-border">
                  {TIMELINE_STEPS.map((step, idx) => {
                    const stepIdx = orderStages.indexOf(step.status);
                    const isCompleted = currentIdx >= stepIdx || order.status === 'delivered';
                    const isCurrent = currentIdx === stepIdx || (step.status === 'delivered' && order.status === 'delivered');
                    
                    return (
                      <div key={step.status} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className={`flex items-center justify-center w-5 h-5 rounded-full border-4 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${isCompleted ? 'bg-accent border-accent-light' : 'bg-surface border-border'}`}>
                          {isCompleted && <CheckCircle size={10} className="text-white" />}
                        </div>
                        
                        <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] bg-surface border border-border p-3 rounded-xl shadow-sm">
                          <h4 className={`text-xs font-bold ${isCurrent ? 'text-accent' : 'text-text-primary'}`}>{step.label}</h4>
                          {isCompleted && <p className="text-[10px] text-text-secondary mt-0.5">Completed</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Items List */}
              <div className="bg-background border border-border rounded-2xl p-5 space-y-4">
                <h3 className="font-bold text-text-primary flex items-center gap-2">
                  <Package size={16} className="text-accent" /> Items in Order ({order.items.length})
                </h3>
                <div className="divide-y divide-border/50">
                  {order.items.map(item => (
                    <div key={item.productId} className="py-3 flex gap-4 items-start">
                      <div className="w-16 h-16 bg-surface border border-border rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" /> : <Package size={20} className="text-text-secondary" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-sm text-text-primary">{item.name}</h4>
                        <p className="text-xs text-text-secondary mt-0.5">Quantity: {item.quantity}</p>
                        <div className="flex items-center gap-2 mt-2 text-[10px]">
                          <span className="bg-surface px-2 py-1 rounded border border-border text-text-secondary">{order.shopName}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-text-primary">₹{item.price * item.quantity}</span>
                        <span className="block text-[10px] text-text-secondary mt-0.5">₹{item.price} / unit</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Summary & Delivery */}
            <div className="space-y-6">
              
              {/* Payment Summary */}
              <div className="bg-background border border-border rounded-2xl p-5">
                <h3 className="font-bold text-text-primary mb-4">Payment Summary</h3>
                <div className="space-y-2.5 text-xs text-text-secondary">
                  <div className="flex justify-between"><span>Subtotal</span><span>₹{order.subtotal || order.total}</span></div>
                  <div className="flex justify-between"><span>Tax (GST)</span><span>₹{(order.tax || 0).toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Delivery Fee</span><span>₹{order.deliveryFee || 0}</span></div>
                  {(order.discount || 0) > 0 && (
                    <div className="flex justify-between text-success"><span>Discount</span><span>-₹{order.discount}</span></div>
                  )}
                  <div className="border-t border-border pt-2.5 mt-2.5 flex justify-between items-center text-sm">
                    <span className="font-bold text-text-primary">Total Amount</span>
                    <span className="font-black text-text-primary text-lg">₹{order.total}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border/50 flex justify-between items-center text-[10px] uppercase font-bold text-text-secondary tracking-wide">
                  <span>Method: {order.paymentMethod}</span>
                  <span className={order.paymentStatus === 'paid' ? 'text-success' : 'text-warning'}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Delivery Details */}
              <div className="bg-background border border-border rounded-2xl p-5">
                <h3 className="font-bold text-text-primary mb-3 flex items-center gap-2">
                  <MapPin size={16} className="text-accent" /> Delivery Address
                </h3>
                <div className="text-xs text-text-secondary leading-relaxed bg-surface p-3 rounded-xl border border-border">
                  <p className="font-bold text-text-primary mb-1">{order.customerName}</p>
                  <p>{order.deliveryDetails?.deliveryAddress || 'Home - Sector 62, Noida, UP, 201309'}</p>
                </div>
              </div>

              {/* Rider Details if assigned */}
              {order.deliveryDetails?.riderName && (
                <div className="bg-background border border-border rounded-2xl p-5">
                  <h3 className="font-bold text-text-primary mb-3 flex items-center gap-2">
                    <Bike size={16} className="text-accent" /> Delivery Partner
                  </h3>
                  <div className="flex items-center gap-3 bg-surface p-3 rounded-xl border border-border">
                    <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center text-accent shrink-0">
                      <User size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-text-primary">{order.deliveryDetails.riderName}</p>
                      <p className="text-[10px] text-text-secondary mt-0.5">{order.deliveryDetails.riderPhone}</p>
                    </div>
                    {order.status === 'delivered' && !riderReviewSuccess && (
                      <Button onClick={() => setShowRiderReview(true)} size="sm" variant="outline" className="ml-auto text-xs h-8">Rate Rider</Button>
                    )}
                    {riderReviewSuccess && (
                      <span className="ml-auto text-xs text-success font-bold px-2">Rated!</span>
                    )}
                    <a href={`tel:${order.deliveryDetails.riderPhone}`} className={`p-2 bg-success/10 text-success rounded-full hover:bg-success/20 transition-colors ${order.status !== 'delivered' ? 'ml-auto' : ''}`}>
                      <Phone size={14} />
                    </a>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {showRiderReview && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl p-6 w-full max-w-sm animate-in zoom-in duration-200">
            <h3 className="font-bold text-lg text-text-primary mb-4">Rate your delivery partner</h3>
            <div className="flex gap-2 justify-center mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRiderRating(star)}>
                  <Star size={32} className={star <= riderRating ? "fill-warning text-warning" : "text-border"} />
                </button>
              ))}
            </div>
            <textarea
              className="w-full bg-background border border-border rounded-lg p-3 text-sm mb-4 min-h-[100px] outline-none focus:border-primary transition-colors text-text-primary"
              placeholder="Write your review... (optional)"
              value={riderComment}
              onChange={(e) => setRiderComment(e.target.value)}
            />
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowRiderReview(false)}>Cancel</Button>
              <Button onClick={submitRiderReview} className="bg-primary text-white hover:bg-primary/90 border-none" disabled={submittingRiderReview}>
                {submittingRiderReview ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
