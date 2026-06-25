import React from 'react';
import { Star, ThumbsUp, ThumbsDown, MessageSquare, Loader2 } from 'lucide-react';
import { useRiderRatings } from '../services/rider.queries';

export const RatingsPage: React.FC = () => {
  const { data, isLoading } = useRiderRatings();

  const average = parseFloat(data?.average || "0");
  const total = data?.total || 0;
  const reviews = data?.reviews || [];

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto pb-20">
      <div>
        <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Ratings & Feedback</h1>
        <p className="text-sm text-text-secondary">See what customers and sellers are saying about you</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Average Rating</h3>
          <div className="text-5xl font-black mt-2 text-primary flex items-center gap-2">
            {average.toFixed(1)} <Star size={32} className="text-amber-500" fill="currentColor"/>
          </div>
          <p className="text-sm text-text-secondary mt-2">Based on {total} reviews</p>
        </div>

        <div className="md:col-span-2 bg-surface border border-border rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Rating Distribution</h3>
          {[5,4,3,2,1].map(num => {
            const count = reviews.filter((r:any) => Math.round(r.rating) === num).length;
            const pct = total === 0 ? 0 : (count / total) * 100;
            return (
              <div key={num} className="flex items-center gap-3 text-sm font-bold">
                <span className="w-4">{num}</span>
                <Star size={12} className="text-amber-500" fill="currentColor" />
                <div className="flex-1 h-2 bg-background rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }}></div>
                </div>
                <span className="w-10 text-right text-text-secondary">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-sm">
        <div className="p-4 border-b border-border">
          <h3 className="font-bold text-text-primary">Recent Reviews</h3>
        </div>
        <div className="p-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-accent" size={32} /></div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-10 text-text-secondary">
              <MessageSquare size={32} className="mx-auto opacity-50 mb-2" />
              <p>No reviews yet. Keep delivering to get feedback!</p>
            </div>
          ) : (
            reviews.map((rev: any) => (
              <div key={rev._id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < rev.rating ? "currentColor" : "none"} className={i < rev.rating ? "" : "text-border"} />
                      ))}
                    </div>
                    <span className="font-bold text-sm text-text-primary">{rev.reviewerId?.name || 'Customer'}</span>
                  </div>
                  <span className="text-xs text-text-secondary">{new Date(rev.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-text-secondary">{rev.comment || 'No comment provided.'}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
export default RatingsPage;
