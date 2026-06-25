import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Star, Clock, MapPin, AlertCircle, ShoppingBag, Store } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store/cartStore';
import { useNotificationStore } from '@/store/notificationStore';
import { trackAnalyticsEvent } from '@/utils/analytics';
import { Product } from '@/domain/product';
import { Shop } from '@/domain/shop';
import { 
  useCategoryDetails, 
  useCategoryShops, 
  useCategoryProducts 
} from '@/hooks/queries';

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

// ─── SKELETONS FOR LOADING STATES ────────────────────────────────────────────

const PageSkeleton = () => (
  <div className="space-y-5 animate-pulse text-left">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded bg-border" />
      <div className="space-y-1.5 flex-1">
        <div className="h-5 bg-border rounded w-1/4" />
        <div className="h-3 bg-border rounded w-1/3" />
      </div>
    </div>
    <div className="h-28 bg-border rounded-xl w-full" />
    <div className="space-y-3">
      <div className="h-4 bg-border rounded w-1/6" />
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="min-w-[200px] h-16 bg-border rounded-lg" />
        ))}
      </div>
    </div>
  </div>
);

export const CategoryDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const { addToast } = useNotificationStore();

  // Queries
  const { data: category, isLoading: catLoading, isError: catError } = useCategoryDetails(slug || '');
  const { data: shops = [], isLoading: shopsLoading } = useCategoryShops(slug || '');
  const { data: products = [], isLoading: productsLoading } = useCategoryProducts(slug || '');

  const handleAddToCart = (e: React.MouseEvent, product: Product, shopName: string, shopId: string) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(shopId, shopName, {
      productId: product.id || product._id || '',
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl,
    });
    trackAnalyticsEvent('ADD_TO_CART', { productId: product.id || product._id, shopId, price: product.price });
    addToast({ title: 'Added to Cart 🛒', message: `${product.name} added to cart`, type: 'success' });
  };

  const isLoading = catLoading || shopsLoading || productsLoading;

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (catError || !category) {
    return (
      <div className="text-center py-12 space-y-4 max-w-md mx-auto">
        <AlertCircle className="w-12 h-12 mx-auto text-danger" />
        <div>
          <h2 className="text-lg font-bold text-text-primary">Failed to load category details</h2>
          <p className="text-xs text-text-secondary mt-1">The category may not exist or database query failed.</p>
        </div>
        <Button size="sm" onClick={() => navigate('/app')}>Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="space-y-5 text-left pb-16">
      {/* Back navigation + Category Info */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => navigate('/app')}
          className="p-2 border border-border rounded-md hover:bg-surface text-text-secondary transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Go Back"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-text-primary tracking-tight">{category.name}</h1>
          <p className="text-[11px] text-text-secondary">Hyperlocal marketplace aisles for {category.name}</p>
        </div>
      </div>

      {/* Category Banner Card */}
      <div className="relative h-28 w-full rounded-xl overflow-hidden border border-border shadow-sm bg-surface flex items-center">
        {category.image && (
          <>
            <img src={category.image} alt={category.name} className="absolute inset-0 w-full h-full object-cover opacity-20 dark:opacity-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/90 to-transparent" />
          </>
        )}
        <div className="relative px-5 py-4 max-w-lg space-y-1 z-10">
          <span className="text-[9px] uppercase font-bold text-accent tracking-wider">Category Profile</span>
          <h3 className="text-sm font-extrabold text-text-primary leading-tight">{category.name}</h3>
          <p className="text-xs text-text-secondary leading-relaxed">{category.description || `Browse quality local shops and fresh catalog items under ${category.name}.`}</p>
        </div>
      </div>

      {/* Shops Section */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-text-secondary">Shops Serving Category</h2>
        {shops.length === 0 ? (
          <div className="p-4 border border-dashed border-border rounded-lg text-center text-xs text-text-secondary flex items-center justify-center gap-2">
            <Store size={14} /> No shops serving this category currently.
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-border">
            {shops.map(shop => {
              const isOpen = isShopOpen(shop);
              return (
                <Link 
                  key={shop.id || shop._id}
                  to={`/app/shops/${shop.slug}`}
                  className="bg-surface border border-border rounded-lg p-2 min-w-[210px] max-w-[210px] flex-shrink-0 cursor-pointer hover:border-accent/40 shadow-sm flex items-center gap-2.5 transition-all group"
                >
                  <img src={shop.logoUrl} alt={shop.name} className="w-10 h-10 rounded object-cover border border-border flex-shrink-0 bg-background" />
                  <div className="min-w-0 flex-1 text-left space-y-0.5">
                    <h3 className="font-bold text-xs truncate text-text-primary group-hover:text-accent transition-colors">{shop.name}</h3>
                    <div className="flex items-center gap-1.5 text-[9px] text-text-secondary">
                      <span className="flex items-center gap-0.5 text-amber-500"><Star size={10} className="fill-amber-500 text-amber-500" />{shop.rating || 'N/A'}</span>
                      <span>•</span>
                      <span>{shop.eta || '15 mins'}</span>
                      <span>•</span>
                      <span className={isOpen ? 'text-success font-semibold' : 'text-text-secondary'}>
                        {isOpen ? 'Open' : 'Closed'}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Products Section */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-text-secondary">Top Products</h2>
        {products.length === 0 ? (
          <div className="p-6 border border-dashed border-border rounded-lg text-center text-xs text-text-secondary flex flex-col items-center justify-center gap-2">
            <ShoppingBag size={20} className="text-text-secondary/40" />
            <span>No products available under this category aisle.</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {products.map((prod) => (
              <Link
                key={prod.id || prod._id}
                to={`/app/products/${prod.id || prod._id}`}
                className="bg-surface border border-border rounded-lg p-2.5 shadow-sm flex flex-col justify-between hover:border-primary/45 hover:-translate-y-0.5 transition-all relative group block"
              >
                {prod.compareAtPrice && prod.compareAtPrice > prod.price && (
                  <span className="absolute top-1.5 left-1.5 bg-danger text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded border border-danger/30 z-10">
                    SAVE {Math.round(((prod.compareAtPrice - prod.price) / prod.compareAtPrice) * 100)}%
                  </span>
                )}
                <div className="space-y-1.5">
                  <div className="h-24 rounded overflow-hidden border border-border/50 bg-background">
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="space-y-0.5 text-left">
                    <span className="text-[9px] uppercase font-bold text-text-secondary block truncate flex items-center gap-1">
                      <MapPin size={9} /> {prod.shopName || 'Local Shop'}
                    </span>
                    <h4 className="text-xs font-bold text-text-primary truncate">{prod.name}</h4>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="text-left">
                    <div className="text-xs font-bold text-text-primary">₹{prod.price}</div>
                    {prod.compareAtPrice && prod.compareAtPrice > prod.price && (
                      <div className="text-[9px] text-text-secondary line-through">₹{prod.compareAtPrice}</div>
                    )}
                  </div>
                  <button
                    onClick={(e) => handleAddToCart(e, prod, prod.shopName || 'Store', prod.shopId)}
                    className="h-8 px-3.5 rounded bg-accent text-white hover:bg-accent/90 text-xs font-bold transition-all relative z-10 shadow-sm flex items-center justify-center min-w-[56px] min-h-[44px]"
                    aria-label={`Add ${prod.name} to cart`}
                  >
                    Add
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryDetailsPage;
