import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Plus, Minus, Trash2, Tag,
  Package, Truck, AlertCircle, Store, Heart, Zap, ArrowRight, X, CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNotificationStore } from '@/store/notificationStore';
import { useCartNotificationStore } from '@/store/cartNotificationStore';
import { trackAnalyticsEvent } from '@/utils/analytics';
import { api } from '@/lib/axios';
import {
  useCart,
  useUpdateCartQty,
  useRemoveCartItem,
  useClearCart,
  useCartSummary,
  useApplyCoupon,
  useAddWishlist,
  useRecommendations,
  useCreateOrder
} from '@/hooks/queries';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useNotificationStore();
  const { showNotification } = useCartNotificationStore();

  const { data: cartData, isLoading } = useCart();
  const { data: recommendedProducts = [] } = useRecommendations();

  const updateCartQtyMutation = useUpdateCartQty();
  const removeCartItemMutation = useRemoveCartItem();
  const clearCartMutation = useClearCart();
  const applyCouponMutation = useApplyCoupon();
  const addWishlistMutation = useAddWishlist();
  const createOrderMutation = useCreateOrder();

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const items = cartData?.items || [];
  const shopName = cartData?.shopName || 'Store';
  const shopId = cartData?.shopId || '';

  const totals = useCartSummary();

  const couponDiscount = appliedCoupon
    ? appliedCoupon.type === 'percent'
      ? Math.round(totals.subtotal * appliedCoupon.discount / 100)
      : appliedCoupon.discount
    : 0;

  const finalTotal = Math.round(Math.max(0, totals.total - couponDiscount) * 100) / 100;

  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) { setCouponError('Please enter a coupon code.'); return; }
    
    applyCouponMutation.mutate({ code, subtotal: totals.subtotal }, {
      onSuccess: (data) => {
        setAppliedCoupon(data);
        setCouponInput('');
        setCouponError('');
        addToast({ title: 'Coupon Applied! 🎉', message: data.description || 'Discount applied', type: 'success' });
      },
      onError: (error: any) => {
        setCouponError(error.response?.data?.error || 'Invalid or expired coupon code.');
      }
    });
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
    addToast({ title: 'Coupon Removed', message: 'Coupon code has been removed.', type: 'info' });
  };

  const handleSaveForLater = (productId: string, name: string) => {
    addWishlistMutation.mutate(productId, {
      onSuccess: () => {
        removeCartItemMutation.mutate(productId, {
          onSuccess: () => {
            addToast({ title: 'Saved for Later', message: `${name} moved to your wishlist.`, type: 'info' });
          }
        });
      }
    });
  };

  const handleCheckout = () => {
    setIsCheckingOut(true);
    trackAnalyticsEvent('CHECKOUT_INITIATED', { total: finalTotal, itemCount: items.length });
    
    createOrderMutation.mutate({
      shopId,
      shopName,
      subtotal: totals.subtotal,
      tax: totals.tax,
      deliveryFee: totals.deliveryFee,
      discount: couponDiscount,
      total: finalTotal,
      items: items.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl
      })),
      deliveryAddress: 'Flat 402, Block A, Green Meadows Apartments, Noida'
    }, {
      onSuccess: (orderData) => {
        clearCartMutation.mutate(undefined, {
          onSuccess: () => {
            addToast({ title: 'Order Placed! 🎉', message: `Your order ${orderData.orderId} has been placed.`, type: 'success' });
            navigate(`/app/orders/${orderData.orderId}/track`);
            setIsCheckingOut(false);
          }
        });
      },
      onError: () => {
        addToast({ title: 'Error', message: 'Failed to place order. Please try again.', type: 'danger' });
        setIsCheckingOut(false);
      }
    });
  };

  const handleAddRecommended = (product: any) => {
    const productId = product.id || product._id;
    const recShopId = product.shopId;
    const recShopName = product.shopName || 'Store';

    // If shop is different from current cart shop, backend will handle clearing it. 
    // We notify user through warning toast if cart isn't empty and shop differs.
    if (items.length > 0 && shopId !== recShopId) {
      if (!window.confirm(`Hyperlocal restriction: Adding this item will clear items from "${shopName}" as it belongs to a different shop. Continue?`)) {
        return;
      }
    }

    addCartMutationHelper(recShopId, recShopName, product);
  };

  const addCartMutationHelper = (shopIdVal: string, shopNameVal: string, product: any) => {
    const productId = product.id || product._id;
    api.post('/v1/cart', {
      shopId: shopIdVal,
      shopName: shopNameVal,
      item: {
        productId,
        name: product.name,
        price: product.price,
        quantity: 1,
        imageUrl: product.imageUrl
      }
    }).then(() => {
      trackAnalyticsEvent('ADD_TO_CART', { productId, productName: product.name, shopId: shopIdVal, price: product.price });
      const currentSubtotal = items.reduce((s, i) => s + i.price * i.quantity, 0) || 0;
      const newTotal = currentSubtotal + product.price;
      showNotification(product.name, 1, newTotal);
      
      // Invalidate cart queries
      api.get('/v1/cart'); // Trigger refetch
      navigate(0); // Reload local state
    }).catch(() => {
      addToast({ title: 'Error', message: 'Failed to add item to cart.', type: 'danger' });
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 text-left">
        <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight flex items-center gap-3">
          <ShoppingCart size={28} className="text-accent" /> Shopping Cart
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-surface border border-border rounded-xl h-64" />
            <div className="bg-surface border border-border rounded-xl h-32" />
          </div>
          <div className="bg-surface border border-border rounded-xl h-64" />
        </div>
      </div>
    );
  }

  // Empty Cart
  if (items.length === 0) {
    return (
      <div className="space-y-6 text-left">
        <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight flex items-center gap-3">
          <ShoppingCart size={28} className="text-accent" /> Shopping Cart
        </h1>
        <div className="flex flex-col items-center justify-center py-24 space-y-5 border border-dashed border-border rounded-2xl bg-surface/50">
          <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center">
            <ShoppingCart size={36} className="text-accent/60" />
          </div>
          <div className="text-center space-y-1.5">
            <p className="text-lg font-bold text-text-primary">Your cart is empty</p>
            <p className="text-sm text-text-secondary max-w-xs">Add items from nearby shops to get started.</p>
          </div>
          <Button onClick={() => navigate('/app')} className="flex items-center gap-2">
            <Package size={14} /> Shop Now
          </Button>
        </div>

        {/* Recommendations in empty cart */}
        {recommendedProducts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-text-secondary">Popular Near You</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {recommendedProducts.slice(0, 3).map(prod => {
                const prodId = prod.id || prod._id;
                return (
                  <div key={prodId} className="bg-surface border border-border rounded-xl p-3 flex gap-3 shadow-sm hover:border-accent/30 transition-colors">
                    <img src={prod.imageUrl} alt={prod.name} className="w-16 h-16 object-cover rounded-lg border border-border flex-shrink-0" />
                    <div className="flex flex-col justify-between flex-1 min-w-0">
                      <div>
                        <p className="text-[9px] text-text-secondary font-bold uppercase truncate">{prod.shopName || 'Store'}</p>
                        <h4 className="text-xs font-bold text-text-primary line-clamp-1">{prod.name}</h4>
                        <p className="text-sm font-extrabold text-text-primary">₹{prod.price}</p>
                      </div>
                      <Button size="sm" onClick={() => handleAddRecommended(prod)} className="text-[10px] h-7 justify-center flex items-center gap-1">
                        <Plus size={11} /> Add
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight flex items-center gap-3">
          <ShoppingCart size={28} className="text-accent" /> Shopping Cart
        </h1>
        <button
          onClick={() => { if (window.confirm('Clear entire cart?')) clearCartMutation.mutate(); }}
          className="text-xs text-danger hover:text-danger/80 font-semibold flex items-center gap-1 transition-colors"
        >
          <Trash2 size={13} /> Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT: Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {/* Shop Group */}
          <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
            {/* Shop Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border bg-background">
              <Store size={16} className="text-accent" />
              <span className="font-bold text-sm text-text-primary">{shopName}</span>
              <span className="text-[10px] bg-accent/10 text-accent border border-accent/20 px-2 py-0.5 rounded font-bold ml-auto">
                {items.length} item{items.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Items */}
            <div className="divide-y divide-border">
              {items.map(item => {
                return (
                  <div key={item.productId} className="p-4 flex gap-4 group">
                    <div className="w-[72px] h-[72px] flex-shrink-0 rounded-lg overflow-hidden border border-border bg-background">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-text-primary line-clamp-1">{item.name}</h4>
                      <p className="text-[10px] text-text-secondary mt-0.5">Unit price: ₹{item.price}</p>
                      <div className="flex items-center justify-between mt-3">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-border rounded-lg overflow-hidden">
                          <button
                            onClick={() => {
                              if (item.quantity === 1) {
                                removeCartItemMutation.mutate(item.productId);
                              } else {
                                updateCartQtyMutation.mutate({ productId: item.productId, quantity: item.quantity - 1 });
                              }
                            }}
                            className="px-3 py-1.5 hover:bg-border/40 text-text-secondary transition-colors"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="px-3 py-1.5 text-sm font-bold border-x border-border min-w-[40px] text-center bg-background">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQtyMutation.mutate({ productId: item.productId, quantity: item.quantity + 1 })}
                            className="px-3 py-1.5 hover:bg-border/40 text-text-secondary transition-colors"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                        <span className="font-extrabold text-sm text-text-primary">₹{(item.price * item.quantity).toFixed(0)}</span>
                      </div>
                      {/* Actions */}
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          onClick={() => handleSaveForLater(item.productId, item.name)}
                          className="text-[10px] text-text-secondary hover:text-accent transition-colors flex items-center gap-1 font-semibold"
                        >
                          <Heart size={11} /> Save for Later
                        </button>
                        <button
                          onClick={() => removeCartItemMutation.mutate(item.productId)}
                          className="text-[10px] text-text-secondary hover:text-danger transition-colors flex items-center gap-1 font-semibold"
                        >
                          <Trash2 size={11} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Delivery Estimate */}
            <div className="px-4 py-3 border-t border-border bg-background/50 flex items-center gap-2 text-xs text-success font-semibold">
              <Truck size={14} />
              <span>Estimated delivery: <strong>15–25 mins</strong> after order placement</span>
            </div>
          </div>

          {/* Coupon Section */}
          <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-text-primary">
              <Tag size={16} className="text-accent" /> Apply Coupon
            </div>
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-success/5 border border-success/30 rounded-lg px-4 py-3">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-success" />
                  <div>
                    <span className="font-bold text-success text-xs font-mono">{appliedCoupon.code}</span>
                    <p className="text-[10px] text-text-secondary">{appliedCoupon.description || 'Discount Applied Successfully'}</p>
                  </div>
                </div>
                <button onClick={handleRemoveCoupon} className="text-danger hover:text-danger/80 transition-colors">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                    placeholder="Enter coupon code (e.g., NEIGHBOR10)"
                    className="flex-1 px-4 py-2.5 bg-background border border-border rounded-lg text-sm font-mono focus:outline-none focus:border-accent transition-colors placeholder:text-text-secondary/50"
                  />
                  <Button size="sm" onClick={handleApplyCoupon} className="px-5">Apply</Button>
                </div>
                {couponError && (
                  <p className="text-[10px] text-danger flex items-center gap-1"><AlertCircle size={11} />{couponError}</p>
                )}
                {/* Available coupons */}
                <div className="flex gap-2 flex-wrap mt-1">
                  {['NEIGHBOR10', 'FREESHIP', 'SAVE50'].map(code => (
                    <button
                      key={code}
                      onClick={() => { setCouponInput(code); setCouponError(''); }}
                      className="text-[9px] font-bold font-mono border border-dashed border-accent/40 text-accent px-2 py-1 rounded hover:bg-accent/5 transition-colors"
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recommended Products */}
          {recommendedProducts.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary">You May Also Like</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {recommendedProducts.slice(0, 3).map(prod => {
                  const prodId = prod.id || prod._id;
                  return (
                    <div key={prodId} className="bg-surface border border-border rounded-xl p-3 flex gap-3 shadow-sm hover:border-accent/30 transition-colors">
                      <img src={prod.imageUrl} alt={prod.name} className="w-14 h-14 object-cover rounded-lg border border-border flex-shrink-0" />
                      <div className="flex flex-col justify-between flex-1 min-w-0">
                        <div>
                          <p className="text-[8px] text-text-secondary font-bold uppercase truncate">{prod.shopName || 'Store'}</p>
                          <h4 className="text-[10px] font-bold text-text-primary line-clamp-1">{prod.name}</h4>
                          <p className="text-xs font-extrabold text-text-primary">₹{prod.price}</p>
                        </div>
                        <Button size="sm" onClick={() => handleAddRecommended(prod)} className="text-[9px] h-6 justify-center flex items-center gap-1">
                          <Plus size={10} /> Add
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Order Summary (Sticky) */}
        <div className="lg:sticky lg:top-20 space-y-4">
          <div className="bg-surface border border-border rounded-xl p-4 space-y-4 shadow-sm">
            <h3 className="font-bold text-sm text-text-primary border-b border-border pb-3">Order Summary</h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-text-secondary">
                <span>Subtotal ({items.length} items)</span>
                <span className="font-semibold text-text-primary">₹{totals.subtotal}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>GST (18%)</span>
                <span className="font-semibold text-text-primary">₹{totals.tax}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span className="flex items-center gap-1"><Truck size={11} />Delivery Fee</span>
                <span className={`font-semibold ${totals.deliveryFee === 0 ? 'text-success' : 'text-text-primary'}`}>
                  {totals.deliveryFee === 0 ? 'FREE' : `₹${totals.deliveryFee}`}
                </span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-success">
                  <span className="flex items-center gap-1"><Tag size={11} />{appliedCoupon.code}</span>
                  <span className="font-bold">-₹{couponDiscount}</span>
                </div>
              )}
              <div className="border-t border-border pt-2.5 flex justify-between text-base font-extrabold text-text-primary">
                <span>Total</span>
                <span>₹{finalTotal}</span>
              </div>
              {couponDiscount > 0 && (
                <p className="text-success text-[10px] font-bold text-center bg-success/5 rounded-lg py-1.5 border border-success/20">
                  🎉 You save ₹{couponDiscount} on this order!
                </p>
              )}
            </div>

            <Button
              className="w-full justify-center flex items-center gap-2 text-sm font-bold h-12"
              onClick={handleCheckout}
              disabled={isCheckingOut}
            >
              {isCheckingOut ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Placing Order...</>
              ) : (
                <><Zap size={16} /> Proceed to Checkout <ArrowRight size={14} /></>
              )}
            </Button>

            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2 text-[10px] text-text-secondary">
                <CheckCircle size={12} className="text-success flex-shrink-0" />
                <span>Secure checkout with 256-bit SSL encryption</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-text-secondary">
                <Truck size={12} className="text-accent flex-shrink-0" />
                <span>Free delivery on orders above ₹500</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-text-secondary">
                <Tag size={12} className="text-warning flex-shrink-0" />
                <span>Valid coupons: NEIGHBOR10, FREESHIP, SAVE50</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
