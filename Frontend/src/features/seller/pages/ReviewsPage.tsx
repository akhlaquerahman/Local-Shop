import React, { useState } from 'react';
import { Download, RefreshCw, Star, MessageCircle, X, Search, Filter } from 'lucide-react';
import { KPICard } from '@/components/ui/KPI';
import { DataTable } from '@/components/table';
import { Button } from '@/components/ui/Button';
import { useReviews, useReplyToReview } from '../services/seller.queries';
import { useNotificationStore } from '@/store/notificationStore';

const ReviewsPage: React.FC = () => {
  const [ratingFilter, setRatingFilter] = useState('');
  const [replyFilter, setReplyFilter] = useState('');
  const [showReplyModal, setShowReplyModal] = useState<any>(null);
  const [replyText, setReplyText] = useState('');

  const { data, isLoading, refetch } = useReviews({ 
    rating: ratingFilter || undefined, 
    replyStatus: replyFilter || undefined 
  });
  const replyMutation = useReplyToReview();
  const { addToast } = useNotificationStore();

  const handleRefresh = () => {
    refetch();
  };

  const handleReplySubmit = async () => {
    if (!replyText.trim()) return;
    try {
      await replyMutation.mutateAsync({ reviewId: showReplyModal._id, reply: replyText });
      addToast({ title: 'Success', message: 'Reply posted', type: 'success' });
      setShowReplyModal(null);
      setReplyText('');
    } catch (err: any) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  const columns = [
    { header: 'Rating', accessorKey: 'rating', cell: (row: any) => (
        <div className="flex items-center gap-1">
          <Star size={14} className={row.rating >= 4 ? 'text-success fill-success' : row.rating <= 2 ? 'text-danger fill-danger' : 'text-warning fill-warning'} />
          <span className="font-bold text-sm">{row.rating}.0</span>
        </div>
      ) 
    },
    { header: 'Customer', accessorKey: 'customerName', cell: (row: any) => <span className="text-sm font-bold">{row.customerName}</span> },
    { header: 'Comment', accessorKey: 'comment', cell: (row: any) => <p className="text-xs text-text-secondary max-w-xs truncate">{row.comment}</p> },
    { header: 'Date', accessorKey: 'createdAt', cell: (row: any) => <span className="text-xs text-text-secondary">{new Date(row.createdAt).toLocaleDateString()}</span> },
    { header: 'Status', accessorKey: 'replyStatus', cell: (row: any) => (
        <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${row.replyStatus === 'replied' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
          {row.replyStatus}
        </span>
      )
    },
    { header: 'Actions', accessorKey: 'actions', cell: (row: any) => (
        <Button size="sm" variant="outline" className="h-auto py-1 px-2 text-xs gap-1" onClick={() => setShowReplyModal(row)}>
          <MessageCircle size={12} /> {row.replyStatus === 'replied' ? 'Edit Reply' : 'Reply'}
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6 text-left max-w-[1440px] mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Reviews & Ratings</h1>
          <p className="text-sm text-text-secondary">Manage customer feedback and improve reputation</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2"><RefreshCw size={14} /> Refresh</Button>
          <Button variant="outline" size="sm" className="gap-2"><Download size={14} /> Export</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Average Rating" value={data?.stats?.averageRating?.toFixed(1) || '0.0'} loading={isLoading} icon={<Star className="text-warning fill-warning" />} className="border-warning/20" />
        <KPICard title="Total Reviews" value={data?.stats?.totalReviews || 0} loading={isLoading} />
        <KPICard title="Pending Replies" value={data?.stats?.pendingReplies || 0} loading={isLoading} className="border-accent/20" />
        <KPICard title="Negative Reviews" value={data?.stats?.negativeReviews || 0} loading={isLoading} className="border-danger/20" />
      </div>

      <div className="bg-surface border border-border rounded-xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-1.5 bg-background">
              <Filter size={16} className="text-text-secondary" />
              <select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)} className="bg-transparent text-sm outline-none w-24">
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
            <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-1.5 bg-background">
              <select value={replyFilter} onChange={(e) => setReplyFilter(e.target.value)} className="bg-transparent text-sm outline-none w-32">
                <option value="">All Statuses</option>
                <option value="pending">Pending Reply</option>
                <option value="replied">Replied</option>
              </select>
            </div>
          </div>
        </div>

        <DataTable 
          columns={columns} 
          data={data?.reviews || []} 
          isLoading={isLoading} 
          exportFileName="reviews"
        />
      </div>

      {showReplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-surface border border-border rounded-xl w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b border-border">
              <h2 className="text-lg font-bold text-text-primary">Reply to Customer</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowReplyModal(null)}><X size={16} /></Button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-background/50 p-4 rounded-lg border border-border">
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className={i < showReplyModal.rating ? 'text-warning fill-warning' : 'text-text-secondary'} />
                  ))}
                </div>
                <p className="text-sm italic text-text-secondary">"{showReplyModal.comment}"</p>
                <p className="text-xs font-bold text-text-primary mt-2">- {showReplyModal.customerName}</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-text-primary mb-2">Your Reply</label>
                <textarea 
                  className="w-full bg-background border border-border rounded-lg p-3 text-sm min-h-[120px] focus:outline-none focus:border-primary"
                  placeholder="Type your response here..."
                  value={replyText || showReplyModal.sellerReply || ''}
                  onChange={(e) => setReplyText(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowReplyModal(null)}>Cancel</Button>
                <Button onClick={handleReplySubmit} isLoading={replyMutation.isPending}>Submit Reply</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsPage;
