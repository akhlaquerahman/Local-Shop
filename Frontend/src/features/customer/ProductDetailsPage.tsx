import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProduct, useShop } from '@/hooks/queries';
import { useCartStore } from '@/store/cartStore';
import { useNotificationStore } from '@/store/notificationStore';
import { Button } from '@/components/ui/Button';
import { trackAnalyticsEvent } from '@/utils/analytics';
import { useBuyNowStore } from '@/store/buyNowStore';
import { Loader2, ArrowLeft, Star, ShoppingBag, Store, MapPin, CheckCircle, ShieldCheck, Zap } from 'lucide-react';

import { ReviewsSection } from '@/components/reviews/ReviewsSection';
import { useProductReviews, useSubmitProductReview } from '@/hooks/queries';

import { ReviewForm } from '@/components/reviews/ReviewForm';

export const ProductDetailsPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const { setSession } = useBuyNowStore();
  const { addToast } = useNotificationStore();

  const { data: product, isLoading: productLoading } = useProduct(productId || '');
  const extractedShopId = typeof product?.shopId === 'object' ? (product.shopId as any)._id : product?.shopId;
  const { data: shop, isLoading: shopLoading } = useShop(extractedShopId || '');
  
  // Reviews Pagination State
  const [page, setPage] = useState(1);
  const { data: reviewsData, isLoading: reviewsLoading } = useProductReviews(product?.id || (product as any)?._id || '', page, 10);
  const submitReview = useSubmitProductReview();

  const [quantity, setQuantity] = useState(1);

  if (productLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-text-secondary">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p>Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-text-primary mb-2">Product Not Found</h2>
        <p className="text-text-secondary mb-6">The product you are looking for does not exist or has been removed.</p>
        <Button onClick={() => navigate('/app')}>Return to Home</Button>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!shop) return;
    addItem(shop.id, shop.name, {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      imageUrl: product.imageUrl,
    });
    trackAnalyticsEvent('ADD_TO_CART', { productId: product.id, productName: product.name, shopId: shop.id, price: product.price, quantity });
    addToast({ title: 'Added to Cart 🛒', message: `${quantity}x ${product.name} added to cart`, type: 'success' });
  };

  const handleBuyNow = () => {
    if (!shop) return;
    setSession({
      shopId: shop.id,
      shopName: shop.name,
      item: {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity,
        imageUrl: product.imageUrl,
      }
    });
    navigate('/app/checkout', { state: { mode: 'buy-now' } });
  };

  const discountPercent = product.compareAtPrice 
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100) 
    : 0;

  return (
    <div className="space-y-6 text-left pb-24">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Left: Product Image */}
        <div className="space-y-4">
          <div className="aspect-square bg-white rounded-2xl border border-border overflow-hidden relative shadow-sm">
            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 bg-danger text-white text-xs font-extrabold px-2 py-1 rounded-md z-10 shadow-md">
                {discountPercent}% OFF
              </span>
            )}
            <img 
              src={product.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600'} 
              alt={product.name} 
              className="w-full h-full object-contain p-4"
            />
          </div>
          <div className="flex gap-4 items-center justify-center text-xs text-text-secondary font-medium">
            <span className="flex items-center gap-1.5"><ShieldCheck size={16} className="text-success" /> Quality Assured</span>
            <span className="flex items-center gap-1.5"><CheckCircle size={16} className="text-success" /> In Stock</span>
          </div>
        </div>

        {/* Right: Product Details */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-accent bg-accent/10 px-2.5 py-1 rounded-full border border-accent/20">
              {product.category}
            </span>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-text-primary leading-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-3 text-sm">
              <span className="flex items-center gap-1 text-amber-500 font-bold">
                <Star size={16} className="fill-amber-500" /> {product.averageRating || product.rating || 0}
              </span>
              <span className="text-text-secondary underline cursor-pointer">
                {product.reviewCount || 0} Reviews
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-text-primary">₹{product.price}</span>
              {product.compareAtPrice && (
                <span className="text-lg text-text-secondary line-through font-medium">₹{product.compareAtPrice}</span>
              )}
            </div>
            <p className="text-xs text-text-secondary">Inclusive of all taxes</p>
          </div>

          <div className="prose prose-sm text-text-secondary border-t border-border pt-6">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-2">Description</h3>
            <p className="leading-relaxed">{product.description}</p>
          </div>

          <div className="bg-surface border border-border p-5 rounded-xl space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-text-primary">Quantity</span>
              <div className="flex items-center bg-background border border-border rounded-lg overflow-hidden">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-surface transition-colors font-bold text-text-primary"
                >
                  -
                </button>
                <div className="w-12 h-10 flex items-center justify-center font-bold text-sm bg-surface border-x border-border">
                  {quantity}
                </div>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-surface transition-colors font-bold text-text-primary"
                >
                  +
                </button>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                className="flex-1 h-12 text-base shadow-enterprise bg-primary text-white hover:bg-primary/90" 
                onClick={handleBuyNow}
                disabled={!shop}
              >
                <Zap size={18} className="mr-2" /> Buy Now
              </Button>
              <Button 
                className="flex-1 h-12 text-base shadow-sm bg-accent text-white hover:bg-accent/90" 
                onClick={handleAddToCart}
                disabled={!shop}
              >
                <ShoppingBag size={18} className="mr-2" /> Add to Cart — ₹{(product.price * quantity).toFixed(2)}
              </Button>
            </div>
          </div>

          {/* Sold By Shop Card */}
          {shopLoading ? (
            <div className="h-24 bg-surface border border-border rounded-xl animate-pulse" />
          ) : shop ? (
            <Link 
              to={`/app/shops/${shop.slug || (shop as any)._id || shop.id}`}
              className="block bg-surface border border-border p-4 rounded-xl hover:border-primary/40 hover:shadow-md transition-all group"
            >
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Sold By</h3>
              <div className="flex items-center gap-4">
                <img src={shop.logoUrl} alt={shop.name} className="w-12 h-12 rounded-lg border border-border object-cover bg-background" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-text-primary group-hover:text-primary transition-colors truncate">{shop.name}</h4>
                  <div className="flex items-center gap-3 text-xs text-text-secondary mt-1">
                    <span className="flex items-center gap-1"><Star size={12} className="text-amber-500 fill-amber-500" /> {shop.averageRating || shop.rating || 0}</span>
                    <span className="flex items-center gap-1"><MapPin size={12} /> Local</span>
                  </div>
                </div>
                <Store size={20} className="text-text-secondary/50 group-hover:text-primary transition-colors" />
              </div>
            </Link>
          ) : null}

        </div>
      </div>

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
            productId: product.id || (product as any)._id || '',
            orderId: 'mock-order-123', // In a real app, this comes from user's order history
            ...data
          }, {
            onSuccess: () => {
              addToast({ title: 'Review Submitted', message: 'Thank you for your feedback! It will be visible after moderation.', type: 'success' });
            },
            onError: (err: any) => {
              addToast({ title: 'Submission Failed', message: err.response?.data?.message || 'Could not submit review', type: 'error' });
            }
          });
        }}
      />

    </div>
  );
};

export default ProductDetailsPage;
