import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Search, Mic, Star, Plus, Store, Grid3X3, Clock, X, TrendingUp, History, ArrowRight, MapPin, ShoppingBag, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store/cartStore';
import { useNotificationStore } from '@/store/notificationStore';
import { trackAnalyticsEvent } from '@/utils/analytics';
import { Product } from '@/domain/product';
import { Shop } from '@/domain/shop';
import { 
  useSearch, 
  useSearchSuggestions, 
  useRecentSearches, 
  useTrendingSearches,
  useAddRecentSearch,
  useDeleteRecentSearch,
  useCategories
} from '@/hooks/queries';
import { Category } from '@/hooks/queries';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import { Loader2 } from 'lucide-react';

type TabId = 'all' | 'products' | 'shops' | 'categories';

const TABS: { id: TabId; label: string }[] = [
  { id: 'all', label: 'All Results' },
  { id: 'products', label: 'Products' },
  { id: 'shops', label: 'Shops' },
  { id: 'categories', label: 'Categories' },
];

const ProductsGridSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 animate-pulse">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="bg-surface border border-border rounded-lg p-2.5 flex flex-col justify-between h-44">
        <div className="h-24 rounded bg-border mb-2" />
        <div className="space-y-1.5">
          <div className="h-3 bg-border rounded w-5/6" />
          <div className="h-2.5 bg-border rounded w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

export const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addItem } = useCartStore();
  const { addToast } = useNotificationStore();

  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const [isFocused, setIsFocused] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced query for real-time search suggestions
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 250);
    return () => clearTimeout(handler);
  }, [query]);

  // Sync route query parameters on enter / submit
  const triggerSearch = (term: string) => {
    const trimmed = term.trim();
    if (trimmed) {
      setSearchParams({ q: trimmed });
      addRecentSearch(trimmed);
      trackAnalyticsEvent('SEARCH', { query: trimmed });
    } else {
      setSearchParams({});
    }
    setIsFocused(false);
    inputRef.current?.blur();
  };

  // ─── QUERY HOOKS INTEGRATION ───────────────────────────────────────────────
  
  const { data: trendingSearches = [], isLoading: trendingLoading } = useTrendingSearches();
  const { data: recentSearches = [], isLoading: recentLoading } = useRecentSearches();
  const { mutate: addRecentSearch } = useAddRecentSearch();
  const { mutate: deleteRecentSearch } = useDeleteRecentSearch();
  const { data: categoriesList = [], isLoading: catLoading } = useCategories();

  // Suggestions API call (enabled when debounced query is present and user is typing)
  const { data: suggestions, isLoading: suggestionsLoading } = useSearchSuggestions(debouncedQuery);

  // Full Search Results API call (enabled when a query exists in route params)
  const searchQuery = searchParams.get('q') || '';
  const { data: searchResults, isLoading: searchLoading, isError: searchError } = useSearch(searchQuery);

  const matchedProducts = searchResults?.products || [];
  const matchedShops = searchResults?.shops || [];
  const matchedCategories = searchResults?.categories || [];
  const hasResults = matchedProducts.length > 0 || matchedShops.length > 0 || matchedCategories.length > 0;

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
    addToast({ title: 'Added to Cart 🛒', message: `${product.name} added to cart`, type: 'success' });
  };

  const handleClearSearch = () => {
    setQuery('');
    setDebouncedQuery('');
    setSearchParams({});
    inputRef.current?.focus();
    setIsFocused(true);
  };

  // Open suggestions dropdown on focus
  const showRecentTrending = isFocused && !query.trim();
  const showSuggestionsDropdown = isFocused && query.trim() && suggestions;

  return (
    <div className="space-y-4 text-left max-w-4xl mx-auto w-full pb-16 relative">
      {/* Search Input Box */}
      <div className="relative">
        <div className={`relative flex items-center bg-surface border rounded-xl h-12 transition-all shadow-sm ${isFocused ? 'border-accent ring-2 ring-accent/15' : 'border-border'}`}>
          <Search size={18} className={`absolute left-4 transition-colors ${isFocused ? 'text-accent' : 'text-text-secondary'}`} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 250)}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') triggerSearch(query);
              if (e.key === 'Escape') handleClearSearch();
            }}
            placeholder="Search products, stores, categories..."
            className="w-full h-full bg-transparent pl-11 pr-20 text-xs text-text-primary placeholder:text-text-secondary/60 focus:outline-none"
            aria-label="Search inputs"
          />
          <div className="absolute right-0 flex items-center h-full pr-1.5">
            {query && (
              <button 
                onClick={handleClearSearch} 
                className="p-2 text-text-secondary hover:text-danger transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Clear search query"
              >
                <X size={15} />
              </button>
            )}
            <button
              onClick={() => addToast({ title: 'Voice Search', message: 'Voice input requires mic permissions.', type: 'info' })}
              className="h-9 w-9 flex items-center justify-center text-text-secondary hover:text-accent border-l border-border transition-colors"
              aria-label="Voice Search"
            >
              <Mic size={16} />
            </button>
          </div>
        </div>

        {/* Dropdown 1: Recent & Trending (No active input query) */}
        {showRecentTrending && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-surface border border-border rounded-xl shadow-enterprise-lg z-50 p-4 space-y-4 animate-in fade-in duration-100">
            {recentSearches.length > 0 && (
              <div className="space-y-1.5 text-left">
                <div className="flex items-center justify-between pb-1 border-b border-border/50">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1"><History size={11} /> Recent Searches</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {recentSearches.map(term => (
                    <div key={term} className="flex items-center gap-1 bg-background border border-border rounded-full pl-3 pr-1.5 py-0.5 text-xs text-text-primary hover:border-accent/50 transition-colors group">
                      <button onClick={() => { setQuery(term); triggerSearch(term); }} className="font-semibold text-[11px]">{term}</button>
                      <button 
                        onClick={() => deleteRecentSearch(term)} 
                        className="text-text-secondary hover:text-danger p-0.5 min-h-[24px] min-w-[24px] flex items-center justify-center"
                        aria-label={`Remove search term ${term}`}
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between pb-1 border-b border-border/50">
                <span className="text-[9px] font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1"><TrendingUp size={11} /> Trending Searches</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1">
                {trendingSearches.map(term => (
                  <button
                    key={term}
                    onClick={() => { setQuery(term); triggerSearch(term); }}
                    className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-background text-xs text-text-primary font-medium group transition-colors text-left min-h-[36px]"
                  >
                    <span className="flex items-center gap-2"><TrendingUp size={12} className="text-accent" />{term}</span>
                    <ArrowRight size={11} className="text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Dropdown 2: Real-time Search Suggestions Dropdown */}
        {showSuggestionsDropdown && suggestions && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-surface border border-border rounded-xl shadow-enterprise-lg z-50 p-2.5 space-y-3 max-h-80 overflow-y-auto animate-in fade-in duration-100 text-left">
            {suggestions.products.length === 0 && suggestions.shops.length === 0 && suggestions.categories.length === 0 ? (
              <div className="text-center py-4 text-xs text-text-secondary">No suggestions found. Press enter to search fully.</div>
            ) : (
              <>
                {suggestions.categories.length > 0 && (
                  <div className="space-y-1">
                    <span className="px-2 text-[8px] font-extrabold text-text-secondary uppercase tracking-wider">Categories</span>
                    {suggestions.categories.map(cat => (
                      <button
                        key={cat.slug || cat.id}
                        onClick={() => navigate(`/app/categories/${cat.slug || cat.id}`)}
                        className="w-full text-left px-2 py-1.5 hover:bg-background rounded text-xs flex items-center gap-2 text-text-primary min-h-[36px]"
                      >
                        <Grid3X3 size={12} className="text-accent" />
                        <span className="font-bold">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                )}
                {suggestions.shops.length > 0 && (
                  <div className="space-y-1 border-t border-border/40 pt-1.5">
                    <span className="px-2 text-[8px] font-extrabold text-text-secondary uppercase tracking-wider">Stores</span>
                    {suggestions.shops.map(shop => (
                      <button
                        key={shop.id || shop._id}
                        onClick={() => navigate(`/app/shops/${shop.slug}`)}
                        className="w-full text-left px-2 py-1.5 hover:bg-background rounded text-xs flex items-center gap-2 text-text-primary min-h-[36px]"
                      >
                        <Store size={12} className="text-accent" />
                        <span className="font-bold">{shop.name}</span>
                      </button>
                    ))}
                  </div>
                )}
                {suggestions.products.length > 0 && (
                  <div className="space-y-1 border-t border-border/40 pt-1.5">
                    <span className="px-2 text-[8px] font-extrabold text-text-secondary uppercase tracking-wider">Products</span>
                    {suggestions.products.map(prod => (
                      <button
                        key={prod.id || prod._id}
                        onClick={() => navigate(`/app/products/${prod.id || prod._id}`)}
                        className="w-full text-left px-2 py-1.5 hover:bg-background rounded text-xs flex items-center gap-2 text-text-primary min-h-[36px]"
                      >
                        <ShoppingBag size={12} className="text-accent" />
                        <span className="truncate">{prod.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* SEARCH RESULTS CONTENT BLOCK */}
      {searchQuery && (
        <div className="space-y-4 pt-2">
          {/* Result Tabs */}
          <div className="flex gap-1 border-b border-border overflow-x-auto">
            {TABS.map(tab => {
              const count = tab.id === 'all' ? matchedProducts.length + matchedShops.length + matchedCategories.length
                : tab.id === 'products' ? matchedProducts.length
                : tab.id === 'shops' ? matchedShops.length
                : matchedCategories.length;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 min-h-[40px] ${
                    activeTab === tab.id ? 'border-accent text-accent' : 'border-transparent text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold ${activeTab === tab.id ? 'bg-accent text-white' : 'bg-border text-text-secondary'}`}>{count}</span>
                </button>
              );
            })}
          </div>

          {/* Loading States */}
          {searchLoading && <ProductsGridSkeleton />}

          {/* Results Rendering */}
          {!searchLoading && (
            <>
              {/* Empty Search results State */}
              {!hasResults ? (
                <div className="text-center py-16 space-y-3 max-w-md mx-auto">
                  <ShoppingBag size={40} className="mx-auto text-text-secondary/35" />
                  <div>
                    <p className="font-bold text-text-primary text-sm">No results match "{searchQuery}"</p>
                    <p className="text-xs text-text-secondary mt-0.5">Try searching for other products, groceries, or bakery goods.</p>
                  </div>
                  <Button size="sm" className="min-h-[38px]" onClick={() => navigate('/app')}>Browse Aisles</Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Products Matches */}
                  {(activeTab === 'all' || activeTab === 'products') && matchedProducts.length > 0 && (
                    <div className="space-y-2 text-left">
                      {activeTab === 'all' && <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5"><ShoppingBag size={14} className="text-accent" />Products</h3>}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {matchedProducts.map(prod => (
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
                                <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                              </div>
                              <div className="space-y-0.5 text-left">
                                <span className="text-[9px] uppercase font-bold text-text-secondary block truncate flex items-center gap-1"><MapPin size={9} />{prod.shopName || 'Local Shop'}</span>
                                <h4 className="text-xs font-bold text-text-primary truncate">{prod.name}</h4>
                              </div>
                            </div>
                            <div className="mt-3 flex items-center justify-between">
                              <div className="text-left">
                                <div className="text-xs font-bold text-text-primary">₹{prod.price}</div>
                                {prod.compareAtPrice && prod.compareAtPrice > prod.price && <div className="text-[9px] text-text-secondary line-through">₹{prod.compareAtPrice}</div>}
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
                    </div>
                  )}

                  {/* Shops Matches */}
                  {(activeTab === 'all' || activeTab === 'shops') && matchedShops.length > 0 && (
                    <div className="space-y-2 text-left">
                      {activeTab === 'all' && <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5"><Store size={14} className="text-accent" />Shops</h3>}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {matchedShops.map(shop => (
                          <Link
                            key={shop.id || shop._id}
                            to={`/app/shops/${shop.slug}`}
                            className="bg-surface border border-border rounded-lg p-2.5 flex items-center gap-3 cursor-pointer hover:border-accent/40 shadow-sm transition-all group"
                          >
                            <img src={shop.logoUrl} alt={shop.name} className="w-12 h-12 rounded object-cover border border-border flex-shrink-0 bg-background" />
                            <div className="min-w-0 flex-1 text-left space-y-0.5">
                              <div className="flex items-center gap-1.5 justify-between">
                                <h3 className="font-bold text-xs text-text-primary truncate">{shop.name}</h3>
                                {shop.isFeatured && <span className="text-[8px] bg-accent/15 border border-accent/20 text-accent px-1.5 py-0.2 rounded font-extrabold flex-shrink-0">FEATURED</span>}
                              </div>
                              <div className="flex items-center gap-3 text-[9px] font-semibold text-text-secondary">
                                <span className="flex items-center gap-0.5"><Star size={10} className="text-amber-500 fill-amber-500" />{shop.rating || 'N/A'}</span>
                                <span className="flex items-center gap-0.5"><Clock size={10} />{shop.eta || '15-20 min'}</span>
                                <span className="px-1.5 py-0.2 bg-background rounded border border-border capitalize text-[8px]">{shop.category}</span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Categories Matches */}
                  {(activeTab === 'all' || activeTab === 'categories') && matchedCategories.length > 0 && (
                    <div className="space-y-2 text-left">
                      {activeTab === 'all' && <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5"><Grid3X3 size={14} className="text-accent" />Categories</h3>}
                      <div className="flex flex-wrap gap-2">
                        {matchedCategories.map(cat => (
                          <button
                            key={cat.slug || cat.id}
                            onClick={() => navigate(`/app/categories/${cat.slug || cat.id}`)}
                            className="flex items-center gap-2.5 bg-surface border border-border rounded-xl px-3 py-2 hover:border-accent/40 hover:bg-accent/5 transition-all group min-h-[44px]"
                          >
                            <Grid3X3 size={13} className="text-accent" />
                            <span className="text-xs font-bold text-text-primary">{cat.name}</span>
                            <ArrowRight size={11} className="text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* No Query: Show popular categories loaded from backend */}
      {!searchQuery && (
        <div className="space-y-4 pt-2 text-left animate-in fade-in duration-200">
          <h2 className="text-sm font-bold text-text-primary">Popular Categories</h2>
          {catLoading ? (
            <div className="flex items-center gap-2 text-text-secondary text-xs">
              <Loader2 className="animate-spin" size={14} /> Loading categories...
            </div>
          ) : categoriesList.length === 0 ? (
            <div className="p-4 border border-dashed border-border rounded-lg text-center text-xs text-text-secondary">
              No categories available.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {categoriesList.slice(0, 6).map(cat => (
                <button
                  key={cat.slug || cat.id}
                  onClick={() => navigate(`/app/categories/${cat.slug || cat.id}`)}
                  className="bg-surface border border-border rounded-xl p-3.5 text-center hover:border-accent/40 hover:bg-accent/5 transition-all group shadow-sm focus-visible:ring-2 focus-visible:ring-primary outline-none"
                >
                  <div className="h-8 w-full flex items-center justify-center rounded bg-background overflow-hidden mb-2 relative">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="text-xl text-text-secondary group-hover:text-primary">
                        <DynamicIcon name={cat.icon || 'ShoppingBag'} size={18} />
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-text-primary block truncate">{cat.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
