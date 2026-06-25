import React, { useState } from 'react';
import { CreditCard, Wallet, Smartphone, Plus, Trash2, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNotificationStore } from '@/store/notificationStore';
import { usePaymentMethods, useDeletePaymentMethod, useSetDefaultPaymentMethod, useAddPaymentMethod } from '@/hooks/queries';

export const PaymentsPage: React.FC = () => {
  const { addToast } = useNotificationStore();
  const { data: payments, isLoading } = usePaymentMethods();
  const deleteMutation = useDeletePaymentMethod();
  const defaultMutation = useSetDefaultPaymentMethod();
  const addMutation = useAddPaymentMethod();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPayment, setNewPayment] = useState({ provider: 'card', maskedNumber: '', expiry: '', cardHolderName: '' });

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove this payment method?')) return;
    try {
      await deleteMutation.mutateAsync(id);
      addToast({ title: 'Removed', message: 'Payment method removed.', type: 'success' });
    } catch (err) {
      addToast({ title: 'Error', message: 'Failed to remove payment method.', type: 'error' });
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await defaultMutation.mutateAsync(id);
      addToast({ title: 'Updated', message: 'Default payment method updated.', type: 'success' });
    } catch (err) {
      addToast({ title: 'Error', message: 'Failed to set default.', type: 'error' });
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'upi': return <Smartphone size={24} />;
      case 'wallet': return <Wallet size={24} />;
      default: return <CreditCard size={24} />;
    }
  };

  const handleSave = async () => {
    if (!newPayment.maskedNumber) {
      addToast({ title: 'Error', message: 'Please enter card/upi details', type: 'error' });
      return;
    }
    let masked = newPayment.maskedNumber;
    if (newPayment.provider === 'card') {
      masked = '**** **** **** ' + newPayment.maskedNumber.slice(-4);
    }
    
    try {
      await addMutation.mutateAsync({ ...newPayment, maskedNumber: masked });
      addToast({ title: 'Success', message: 'Payment method added.', type: 'success' });
      setIsModalOpen(false);
      setNewPayment({ provider: 'card', maskedNumber: '', expiry: '', cardHolderName: '' });
    } catch (err) {
      addToast({ title: 'Error', message: 'Failed to add payment method.', type: 'error' });
    }
  };

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight flex items-center gap-3">
            <CreditCard size={28} className="text-accent" /> Payment Methods
          </h1>
          <p className="text-sm text-text-secondary mt-1">Manage your saved cards, UPI, and wallets</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-accent text-white shadow-sm flex items-center gap-2">
          <Plus size={16} /> Add New
        </Button>
      </div>

      <div className="bg-success/10 border border-success/20 rounded-xl p-4 flex gap-3 items-start shadow-sm">
        <ShieldCheck size={20} className="text-success mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="text-sm font-bold text-success">100% Secure Payments</h4>
          <p className="text-xs text-success/80 mt-1">Your card details are tokenized and encrypted. We do not store your full card number or CVV.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-surface border border-border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : payments?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {payments.map((method: any) => (
            <div key={method._id} className={`bg-surface border rounded-xl p-5 flex flex-col justify-between transition-all hover:shadow-md ${method.isDefault ? 'border-accent ring-1 ring-accent/20' : 'border-border'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-10 rounded bg-background border border-border flex items-center justify-center text-text-secondary">
                    {getProviderIcon(method.provider)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-primary uppercase tracking-wide">{method.provider}</p>
                    {method.isDefault && <span className="text-[10px] font-extrabold text-accent uppercase tracking-wider">Default</span>}
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-lg font-mono text-text-primary tracking-widest">{method.maskedNumber}</p>
                {method.expiry && <p className="text-xs text-text-secondary mt-1">Expires: {method.expiry}</p>}
                {method.cardHolderName && <p className="text-xs font-semibold text-text-primary mt-1">{method.cardHolderName}</p>}
              </div>

              <div className="flex gap-2 pt-3 border-t border-border mt-auto">
                {!method.isDefault && (
                  <Button variant="outline" size="sm" onClick={() => handleSetDefault(method._id)} className="flex-1 text-xs h-8 border-border">Set Default</Button>
                )}
                <Button variant="outline" size="sm" onClick={() => handleDelete(method._id)} className="px-3 h-8 border-border text-text-secondary hover:bg-danger/10 hover:text-danger hover:border-danger/30 ml-auto"><Trash2 size={14} /></Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-surface border border-dashed border-border rounded-xl">
          <CreditCard size={48} className="text-text-secondary/20 mb-4" />
          <h2 className="text-lg font-bold text-text-primary">No payment methods</h2>
          <p className="text-sm text-text-secondary mt-1 text-center max-w-sm mb-4">Save a card or UPI ID for faster checkouts.</p>
        </div>
      )}

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl w-full max-w-sm shadow-xl border border-border overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border flex justify-between items-center bg-background">
              <h3 className="font-bold text-text-primary">Add Payment Method</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-text-secondary hover:text-danger"><Plus size={20} className="rotate-45" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {['card', 'upi', 'wallet'].map(type => (
                  <button key={type} onClick={() => setNewPayment({...newPayment, provider: type})} className={`py-2 rounded-lg text-xs font-bold border capitalize transition-colors ${newPayment.provider === type ? 'bg-accent/10 border-accent text-accent' : 'border-border text-text-secondary hover:border-text-primary'}`}>
                    {type}
                  </button>
                ))}
              </div>
              
              {newPayment.provider === 'card' ? (
                <>
                  <input type="text" placeholder="Card Number" value={newPayment.maskedNumber} onChange={e => setNewPayment({...newPayment, maskedNumber: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-accent focus:outline-none" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="MM/YY" value={newPayment.expiry} onChange={e => setNewPayment({...newPayment, expiry: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-accent focus:outline-none" />
                    <input type="text" placeholder="CVV" className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-accent focus:outline-none" />
                  </div>
                  <input type="text" placeholder="Card Holder Name" value={newPayment.cardHolderName} onChange={e => setNewPayment({...newPayment, cardHolderName: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-accent focus:outline-none" />
                </>
              ) : (
                <input type="text" placeholder={`${newPayment.provider.toUpperCase()} ID / Number`} value={newPayment.maskedNumber} onChange={e => setNewPayment({...newPayment, maskedNumber: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-accent focus:outline-none" />
              )}
            </div>
            <div className="p-4 border-t border-border bg-background flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button className="flex-1 bg-accent" onClick={handleSave} disabled={addMutation.isPending}>{addMutation.isPending ? 'Saving...' : 'Save'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;
