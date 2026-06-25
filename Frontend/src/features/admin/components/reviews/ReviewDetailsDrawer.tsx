import React, { useState } from 'react';
import { useAdminReviewDetails, useApproveReview, useHideReview, useDeleteReview } from '../../services/admin.queries';
import { Button } from '@/components/ui/Button';

export const ReviewDetailsDrawer = ({ reviewId, isOpen, onClose }: { reviewId: string, isOpen: boolean, onClose: () => void }) => {
  const { data, isLoading } = useAdminReviewDetails(reviewId);
  const [activeTab, setActiveTab] = useState('OVERVIEW');

  const approveMutation = useApproveReview();
  const hideMutation = useHideReview();
  const deleteMutation = useDeleteReview();

  if (!isOpen) return null;

  const review = data?.review;
  const reports = data?.reports || [];
  const auditLogs = data?.auditLogs || [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60">
      <div className="w-full max-w-2xl bg-background h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-surface">
          <div>
            <h2 className="text-lg font-extrabold text-text-primary">Review Details</h2>
            <p className="text-xs font-mono text-text-secondary mt-1">{reviewId}</p>
          </div>
          <button onClick={onClose} className="text-text-secondary hover:text-white p-2">✕</button>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center text-text-secondary">Loading details...</div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {/* Header / Actions */}
            <div className="p-6 bg-surface/50 border-b border-border flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-3xl font-black text-warning">{review?.rating}★</div>
                <div>
                  <span className={`px-2 py-1 text-xs font-bold uppercase rounded-md bg-primary/10 text-primary`}>
                    {review?.reviewType || review?.targetType}
                  </span>
                  <p className="text-sm font-bold mt-1 text-text-primary uppercase">{review?.status}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {review?.status !== 'ACTIVE' && (
                  <Button size="sm" className="bg-success text-white" onClick={() => approveMutation.mutate({ id: reviewId })}>
                    {approveMutation.isPending ? '...' : 'Approve'}
                  </Button>
                )}
                {review?.status !== 'HIDDEN' && (
                  <Button size="sm" className="bg-warning text-black" onClick={() => hideMutation.mutate({ id: reviewId })}>
                    {hideMutation.isPending ? '...' : 'Hide'}
                  </Button>
                )}
                <Button size="sm" className="bg-danger text-white" onClick={() => deleteMutation.mutate({ id: reviewId })}>
                  {deleteMutation.isPending ? '...' : 'Delete'}
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto border-b border-border bg-surface">
              {['OVERVIEW', 'CUSTOMER', 'ORDER', 'IMAGES', 'REPORTS', 'AUDIT'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-xs font-bold tracking-wider whitespace-nowrap transition-colors ${
                    activeTab === tab ? 'border-b-2 border-primary text-primary' : 'text-text-secondary hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'OVERVIEW' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-text-secondary uppercase mb-2">Review Content</h4>
                    <p className="text-sm text-text-primary bg-surface p-4 rounded-lg border border-border">
                      {review?.title && <strong className="block mb-1">{review.title}</strong>}
                      {review?.comment || review?.reviewText || <span className="italic text-text-secondary">No text provided</span>}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-bold text-text-secondary uppercase mb-1">Created At</p>
                      <p className="text-sm">{new Date(review?.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-text-secondary uppercase mb-1">Risk Score</p>
                      <p className="text-sm font-mono text-warning">{review?.aiRiskScore || 0} / 100 ({review?.aiRiskLevel})</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'CUSTOMER' && (
                <div className="space-y-4">
                  <p><span className="text-xs font-bold text-text-secondary uppercase block mb-1">Name</span> {review?.customerName || review?.customer?.name}</p>
                  <p><span className="text-xs font-bold text-text-secondary uppercase block mb-1">Customer ID</span> {review?.customerId || review?.customer?._id || 'Unknown'}</p>
                  {(review?.customer?.email) && <p><span className="text-xs font-bold text-text-secondary uppercase block mb-1">Email</span> {review?.customer?.email}</p>}
                </div>
              )}

              {activeTab === 'ORDER' && (
                <div className="space-y-4">
                  <p><span className="text-xs font-bold text-text-secondary uppercase block mb-1">Order ID</span> <span className="font-mono">{review?.orderId}</span></p>
                  <p><span className="text-xs font-bold text-text-secondary uppercase block mb-1">Verified Purchase</span> {review?.isVerifiedPurchase ? 'Yes' : 'No'}</p>
                </div>
              )}

              {activeTab === 'IMAGES' && (
                <div className="flex gap-4 flex-wrap">
                  {review?.images?.length > 0 ? (
                    review.images.map((img: any, i: number) => (
                      <img key={i} src={img.url} alt={`Review ${i}`} className="w-32 h-32 object-cover rounded-lg border border-border" />
                    ))
                  ) : (
                    <p className="text-text-secondary text-sm">No images attached to this review.</p>
                  )}
                </div>
              )}

              {activeTab === 'REPORTS' && (
                <div className="space-y-4">
                  {reports.length > 0 ? (
                    reports.map((r: any) => (
                      <div key={r._id} className="p-4 bg-surface rounded-lg border border-border">
                        <p className="text-sm font-bold text-danger">{r.reason}</p>
                        <p className="text-xs text-text-secondary mt-1">{r.comment}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-text-secondary text-sm">No reports filed.</p>
                  )}
                </div>
              )}

              {activeTab === 'AUDIT' && (
                <div className="space-y-4">
                  {auditLogs.length > 0 ? (
                    auditLogs.map((log: any) => (
                      <div key={log._id} className="p-3 bg-surface rounded-lg border border-border flex justify-between items-center">
                        <div>
                          <p className="text-xs font-bold text-text-primary">{log.action}</p>
                          <p className="text-xs text-text-secondary mt-1">{log.reason}</p>
                        </div>
                        <p className="text-xs text-text-secondary">{new Date(log.createdAt).toLocaleString()}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-text-secondary text-sm">No audit logs.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
