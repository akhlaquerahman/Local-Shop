import React, { useState } from 'react';
import { Star, Store, Package, Trash2, Edit2, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNotificationStore } from '@/store/notificationStore';
import { useCustomerReviews, useDeleteReview, useUpdateReview } from '@/hooks/queries';
import { ReviewModal } from '@/components/reviews/ReviewModal';

export const ReviewsPage: React.FC = () => {
  const { addToast } = useNotificationStore();
  const [filter, setFilter] = useState<'All' | 'Products' | 'Shops'>('All');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useCustomerReviews(filter, search);
  const deleteMutation = useDeleteReview();
  const updateMutation = useUpdateReview();

  const [editTarget, setEditTarget] = useState<any>(null);

  const reviews = data?.data || [];
  const stats = data?.stats || { averageRating: 0, productReviews: 0, shopReviews: 0 };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await deleteMutation.mutateAsync(id);
      addToast({ title: 'Deleted', message: 'Review removed successfully.', type: 'success' });
    } catch (err) {
      addToast({ title: 'Error', message: 'Failed to delete review.', type: 'error' });
    }
  };

  // filtering is done by backend now, so we just use reviews directly
  const filteredReviews = reviews;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} size={14} className={i < rating ? 'fill-warning text-warning' : 'fill-border text-border'} />
    ));
  };

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight flex items-center gap-3">
            <Star size={28} className="text-warning fill-warning" /> Ratings & Reviews
          </h1>
          <p className="text-sm text-text-secondary mt-1">Manage your feedback across products and shops</p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center text-warning font-bold">{stats.averageRating?.toFixed(1) || '0'}</div>
          <div><p className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Avg Rating</p><p className="font-bold text-text-primary text-sm">Overall</p></div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent"><Package size={18} /></div>
          <div><p className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Products</p><p className="font-bold text-text-primary text-sm">{stats.productReviews} reviews</p></div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success"><Store size={18} /></div>
          <div><p className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Shops</p><p className="font-bold text-text-primary text-sm">{stats.shopReviews} reviews</p></div>
        </div>
      </div>

      {/* Container */}
      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-background">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input 
              type="text" 
              placeholder="Search reviews..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-lg text-sm focus:border-accent focus:outline-none transition-colors"
            />
          </div>
          
          <div className="flex bg-surface border border-border rounded-lg p-1">
            {(['All', 'Products', 'Shops'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold capitalize transition-colors ${
                  filter === f ? 'bg-accent text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        <div className="divide-y divide-border">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-5 animate-pulse flex gap-4">
                <div className="w-16 h-16 bg-border rounded-lg" />
                <div className="flex-1 space-y-2"><div className="h-4 w-32 bg-border rounded"/><div className="h-4 w-full bg-border rounded"/><div className="h-4 w-2/3 bg-border rounded"/></div>
              </div>
            ))
          ) : filteredReviews.length > 0 ? (
            filteredReviews.map((review: any) => (
              <div key={review._id} className="p-5 flex flex-col sm:flex-row gap-5 hover:bg-background/50 transition-colors">
                <div className="flex gap-4 flex-1">
                  {review.targetImage ? (
                    <img src={review.targetImage} alt="" className="w-16 h-16 object-cover rounded-lg border border-border bg-background" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-background border border-border flex items-center justify-center text-text-secondary">
                      {review.shopId ? <Store size={24} /> : <Package size={24} />}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary border border-border bg-background px-1.5 py-0.5 rounded">
                            {review.shopId ? 'Shop' : 'Product'}
                          </span>
                          <span className="text-xs text-text-secondary">{new Date(review.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                        </div>
                        <h3 className="font-bold text-text-primary text-sm line-clamp-1">{review.targetName}</h3>
                        <div className="flex gap-1 my-2">{renderStars(review.rating)}</div>
                      </div>
                    </div>
                    {review.title && <h4 className="text-sm font-bold text-text-primary mb-1">{review.title}</h4>}
                    <p className="text-sm text-text-secondary leading-relaxed">{review.comment}</p>
                  </div>
                </div>
                
                <div className="flex sm:flex-col gap-2 justify-end sm:justify-start border-t sm:border-t-0 sm:border-l border-border pt-4 sm:pt-0 sm:pl-5 mt-4 sm:mt-0">
                  <Button variant="outline" size="sm" onClick={() => setEditTarget(review)} className="h-8 text-xs border-border flex-1 sm:flex-none justify-center hover:text-accent"><Edit2 size={14} className="mr-1.5"/> Edit</Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(review._id)} className="h-8 text-xs border-border flex-1 sm:flex-none justify-center hover:bg-danger/10 hover:text-danger hover:border-danger/30"><Trash2 size={14} className="mr-1.5"/> Delete</Button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-16 text-center">
              <Star size={40} className="mx-auto text-text-secondary/20 mb-4" />
              <p className="text-base font-bold text-text-primary">No reviews found</p>
              <p className="text-sm text-text-secondary mt-1">You haven't posted any reviews matching these filters.</p>
            </div>
          )}
        </div>
      </div>

      <ReviewModal 
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSubmit={(data) => {
          updateMutation.mutate({ id: editTarget._id, data }, {
            onSuccess: () => {
              addToast({ title: 'Updated', message: 'Review updated successfully.', type: 'success' });
              setEditTarget(null);
            },
            onError: (err: any) => {
              addToast({ title: 'Error', message: err.response?.data?.message || 'Failed to update review.', type: 'error' });
            }
          });
        }}
        isSubmitting={updateMutation.isPending}
        targetName={editTarget?.targetName || 'Review Target'}
        initialData={editTarget ? { rating: editTarget.rating, title: editTarget.title || '', comment: editTarget.comment, images: editTarget.images || [] } : undefined}
      />
    </div>
  );
};

export default ReviewsPage;
