import React, { useState } from 'react';
import { X, Send, User, Shield, CheckCircle2 } from 'lucide-react';
import { useTicketById, useReplyTicket, useResolveTicket } from '../services/rider.queries';
import { useNotificationStore } from '@/store/notificationStore';
import { Button } from '@/components/ui/Button';

interface TicketChatModalProps {
  ticketId: string | null;
  onClose: () => void;
}

const TicketChatModal: React.FC<TicketChatModalProps> = ({ ticketId, onClose }) => {
  const { data: ticket, isLoading } = useTicketById(ticketId || '');
  const replyMutation = useReplyTicket();
  const resolveMutation = useResolveTicket();
  const { addToast } = useNotificationStore();
  const [message, setMessage] = useState('');

  if (!ticketId) return null;

  const handleReply = async () => {
    if (!message.trim()) return;
    try {
      await replyMutation.mutateAsync({ id: ticket._id || ticket.id, message });
      setMessage('');
      addToast({ title: 'Sent', message: 'Reply added successfully', type: 'success' });
    } catch (err: any) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  const handleResolve = async () => {
    try {
      await resolveMutation.mutateAsync(ticket._id || ticket.id);
      addToast({ title: 'Resolved', message: 'Ticket marked as resolved', type: 'success' });
    } catch (err: any) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-surface border border-border w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-border flex justify-between items-center bg-surface sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary uppercase tracking-wide">
                {ticket?.ticketNumber || 'Loading...'}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${ticket?.status === 'Resolved' || ticket?.status === 'Closed' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                {ticket?.status || 'Loading...'}
              </span>
            </div>
            <h2 className="text-lg font-bold text-text-primary">{ticket?.subject || 'Loading ticket...'}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-background rounded-full text-text-secondary transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-background/50">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            ticket?.messages?.map((msg: any, idx: number) => {
              const isRider = msg.sender === 'rider' || msg.sender === 'user';
              const isAdmin = msg.sender === 'admin' || msg.sender === 'support';
              return (
                <div key={idx} className={`flex gap-3 ${isRider ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isRider ? 'bg-primary/20 text-primary' : isAdmin ? 'bg-danger/20 text-danger' : 'bg-surface border border-border text-text-secondary'}`}>
                    {isRider ? <User size={14} /> : isAdmin ? <Shield size={14} /> : <User size={14} />}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl p-4 ${isRider ? 'bg-primary text-white rounded-tr-none' : isAdmin ? 'bg-surface border border-danger/20 rounded-tl-none' : 'bg-surface border border-border rounded-tl-none'}`}>
                    <div className="flex justify-between items-center mb-1 text-xs opacity-70">
                      <span className="font-semibold capitalize">{msg.sender}</span>
                      <span>{new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className={`text-sm whitespace-pre-wrap ${isRider ? 'text-white' : 'text-text-primary'}`}>{msg.message}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Reply Box */}
        {ticket?.status !== 'Resolved' && ticket?.status !== 'Closed' && (
          <div className="p-4 bg-surface border-t border-border mt-auto space-y-3">
            <div className="relative flex items-center">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your reply..."
                className="w-full bg-background border border-border rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary min-h-[50px] max-h-[120px] resize-y"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleReply();
                  }
                }}
              />
              <button
                onClick={handleReply}
                disabled={!message.trim() || replyMutation.isPending}
                className="absolute right-2 p-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {replyMutation.isPending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send size={16} />
                )}
              </button>
            </div>
            <Button 
              variant="outline" 
              className="w-full text-success border-success/30 hover:bg-success/10 hover:text-success"
              onClick={handleResolve}
              isLoading={resolveMutation.isPending}
            >
              <CheckCircle2 size={16} className="mr-2" />
              Mark as Resolved
            </Button>
            <p className="text-[10px] text-text-secondary mt-2 text-center">Press Enter to send, Shift+Enter for new line</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketChatModal;
