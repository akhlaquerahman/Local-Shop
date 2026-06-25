import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingBag, Zap, MapPin } from 'lucide-react';
import { Product } from '@/domain/product';
import { Button } from '@/components/ui/Button';

interface ProductCardProps {
  product: Product;
  onAddToCart: (e: React.MouseEvent, product: Product) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent, productId: string) => void;
  showFavoriteButton?: boolean;
  onBuyNow?: (e: React.MouseEvent, productId: string) => void;
  className?: string;
  checkbox?: React.ReactNode;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  isFavorite = false,
  onToggleFavorite,
  showFavoriteButton = false,
  onBuyNow,
  className = '',
  checkbox
}) => {
  const productId = product.id || (product as any)._id || '';
  const discount = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <div
      className={`bg-surface border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-enterprise-md hover:border-accent/40 transition-all flex flex-col justify-between group min-h-[17rem] h-auto relative ${className}`}
    >
      {/* Floating Checkbox */}
      {checkbox && (
        <div className="absolute top-2 left-2 z-20">
          {checkbox}
        </div>
      )}

      {/* Floating Discount Badge */}
      {discount > 0 && !checkbox && (
        <span className="absolute top-2 left-2 bg-danger text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-danger/10 z-10">
          SAVE {discount}%
        </span>
      )}

      {/* Floating Favorite Heart */}
      {showFavoriteButton && onToggleFavorite && (
        <button
          onClick={(e) => onToggleFavorite(e, productId)}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-surface/90 border border-border flex items-center justify-center text-text-secondary hover:text-danger shadow-sm z-10 transition-colors min-h-[36px] min-w-[36px]"
          aria-label={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={14} className={isFavorite ? 'text-danger fill-danger' : 'text-text-secondary'} />
        </button>
      )}

      <Link
        to={`/app/products/${productId}`}
        className="flex flex-col flex-1"
      >
        {/* Product Image */}
        <div className="h-28 bg-background border-b border-border/40 overflow-hidden flex items-center justify-center relative">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <ShoppingBag size={24} className="text-text-secondary/30" />
          )}
        </div>

        {/* Product Info */}
        <div className="p-3.5 flex flex-col justify-between flex-1 text-left">
          <div className="space-y-1">
            <span className="text-[9px] uppercase font-bold text-text-secondary tracking-wider block truncate flex items-center gap-0.5">
              <MapPin size={9} /> {(product as any).shopName || (product as any).shop?.name || (product as any).shopId?.name || 'Local Shop'}
            </span>
            <h3 className="text-xs font-bold text-text-primary line-clamp-1 group-hover:text-accent transition-colors">
              {product.name}
            </h3>
            <div className="flex items-center gap-1">
              <Star size={10} className="text-amber-500 fill-amber-500" />
              <span className="text-[9px] text-text-secondary font-bold">
                {product.rating || 'N/A'} {product.reviewCount ? `(${product.reviewCount})` : ''}
              </span>
            </div>
          </div>

          {/* Pricing & CTA */}
          <div className="mt-2 pt-1.5 border-t border-border/30">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-xs font-extrabold text-text-primary">₹{product.price}</div>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <div className="text-[9px] text-text-secondary line-through">₹{product.compareAtPrice}</div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              {onBuyNow && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onBuyNow(e, productId);
                  }}
                  className="w-full h-8 px-2 rounded bg-primary text-white hover:bg-primary/90 text-xs font-bold transition-all shadow-sm flex items-center justify-center"
                  aria-label={`Buy ${product.name} now`}
                >
                  <Zap size={12} className="mr-1" /> Buy Now
                </button>
              )}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onAddToCart(e, product);
                }}
                className={`w-full h-8 px-2 rounded text-xs font-bold transition-all flex items-center justify-center shadow-sm ${onBuyNow ? 'bg-surface text-accent border border-accent hover:bg-accent hover:text-white' : 'bg-accent text-white hover:bg-accent/90'}`}
                aria-label={`Add ${product.name} to cart`}
              >
                {onBuyNow ? 'Add to Cart' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
