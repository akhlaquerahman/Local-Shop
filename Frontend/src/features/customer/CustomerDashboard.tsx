import React, { useState, useRef } from 'react';
import { useNotificationStore } from '@/store/notificationStore';
import { useCartNotificationStore } from '@/store/cartNotificationStore';
import { Product } from '@/domain/product';
import { Shop } from '@/domain/shop';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/ui/cards';
import { trackAnalyticsEvent } from '@/utils/analytics';
import { Clock, Star, ShoppingBag, Heart, AlertCircle, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  useCategories, 
  useFeaturedShops, 
  useDeals, 
  useProducts, 
  useRecommendations, 
  useActiveOrder, 
  useRecentlyViewed,
  useWishlist,
  useAddWishlist,
  useRemoveWishlist,
  useCart,
  useAddCart,
  useCartSummary
} from '@/hooks/queries';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import { useBuyNowStore } from '@/store/buyNowStore';

// ─── SKELETON LOADERS FOR COMPONENT LOADING STATES ───────────────────────────

const CategorySkeleton = () => (
  <div className="flex gap-3 overflow-hidden pb-2" aria-label="Loading categories">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="animate-pulse bg-surface border border-border p-2 rounded-xl flex flex-col items-center space-y-2 h-20 min-w-[100px] flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-border" />
        <div className="w-12 h-2.5 bg-border rounded" />
      </div>
    ))}
  </div>
);

const ShopSkeleton = () => (
  <div className="flex gap-3 overflow-hidden pb-2" aria-label="Loading shops">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="animate-pulse bg-surface border border-border rounded-lg p-2.5 flex gap-3 h-20 min-w-[300px] flex-shrink-0">
        <div className="w-12 h-12 rounded bg-border flex-shrink-0" />
        <div className="flex-1 space-y-2 py-0.5">
          <div className="h-3.5 bg-border rounded w-3/4" />
          <div className="h-2.5 bg-border rounded w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

const ProductSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3" aria-label="Loading products">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="animate-pulse bg-surface border border-border rounded-lg p-2.5 flex flex-col justify-between h-44">
        <div className="h-24 rounded bg-border mb-2" />
        <div className="space-y-1.5">
          <div className="h-3 bg-border rounded w-5/6" />
          <div className="h-2.5 bg-border rounded w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

// Helper to determine if shop is open based on hours
const isShopOpen = (shop: Shop) => {
  if (!shop.operatingHours) return true;
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTime = hours * 60 + minutes;
  
  const [openH, openM] = shop.operatingHours.open.split(':').map(Number);
  const [closeH, closeM] = shop.operatingHours.close.split(':').map(Number);
  const openTime = openH * 60 + openM;
  const closeTime = closeH * 60 + closeM;
  
  const dayOpen = shop.operatingHours.daysOpen.includes(now.getDay());
  return dayOpen && currentTime >= openTime && currentTime <= closeTime;
};

export const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useNotificationStore();
  const { showNotification } = useCartNotificationStore();

  const [deliveryAddress] = useState<string>('Home - Sector 62, Noida');
  const isServiceable = deliveryAddress !== '' && !deliveryAddress.includes('Mumbai');
  const [isSubscribedToNotification, setIsSubscribedToNotification] = useState(false);

  // ─── REACT QUERY BACKEND INTEGRATION ─────────────────────────────────────────
  const { data: categories = [], isLoading: catLoading, isError: catError } = useCategories();
  const { data: shops = [], isLoading: shopsLoading, isError: shopsError } = useFeaturedShops();
  const { data: deals = [], isLoading: dealsLoading, isError: dealsError } = useDeals();
  const { data: allProducts = [], isLoading: productsLoading } = useProducts();
  const { data: recommendations = [], isLoading: recLoading, isError: recError } = useRecommendations();
  const { data: recentlyViewed = [], isLoading: recentLoading } = useRecentlyViewed();
  const { data: activeOrder, isLoading: orderLoading } = useActiveOrder();

  const { data: wishlistItems = [] } = useWishlist();
  const wishlistIds = wishlistItems.map(item => item.id || (item as any)._id || '');

  const { data: cartData } = useCart();
  const cartSummary = useCartSummary();

  const addWishlistMutation = useAddWishlist();
  const removeWishlistMutation = useRemoveWishlist();
  const addCartMutation = useAddCart();

  const handleAddToCart = (e: React.MouseEvent, product: Product, shopName: string, shopId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const productId = product.id || (product as any)._id || '';
    addCartMutation.mutate({
      shopId,
      shopName,
      item: {
        productId,
        name: product.name,
        price: product.price,
        quantity: 1,
        imageUrl: product.imageUrl
      }
    }, {
      onSuccess: () => {
        trackAnalyticsEvent('ADD_TO_CART', { productId, productName: product.name, shopId, price: product.price });
        const currentSubtotal = cartData?.items.reduce((s, i) => s + i.price * i.quantity, 0) || 0;
        const newTotal = currentSubtotal + product.price;
        showNotification(product.name, 1, newTotal);
      }
    });
  };

  const toggleWishlist = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (wishlistIds.includes(id)) {
      removeWishlistMutation.mutate(id, {
        onSuccess: () => {
          addToast({ title: 'Removed from Wishlist', message: 'Item removed from your favorites.', type: 'info' });
        }
      });
    } else {
      addWishlistMutation.mutate(id, {
        onSuccess: () => {
          addToast({ title: 'Added to Wishlist ❤️', message: 'Item saved to your favorites.', type: 'success' });
        }
      });
    }
  };
  const { setSession } = useBuyNowStore();
  
  const handleBuyNow = (e: React.MouseEvent, product: Product, shopName: string, shopId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const productId = product.id || (product as any)._id || '';
    setSession({
      shopId,
      shopName,
      item: {
        productId,
        name: product.name,
        price: product.price,
        quantity: 1,
        imageUrl: product.imageUrl
      }
    });
    navigate('/app/checkout', { state: { mode: 'buy-now' } });
  };

  const catRef = useRef<HTMLDivElement>(null);
  const shopRef = useRef<HTMLDivElement>(null);

  const scrollContainer = (ref: React.RefObject<HTMLDivElement>, dir: 'left' | 'right') => {
    if (ref.current) {
      ref.current.scrollBy({ left: dir === 'left' ? -350 : 350, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-5 text-left pb-16 relative">
      {/* EMPTY ADDRESS STATE */}
      {deliveryAddress === '' && (
        <div className="bg-danger/5 border border-danger/20 rounded-lg p-5 text-center space-y-3" role="alert">
          <AlertCircle className="w-8 h-8 mx-auto text-danger" />
          <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">No Delivery Address Configured</h4>
          <p className="text-[11px] text-text-secondary max-w-xs mx-auto">
            You must add a delivery address to verify active hyperlocal merchant stores and check serviceability details.
          </p>
          <Button size="sm" onClick={() => {}} className="shadow-enterprise text-xs min-h-[44px] px-4">Configure Address</Button>
        </div>
      )}

      {/* UNSERVICEABLE LOCATION WARNING */}
      {deliveryAddress !== '' && !isServiceable && (
        <div className="bg-warning/5 border border-warning/30 rounded-lg p-4 text-left space-y-3" role="alert">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-warning flex-shrink-0 mt-0.5" size={16} />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Unserviceable Location</h4>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                Currently unavailable in this area. We are onboarding local vendors in this sector.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => { setIsSubscribedToNotification(true); addToast({ title: 'Alert Registered 🔔', message: "We will text you when we launch here.", type: 'success' }); }}
            disabled={isSubscribedToNotification}
            className="w-full justify-center text-xs shadow-enterprise bg-warning text-black hover:bg-warning/90 border-none min-h-[44px]"
          >
            {isSubscribedToNotification ? 'Notification Enabled ✓' : 'Notify Me Upon Launch'}
          </Button>
        </div>
      )}

      {/* MAIN DASHBOARD CONTENT */}
      {isServiceable && deliveryAddress !== '' && (
        <>
          {/* COMPACT ACTIVE ORDER WIDGET */}
          {!orderLoading && activeOrder && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 flex flex-wrap gap-3 items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <ShoppingBag size={15} />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-emerald-800 dark:text-emerald-400">
                    Order Active • Status: <span className="capitalize">{activeOrder.status}</span>
                  </div>
                  <div className="text-[10px] text-text-secondary">
                    ID: {activeOrder.orderId} • ETA: {activeOrder.eta || '12 mins'}
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/app/orders/${activeOrder.orderId || activeOrder.id}/track`)}
                className="text-xs py-1 px-3.5 h-8 border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold min-h-[38px] flex items-center"
                aria-label="Track your active order"
              >
                Track Order
              </Button>
            </div>
          )}

          {/* CATEGORY aisLES */}
          <div className="space-y-2 relative group">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-text-secondary">Explore Category Aisles</h2>
              <div className="flex gap-2">
                <button onClick={() => scrollContainer(catRef, 'left')} aria-label="Scroll left" className="w-6 h-6 flex items-center justify-center rounded-full bg-surface border border-border hover:bg-surface-hover hover:text-primary transition-colors"><ChevronLeft size={14}/></button>
                <button onClick={() => scrollContainer(catRef, 'right')} aria-label="Scroll right" className="w-6 h-6 flex items-center justify-center rounded-full bg-surface border border-border hover:bg-surface-hover hover:text-primary transition-colors"><ChevronRight size={14}/></button>
              </div>
            </div>
            {catLoading ? (
              <CategorySkeleton />
            ) : catError ? (
              <div className="p-4 border border-dashed border-danger/30 bg-danger/5 rounded-lg text-center text-xs text-danger" role="alert">
                Failed to load categories. Please try refreshing.
              </div>
            ) : categories.length === 0 ? (
              <div className="p-4 border border-dashed border-border rounded-lg text-center text-xs text-text-secondary">
                No categories available.
              </div>
            ) : (
              <div ref={catRef} className="flex gap-3 overflow-x-auto scroll-smooth hide-scrollbar pb-2 pt-1 snap-x">
                {categories.map((cat: any) => (
                  <Link
                    key={cat.slug || cat.id || cat._id}
                    to={`/app/categories/${cat.slug || cat.id || cat._id}`}
                    tabIndex={0}
                    aria-label={`Navigate to ${cat.name} category`}
                    onClick={() => trackAnalyticsEvent('CATEGORY_CLICK', { category: cat.name })}
                    className="snap-start flex-shrink-0 w-[110px] cursor-pointer focus-visible:ring-2 focus-visible:ring-primary outline-none bg-surface border border-border p-2 rounded-xl hover:border-primary hover:bg-primary/5 hover:-translate-y-0.5 transition-all text-center space-y-1.5 shadow-sm group block"
                  >
                    <div className="h-10 w-full flex items-center justify-center rounded bg-background overflow-hidden relative">
                      {cat.image ? (
                        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="text-text-secondary group-hover:text-primary">
                          <DynamicIcon name={cat.icon || 'ShoppingBag'} size={18} />
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-text-primary block truncate leading-none group-hover:text-primary">{cat.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* FEATURED SHOPS */}
          <div className="space-y-2 pt-1 relative group">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-text-secondary">Nearby Featured Shops</h2>
              <div className="flex gap-2">
                <button onClick={() => scrollContainer(shopRef, 'left')} aria-label="Scroll left" className="w-6 h-6 flex items-center justify-center rounded-full bg-surface border border-border hover:bg-surface-hover hover:text-primary transition-colors"><ChevronLeft size={14}/></button>
                <button onClick={() => scrollContainer(shopRef, 'right')} aria-label="Scroll right" className="w-6 h-6 flex items-center justify-center rounded-full bg-surface border border-border hover:bg-surface-hover hover:text-primary transition-colors"><ChevronRight size={14}/></button>
              </div>
            </div>
            {shopsLoading ? (
              <ShopSkeleton />
            ) : shopsError ? (
              <div className="p-4 border border-dashed border-danger/30 bg-danger/5 rounded-lg text-center text-xs text-danger" role="alert">
                Failed to load featured shops. Please try refreshing.
              </div>
            ) : shops.length === 0 ? (
              <div className="p-4 border border-dashed border-border rounded-lg text-center text-xs text-text-secondary">
                No featured shops available nearby at the moment.
              </div>
            ) : (
              <div ref={shopRef} className="flex gap-3 overflow-x-auto scroll-smooth hide-scrollbar pb-2 snap-x">
                {shops.map((shop: Shop) => {
                  const isOpen = isShopOpen(shop);
                  return (
                    <Link
                      to={`/app/shops/${shop.slug}`}
                      key={shop.id || shop._id}
                      tabIndex={0}
                      aria-label={`View shop details for ${shop.name}`}
                      onClick={() => trackAnalyticsEvent('STORE_CLICK', { shopId: shop.id || shop._id, shopName: shop.name })}
                      className="snap-start flex-shrink-0 w-[300px] sm:w-[320px] cursor-pointer focus-visible:ring-2 focus-visible:ring-primary outline-none bg-surface border border-border rounded-lg p-2.5 shadow-sm flex gap-3 hover:border-primary/45 hover:-translate-y-0.5 hover:shadow transition-all group"
                    >
                      <img src={shop.logoUrl} alt={shop.name} className="w-12 h-12 rounded border border-border object-cover bg-background flex-shrink-0 group-hover:scale-105 transition-transform" />
                      <div className="space-y-1 min-w-0 text-left flex-1 flex flex-col justify-center">
                        <div className="flex items-center gap-1.5 justify-between">
                          <span className="font-bold text-xs text-text-primary truncate">{shop.name}</span>
                          {shop.isFeatured && (
                            <span className="bg-accent/10 text-accent text-[8px] font-bold px-1 py-0.2 rounded border border-accent/20 flex-shrink-0">FEATURED</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-semibold text-text-secondary">
                          <span className="flex items-center gap-0.5 text-amber-500 fill-amber-500"><Star size={11} className="fill-amber-500" /><span className="text-text-primary font-bold">{shop.rating || 'N/A'}</span></span>
                          <span className="flex items-center gap-0.5"><Clock size={11} /><span>{shop.eta || '15 Mins'}</span></span>
                          <span className="flex items-center gap-0.5"><span>{shop.distance ? `${shop.distance} km` : '0.5 km'}</span></span>
                          <span className={`px-1.5 py-0.2 rounded text-[8px] font-extrabold ${isOpen ? 'bg-success/15 text-success border border-success/20' : 'bg-border text-text-secondary border border-border/40'}`}>
                            {isOpen ? 'OPEN' : 'CLOSED'}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* FRESH DEALS */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-text-secondary">Fresh Deals For You</h2>
              <span className="text-[10px] text-accent font-bold hover:underline cursor-pointer">View All</span>
            </div>
            {dealsLoading ? (
              <ProductSkeleton />
            ) : dealsError ? (
              <div className="p-4 border border-dashed border-danger/30 bg-danger/5 rounded-lg text-center text-xs text-danger" role="alert">
                Failed to load deals. Please try refreshing.
              </div>
            ) : deals.length === 0 ? (
              <div className="p-4 border border-dashed border-border rounded-lg text-center text-xs text-text-secondary">
                No fresh deals currently available.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {deals.map((prod: Product) => (
                  <ProductCard
                    key={prod.id || (prod as any)._id}
                    product={prod}
                    onAddToCart={(e) => handleAddToCart(e, prod, prod.shopName || 'Store', prod.shopId)}
                    onBuyNow={(e) => handleBuyNow(e, prod, prod.shopName || 'Store', prod.shopId)}
                    showFavoriteButton={true}
                    isFavorite={wishlistIds.includes(prod.id || (prod as any)._id)}
                    onToggleFavorite={toggleWishlist}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ALL PRODUCTS */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-text-secondary">All Products</h2>
            </div>
            {productsLoading ? (
              <ProductSkeleton />
            ) : allProducts.length === 0 ? (
              <div className="p-4 border border-dashed border-border rounded-lg text-center text-xs text-text-secondary">
                No products available at the moment.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {allProducts.map((prod: Product) => (
                  <ProductCard
                    key={prod.id || (prod as any)._id}
                    product={prod}
                    onAddToCart={(e) => handleAddToCart(e, prod, prod.shopName || 'Store', prod.shopId)}
                    onBuyNow={(e) => handleBuyNow(e, prod, prod.shopName || 'Store', prod.shopId)}
                    showFavoriteButton={true}
                    isFavorite={wishlistIds.includes(prod.id || (prod as any)._id)}
                    onToggleFavorite={toggleWishlist}
                  />
                ))}
              </div>
            )}
          </div>

          {/* RECENTLY VIEWED */}
          {recentlyViewed && recentlyViewed.length > 0 && (
            <div className="space-y-2 pt-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-text-secondary">Recently Viewed</h2>
              {recentLoading ? (
                <div className="flex items-center gap-2 text-text-secondary text-xs"><Loader2 className="animate-spin" size={12} /> Loading...</div>
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-1.5 scrollbar-none">
                  {recentlyViewed.map((prod: Product) => (
                    <ProductCard
                      key={prod.id || (prod as any)._id}
                      product={prod}
                      onAddToCart={(e) => handleAddToCart(e, prod, prod.shopName || 'Store', prod.shopId)}
                      onBuyNow={(e) => handleBuyNow(e, prod, prod.shopName || 'Store', prod.shopId)}
                      showFavoriteButton={true}
                      isFavorite={wishlistIds.includes(prod.id || (prod as any)._id)}
                      onToggleFavorite={toggleWishlist}
                      className="min-w-[160px] max-w-[160px] flex-shrink-0"
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CustomerDashboard;
