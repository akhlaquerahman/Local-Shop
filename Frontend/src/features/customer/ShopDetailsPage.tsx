import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useShop, useShopProducts } from '@/hooks/queries';
import { useCartStore } from '@/store/cartStore';
import { useNotificationStore } from '@/store/notificationStore';
import { Product } from '@/domain/product';
import { Button } from '@/components/ui/Button';
import { trackAnalyticsEvent } from '@/utils/analytics';
import { Loader2, ArrowLeft, Star, Clock, MapPin, Plus, Store, CheckCircle, Search, MessageSquare } from 'lucide-react';

import { ReviewsSection } from '@/components/reviews/ReviewsSection';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { useShopReviews, useSubmitShopReview } from '@/hooks/queries';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export const ShopDetailsPage: React.FC = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const { addToast } = useNotificationStore();

  const { data: shop, isLoading: shopLoading } = useShop(shopId || '');
  const actualShopId = shop?._id || shop?.id || '';
  const { data: products = [], isLoading: productsLoading } = useShopProducts(actualShopId);

  const [activeTab, setActiveTab] = React.useState<'products' | 'reviews' | 'location'>('products');
  const [page, setPage] = React.useState(1);
  const { data: reviewsData, isLoading: reviewsLoading } = useShopReviews(shop?.id || (shop as any)?._id || '', page, 10);
  const submitReview = useSubmitShopReview();

  if (shopLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-text-secondary">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p>Loading shop profile...</p>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-text-primary mb-2">Shop Not Found</h2>
        <p className="text-text-secondary mb-6">The shop you are looking for does not exist or has been removed.</p>
        <Button onClick={() => navigate('/app/shops')}>Browse Other Shops</Button>
      </div>
    );
  }

  const isShopOpen = () => {
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

  const isOpen = isShopOpen();

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    const sId = shop.id || (shop as any)._id || '';
    const pId = product.id || (product as any)._id || '';
    addItem(sId, shop.name, {
      productId: pId,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl,
    });
    trackAnalyticsEvent('ADD_TO_CART', { productId: pId, productName: product.name, shopId: sId, price: product.price, quantity: 1 });
    addToast({ title: 'Added to Cart 🛒', message: `${product.name} added to cart`, type: 'success' });
  };

  return (
    <div className="space-y-8 text-left pb-24">
      {/* Top Nav */}
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Hero Profile */}
      <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-start relative overflow-hidden shadow-sm">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        {/* Logo */}
        <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 bg-background border border-border rounded-2xl overflow-hidden shadow-sm relative z-10">
          <img src={shop.logoUrl} alt={shop.name} className="w-full h-full object-cover" />
        </div>

        {/* Profile Info */}
        <div className="flex-1 space-y-4 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary leading-tight">{shop.name}</h1>
              {shop.isFeatured && (
                <span className="bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  Featured
                </span>
              )}
            </div>
            <p className="text-sm text-text-secondary max-w-2xl leading-relaxed">{shop.description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-text-secondary">
            <span className="flex items-center gap-1.5"><Star size={14} className="text-amber-500 fill-amber-500" /> <span className="text-text-primary">{shop.averageRating || shop.rating || 0} Rating</span></span>
            <span className="flex items-center gap-1.5 underline cursor-pointer hover:text-text-primary" onClick={() => setActiveTab('reviews')}>
              {shop.reviewCount || 0} Reviews
            </span>
            <span className="flex items-center gap-1.5"><MapPin size={14} /> {shop.coordinates?.address || 'Local Sector'}</span>
            <span className="flex items-center gap-1.5"><Clock size={14} /> {shop.operatingHours?.open} - {shop.operatingHours?.close}</span>
            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider border ${isOpen ? 'bg-success/10 text-success border-success/20' : 'bg-background text-text-secondary border-border'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-success' : 'bg-text-secondary/50'}`} />
              {isOpen ? 'Open Now' : 'Closed'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border">
        <button 
          className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'products' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
          onClick={() => setActiveTab('products')}
        >
          <Store size={16} /> Products
        </button>
        <button 
          className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'reviews' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
          onClick={() => setActiveTab('reviews')}
        >
          <MessageSquare size={16} /> Reviews
        </button>
        <button 
          className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'location' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
          onClick={() => setActiveTab('location')}
        >
          <MapPin size={16} /> Location
        </button>
      </div>

      {activeTab === 'products' ? (
      <div className="space-y-6">
        {/* Shop Products Area */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-text-primary">Shop Catalog</h2>
            <p className="text-xs text-text-secondary">Explore {products.length} products available for delivery.</p>
          </div>
          <div className="relative hidden md:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input 
              type="text" 
              placeholder="Search in shop..." 
              className="pl-9 pr-4 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary outline-none focus:border-accent w-64 transition-colors"
            />
          </div>
        </div>

        {productsLoading ? (
          <div className="flex items-center justify-center gap-2 text-text-secondary py-20">
            <Loader2 className="animate-spin" size={24} /> Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 space-y-4 border border-border border-dashed rounded-xl">
            <Store size={48} className="mx-auto text-text-secondary/40" />
            <div>
              <p className="font-bold text-text-primary">No products available</p>
              <p className="text-sm text-text-secondary">This shop hasn't listed any products yet.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((prod: Product) => (
              <Link
                to={`/app/products/${prod.id || (prod as any)._id}`}
                key={prod.id || (prod as any)._id}
                tabIndex={0}
                aria-label={`View product details for ${prod.name}`}
                onClick={() => trackAnalyticsEvent('PRODUCT_CLICK', { productId: prod.id || (prod as any)._id, name: prod.name })}
                className="cursor-pointer focus-visible:ring-2 focus-visible:ring-primary outline-none bg-surface border border-border rounded-xl p-3 shadow-sm hover:shadow-enterprise flex flex-col justify-between hover:border-primary/40 hover:-translate-y-1 transition-all relative group block"
              >
                {prod.compareAtPrice && (
                  <span className="absolute top-3 left-3 bg-danger text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-danger/30 z-10 shadow-sm">
                    {Math.round(((prod.compareAtPrice - prod.price) / prod.compareAtPrice) * 100)}% OFF
                  </span>
                )}
                <div className="space-y-3">
                  <div className="h-32 rounded-lg overflow-hidden border border-border/50 bg-background relative p-2">
                    <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="space-y-1 text-left">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-accent bg-accent/10 px-1.5 py-0.5 rounded border border-accent/20 inline-block">
                      {prod.category}
                    </span>
                    <h4 className="text-sm font-bold text-text-primary leading-snug line-clamp-2">{prod.name}</h4>
                  </div>
                </div>
                <div className="mt-4 flex items-end justify-between border-t border-border pt-3">
                  <div className="text-left">
                    <div className="text-sm font-extrabold text-text-primary">₹{prod.price}</div>
                    {prod.compareAtPrice && <div className="text-[10px] font-medium text-text-secondary line-through">₹{prod.compareAtPrice}</div>}
                  </div>
                  <Button
                    onClick={(e) => handleAddToCart(e, prod)}
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 rounded-lg flex items-center justify-center border-border hover:border-accent hover:bg-accent/5 hover:text-accent shadow-sm relative z-10 text-xs font-bold transition-all"
                    aria-label={`Add ${prod.name} to cart`}
                  >
                    <Plus size={14} className="mr-1" /> Add
                  </Button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      ) : activeTab === 'reviews' ? (
        <div className="space-y-8">
          <ReviewsSection 
            averageRating={reviewsData?.averageRating || 0}
            reviewCount={reviewsData?.reviewCount || 0}
            distribution={reviewsData?.distribution || {}}
            reviews={reviewsData?.data || []}
            isLoading={reviewsLoading}
            hasMore={reviewsData ? reviewsData.page < reviewsData.pages : false}
            onLoadMore={() => setPage(page + 1)}
          />
          
          <ReviewForm 
            isLoading={submitReview.isPending}
            onSubmit={(data) => {
              submitReview.mutate({
                shopId: shop.id || (shop as any)._id || '',
                orderId: 'mock-order-123', // In a real app, this comes from user's order history
                ...data
              }, {
                onSuccess: () => {
                  addToast({ title: 'Review Submitted', message: 'Thank you for your feedback on this shop! It will be visible after moderation.', type: 'success' });
                },
                onError: (err: any) => {
                  addToast({ title: 'Submission Failed', message: err.response?.data?.message || 'Could not submit review', type: 'error' });
                }
              });
            }}
          />
        </div>
      ) : activeTab === 'location' ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-text-primary">Shop Location</h2>
              <p className="text-xs text-text-secondary">Get directions to {shop.name}.</p>
            </div>
          </div>
          
          {shop.location?.coordinates && shop.location.coordinates.length === 2 ? (
            <div className="flex flex-col gap-4 bg-surface p-4 border border-border rounded-xl shadow-sm">
              <div className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-text-primary">{shop.name}</p>
                  <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                    {shop.location.address || shop.address?.street || 'Address not provided'}
                    {shop.location.city ? `, ${shop.location.city}` : ''}
                    {shop.location.postalCode ? ` - ${shop.location.postalCode}` : ''}
                  </p>
                  <div className="flex gap-3 mt-4 flex-wrap">
                    <Button 
                      size="sm" 
                      onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${shop.location.coordinates[1]},${shop.location.coordinates[0]}`, '_blank')}
                    >
                      Get Directions
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(`https://www.openstreetmap.org/?mlat=${shop.location.coordinates[1]}&mlon=${shop.location.coordinates[0]}#map=16/${shop.location.coordinates[1]}/${shop.location.coordinates[0]}`, '_blank')}
                    >
                      Open in OpenStreetMap
                    </Button>
                  </div>
                </div>
              </div>
              <div className="h-[400px] w-full rounded-xl overflow-hidden border border-border mt-4 relative z-0">
                <MapContainer 
                  center={[shop.location.coordinates[1], shop.location.coordinates[0]]} 
                  zoom={15} 
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[shop.location.coordinates[1], shop.location.coordinates[0]]}>
                    <Popup>
                      <b>{shop.name}</b><br/>{shop.location.address || 'Location'}
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 border border-border border-dashed rounded-xl">
              <MapPin size={48} className="mx-auto text-text-secondary/40 mb-4" />
              <p className="font-bold text-text-primary">No location data available</p>
              <p className="text-sm text-text-secondary mt-1">This shop has not set their exact coordinates yet.</p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default ShopDetailsPage;
