import React from 'react';
import { useReturns } from '@/hooks/queries';
import { Package, ChevronRight, CheckCircle, Clock, XCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export const ReturnTrackingPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: returns = [], isLoading, isError } = useReturns();
  const [activeTab, setActiveTab] = React.useState('ALL');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': case 'REFUND_COMPLETED': case 'REPLACEMENT_DELIVERED': case 'CLOSED': return 'text-green-600 bg-green-100';
      case 'REJECTED': return 'text-red-600 bg-red-100';
      default: return 'text-amber-600 bg-amber-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': case 'REFUND_COMPLETED': case 'REPLACEMENT_DELIVERED': case 'CLOSED': return <CheckCircle size={16} className="text-green-600" />;
      case 'REJECTED': return <XCircle size={16} className="text-red-600" />;
      default: return <Clock size={16} className="text-amber-600" />;
    }
  };

  const cleanNotes = (notes: string) => {
    if (!notes) return '';
    if (notes.includes('data:image')) {
      return notes.substring(0, notes.indexOf('data:image')) + '[Image Attached]';
    }
    return notes;
  };

  const filteredReturns = returns.filter((req: any) => {
    if (activeTab === 'ALL') return true;
    return req.status === activeTab;
  });

  return (
    <div className="max-w-4xl mx-auto w-full space-y-6 pb-16 overflow-x-hidden">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-surface rounded-full text-text-secondary transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-text-primary">Returns & Cancellations</h1>
          <p className="text-sm text-text-secondary mt-1">Track your requested returns, replacements, and cancellations.</p>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map(i => <div key={i} className="bg-surface rounded-2xl h-32" />)}
        </div>
      )}

      {!isLoading && !isError && filteredReturns.length === 0 && (
        <div className="text-center py-20 bg-surface/50 border border-border rounded-2xl">
          <Package size={48} className="mx-auto text-text-secondary/50 mb-3" />
          <h3 className="font-bold text-text-primary text-lg">No active requests</h3>
          <p className="text-text-secondary text-sm">No returns match the selected status.</p>
        </div>
      )}

      <div className="space-y-4">
        {filteredReturns.map((req: any) => (
          <div key={req._id} className="bg-surface border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wide uppercase ${req.requestType === 'CANCELLATION' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                    {req.requestType}
                  </span>
                  <span className="text-xs font-mono text-text-secondary">Order #{req.orderId}</span>
                </div>
                <h3 className="font-bold text-text-primary">{req.reason}</h3>
              </div>
              <div className="flex flex-col md:items-end">
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${getStatusColor(req.status)}`}>
                  {getStatusIcon(req.status)}
                  {req.status.replace(/_/g, ' ')}
                </div>
                {req.refundAmount > 0 && (
                  <p className="text-sm font-black text-text-primary mt-2">Refund: ₹{req.refundAmount}</p>
                )}
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-border">
              <h4 className="text-xs font-bold text-text-secondary uppercase mb-6">Tracking Progress</h4>
              
              <div className="relative">
                {(() => {
                  let milestones: string[] = [];
                  if (req.status === 'REJECTED') {
                    milestones = ['REQUESTED', 'REJECTED'];
                  } else if (req.requestType === 'CANCELLATION') {
                    milestones = ['REQUESTED', 'APPROVED', 'REFUND_COMPLETED', 'CLOSED'];
                  } else if (req.requestType === 'REPLACEMENT') {
                    milestones = ['REQUESTED', 'APPROVED', 'PICKUP_ASSIGNED', 'PICKUP_IN_PROGRESS', 'ITEM_RECEIVED', 'REPLACEMENT_SHIPPED', 'REPLACEMENT_DELIVERED', 'CLOSED'];
                  } else {
                    milestones = ['REQUESTED', 'APPROVED', 'PICKUP_ASSIGNED', 'PICKUP_IN_PROGRESS', 'ITEM_RECEIVED', 'REFUND_COMPLETED', 'CLOSED'];
                  }

                  let currentIndex = milestones.indexOf(req.status);
                  // Fallback if status is somehow not in the list (e.g. UNDER_REVIEW)
                  if (currentIndex === -1) {
                    if (req.status === 'UNDER_REVIEW') currentIndex = 0;
                    else currentIndex = milestones.length - 1;
                  }

                  return (
                    <div className="flex justify-between items-start relative overflow-x-auto pb-4 scrollbar-none pt-2">
                      {/* Background Line */}
                      <div className="absolute top-5 left-0 right-0 h-1 bg-border -translate-y-1/2 z-0 min-w-[600px]" />
                      
                      {/* Active Line */}
                      <div 
                        className="absolute top-5 left-0 h-1 bg-accent -translate-y-1/2 z-0 transition-all duration-500 ease-in-out min-w-[600px]" 
                        style={{ width: `${(currentIndex / (milestones.length - 1)) * 100}%` }}
                      />

                      {milestones.map((step, idx) => {
                        const isCompleted = idx <= currentIndex;
                        const isActive = idx === currentIndex;
                        
                        // Find the log for this step to show the timestamp
                        const stepLog = req.auditLogs.find((l: any) => l.newStatus === step);
                        
                        return (
                          <div key={step} className="relative z-10 flex flex-col items-center flex-1 min-w-[100px] gap-2">
                            <div 
                              className={`w-6 h-6 rounded-full border-4 flex items-center justify-center transition-colors duration-300 ${
                                isCompleted ? 'bg-accent border-accent text-white' : 'bg-surface border-border'
                              } ${isActive ? 'ring-4 ring-accent/20' : ''}`}
                            >
                              {isCompleted && <CheckCircle size={12} />}
                            </div>
                            <div className="text-center px-1">
                              <p className={`text-[10px] font-bold uppercase whitespace-pre-wrap leading-tight ${isCompleted ? 'text-text-primary' : 'text-text-secondary'}`}>
                                {step.replace(/_/g, ' ')}
                              </p>
                              {stepLog && (
                                <p className="text-[9px] text-text-secondary mt-1">
                                  {new Date(stepLog.timestamp).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Show Latest Note */}
              {req.auditLogs.length > 0 && (
                <div className="mt-6 bg-surface border border-border rounded-xl p-4">
                  <p className="text-xs font-bold text-text-secondary uppercase mb-1">Latest Update</p>
                  <p className="text-sm text-text-primary">{cleanNotes(req.auditLogs[req.auditLogs.length - 1].notes)}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReturnTrackingPage;
