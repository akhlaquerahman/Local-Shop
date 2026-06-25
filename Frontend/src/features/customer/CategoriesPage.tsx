import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Loader2 } from 'lucide-react';
import { useCategories } from '@/hooks/queries';

export const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: categories = [], isLoading } = useCategories();

  return (
    <div className="space-y-6 text-left">
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">Shop by Category</h1>
        <p className="text-sm text-text-secondary">Explore products from local shops categorized for your convenience.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-text-secondary py-10">
          <Loader2 className="animate-spin" size={20} /> Loading categories...
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 space-y-4 border border-border border-dashed rounded-xl">
          <ShoppingBag size={48} className="mx-auto text-text-secondary/40" />
          <div>
            <p className="font-bold text-text-primary">No categories found</p>
            <p className="text-sm text-text-secondary">Check back later or try adjusting your location.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {categories.map((cat: any) => {
            const Icon = cat.icon || ShoppingBag;

            return (
              <div 
                key={cat.id || cat.slug}
                onClick={() => navigate(`/app/categories/${cat.slug || cat.id}`)}
                className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-enterprise hover:border-accent/40 transition-all cursor-pointer group flex flex-col h-full"
              >
                {/* Category Image Header */}
                <div className="h-32 w-full relative overflow-hidden bg-background">
                  {cat.image ? (
                    <img 
                      src={cat.image} 
                      alt={cat.name || cat.label} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-surface-hover flex items-center justify-center text-text-secondary/20">
                      <ShoppingBag size={48} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className={`absolute bottom-3 left-3 w-8 h-8 rounded-full ${cat.bg || 'bg-accent/10'} ${cat.color || 'text-accent'} bg-white flex items-center justify-center shadow-sm`}>
                    <Icon size={16} />
                  </div>
                </div>

                {/* Category Info */}
                <div className="p-4 flex flex-col flex-1 justify-between">
                  <h3 className="font-bold text-sm text-text-primary mb-2 line-clamp-1">{cat.name || cat.label}</h3>
                  <div className="flex items-center gap-3 text-[10px] text-text-secondary font-medium">
                    <span className="bg-background px-2 py-1 rounded border border-border">{cat.shopCount || 0} Shops</span>
                    <span className="bg-background px-2 py-1 rounded border border-border">{cat.productCount || 0} Products</span>
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

export default CategoriesPage;
