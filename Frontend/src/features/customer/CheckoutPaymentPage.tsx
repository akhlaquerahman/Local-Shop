import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CreditCard, Wallet, Banknote, Smartphone, CheckCircle, ShieldCheck } from 'lucide-react';
import { useWallet, usePaymentMethods, useCreateOrder, useCartStore } from '@/hooks/queries'; // Wait, useCartStore is not from queries. I'll import from store directly
import { useNotificationStore } from '@/store/notificationStore';
import { Button } from '@/components/ui/Button';
import { useBuyNowStore } from '@/store/buyNowStore';
import { useCartStore as useZustandCartStore } from '@/store/cartStore';

export const CheckoutPaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as any;
  const { addToast } = useNotificationStore();
  const { clearSession } = useBuyNowStore();
  const { clearCart } = useZustandCartStore();

  const [selectedMethod, setSelectedMethod] = useState<string>('COD');
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: wallet } = useWallet();
  const { data: paymentMethods = [] } = usePaymentMethods();
  const createOrderMutation = useCreateOrder();

  if (!state || !state.items) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold">Invalid Session</h2>
        <Button onClick={() => navigate('/app')} className="mt-4">Back to Home</Button>
      </div>
    );
  }

  const { mode, shopId, shopName, items, addressId, deliveryAddress, subtotal, tax, deliveryFee, discount, total } = state;

  const handlePay = async () => {
    setIsProcessing(true);
    
    // Simulate payment gateway delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const orderData = {
        shopId: shopId || 'shop-1',
        shopName: shopName || 'Local Shop',
        subtotal: subtotal || 0,
        tax: tax || 0,
        deliveryFee: deliveryFee || 0,
        discount: discount || 0,
        total: total || 0,
        items: items || [],
        deliveryAddress: deliveryAddress || 'Home',
        paymentMethod: selectedMethod || 'COD'
      };

      const result = await createOrderMutation.mutateAsync(orderData);
      
      // Clear sessions
      if (mode === 'buy-now') {
        clearSession();
      } else {
        clearCart();
      }

      addToast({ title: 'Order Placed!', message: 'Payment successful.', type: 'success' });
      navigate('/app/checkout/success', { state: { orderId: result.orderId || result.id || 'ORD-SUCCESS', total, deliveryAddress, paymentMethod: selectedMethod } });
    } catch (err) {
      addToast({ title: 'Payment Failed', message: 'Could not process your order. Try again.', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const walletBalance = wallet?.balance || 0;
  const canUseWallet = walletBalance >= total;

  return (
    <div className="pb-24 text-left max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-surface text-text-secondary" disabled={isProcessing}>
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Payment</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Payment Options */}
        <div className="md:col-span-2 space-y-4">
          <section className="bg-surface border border-border p-5 rounded-xl space-y-4 shadow-sm">
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck size={16} className="text-success" /> Select Payment Method
            </h2>
            
            <div className="space-y-3">
              {/* Wallet Option */}
              <label className={`block p-4 border rounded-xl cursor-pointer transition-all flex items-start gap-3 ${selectedMethod === 'WALLET' ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-text-secondary/30'} ${!canUseWallet && 'opacity-60 grayscale'}`}>
                <div className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-full border flex items-center justify-center ${selectedMethod === 'WALLET' ? 'border-primary' : 'border-text-secondary/50'}`}>
                  {selectedMethod === 'WALLET' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </div>
                <Wallet size={20} className={selectedMethod === 'WALLET' ? 'text-primary' : 'text-text-secondary'} />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="text-sm font-bold text-text-primary">Local Shop Wallet</span>
                    <span className="text-sm font-bold">₹{walletBalance.toFixed(2)}</span>
                  </div>
                  {canUseWallet ? (
                    <p className="text-xs text-text-secondary mt-1">Pay instantly using your balance</p>
                  ) : (
                    <p className="text-xs text-danger mt-1">Insufficient balance. Add ₹{(total - walletBalance).toFixed(2)}</p>
                  )}
                </div>
                <input type="radio" name="payment" className="hidden" disabled={!canUseWallet} checked={selectedMethod === 'WALLET'} onChange={() => setSelectedMethod('WALLET')} />
              </label>

              {/* UPI Options */}
              {paymentMethods.filter((m: any) => m.provider === 'upi').map((method: any) => (
                <label key={method.id || method._id} className={`block p-4 border rounded-xl cursor-pointer transition-all flex items-start gap-3 ${selectedMethod === `UPI-${method.id || method._id}` ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-text-secondary/30'}`}>
                  <div className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-full border flex items-center justify-center ${selectedMethod === `UPI-${method.id || method._id}` ? 'border-primary' : 'border-text-secondary/50'}`}>
                    {selectedMethod === `UPI-${method.id || method._id}` && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                  </div>
                  <Smartphone size={20} className={selectedMethod === `UPI-${method.id || method._id}` ? 'text-primary' : 'text-text-secondary'} />
                  <div className="flex-1">
                    <span className="text-sm font-bold text-text-primary">{method.maskedNumber}</span>
                    <p className="text-xs text-text-secondary mt-1">UPI ID</p>
                  </div>
                  <input type="radio" name="payment" className="hidden" checked={selectedMethod === `UPI-${method.id || method._id}`} onChange={() => setSelectedMethod(`UPI-${method.id || method._id}`)} />
                </label>
              ))}

              {/* Card Options */}
              {paymentMethods.filter((m: any) => m.provider === 'card').map((method: any) => (
                <label key={method.id || method._id} className={`block p-4 border rounded-xl cursor-pointer transition-all flex items-start gap-3 ${selectedMethod === `CARD-${method.id || method._id}` ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-text-secondary/30'}`}>
                  <div className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-full border flex items-center justify-center ${selectedMethod === `CARD-${method.id || method._id}` ? 'border-primary' : 'border-text-secondary/50'}`}>
                    {selectedMethod === `CARD-${method.id || method._id}` && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                  </div>
                  <CreditCard size={20} className={selectedMethod === `CARD-${method.id || method._id}` ? 'text-primary' : 'text-text-secondary'} />
                  <div className="flex-1">
                    <span className="text-sm font-bold text-text-primary">{method.maskedNumber}</span>
                    <p className="text-xs text-text-secondary mt-1">Expires {method.expiry}</p>
                  </div>
                  <input type="radio" name="payment" className="hidden" checked={selectedMethod === `CARD-${method.id || method._id}`} onChange={() => setSelectedMethod(`CARD-${method.id || method._id}`)} />
                </label>
              ))}

              {/* Cash On Delivery */}
              <label className={`block p-4 border rounded-xl cursor-pointer transition-all flex items-start gap-3 ${selectedMethod === 'COD' ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-text-secondary/30'}`}>
                <div className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-full border flex items-center justify-center ${selectedMethod === 'COD' ? 'border-primary' : 'border-text-secondary/50'}`}>
                  {selectedMethod === 'COD' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </div>
                <Banknote size={20} className={selectedMethod === 'COD' ? 'text-primary' : 'text-text-secondary'} />
                <div className="flex-1">
                  <span className="text-sm font-bold text-text-primary">Cash On Delivery</span>
                  <p className="text-xs text-text-secondary mt-1">Pay with cash when your order arrives</p>
                </div>
                <input type="radio" name="payment" className="hidden" checked={selectedMethod === 'COD'} onChange={() => setSelectedMethod('COD')} />
              </label>

            </div>
          </section>
        </div>

        {/* Right: Summary */}
        <div className="md:col-span-1">
          <section className="bg-surface border border-border p-5 rounded-xl space-y-4 shadow-sm sticky top-6">
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">Amount Payable</h2>
            <div className="text-3xl font-extrabold text-primary">
              ₹{total.toFixed(2)}
            </div>
            
            <div className="border-t border-border/50 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-text-secondary">
                <span>Items ({items.length})</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Taxes & Fees</span>
                <span>₹{(tax + deliveryFee + 5).toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}
            </div>

            <Button 
              className="w-full h-12 mt-4 text-base shadow-enterprise bg-primary text-white hover:bg-primary/90" 
              onClick={handlePay}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : `Pay ₹${total.toFixed(2)}`}
            </Button>
            <p className="text-[10px] text-center text-text-secondary mt-2 flex items-center justify-center gap-1">
              <ShieldCheck size={10} /> Secure checkout process
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPaymentPage;
