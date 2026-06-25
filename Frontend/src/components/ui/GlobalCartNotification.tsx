import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartNotificationStore } from '@/store/cartNotificationStore';

export const GlobalCartNotification: React.FC = () => {
  const { notification, hideNotification } = useCartNotificationStore();
  const navigate = useNavigate();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      hideNotification();
    }, 4000);
  };

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    if (notification?.visible) {
      startTimer();
    }
    return () => clearTimer();
  }, [notification?.productName, notification?.quantity, notification?.visible]);

  if (!notification || !notification.visible) return null;

  return (
    <div
      onMouseEnter={clearTimer}
      onMouseLeave={startTimer}
      className="fixed bottom-20 md:bottom-6 right-1/2 translate-x-1/2 md:right-6 md:translate-x-0 w-[90%] md:w-80 bg-surface border border-border shadow-enterprise-lg rounded-xl p-3.5 z-[100] animate-in fade-in slide-in-from-bottom duration-300 transition-all text-left flex flex-col gap-2.5"
      role="status"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-border/50">
        <span className="text-[10px] font-bold text-success uppercase tracking-wider flex items-center gap-1.5">
          <ShoppingBag size={12} className="text-success" /> Product Added to Cart
        </span>
        <button
          onClick={hideNotification}
          className="p-1 hover:bg-border/40 text-text-secondary hover:text-danger rounded transition-colors"
          aria-label="Close notification"
        >
          <X size={13} />
        </button>
      </div>

      {/* Details */}
      <div className="space-y-0.5">
        <h4 className="text-xs font-bold text-text-primary line-clamp-1 pr-6">{notification.productName}</h4>
        <p className="text-[10px] text-text-secondary font-medium">Quantity added: {notification.quantity}</p>
        <p className="text-[11px] text-text-primary font-bold mt-1">Cart Total: ₹{notification.cartTotal.toFixed(0)}</p>
      </div>

      {/* CTA */}
      <button
        onClick={() => {
          hideNotification();
          navigate('/app/cart');
        }}
        className="w-full h-8 flex items-center justify-center gap-1.5 bg-accent text-white hover:bg-accent/90 text-xs font-bold rounded-lg shadow-sm transition-all"
      >
        <span>View Cart</span>
        <ArrowRight size={13} />
      </button>
    </div>
  );
};

export default GlobalCartNotification;
