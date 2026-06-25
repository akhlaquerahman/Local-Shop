import React, { useState } from 'react';
import { Star, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ImageLightbox } from '@/components/ui/ImageLightbox';

interface ReviewsSectionProps {
  averageRating: number;
  reviewCount: number;
  distribution?: Record<number, number>;
  reviews: any[];
  isLoading: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  averageRating,
  reviewCount,
  distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  reviews,
  isLoading,
  onLoadMore,
  hasMore
}) => {
  const [lightboxState, setLightboxState] = useState<{isOpen: boolean, images: string[], index: number}>({
    isOpen: false,
    images: [],
    index: 0
  });

  return (
    <div className="bg-surface border border-border rounded-xl p-6 space-y-8 mt-8 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-text-primary uppercase tracking-wider">Customer Reviews</h2>
        <Button variant="primary" onClick={() => document.getElementById('write-review-form')?.scrollIntoView({ behavior: 'smooth' })}>
          Write a Review
        </Button>
      </div>
      
      {/* Aggregate Stats */}
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start border-b border-border pb-8">
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          <div className="text-5xl font-extrabold text-text-primary flex items-center gap-2">
            {averageRating.toFixed(1)} <Star size={36} className="text-amber-500 fill-amber-500" />
          </div>
          <p className="text-sm font-medium text-text-secondary">Based on {reviewCount} Reviews</p>
        </div>

        <div className="flex-1 w-full space-y-2 max-w-sm">
          {[5, 4, 3, 2, 1].map(star => {
            const count = distribution[star] || 0;
            const percentage = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-3 text-xs font-bold text-text-secondary">
                <span className="w-4">{star}★</span>
                <div className="flex-1 h-2.5 bg-background rounded-full overflow-hidden border border-border/50">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${percentage}%` }} />
                </div>
                <span className="w-8 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review List */}
      <div className="space-y-6">
        {reviews.length === 0 && !isLoading ? (
          <div className="text-center py-10 space-y-2">
            <p className="text-text-primary font-bold">No reviews yet.</p>
            <p className="text-text-secondary">Be the first customer to review this product.</p>
          </div>
        ) : (
          reviews.map(review => (
            <div key={review._id || review.id} className="space-y-3 pb-6 border-b border-border/50 last:border-0">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                    {review.customerName?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-text-primary flex items-center gap-2">
                      {review.customerName}
                      {review.isVerifiedPurchase && (
                        <span className="flex items-center text-[10px] bg-success/10 text-success px-1.5 py-0.5 rounded font-bold uppercase">
                          <CheckCircle size={10} className="mr-1" /> Verified
                        </span>
                      )}
                    </h4>
                    <p className="text-[10px] text-text-secondary">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} size={14} className={star <= review.rating ? 'text-amber-500 fill-amber-500' : 'text-border'} />
                  ))}
                </div>
              </div>
              
              {review.title && <h5 className="font-bold text-sm text-text-primary">{review.title}</h5>}
              <p className="text-sm text-text-secondary leading-relaxed">{review.comment}</p>
              
              {review.images && review.images.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {review.images.map((img: string, idx: number) => (
                    <button 
                      key={idx} 
                      onClick={() => setLightboxState({ isOpen: true, images: review.images, index: idx })}
                      className="focus:outline-none focus:ring-2 focus:ring-primary rounded-lg overflow-hidden group relative"
                    >
                      <img 
                        src={img} 
                        alt="Review attachment" 
                        className="w-20 h-20 md:w-24 md:h-24 object-cover border border-border group-hover:opacity-90 transition-opacity" 
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                         <ImageIcon size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {hasMore && (
        <div className="text-center pt-2">
          <Button variant="outline" onClick={onLoadMore} isLoading={isLoading}>Load More Reviews</Button>
        </div>
      )}

      <ImageLightbox 
        isOpen={lightboxState.isOpen}
        images={lightboxState.images}
        initialIndex={lightboxState.index}
        onClose={() => setLightboxState(s => ({ ...s, isOpen: false }))}
      />
    </div>
  );
};

