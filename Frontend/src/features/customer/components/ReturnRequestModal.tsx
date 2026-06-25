import React, { useState } from 'react';
import { X, UploadCloud, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCreateReturn } from '@/hooks/queries';
import { useNotificationStore } from '@/store/notificationStore';
import { Order } from '@/domain/order';

interface ReturnRequestModalProps {
  order: Order;
  onClose: () => void;
}

export const ReturnRequestModal: React.FC<ReturnRequestModalProps> = ({ order, onClose }) => {
  const [requestType, setRequestType] = useState('RETURN');
  const [reason, setReason] = useState('Damaged Product');
  const [description, setDescription] = useState('');
  const [refundMethod, setRefundMethod] = useState('WALLET');
  const [images, setImages] = useState<string[]>([]);
  
  const { addToast } = useNotificationStore();
  const createReturnMutation = useCreateReturn();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (images.length + files.length > 5) {
      addToast({ title: 'Limit Exceeded', message: 'Maximum 5 images allowed.', type: 'warning' });
      return;
    }

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim().length < 20) {
      addToast({ title: 'Invalid Description', message: 'Please provide at least 20 characters.', type: 'warning' });
      return;
    }

    createReturnMutation.mutate({
      orderId: order.orderId || order.id,
      requestType,
      reason,
      description,
      refundMethod: requestType === 'RETURN' ? refundMethod : undefined,
      evidenceImages: images
    }, {
      onSuccess: () => {
        addToast({ title: 'Request Submitted', message: `Your ${requestType.toLowerCase()} request has been submitted.`, type: 'success' });
        onClose();
      },
      onError: (err: any) => {
        addToast({ title: 'Request Failed', message: err.message || 'Failed to submit request', type: 'danger' });
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="max-w-md w-full bg-surface border border-border rounded-xl shadow-enterprise-lg p-5 space-y-4 relative animate-in zoom-in-95 duration-200 text-left overflow-y-auto max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:bg-border rounded text-text-secondary">
          <X size={16} />
        </button>
        <div className="border-b border-border pb-3">
          <h3 className="font-extrabold text-lg text-text-primary">Return / Replace Order</h3>
          <p className="text-xs text-text-secondary mt-1">Order #{order.orderId || order.id}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-text-secondary">Request Type</label>
            <select value={requestType} onChange={e => setRequestType(e.target.value)} className="w-full border border-border bg-background p-2.5 rounded-lg text-sm focus:outline-none focus:border-accent text-text-primary font-medium">
              <option value="RETURN">Return</option>
              <option value="REPLACEMENT">Replacement</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-text-secondary">Reason</label>
            <select value={reason} onChange={e => setReason(e.target.value)} className="w-full border border-border bg-background p-2.5 rounded-lg text-sm focus:outline-none focus:border-accent text-text-primary font-medium">
              <option value="Damaged Product">Damaged Product</option>
              <option value="Wrong Product">Wrong Product</option>
              <option value="Missing Item">Missing Item</option>
              <option value="Quality Issue">Quality Issue</option>
              <option value="Expired Product">Expired Product</option>
              <option value="Product Not Working">Product Not Working</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {requestType === 'RETURN' && (
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-text-secondary">Refund Method</label>
              <select value={refundMethod} onChange={e => setRefundMethod(e.target.value)} className="w-full border border-border bg-background p-2.5 rounded-lg text-sm focus:outline-none focus:border-accent text-text-primary font-medium">
                <option value="WALLET">Local Shop Wallet (Instant)</option>
                <option value="ORIGINAL_PAYMENT">Original Payment Method</option>
                <option value="UPI">UPI Transfer</option>
                <option value="BANK_ACCOUNT">Bank Account</option>
              </select>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-text-secondary">Detailed Description <span className="text-danger">*</span></label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Minimum 20 characters..."
              className="w-full border border-border bg-background p-2.5 rounded-lg text-sm focus:outline-none focus:border-accent text-text-primary placeholder:text-text-secondary/50 resize-none"
              required
              minLength={20}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-text-secondary flex justify-between">
              <span>Upload Evidence (Images/Video)</span>
              <span>{images.length}/5</span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {images.map((img, idx) => (
                <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border group">
                  <img src={img} alt="Preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(idx)} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={16} className="text-white" />
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <label className="w-16 h-16 rounded-lg border-2 border-dashed border-border hover:border-accent bg-background/50 flex flex-col items-center justify-center cursor-pointer text-text-secondary hover:text-accent transition-colors">
                  <UploadCloud size={20} />
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                </label>
              )}
            </div>
            <p className="text-[10px] text-text-secondary flex items-center gap-1"><AlertCircle size={10} /> Max 5 files to help verify your claim.</p>
          </div>

          <div className="flex gap-2.5 pt-4 border-t border-border">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-accent hover:bg-accent-hover text-white" disabled={createReturnMutation.isPending}>
              {createReturnMutation.isPending ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
