import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle2, XCircle, Send, Paperclip, MoreVertical, ShieldCheck, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNotificationStore } from '@/store/notificationStore';
import { useUserSupportTicket, useUserReplyToTicket } from './services/support.queries';

export const TicketDetailsPage: React.FC = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useNotificationStore();
  
  const { data: ticket, isLoading } = useUserSupportTicket(ticketId || '');
  const replyMutation = useUserReplyToTicket();

  const [newMessage, setNewMessage] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !ticketId) return;

    replyMutation.mutate(
      { id: ticketId, message: newMessage },
      {
        onSuccess: () => {
          setNewMessage('');
        }
      }
    );
  };

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase() || 'open';
    switch (s) {
      case 'open': return <span className="bg-danger/10 text-danger border border-danger/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><Clock size={10} /> Open</span>;
      case 'pending': 
      case 'in progress': return <span className="bg-warning/10 text-warning border border-warning/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><Clock size={10} /> {s}</span>;
      case 'resolved': return <span className="bg-success/10 text-success border border-success/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><CheckCircle2 size={10} /> Resolved</span>;
      case 'closed': return <span className="bg-surface text-text-secondary border border-border px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><XCircle size={10} /> Closed</span>;
      default: return null;
    }
  };

  if (isLoading) return <div className="p-8 text-center animate-pulse text-text-secondary">Loading ticket details...</div>;
  if (!ticket) return <div className="p-8 text-center text-danger">Ticket not found.</div>;

  const isClosed = ticket.status === 'Closed' || ticket.status === 'Resolved';

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] text-left max-w-4xl mx-auto w-full animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-surface shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 border border-border rounded-md hover:bg-background text-text-secondary transition-colors">
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-lg font-extrabold text-text-primary tracking-tight">{ticket.ticketNumber || ticket._id.slice(-6).toUpperCase()}</h1>
              {getStatusBadge(ticket.status)}
            </div>
            <p className="text-xs text-text-secondary truncate max-w-[200px] sm:max-w-md">{ticket.subject}</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background custom-scrollbar">
        <div className="text-center py-4">
          <div className="inline-flex items-center justify-center gap-2 bg-surface border border-border px-4 py-1.5 rounded-full shadow-sm">
            <ShieldCheck size={14} className="text-success" />
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Secure Support Channel</span>
          </div>
        </div>

        {ticket.messages?.map((msg: any, idx: number) => {
          const isAgent = msg.sender === 'support' || msg.sender === 'admin';
          return (
          <div key={msg._id || idx} className={`flex ${!isAgent ? 'justify-end' : 'justify-start'} w-full`}>
            
              <div className={`flex items-end gap-2 max-w-[85%] sm:max-w-[70%] ${!isAgent ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${!isAgent ? 'bg-surface border border-border' : 'bg-accent/10 border border-accent/20'}`}>
                  {!isAgent ? <User size={14} className="text-text-secondary" /> : <ShieldCheck size={14} className="text-accent" />}
                </div>
                
                {/* Bubble */}
                <div className={`flex flex-col ${!isAgent ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[10px] font-bold text-text-secondary uppercase">{!isAgent ? 'You' : 'Support Agent'}</span>
                    <span className="text-[9px] text-text-secondary/60">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm
                    ${!isAgent 
                      ? 'bg-accent text-white rounded-br-sm' 
                      : 'bg-surface border border-border text-text-primary rounded-bl-sm'}
                  `}>
                    {msg.message}
                  </div>
                </div>
              </div>
          </div>
          );
        })}
      </div>

      {/* Input Area */}
      {isClosed ? (
        <div className="p-4 bg-surface border-t border-border shrink-0 text-center">
          <p className="text-sm font-semibold text-text-secondary">This ticket has been closed.</p>
          <p className="text-xs text-text-secondary/60 mt-1">If you need further assistance, please create a new ticket.</p>
        </div>
      ) : (
        <div className="p-4 bg-surface border-t border-border shrink-0">
          <form onSubmit={handleSendMessage} className="flex items-end gap-2 relative">
            <div className="flex-1 relative">
              <button type="button" className="absolute left-3 bottom-2.5 p-1 text-text-secondary hover:text-text-primary transition-colors">
                <Paperclip size={18} />
              </button>
              <textarea
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Type your message here..."
                className="w-full pl-10 pr-4 py-3 max-h-32 min-h-[44px] bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-accent text-text-primary resize-none custom-scrollbar"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
            </div>
            <Button type="submit" isLoading={replyMutation.isPending} disabled={!newMessage.trim()} className="h-[44px] w-[44px] p-0 flex items-center justify-center rounded-xl shrink-0">
              <Send size={18} className="ml-1" />
            </Button>
          </form>
          <p className="text-[10px] text-text-secondary/60 text-center mt-2">Press Enter to send, Shift + Enter for new line.</p>
        </div>
      )}
    </div>
  );
};
export default TicketDetailsPage;
