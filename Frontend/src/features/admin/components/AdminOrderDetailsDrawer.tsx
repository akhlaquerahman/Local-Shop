import React from 'react';
import { 
  X, CheckCircle, Package, Truck, Store, MapPin, 
  Bike, FileText, User, Phone, Box, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAdminOrderById } from '../services/admin.queries';
import { Skeleton } from '@/components/ui/Skeleton';

interface AdminOrderDetailsDrawerProps {
  orderId: string;
  onClose: () => void;
}

const TIMELINE_STEPS = [
  { status: 'pending', label: 'Order Placed' },
  { status: 'accepted', label: 'Accepted' },
  { status: 'preparing', label: 'Packed' },
  { status: 'ready_for_pickup', label: 'Ready for Pickup' },
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

export const AdminOrderDetailsDrawer: React.FC<AdminOrderDetailsDrawerProps> = ({ orderId, onClose }) => {
  const { data: order, isLoading } = useAdminOrderById(orderId);

  const orderStages = ['pending', 'accepted', 'preparing', 'packed', 'ready_for_pickup', 'assigned_to_rider', 'arrived_at_pickup', 'picked_up', 'in_transit', 'arrived_at_destination', 'delivered'];
  const currentIdx = orderStages.indexOf(order?.status || 'pending');
  
  return (
    <>
      <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full md:w-[900px] bg-surface shadow-enterprise-xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header Fixed */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/50">
          <div>
            <h2 className="text-xl font-black text-text-primary">Order {order?.orderId || orderId}</h2>
            {order && <p className="text-xs text-text-secondary mt-0.5">Placed on {formatDate(order.createdAt)}</p>}
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs"
              onClick={() => window.print()}
              disabled={isLoading}
            >
              <FileText size={14} className="mr-1.5" /> Print Details
            </Button>
            <button onClick={onClose} className="p-2 hover:bg-border rounded-full text-text-secondary hover:text-text-primary transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {isLoading ? (
             <div className="space-y-4">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
             </div>
          ) : !order ? (
             <div className="flex items-center justify-center h-full text-text-secondary font-bold">
                 Order Not Found
             </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* LEFT COLUMN: Products & Timeline */}
            <div className="md:col-span-2 space-y-6">

              {/* Items List */}
              <div className="bg-background border border-border rounded-2xl p-5 space-y-4">
                <h3 className="font-bold text-text-primary flex items-center gap-2">
                  <Package size={16} className="text-accent" /> Ordered Items ({order.items?.length || 0})
                </h3>
                <div className="divide-y divide-border/50">
                  {order.items?.map((item: any, idx: number) => (
                    <div key={item.productId || idx} className="py-3 flex gap-4 items-start">
                      <div className="w-16 h-16 bg-surface border border-border rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" /> : <Package size={20} className="text-text-secondary" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-sm text-text-primary">{item.name}</h4>
                        <p className="text-xs text-text-secondary mt-0.5">Quantity: {item.quantity}</p>
                        <div className="flex items-center gap-2 mt-2 text-[10px]">
                          <span className="bg-surface px-2 py-1 rounded border border-border text-text-secondary">SKU: {item.productId?.slice(-8).toUpperCase() || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-text-primary">₹{(item.price * item.quantity).toFixed(2)}</span>
                        <span className="block text-[10px] text-text-secondary mt-0.5">₹{item.price} / unit</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Enterprise Timeline */}
              <div className="bg-background border border-border rounded-2xl p-5">
                <h3 className="font-bold text-text-primary mb-5 flex items-center gap-2">
                  <Truck size={16} className="text-accent" /> Order Status Timeline
                </h3>
                <div className="relative pl-4 space-y-6 before:absolute before:inset-0 before:ml-[23px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-border before:to-border">
                  {TIMELINE_STEPS.map((step, idx) => {
                    const stepIdx = orderStages.indexOf(step.status);
                    // Special handling to map generalized timeline steps to detailed order stages
                    let isCompleted = false;
                    let isCurrent = false;

                    if (step.status === 'delivered') {
                        isCompleted = order.status === 'delivered';
                        isCurrent = order.status === 'delivered';
                    } else if (step.status === 'preparing') {
                        isCompleted = currentIdx >= orderStages.indexOf('preparing');
                        isCurrent = order.status === 'preparing' || order.status === 'packed';
                    } else if (step.status === 'picked_up') {
                        isCompleted = currentIdx >= orderStages.indexOf('picked_up');
                        isCurrent = order.status === 'picked_up' || order.status === 'in_transit';
                    } else {
                        isCompleted = currentIdx >= stepIdx;
                        isCurrent = currentIdx === stepIdx;
                    }

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
                    <span className="font-black text-text-primary text-lg">₹{(order.total || 0).toFixed(2)}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border/50 flex justify-between items-center text-[10px] uppercase font-bold text-text-secondary tracking-wide">
                  <span>Method: {order.paymentMethod || 'UPI'}</span>
                  <span className={order.paymentStatus === 'paid' ? 'text-success' : 'text-warning'}>
                    {order.paymentStatus || 'Pending'}
                  </span>
                </div>
              </div>

              {/* Customer Details */}
              <div className="bg-background border border-border rounded-2xl p-5">
                <h3 className="font-bold text-text-primary mb-3 flex items-center gap-2">
                  <MapPin size={16} className="text-accent" /> Customer Details
                </h3>
                <div className="text-xs text-text-secondary leading-relaxed bg-surface p-3 rounded-xl border border-border">
                  <p className="font-bold text-text-primary mb-1 text-sm">{order.customerName || 'Customer'}</p>
                  {order.customerId?.phone && <p className="mb-2 text-text-primary font-medium">{order.customerId.phone}</p>}
                  <p>{order.deliveryDetails?.deliveryAddress || 'No Address Provided'}</p>
                </div>
              </div>

              {/* Seller Details */}
              <div className="bg-background border border-border rounded-2xl p-5">
                <h3 className="font-bold text-text-primary mb-3 flex items-center gap-2">
                  <Store size={16} className="text-accent" /> Seller Details
                </h3>
                <div className="text-xs text-text-secondary leading-relaxed bg-surface p-3 rounded-xl border border-border">
                  <p className="font-bold text-text-primary mb-1 text-sm">{order.shopName || 'Unknown Store'}</p>
                  <p>{order.city && order.city !== 'N/A' ? order.city : 'City not specified'}</p>
                </div>
              </div>

              {/* Rider Details if assigned */}
              <div className="bg-background border border-border rounded-2xl p-5">
                <h3 className="font-bold text-text-primary mb-3 flex items-center gap-2">
                  <Bike size={16} className="text-accent" /> Delivery Partner
                </h3>
                {order.deliveryDetails?.riderName ? (
                    <div className="flex items-center gap-3 bg-surface p-3 rounded-xl border border-border">
                        <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center text-accent shrink-0">
                        <User size={18} />
                        </div>
                        <div>
                        <p className="font-bold text-sm text-text-primary">{order.deliveryDetails.riderName}</p>
                        <p className="text-[10px] text-text-secondary mt-0.5">{order.deliveryDetails.riderPhone}</p>
                        </div>
                        <a href={`tel:${order.deliveryDetails.riderPhone}`} className="ml-auto p-2 bg-success/10 text-success rounded-full hover:bg-success/20 transition-colors">
                        <Phone size={14} />
                        </a>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-4 bg-surface rounded-xl border border-dashed border-border">
                        <Clock size={24} className="text-text-secondary mb-2" />
                        <p className="text-xs font-bold text-text-secondary">No Rider Assigned Yet</p>
                    </div>
                )}
              </div>

            </div>
          </div>
          )}
        </div>
      </div>
    </>
  );
};
