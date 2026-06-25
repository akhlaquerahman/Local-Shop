import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  Heart, Search, ShoppingCart, Trash2, Package, ArrowUpDown, X
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/ui/cards/ProductCard';
import { useNotificationStore } from '@/store/notificationStore';
import { useCartNotificationStore } from '@/store/cartNotificationStore';
import { trackAnalyticsEvent } from '@/utils/analytics';
import { api } from '@/lib/axios';
import { 
  useWishlist, 
  useRemoveWishlist, 
  useClearWishlist, 
  useCart, 
  useAddCart 
} from '@/hooks/queries';
import { Product } from '@/domain/product';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Recently Added' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

export const WishlistPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useNotificationStore();
  const { showNotification } = useCartNotificationStore();

  const { data: wishlistProducts = [], isLoading } = useWishlist();
  const { data: cartData } = useCart();

  const removeWishlistMutation = useRemoveWishlist();
  const clearWishlistMutation = useClearWishlist();
  const addCartMutation = useAddCart();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const filteredAndSortedProducts = useMemo(() => {
    let items = [...wishlistProducts];
    if (searchQuery.trim()) {
      items = items.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    switch (sortBy) {
      case 'price_asc': return items.sort((a, b) => a.price - b.price);
      case 'price_desc': return items.sort((a, b) => b.price - a.price);
      case 'rating': return items.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      default: return items; // original order
    }
  }, [wishlistProducts, searchQuery, sortBy]);

  const handleToggleFavorite = (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    removeWishlistMutation.mutate(productId, {
      onSuccess: () => {
        addToast({ title: 'Removed', message: 'Item removed from wishlist.', type: 'info' });
        setSelectedIds(prev => prev.filter(id => id !== productId));
      }
    });
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    const productId = product.id || (product as any)._id || '';
    const shopId = product.shopId || '';
    const shopName = (product as any).shopName || 'Store';

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
        
        // Remove from wishlist
        removeWishlistMutation.mutate(productId);
      }
    });
  };

  const handleBuyNow = (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const product = wishlistProducts.find(p => p.id === productId || (p as any)._id === productId);
    if (!product) return;
    const shopId = product.shopId || '';
    const shopName = (product as any).shopName || 'Store';

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
        
        // Remove from wishlist
        removeWishlistMutation.mutate(productId);
        navigate('/app/cart');
      }
    });
  };

  // Bulk Actions
  const handleMoveSelectedToCart = async () => {
    const selectedProducts = wishlistProducts.filter(p => selectedIds.includes(p.id || (p as any)._id));
    if (selectedProducts.length === 0) return;

    const shopIds = Array.from(new Set(selectedProducts.map(p => p.shopId)));
    if (shopIds.length > 1) {
      addToast({
        title: 'Multiple Shops Selected',
        message: 'Hyperlocal restriction: Cart items must belong to the same shop. Please select items from a single shop.',
        type: 'warning'
      });
      return;
    }

    const shopId = selectedProducts[0].shopId;
    const shopName = (selectedProducts[0] as any).shopName || 'Store';

    try {
      for (const prod of selectedProducts) {
        const prodId = prod.id || (prod as any)._id;
        await api.post('/v1/cart', {
          shopId,
          shopName,
          item: {
            productId: prodId,
            name: prod.name,
            price: prod.price,
            quantity: 1,
            imageUrl: prod.imageUrl
          }
        });
        await api.delete(`/v1/wishlist?productId=${encodeURIComponent(prodId)}`);
      }

      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });

      addToast({
        title: 'Moved to Cart 🛒',
        message: `Successfully moved ${selectedProducts.length} items to your cart.`,
        type: 'success'
      });
      setSelectedIds([]);
    } catch (error) {
      addToast({
        title: 'Error moving items',
        message: 'Something went wrong while moving items to cart.',
        type: 'danger'
      });
    }
  };

  const handleRemoveSelected = async () => {
    try {
      for (const id of selectedIds) {
        await api.delete(`/v1/wishlist?productId=${encodeURIComponent(id)}`);
      }
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      addToast({
        title: 'Items Removed',
        message: `Removed ${selectedIds.length} items from your wishlist.`,
        type: 'info'
      });
      setSelectedIds([]);
    } catch (error) {
      addToast({
        title: 'Error removing items',
        message: 'Failed to remove selected items.',
        type: 'danger'
      });
    }
  };

  const handleClearWishlist = () => {
    clearWishlistMutation.mutate(undefined, {
      onSuccess: () => {
        addToast({
          title: 'Wishlist Cleared',
          message: 'All items removed from your wishlist.',
          type: 'info'
        });
        setSelectedIds([]);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 text-left">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight flex items-center gap-3">
            <Heart size={28} className="text-danger fill-danger" /> My Wishlist
          </h1>
          <p className="text-sm text-text-secondary mt-1">Loading saved items...</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4 animate-pulse">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-lg p-2.5 flex flex-col justify-between h-64">
              <div className="h-32 rounded bg-border mb-2" />
              <div className="space-y-2">
                <div className="h-3 bg-border rounded w-5/6" />
                <div className="h-2.5 bg-border rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left pb-24 relative">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight flex items-center gap-3">
            <Heart size={28} className="text-danger fill-danger" /> My Wishlist
          </h1>
          <p className="text-sm text-text-secondary mt-1">{wishlistProducts.length} saved items</p>
        </div>
        {wishlistProducts.length > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleClearWishlist}
            className="flex items-center gap-2 border-danger/20 text-danger hover:bg-danger/5"
          >
            <Trash2 size={14} /> Clear Wishlist
          </Button>
        )}
      </div>

      {/* Search + Sort Bar */}
      {wishlistProducts.length > 0 && (
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search your wishlist..."
              className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:border-accent transition-colors text-text-primary placeholder:text-text-secondary/60"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-danger">
                <X size={14} />
              </button>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg text-xs font-semibold text-text-secondary hover:bg-surface transition-colors bg-background"
            >
              <ArrowUpDown size={14} />
              <span className="hidden sm:inline">{SORT_OPTIONS.find(o => o.value === sortBy)?.label || 'Sort'}</span>
            </button>
            {showSortMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-surface border border-border rounded-lg shadow-enterprise-lg z-20 py-1">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setSortBy(opt.value); setShowSortMenu(false); }}
                    className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors ${sortBy === opt.value ? 'text-accent bg-accent/5' : 'text-text-secondary hover:bg-border/30 hover:text-text-primary'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {wishlistProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 space-y-5 border border-dashed border-border rounded-2xl bg-surface/50">
          <div className="w-20 h-20 rounded-full bg-danger/10 flex items-center justify-center">
            <Heart size={36} className="text-danger/50" />
          </div>
          <div className="text-center space-y-1.5">
            <p className="text-lg font-bold text-text-primary">Your wishlist is empty</p>
            <p className="text-sm text-text-secondary max-w-xs">Save products you love and come back to them anytime.</p>
          </div>
          <Button onClick={() => navigate('/app/categories')} size="sm">
            Explore Products
          </Button>
        </div>
      )}

      {/* No Search Results */}
      {wishlistProducts.length > 0 && filteredAndSortedProducts.length === 0 && searchQuery && (
        <div className="flex flex-col items-center justify-center py-16 space-y-4 border border-dashed border-border rounded-xl">
          <Search size={40} className="text-text-secondary/40" />
          <div className="text-center">
            <p className="font-bold text-text-primary">No results for "{searchQuery}"</p>
            <p className="text-sm text-text-secondary">Try a different search term.</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => setSearchQuery('')}>Clear Search</Button>
        </div>
      )}

      {/* Product Grid */}
      {filteredAndSortedProducts.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredAndSortedProducts.map(prod => {
            const prodId = prod.id || (prod as any)._id;
            return (
              <ProductCard
                key={prodId}
                product={prod}
                onAddToCart={(e) => handleAddToCart(e, prod)}
                showFavoriteButton={true}
                isFavorite={true}
                onToggleFavorite={handleToggleFavorite}
                onBuyNow={(e) => handleBuyNow(e, prodId)}
                checkbox={
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(prodId)}
                    onChange={() => {
                      setSelectedIds(prev =>
                        prev.includes(prodId) ? prev.filter(x => x !== prodId) : [...prev, prodId]
                      );
                    }}
                    className="w-4 h-4 rounded border-border text-accent focus:ring-accent cursor-pointer bg-surface/90"
                    onClick={(e) => e.stopPropagation()}
                  />
                }
              />
            );
          })}
        </div>
      )}

      {/* Bulk Actions Floating Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-surface border border-border shadow-enterprise-lg rounded-full px-6 py-3.5 flex items-center gap-6 z-50 animate-slide-up backdrop-blur-md bg-surface/90 max-w-[90%] sm:max-w-xl">
          <div className="flex items-center gap-2 flex-shrink-0">
            <input
              type="checkbox"
              id="select-all"
              checked={selectedIds.length === filteredAndSortedProducts.length}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedIds(filteredAndSortedProducts.map(p => p.id || (p as any)._id));
                } else {
                  setSelectedIds([]);
                }
              }}
              className="w-4 h-4 rounded border-border text-accent focus:ring-accent cursor-pointer"
            />
            <label htmlFor="select-all" className="text-xs font-bold text-text-primary cursor-pointer select-none">
              Select All ({selectedIds.length})
            </label>
          </div>

          <div className="h-5 w-[1px] bg-border" />

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              onClick={handleMoveSelectedToCart}
              className="flex items-center gap-1.5 text-xs py-1.5 px-3 h-8 bg-accent"
            >
              <ShoppingCart size={13} /> Move to Cart
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleRemoveSelected}
              className="flex items-center gap-1.5 text-xs py-1.5 px-3 h-8 border-danger/30 text-danger hover:bg-danger/5"
            >
              <Trash2 size={13} /> Remove
            </Button>

            <button
              onClick={() => setSelectedIds([])}
              className="text-[11px] font-bold text-text-secondary hover:text-text-primary ml-2 select-none"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Discover More CTA */}
      {wishlistProducts.length > 0 && (
        <div className="border-t border-border pt-6 text-center space-y-3">
          <p className="text-sm text-text-secondary">Discover more products you'll love</p>
          <Button variant="outline" size="sm" onClick={() => navigate('/app/categories')}>
            <Package size={14} className="mr-2" /> Browse All Categories
          </Button>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
