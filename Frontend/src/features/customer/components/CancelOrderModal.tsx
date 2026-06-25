import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNotificationStore } from '@/store/notificationStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Order } from '@/domain/order';

interface CancelOrderModalProps {
  order: Order;
  onClose: () => void;
}

export const CancelOrderModal: React.FC<CancelOrderModalProps> = ({ order, onClose }) => {
  const [reason, setReason] = useState('Ordered by mistake');
  const [description, setDescription] = useState('');
  const [refundMethod, setRefundMethod] = useState('WALLET');
  
  const { addToast } = useNotificationStore();
  const queryClient = useQueryClient();

  const cancelOrderMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/v1/returns/cancellations', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      addToast({ title: 'Order Cancelled', message: 'Your order has been cancelled successfully.', type: 'success' });
      onClose();
    },
    onError: (err: any) => {
      addToast({ title: 'Cancellation Failed', message: err.response?.data?.message || err.message, type: 'danger' });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    cancelOrderMutation.mutate({
      orderId: order.orderId || order.id,
      reason,
      description,
      refundMethod
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="max-w-md w-full bg-surface border border-border rounded-xl shadow-enterprise-lg p-5 space-y-4 relative animate-in zoom-in-95 duration-200 text-left overflow-y-auto max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:bg-border rounded text-text-secondary">
          <X size={16} />
        </button>
        <div className="border-b border-border pb-3">
          <h3 className="font-extrabold text-lg text-text-primary">Cancel Order</h3>
          <p className="text-xs text-text-secondary mt-1">Order #{order.orderId || order.id}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-text-secondary">Reason</label>
            <select value={reason} onChange={e => setReason(e.target.value)} className="w-full border border-border bg-background p-2.5 rounded-lg text-sm focus:outline-none focus:border-accent text-text-primary font-medium">
              <option value="Ordered by mistake">Ordered by mistake</option>
              <option value="Found cheaper elsewhere">Found cheaper elsewhere</option>
              <option value="Delivery taking too long">Delivery taking too long</option>
              <option value="Duplicate order">Duplicate order</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-text-secondary">Comments (Optional)</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              placeholder="Any additional details..."
              className="w-full border border-border bg-background p-2.5 rounded-lg text-sm focus:outline-none focus:border-accent text-text-primary placeholder:text-text-secondary/50 resize-none"
            />
          </div>

          <div className="space-y-1 bg-background/50 p-3 rounded-lg border border-border mt-2">
            <h4 className="text-sm font-bold text-text-primary mb-2">Refund Summary</h4>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-text-secondary">Expected Refund</span>
              <span className="font-bold text-text-primary">₹{order.total}</span>
            </div>
            {order.paymentMethod !== 'cod' && (
              <div className="mt-3 space-y-1">
                <label className="text-xs font-bold uppercase text-text-secondary">Refund To</label>
                <select value={refundMethod} onChange={e => setRefundMethod(e.target.value)} className="w-full border border-border bg-background p-2 rounded-md text-xs focus:outline-none focus:border-accent text-text-primary">
                  <option value="WALLET">Local Shop Wallet (Instant)</option>
                  <option value="ORIGINAL_PAYMENT">Original Payment Method</option>
                </select>
              </div>
            )}
            {order.paymentMethod === 'cod' && (
              <p className="text-[10px] text-text-secondary mt-2 flex items-center gap-1">
                <AlertCircle size={10} /> No refund required for COD orders.
              </p>
            )}
          </div>

          <div className="flex gap-2.5 pt-4 border-t border-border">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Go Back
            </Button>
            <Button type="submit" className="flex-1 bg-danger hover:bg-danger/90 text-white border-transparent" disabled={cancelOrderMutation.isPending}>
              {cancelOrderMutation.isPending ? 'Cancelling...' : 'Confirm Cancellation'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
