import React, { useState, useEffect } from 'react';
import { Star, Clock, MapPin, LayoutGrid, List, X, ChevronDown, Store, Filter, Loader2, AlertCircle, Map } from 'lucide-react';
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
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { trackAnalyticsEvent } from '@/utils/analytics';
import { useShops, useCategories } from '@/hooks/queries';
import { Shop } from '@/domain/shop';

const SORT_OPTIONS = [
  { value: 'nearest', label: 'Nearest First' },
  { value: 'top_rated', label: 'Top Rated' },
  { value: 'fast_delivery', label: 'Fast Delivery' },
];

const VIEW_MODE_KEY = 'localshop_shops_view_mode';

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

const FilterSkeleton = () => (
  <div className="flex gap-2 overflow-x-auto pb-1 animate-pulse">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="h-7 w-20 bg-border rounded-full flex-shrink-0" />
    ))}
  </div>
);

const ShopsGridSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 animate-pulse">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="bg-surface border border-border rounded-lg p-2.5 flex flex-col justify-between h-40">
        <div className="h-20 rounded bg-border mb-2" />
        <div className="space-y-1.5">
          <div className="h-3 bg-border rounded w-5/6" />
          <div className="h-2.5 bg-border rounded w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

export const ShopsPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSort, setSelectedSort] = useState('top_rated');
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Persist View Mode state (Grid / List / Map) in Local Storage
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>(() => {
    const saved = localStorage.getItem(VIEW_MODE_KEY);
    return (saved === 'grid' || saved === 'list' || saved === 'map') ? saved : 'grid';
  });

  useEffect(() => {
    localStorage.setItem(VIEW_MODE_KEY, viewMode);
  }, [viewMode]);

  // Dynamic Categories from Backend (For Filter Chips)
  const { data: categories = [], isLoading: catLoading } = useCategories();

  // Query parameter filters for API request
  const apiFilters = {
    category: selectedCategory !== 'All' ? selectedCategory : undefined,
    minRating: minRating > 0 ? minRating : undefined,
    openOnly: openNowOnly ? true : undefined
  };

  const { data: fetchedShops = [], isLoading: shopsLoading, isError: shopsError, refetch } = useShops(apiFilters);

  // Sorting results on client side
  const sortedShops = React.useMemo(() => {
    let shops = [...fetchedShops];
    if (selectedSort === 'top_rated') {
      shops.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (selectedSort === 'nearest') {
      shops.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    } else if (selectedSort === 'fast_delivery') {
      // Sort fast delivery by parsing eta numbers
      shops.sort((a, b) => {
        const aEta = parseInt(a.eta || '30') || 30;
        const bEta = parseInt(b.eta || '30') || 30;
        return aEta - bEta;
      });
    }
    return shops;
  }, [fetchedShops, selectedSort]);

  const handleShopClick = (shop: Shop) => {
    trackAnalyticsEvent('STORE_CLICK', { shopId: shop.id || shop._id, shopName: shop.name });
    navigate(`/app/shops/${shop.slug}`);
  };

  return (
    <div className="space-y-4 text-left pb-16">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-extrabold text-text-primary tracking-tight">Browse Local Shops</h1>
          <p className="text-[11px] text-text-secondary flex items-center gap-1 mt-0.5">
            <MapPin size={11} className="text-accent" />
            Showing active stores near <span className="font-semibold text-text-primary">Sector 62, Noida, UP</span>
          </p>
        </div>
        
        {/* Controls: View Mode & Filters */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex border border-border rounded-md overflow-hidden bg-surface">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ${viewMode === 'grid' ? 'bg-accent/10 text-accent font-semibold' : 'hover:bg-border/30 text-text-secondary'}`}
              aria-label="Grid View"
              title="Grid View"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 border-l border-border transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ${viewMode === 'list' ? 'bg-accent/10 text-accent font-semibold' : 'hover:bg-border/30 text-text-secondary'}`}
              aria-label="List View"
              title="List View"
            >
              <List size={15} />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 border-l border-border transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ${viewMode === 'map' ? 'bg-accent/10 text-accent font-semibold' : 'hover:bg-border/30 text-text-secondary'}`}
              aria-label="Map View"
              title="Map View"
            >
              <Map size={15} />
            </button>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md border text-xs font-semibold transition-all min-h-[44px] ${showFilters ? 'bg-accent border-accent text-white' : 'border-border bg-surface text-text-secondary hover:bg-border/20'}`}
            aria-label="Toggle Advanced Filters"
          >
            <Filter size={13} />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Category Scroll Row */}
      {catLoading ? (
        <FilterSkeleton />
      ) : (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-border">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1 rounded-full text-[11px] font-bold border flex-shrink-0 transition-all min-h-[30px] ${
              selectedCategory === 'All'
                ? 'bg-accent text-white border-accent shadow-sm'
                : 'bg-surface border-border text-text-secondary hover:border-accent/40 hover:text-text-primary'
            }`}
            aria-label="Show All Categories"
          >
            All
          </button>
          {categories.map((cat: any) => (
            <button
              key={cat.slug || cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold border flex-shrink-0 transition-all min-h-[30px] ${
                selectedCategory === cat.name
                  ? 'bg-accent text-white border-accent shadow-sm'
                  : 'bg-surface border-border text-text-secondary hover:border-accent/40 hover:text-text-primary'
              }`}
              aria-label={`Filter by ${cat.name}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Advanced Filter Panel (Collapsible) */}
      {showFilters && (
        <div className="bg-surface border border-border rounded-xl p-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs animate-in slide-in-from-top duration-200">
          {/* Sort Selection */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-text-secondary tracking-wider">Sort Results</label>
            <div className="relative">
              <select
                value={selectedSort}
                onChange={e => setSelectedSort(e.target.value)}
                className="w-full bg-background border border-border rounded-md px-2.5 py-1.5 text-xs font-semibold text-text-primary appearance-none cursor-pointer min-h-[36px]"
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
            </div>
          </div>

          {/* Min Rating */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-text-secondary tracking-wider">Min Rating</label>
            <div className="flex gap-1.5">
              {[0, 3, 4, 4.5].map(r => (
                <button
                  key={r}
                  onClick={() => setMinRating(r)}
                  className={`flex-grow py-1.5 rounded-md border text-xs font-bold transition-all min-h-[36px] ${
                    minRating === r ? 'bg-accent/15 border-accent text-accent font-extrabold' : 'border-border text-text-secondary hover:bg-border/30'
                  }`}
                >
                  {r === 0 ? 'All' : `${r}★`}
                </button>
              ))}
            </div>
          </div>

          {/* Open Now Toggle */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-text-secondary tracking-wider">Availability</label>
            <button
              onClick={() => setOpenNowOnly(!openNowOnly)}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md border text-xs font-bold transition-all min-h-[36px] ${
                openNowOnly ? 'bg-success/10 border-success text-success' : 'bg-background border-border text-text-secondary hover:bg-surface'
              }`}
            >
              <span>Open Stores Only</span>
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${openNowOnly ? 'border-success bg-success' : 'border-border'}`}>
                {openNowOnly && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Results Header Info & Active Pills */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
        <p className="text-text-secondary">
          Showing <span className="font-bold text-text-primary">{sortedShops.length}</span> shops
        </p>
        <div className="flex items-center gap-1.5 flex-wrap">
          {selectedCategory !== 'All' && (
            <span className="flex items-center gap-1 bg-accent/10 text-accent border border-accent/20 rounded-full px-2 py-0.5 text-[9px] font-bold">
              {selectedCategory}
              <button onClick={() => setSelectedCategory('All')} aria-label="Clear category filter"><X size={9} /></button>
            </span>
          )}
          {openNowOnly && (
            <span className="flex items-center gap-1 bg-success/10 text-success border border-success/20 rounded-full px-2 py-0.5 text-[9px] font-bold">
              Open Now
              <button onClick={() => setOpenNowOnly(false)} aria-label="Clear open now filter"><X size={9} /></button>
            </span>
          )}
          {minRating > 0 && (
            <span className="flex items-center gap-1 bg-warning/10 text-warning border border-warning/20 rounded-full px-2 py-0.5 text-[9px] font-bold">
              {minRating}★+
              <button onClick={() => setMinRating(0)} aria-label="Clear rating filter"><X size={9} /></button>
            </span>
          )}
        </div>
      </div>

      {/* Shops Grid / List View */}
      {shopsLoading ? (
        <ShopsGridSkeleton />
      ) : shopsError ? (
        <div className="text-center py-12 space-y-4 max-w-sm mx-auto" role="alert">
          <AlertCircle className="w-10 h-10 mx-auto text-danger" />
          <div>
            <p className="font-bold text-text-primary">Failed to load shops</p>
            <p className="text-xs text-text-secondary mt-1">There was a problem querying the database.</p>
          </div>
          <Button size="sm" onClick={() => refetch()}>Try Again</Button>
        </div>
      ) : sortedShops.length === 0 ? (
        <div className="text-center py-16 space-y-3 border border-border border-dashed rounded-xl max-w-md mx-auto">
          <Store size={36} className="mx-auto text-text-secondary/40" />
          <div>
            <p className="font-bold text-text-primary text-sm">No shops match your filters</p>
            <p className="text-xs text-text-secondary mt-0.5">Try clearing filters or selecting another category aisle.</p>
          </div>
          <Button size="sm" className="min-h-[38px]" onClick={() => { setSelectedCategory('All'); setOpenNowOnly(false); setMinRating(0); }}>
            Clear Filters
          </Button>
        </div>
      ) : viewMode === 'map' ? (
        <div className="h-[500px] w-full rounded-xl overflow-hidden border border-border relative z-0">
          <MapContainer 
            center={[28.6139, 77.2090]} // Fallback center
            zoom={13} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {sortedShops.filter(s => s.location?.coordinates && s.location.coordinates.length === 2).map(shop => (
              <Marker 
                key={shop.id || shop._id} 
                position={[shop.location.coordinates[1], shop.location.coordinates[0]]}
              >
                <Popup>
                  <div className="text-center">
                    <b className="text-sm font-bold block mb-1">{shop.name}</b>
                    <span className="text-xs text-text-secondary block mb-2">{shop.category}</span>
                    <Button size="sm" className="w-full text-[10px] h-6" onClick={() => handleShopClick(shop)}>View Shop</Button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3' : 'space-y-2'}>
          {sortedShops.map(shop => {
            const isOpen = isShopOpen(shop);
            return viewMode === 'grid' ? (
              /* Grid Card (Compact Height, Descriptions Removed) */
              <div
                key={shop.id || shop._id}
                onClick={() => handleShopClick(shop)}
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter') handleShopClick(shop); }}
                className="bg-surface border border-border rounded-lg overflow-hidden shadow-sm hover:border-accent/40 hover:-translate-y-0.5 transition-all cursor-pointer group flex flex-col focus-visible:ring-2 focus-visible:ring-primary outline-none"
              >
                <div className="relative h-20 bg-background overflow-hidden">
                  <img src={shop.logoUrl} alt={shop.name} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute top-1.5 right-1.5">
                    <span className={`px-1.5 py-0.2 rounded text-[8px] font-extrabold ${isOpen ? 'bg-success text-white' : 'bg-background/80 text-text-secondary border border-border'}`}>
                      {isOpen ? 'Open' : 'Closed'}
                    </span>
                  </div>
                  {shop.isFeatured && (
                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.2 rounded text-[8px] font-extrabold bg-accent text-white">Featured</span>
                  )}
                  <div className="absolute bottom-1.5 left-1.5">
                    <h3 className="font-bold text-xs text-white truncate drop-shadow-sm">{shop.name}</h3>
                  </div>
                </div>
                <div className="p-2 flex flex-col flex-1 justify-between">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-text-secondary">
                    <span className="flex items-center gap-0.5">
                      <Star size={10} className="text-amber-500 fill-amber-500" />
                      <span className="text-text-primary font-bold">{shop.rating || 'New'}</span>
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Clock size={10} />
                      {shop.eta || '15-20 min'}
                    </span>
                    <span className="px-1 py-0.2 bg-background rounded border border-border capitalize max-w-[65px] truncate">{shop.category}</span>
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-text-secondary border-t border-border/60 mt-1.5 pt-1.5">
                    <span className="flex items-center gap-0.5"><MapPin size={9} />{shop.distance ? `${shop.distance} km` : '1.2 km'}</span>
                    <span>Del. Fee: ₹{shop.deliveryFee ?? 40}</span>
                  </div>
                </div>
              </div>
            ) : (
              /* List Card (Compact Height, Descriptions Removed) */
              <div
                key={shop.id || shop._id}
                onClick={() => handleShopClick(shop)}
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter') handleShopClick(shop); }}
                className="bg-surface border border-border rounded-lg p-2.5 flex gap-3 hover:border-accent/40 transition-all cursor-pointer group focus-visible:ring-2 focus-visible:ring-primary outline-none"
              >
                <img src={shop.logoUrl} alt={shop.name} className="w-12 h-12 rounded object-cover border border-border flex-shrink-0 bg-background" />
                <div className="flex flex-col justify-center flex-1 min-w-0 text-left space-y-1">
                  <div className="flex items-center gap-2 justify-between">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-xs text-text-primary truncate">{shop.name}</h3>
                      {shop.isFeatured && <span className="text-[8px] bg-accent/15 border border-accent/20 text-accent px-1.5 py-0.2 rounded font-extrabold flex-shrink-0">FEATURED</span>}
                    </div>
                    <span className={`px-1.5 py-0.2 rounded text-[8px] font-extrabold ${isOpen ? 'bg-success/10 text-success' : 'bg-background border border-border text-text-secondary'}`}>
                      {isOpen ? 'Open' : 'Closed'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3.5 text-[9px] font-semibold text-text-secondary">
                    <span className="flex items-center gap-0.5"><Star size={10} className="text-amber-500 fill-amber-500" /><span className="text-text-primary font-bold">{shop.rating || 'New'}</span></span>
                    <span className="flex items-center gap-0.5"><Clock size={10} />{shop.eta || '15-20 min'}</span>
                    <span className="flex items-center gap-0.5"><MapPin size={9} />{shop.distance ? `${shop.distance} km` : '1.2 km'}</span>
                    <span>Fee: ₹{shop.deliveryFee ?? 40}</span>
                    <span className="px-1.5 py-0.2 bg-surface rounded border border-border capitalize text-[8px] ml-auto">{shop.category}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ShopsPage;
