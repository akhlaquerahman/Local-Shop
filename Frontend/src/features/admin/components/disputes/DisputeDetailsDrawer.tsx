import React, { useState } from 'react';
import { useAdminDisputeDetails, useUpdateDisputeStatus, useResolveDispute, useAddDisputeMessage } from '../../services/admin.queries';
import { Button } from '@/components/ui/Button';

export const DisputeDetailsDrawer = ({ disputeId, isOpen, onClose }: { disputeId: string, isOpen: boolean, onClose: () => void }) => {
  const { data, isLoading } = useAdminDisputeDetails(disputeId);
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [newMessage, setNewMessage] = useState('');

  const statusMutation = useUpdateDisputeStatus();
  const resolveMutation = useResolveDispute();
  const messageMutation = useAddDisputeMessage();

  if (!isOpen) return null;

  const dispute = data?.dispute;
  const messages = data?.messages || [];

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    messageMutation.mutate({ id: disputeId, payload: { message: newMessage, isInternal: true } }, {
      onSuccess: () => setNewMessage('')
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60">
      <div className="w-full max-w-2xl bg-background h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-surface">
          <div>
            <h2 className="text-lg font-extrabold text-text-primary">Investigate Dispute</h2>
            <p className="text-xs font-mono text-text-secondary mt-1">{dispute?.disputeId}</p>
          </div>
          <button onClick={onClose} className="text-text-secondary hover:text-white p-2">✕</button>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center text-text-secondary">Loading details...</div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {/* Header / Actions */}
            <div className="p-6 bg-surface/50 border-b border-border flex flex-wrap gap-4 items-center justify-between">
              <div>
                <span className={`px-2 py-1 text-xs font-bold uppercase rounded-md ${
                  dispute?.priority === 'URGENT' ? 'bg-danger text-white' : 'bg-surface border border-border'
                }`}>
                  {dispute?.priority} PRIORITY
                </span>
                <p className="text-lg font-bold mt-2 text-text-primary">{dispute?.status}</p>
              </div>
              <div className="flex gap-2">
                {dispute?.status === 'OPEN' && (
                  <Button size="sm" variant="outline" onClick={() => statusMutation.mutate({ id: disputeId, status: 'IN_REVIEW' })}>
                    Mark In Review
                  </Button>
                )}
                {['OPEN', 'IN_REVIEW'].includes(dispute?.status) && (
                  <Button size="sm" className="bg-danger text-white" onClick={() => statusMutation.mutate({ id: disputeId, status: 'ESCALATED' })}>
                    Escalate
                  </Button>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto border-b border-border bg-surface">
              {['OVERVIEW', 'ORDER', 'TIMELINE', 'RESOLUTION'].map(tab => (
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
                    <h4 className="text-xs font-bold text-text-secondary uppercase mb-2">Reason</h4>
                    <p className="text-lg font-bold text-text-primary">{dispute?.reason}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-text-secondary uppercase mb-2">Description</h4>
                    <p className="text-sm text-text-primary bg-surface p-4 rounded-lg border border-border whitespace-pre-wrap">
                      {dispute?.description}
                    </p>
                  </div>
                  {dispute?.evidence && dispute.evidence.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-text-secondary uppercase mb-2">Evidence</h4>
                      <div className="flex gap-4 flex-wrap">
                        {dispute.evidence.map((img: any, i: number) => (
                          <img key={i} src={img.url} alt={`Evidence ${i}`} className="w-32 h-32 object-cover rounded-lg border border-border" />
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div>
                      <p className="text-xs font-bold text-text-secondary uppercase mb-1">Customer</p>
                      <p className="text-sm">{dispute?.customer?.firstName} {dispute?.customer?.lastName}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-text-secondary uppercase mb-1">Target</p>
                      <p className="text-sm">{dispute?.targetType} - {dispute?.targetId?.name || dispute?.targetId?.firstName || dispute?.targetId}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'ORDER' && (
                <div className="space-y-4">
                  <p><span className="text-xs font-bold text-text-secondary uppercase block mb-1">Order ID</span> <span className="font-mono">{dispute?.orderId}</span></p>
                  <Button variant="outline" size="sm">View Full Order Details</Button>
                </div>
              )}

              {activeTab === 'TIMELINE' && (
                <div className="space-y-6 flex flex-col h-[50vh]">
                  <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {messages.length === 0 && <p className="text-text-secondary text-sm">No internal notes yet.</p>}
                    {messages.map((msg: any) => (
                      <div key={msg._id} className={`p-4 rounded-lg border ${msg.isInternal ? 'bg-warning/10 border-warning/20' : 'bg-surface border-border'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-bold">{msg.sender?.firstName || msg.senderRole}</span>
                          <span className="text-[10px] text-text-secondary">{new Date(msg.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-sm">{msg.message}</p>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-border flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Add an internal note..." 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 bg-surface border border-border rounded-lg px-4 py-2 text-sm focus:outline-none"
                    />
                    <Button onClick={handleSendMessage} disabled={messageMutation.isPending}>
                      {messageMutation.isPending ? '...' : 'Add Note'}
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === 'RESOLUTION' && (
                <div className="space-y-6">
                  {['RESOLVED', 'DISMISSED'].includes(dispute?.status) ? (
                    <div className="p-6 bg-success/10 border border-success/30 rounded-lg text-center">
                      <h3 className="text-lg font-bold text-success mb-2">Dispute Closed</h3>
                      <p className="text-sm text-text-primary">Winner: <span className="font-bold">{dispute?.resolutionWinner}</span></p>
                      <p className="text-sm text-text-secondary mt-4 bg-background p-3 rounded text-left">
                        {dispute?.resolutionNotes}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 p-6 bg-surface border border-border rounded-lg">
                      <h3 className="text-lg font-bold text-text-primary mb-4">Resolve Dispute</h3>
                      <textarea 
                        id="resolutionNotes"
                        placeholder="Enter the resolution details and rationale..."
                        className="w-full h-32 bg-background border border-border rounded-lg p-4 text-sm"
                      />
                      <div className="flex gap-4 pt-4">
                        <Button 
                          className="flex-1 bg-success text-white" 
                          onClick={() => {
                            const notes = (document.getElementById('resolutionNotes') as HTMLTextAreaElement).value;
                            resolveMutation.mutate({ id: disputeId, payload: { winner: 'CUSTOMER', resolutionNotes: notes } })
                          }}
                        >
                          Resolve in favor of Customer
                        </Button>
                        <Button 
                          className="flex-1 bg-surface border border-border text-text-primary" 
                          onClick={() => {
                            const notes = (document.getElementById('resolutionNotes') as HTMLTextAreaElement).value;
                            resolveMutation.mutate({ id: disputeId, payload: { winner: 'MERCHANT', resolutionNotes: notes } })
                          }}
                        >
                          Dismiss (Favor Merchant)
                        </Button>
                      </div>
                    </div>
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
