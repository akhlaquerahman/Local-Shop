import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MapPin, Plus, CheckCircle, Tag, Info, ShoppingBag } from 'lucide-react';
import { useAddresses, useCart, useCartSummary } from '@/hooks/queries';
import { useBuyNowStore } from '@/store/buyNowStore';
import { Button } from '@/components/ui/Button';
import { useNotificationStore } from '@/store/notificationStore';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { mode?: 'buy-now' | 'cart' } | null;
  const mode = state?.mode || 'cart';

  const { addToast } = useNotificationStore();

  const { data: addresses = [], isLoading: addressesLoading } = useAddresses();
  const defaultAddress = addresses.find((a: any) => a.isDefault) || addresses[0];
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(defaultAddress?.id || defaultAddress?._id || null);

  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);

  // Data Sources
  const { data: cartData, isLoading: cartLoading } = useCart();
  const cartSummary = useCartSummary();
  const { session } = useBuyNowStore();

  const isBuyNow = mode === 'buy-now' && session !== null;
  
  const items = isBuyNow ? [session!.item] : (cartData?.items || []);
  const shopId = isBuyNow ? session!.shopId : (cartData?.shopId || '');
  const shopName = isBuyNow ? session!.shopName : (cartData?.shopName || 'Local Shop');
  
  const subtotal = isBuyNow 
    ? (session!.item.price * session!.item.quantity) 
    : (cartData?.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0) || 0);
  
  const tax = subtotal * 0.05; // 5% GST
  const deliveryFee = subtotal > 500 ? 0 : 40;
  const platformFee = 5;
  const total = subtotal + tax + deliveryFee + platformFee - discount;

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === 'WELCOME50') {
      setDiscount(50);
      addToast({ title: 'Coupon Applied', message: '₹50 discount applied to your order', type: 'success' });
    } else {
      addToast({ title: 'Invalid Coupon', message: 'The coupon code is invalid or expired', type: 'error' });
    }
  };

  const handleContinue = () => {
    if (!selectedAddressId) {
      addToast({ title: 'Address Required', message: 'Please select a delivery address', type: 'error' });
      return;
    }
    
    if (items.length === 0) {
      addToast({ title: 'Cart Empty', message: 'Please add items to your cart', type: 'error' });
      return;
    }

    const selectedAddress = addresses.find((a: any) => (a.id || a._id) === selectedAddressId);
    const addressString = `${selectedAddress?.addressLine1}, ${selectedAddress?.city}`;

    // Navigate to payment with full state
    navigate('/app/checkout/payment', {
      state: {
        mode,
        shopId,
        shopName,
        items,
        addressId: selectedAddressId,
        deliveryAddress: addressString,
        subtotal,
        tax,
        deliveryFee,
        discount,
        total
      }
    });
  };

  if ((!isBuyNow && cartLoading) || addressesLoading) {
    return <div className="p-8 text-center text-text-secondary">Loading checkout details...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20 space-y-4">
        <ShoppingBag size={48} className="mx-auto text-border" />
        <h2 className="text-xl font-bold text-text-primary">No items to checkout</h2>
        <Button onClick={() => navigate('/app')}>Continue Shopping</Button>
      </div>
    );
  }

  return (
    <div className="pb-24 text-left max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-surface text-text-secondary">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Checkout</h1>
      </div>

      {/* 1. Address Selection */}
      <section className="bg-surface border border-border p-5 rounded-xl space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
            <MapPin size={16} className="text-accent" /> Delivery Address
          </h2>
          <Button variant="outline" size="sm" onClick={() => navigate('/app/addresses')} className="text-xs h-8">
            <Plus size={14} className="mr-1" /> Add New
          </Button>
        </div>

        {addresses.length === 0 ? (
          <div className="p-4 border border-dashed border-danger/30 bg-danger/5 rounded-lg text-center text-xs text-danger">
            No saved addresses found. Please add an address to continue.
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((address: any) => {
              const id = address.id || address._id;
              const isSelected = selectedAddressId === id;
              return (
                <div 
                  key={id}
                  onClick={() => setSelectedAddressId(id)}
                  className={`p-4 border rounded-xl cursor-pointer transition-all flex items-start gap-3 ${isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-text-secondary/30'}`}
                >
                  <div className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-primary' : 'border-text-secondary/50'}`}>
                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-text-primary">{address.addressType || 'Home'}</span>
                      {address.isDefault && <span className="text-[10px] bg-accent/10 text-accent px-1.5 py-0.5 rounded font-bold">DEFAULT</span>}
                    </div>
                    <p className="text-xs text-text-secondary mt-1">{address.addressLine1}, {address.addressLine2 && `${address.addressLine2}, `}{address.city}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{address.recipientName} • {address.phone}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 2. Order Items */}
      <section className="bg-surface border border-border p-5 rounded-xl space-y-4 shadow-sm">
        <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
          <ShoppingBag size={16} className="text-accent" /> Order Items
        </h2>
        <div className="text-xs text-text-secondary mb-2">Sold by: <span className="font-bold text-text-primary">{shopName}</span></div>
        <div className="space-y-3">
          {items.map((item: any, index: number) => (
            <div key={item.productId || item._id || item.id || `item-${index}`} className="flex items-center gap-3 p-3 border border-border/50 rounded-lg bg-background">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} className="w-12 h-12 object-cover rounded" />
              ) : (
                <div className="w-12 h-12 bg-surface flex items-center justify-center rounded"><ShoppingBag size={16} className="text-text-secondary/50" /></div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-text-primary truncate">{item.name}</h4>
                <div className="text-xs text-text-secondary mt-0.5">Qty: {item.quantity}</div>
              </div>
              <div className="text-sm font-extrabold text-text-primary">
                ₹{(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Coupon */}
      <section className="bg-surface border border-border p-5 rounded-xl space-y-4 shadow-sm">
        <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
          <Tag size={16} className="text-accent" /> Offers & Benefits
        </h2>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Enter coupon code" 
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            className="flex-1 h-10 px-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary uppercase"
            disabled={discount > 0}
          />
          {discount > 0 ? (
            <Button variant="outline" className="h-10 text-danger border-danger/30 hover:bg-danger/5" onClick={() => { setDiscount(0); setCouponCode(''); }}>Remove</Button>
          ) : (
            <Button className="h-10 bg-accent text-white" onClick={handleApplyCoupon} disabled={!couponCode}>Apply</Button>
          )}
        </div>
      </section>

      {/* 4. Order Summary */}
      <section className="bg-surface border border-border p-5 rounded-xl space-y-4 shadow-sm">
        <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">Bill Details</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-text-secondary">
            <span>Item Total</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-text-secondary">
            <span>Delivery Fee</span>
            <span>{deliveryFee === 0 ? <span className="text-success font-bold">FREE</span> : `₹${deliveryFee.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between text-text-secondary">
            <span className="flex items-center gap-1">Taxes (GST) <Info size={12} className="text-text-secondary/50"/></span>
            <span>₹{tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-text-secondary">
            <span>Platform Fee</span>
            <span>₹{platformFee.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-success font-bold">
              <span>Item Discount</span>
              <span>-₹{discount.toFixed(2)}</span>
            </div>
          )}
          <div className="border-t border-border/50 pt-3 mt-3 flex justify-between font-extrabold text-base text-text-primary">
            <span>To Pay</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>
      </section>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-surface border-t border-border shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-50">
        <div className="max-w-3xl mx-auto">
          <Button 
            className="w-full h-14 text-base font-bold shadow-enterprise bg-primary text-white hover:bg-primary/90"
            onClick={handleContinue}
            disabled={!selectedAddressId || items.length === 0}
          >
            Continue to Payment <span className="ml-2 font-normal opacity-80">|</span> <span className="ml-2">₹{total.toFixed(2)}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
