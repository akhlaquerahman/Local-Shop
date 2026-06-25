import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Package, Download, ShoppingBag, MapPin, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const OrderSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as any;

  // If someone navigates here manually without state, send them home
  useEffect(() => {
    if (!state) {
      navigate('/app', { replace: true });
    }
  }, [state, navigate]);

  if (!state) return null;

  const { orderId, total, deliveryAddress, paymentMethod } = state;

  return (
    <div className="pb-24 text-center max-w-lg mx-auto space-y-8 mt-10">
      
      {/* Success Animation Container */}
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center mb-2 shadow-[0_0_40px_rgba(34,197,94,0.3)]">
          <CheckCircle size={48} className="text-success" />
        </div>
        <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Order Confirmed!</h1>
        <p className="text-sm text-text-secondary">
          Thank you for your purchase. Your order has been placed successfully.
        </p>
      </div>

      {/* Order Details Card */}
      <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm space-y-4 text-left">
        <div className="flex items-center justify-between border-b border-border/50 pb-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Order ID</span>
            <div className="text-sm font-bold text-text-primary">{orderId}</div>
          </div>
          <div className="space-y-1 text-right">
            <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Total Amount</span>
            <div className="text-sm font-extrabold text-primary">₹{total?.toFixed(2)}</div>
          </div>
        </div>

        <div className="flex items-start gap-3 py-2">
          <MapPin size={18} className="text-text-secondary mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-xs font-bold text-text-primary">Delivery Address</div>
            <div className="text-[11px] text-text-secondary mt-1 leading-relaxed">
              {deliveryAddress}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 py-2">
          <CreditCard size={18} className="text-text-secondary mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-xs font-bold text-text-primary">Payment Method</div>
            <div className="text-[11px] text-text-secondary mt-1 uppercase">
              {paymentMethod?.includes('-') ? paymentMethod.split('-')[0] : paymentMethod}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3 pt-4">
        <Button 
          className="w-full h-14 text-base font-bold shadow-enterprise bg-primary text-white hover:bg-primary/90 flex items-center justify-center gap-2"
          onClick={() => navigate(`/app/orders`)}
        >
          <Package size={18} /> Track Order
        </Button>
        <Button 
          variant="outline"
          className="w-full h-14 text-base font-bold flex items-center justify-center gap-2 border-border text-text-secondary hover:text-text-primary"
          onClick={() => navigate('/app')}
        >
          <ShoppingBag size={18} /> Continue Shopping
        </Button>
        <Button 
          variant="ghost"
          className="w-full h-12 text-sm text-accent hover:bg-accent/10 flex items-center justify-center gap-2 mt-2"
          onClick={() => {}}
        >
          <Download size={16} /> Download Invoice
        </Button>
      </div>

    </div>
  );
};

export default OrderSuccessPage;
