import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdminSupportTicket, useReplyToTicket, useResolveTicket } from '../services/admin.support.queries';
import { Button } from '@/components/ui/Button';
import { Send, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export const SupportTicketChatPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: ticket, isLoading } = useAdminSupportTicket(id || '');
  const replyMutation = useReplyToTicket();
  const resolveMutation = useResolveTicket();

  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!message.trim() || !id) return;
    replyMutation.mutate({ id, message });
    setMessage('');
  };

  const handleResolve = () => {
    if (!id) return;
    resolveMutation.mutate(id);
  };

  if (isLoading) return <div className="p-8 text-center animate-pulse text-text-secondary">Loading ticket details...</div>;
  if (!ticket) return <div className="p-8 text-center text-danger">Ticket not found.</div>;

  const isResolved = ticket.status === 'Resolved' || ticket.status === 'Closed';

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-100px)] flex flex-col bg-surface border border-border rounded-xl shadow-enterprise overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="p-4 border-b border-border bg-background flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/support')} className="p-2 hover:bg-surface rounded-full text-text-secondary">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="font-bold text-text-primary text-lg">{ticket.subject}</h2>
            <div className="flex items-center gap-2 text-xs text-text-secondary mt-1">
              <span className="font-mono bg-surface px-1.5 py-0.5 rounded border border-border">{ticket.ticketNumber}</span>
              <span className="uppercase font-semibold">| Role: {ticket.userRole || 'Customer'}</span>
              <span className={`uppercase font-semibold ${isResolved ? 'text-success' : 'text-brand-primary'}`}>| Status: {ticket.status}</span>
            </div>
          </div>
        </div>
        {!isResolved && (
          <Button onClick={handleResolve} isLoading={resolveMutation.isPending} className="bg-success hover:bg-success/90 text-white gap-2">
            <CheckCircle size={16} />
            Solve Ticket
          </Button>
        )}
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar bg-surface/50">
        {ticket.messages?.map((msg: any, idx: number) => {
          const isAgent = msg.sender === 'support' || msg.sender === 'admin';
          return (
            <div key={idx} className={`flex flex-col max-w-[80%] ${isAgent ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="text-[10px] font-bold text-text-secondary uppercase">{isAgent ? 'Support Agent' : msg.sender}</span>
                <span className="text-[10px] text-text-tertiary">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className={`p-3 rounded-2xl text-sm shadow-sm ${
                isAgent 
                  ? 'bg-brand-primary text-white rounded-tr-sm' 
                  : 'bg-background border border-border text-text-primary rounded-tl-sm'
              }`}>
                {msg.message}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-background border-t border-border">
        {isResolved ? (
          <div className="text-center text-sm font-medium text-text-secondary py-2 bg-surface rounded-lg border border-border">
            This ticket has been resolved and is now closed.
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your reply to the user..."
              className="flex-1 px-4 py-2.5 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
            />
            <Button onClick={handleSend} isLoading={replyMutation.isPending} disabled={!message.trim()} className="bg-primary hover:bg-primary/90 text-white px-6">
              <Send size={18} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
export default SupportTicketChatPage;
