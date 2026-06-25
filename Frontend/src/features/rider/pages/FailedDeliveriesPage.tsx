import React, { useState } from 'react';
import { useFailedDeliveries } from '../services/rider.queries';
import { AlertOctagon, Search, FileText, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const FailedDeliveriesPage: React.FC = () => {
  const { data: failed, isLoading } = useFailedDeliveries();
  const list = failed || [];

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto pb-20">
      <div>
        <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Exception Center</h1>
        <p className="text-sm text-text-secondary">Manage failed, cancelled, and disputed deliveries</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-border p-4 rounded-xl">
          <div className="text-[10px] font-bold uppercase text-text-secondary tracking-wider">Total Failed</div>
          <div className="text-2xl font-black mt-1 text-error">{list.length}</div>
        </div>
        <div className="bg-surface border border-border p-4 rounded-xl">
          <div className="text-[10px] font-bold uppercase text-text-secondary tracking-wider">Pending Review</div>
          <div className="text-2xl font-black mt-1 text-amber-500">{list.filter((x: any) => x.adminReviewStatus === 'pending').length}</div>
        </div>
        <div className="bg-surface border border-border p-4 rounded-xl">
          <div className="text-[10px] font-bold uppercase text-text-secondary tracking-wider">Resolved</div>
          <div className="text-2xl font-black mt-1 text-success">{list.filter((x: any) => x.adminReviewStatus === 'resolved').length}</div>
        </div>
        <div className="bg-surface border border-border p-4 rounded-xl">
          <div className="text-[10px] font-bold uppercase text-text-secondary tracking-wider">Appealed</div>
          <div className="text-2xl font-black mt-1 text-accent">{list.filter((x: any) => x.adminReviewStatus === 'appealed').length}</div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-background text-text-secondary uppercase text-[10px] font-bold border-b border-border tracking-wider">
              <tr>
                <th className="px-6 py-4">Delivery ID</th>
                <th className="px-6 py-4">Failed At</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Admin Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center"><Loader2 className="animate-spin text-accent mx-auto" size={32}/></td></tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <AlertOctagon size={32} className="mx-auto text-text-secondary/50 mb-3" />
                    <p className="text-text-secondary">Excellent! You have zero failed deliveries.</p>
                  </td>
                </tr>
              ) : (
                list.map((job: any) => (
                  <tr key={job._id} className="hover:bg-background/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-primary">{job._id.substring(0,8)}</td>
                    <td className="px-6 py-4 text-text-secondary">{new Date(job.updatedAt).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="font-medium">{job.failureReason || 'Customer Unavailable'}</span>
                      {job.failureEvidence?.length > 0 && <span className="ml-2 px-1.5 py-0.5 bg-background border border-border rounded text-[10px]"><FileText size={10} className="inline mr-1"/>{job.failureEvidence.length} items</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                        ${job.adminReviewStatus === 'resolved' ? 'bg-success/10 text-success' : 
                          job.adminReviewStatus === 'appealed' ? 'bg-accent/10 text-accent' : 
                          'bg-amber-500/10 text-amber-500'}`}
                      >
                        {job.adminReviewStatus || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button size="sm" variant="outline" icon={<ChevronRight size={14}/>}>Details</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default FailedDeliveriesPage;
