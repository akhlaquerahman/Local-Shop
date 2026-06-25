import React, { useState } from 'react';
import { Tag, Search, Filter, Copy, CheckCircle2, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNotificationStore } from '@/store/notificationStore';
import { trackAnalyticsEvent } from '@/utils/analytics';
import { useCoupons, useCouponStats } from '@/hooks/queries';

export const CouponsPage: React.FC = () => {
  const { addToast } = useNotificationStore();
  const [filter, setFilter] = useState<'available' | 'used' | 'expired'>('available');
  const [search, setSearch] = useState('');

  const { data: couponsData, isLoading: isCouponsLoading } = useCoupons(filter);
  const { data: statsData, isLoading: isStatsLoading } = useCouponStats();

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    addToast({ title: 'Code Copied', message: `Coupon ${code} copied to clipboard!`, type: 'success' });
    trackAnalyticsEvent('COUPON_COPIED', { code });
  };

  const filteredCoupons = couponsData?.filter((c: any) => 
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    (c.usageConditions && c.usageConditions.toLowerCase().includes(search.toLowerCase()))
  ) || [];

  const isLoading = isCouponsLoading || isStatsLoading;

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight flex items-center gap-3">
            <Ticket size={28} className="text-accent" /> My Coupons
          </h1>
          <p className="text-sm text-text-secondary mt-1">Unlock discounts and manage your promo codes</p>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-background">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input 
              type="text" 
              placeholder="Search by code or offer..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-lg text-sm focus:border-accent focus:outline-none transition-colors"
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <div className="flex bg-surface border border-border rounded-lg p-1">
              {(['available', 'used', 'expired'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-md text-xs font-semibold capitalize transition-colors flex items-center gap-2 ${
                    filter === f ? 'bg-accent text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {f}
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                    filter === f ? 'bg-white/20 text-white' : 'bg-background border border-border'
                  }`}>
                    {statsData?.[f] || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Coupons Grid */}
        <div className="p-4 bg-background/50 min-h-[400px]">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-surface border border-border rounded-xl p-5 h-36 animate-pulse" />
              ))}
            </div>
          ) : filteredCoupons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCoupons.map((coupon: any) => (
                <div 
                  key={coupon._id || coupon.code} 
                  className={`relative flex flex-col justify-between bg-surface border rounded-xl overflow-hidden transition-all hover:shadow-md
                    ${filter === 'available' ? 'border-border' : 'border-border/50 opacity-70'}
                  `}
                >
                  {/* Perforation edge decoration */}
                  <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-4 bg-background rounded-full border-r border-border" />
                  <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-4 bg-background rounded-full border-l border-border" />
                  
                  <div className="p-4 pb-3 flex flex-col flex-1 border-b border-dashed border-border/60">
                    <div className="flex justify-between items-start mb-2">
                      <span className="inline-flex items-center gap-1.5 bg-accent/10 text-accent px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-widest border border-accent/20">
                        <Tag size={10} /> CODE
                      </span>
                      {filter === 'available' && coupon.expiryDate && (
                        <span className="text-[10px] text-warning font-semibold">
                          Valid till {new Date(coupon.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-black text-text-primary font-mono tracking-tight">{coupon.code}</h3>
                    
                    <div className="mt-2 space-y-1">
                      <p className="text-sm font-bold text-success">Save ₹{coupon.discountAmount}</p>
                      <p className="text-xs text-text-secondary line-clamp-1" title={coupon.usageConditions}>
                        {coupon.usageConditions || `Min. order ₹${coupon.minOrderAmount}`}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-background flex items-center justify-between gap-3">
                    <p className="text-[10px] text-text-secondary/60 uppercase font-semibold">
                      {filter === 'available' ? 'Ready to use' : filter}
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleCopyCode(coupon.code)}
                        className="h-7 text-xs px-2 py-0 border-border bg-surface text-text-primary hover:border-accent hover:text-accent"
                      >
                        <Copy size={12} className="mr-1" /> Copy
                      </Button>
                      {filter === 'available' && (
                        <Button 
                          size="sm" 
                          className="h-7 text-xs px-3 py-0 bg-accent text-white"
                          onClick={() => {
                            addToast({ title: 'Redirecting', message: 'Redirecting to cart to apply coupon', type: 'info' });
                          }}
                        >
                          Apply
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-20">
              <Filter size={40} className="text-text-secondary/20 mb-4" />
              <p className="text-base font-bold text-text-primary">No {filter} coupons found</p>
              <p className="text-sm text-text-secondary mt-1 max-w-sm text-center">
                {filter === 'available' ? 'You have used all your coupons! Check back later for more exciting offers.' : 'Try adjusting your search criteria.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CouponsPage;
