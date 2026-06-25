import React, { useState } from 'react';
import { LifeBuoy, Plus, Search, MessageSquare, Clock, CheckCircle2, ChevronRight, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useSupportTickets, useSupportTicket, useCreateTicket, useReplyTicket, useResolveTicket } from '@/hooks/queries';
import { useNotificationStore } from '@/store/notificationStore';

export const SupportPage: React.FC = () => {
  const { addToast } = useNotificationStore();
  const { data: tickets, isLoading } = useSupportTickets();
  const createMutation = useCreateTicket();
  const replyMutation = useReplyTicket();
  const resolveMutation = useResolveTicket();

  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: '', category: 'Order Issue', priority: 'Medium', message: '' });
  
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');

  const { data: activeTicket, isLoading: isLoadingTicket } = useSupportTicket(activeTicketId || '');

  const filtered = tickets?.filter((t: any) => {
    if (filter !== 'All' && t.status !== filter) return false;
    if (search && !t.subject.toLowerCase().includes(search.toLowerCase()) && !t.ticketNumber.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }) || [];

  const handleCreate = async () => {
    if (!newTicket.subject || !newTicket.message) return addToast({ title: 'Error', message: 'Subject and message required', type: 'error' });
    try {
      await createMutation.mutateAsync(newTicket);
      addToast({ title: 'Success', message: 'Ticket created successfully', type: 'success' });
      setIsCreateModalOpen(false);
      setNewTicket({ subject: '', category: 'Order Issue', priority: 'Medium', message: '' });
    } catch (e) {
      addToast({ title: 'Error', message: 'Failed to create ticket', type: 'error' });
    }
  };

  const handleReply = async () => {
    if (!replyMessage || !activeTicketId) return;
    try {
      await replyMutation.mutateAsync({ id: activeTicketId, message: replyMessage });
      setReplyMessage('');
    } catch (e) {
      addToast({ title: 'Error', message: 'Failed to send reply', type: 'error' });
    }
  };

  const handleResolve = async () => {
    if (!activeTicketId) return;
    try {
      await resolveMutation.mutateAsync(activeTicketId);
      addToast({ title: 'Success', message: 'Ticket marked as resolved', type: 'success' });
    } catch (e) {
      addToast({ title: 'Error', message: 'Failed to resolve ticket', type: 'error' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-warning/10 text-warning border-warning/20';
      case 'Pending': return 'bg-accent/10 text-accent border-accent/20';
      case 'Resolved': return 'bg-success/10 text-success border-success/20';
      case 'Closed': return 'bg-text-secondary/10 text-text-secondary border-border';
      default: return 'bg-background border-border text-text-secondary';
    }
  };

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto w-full relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight flex items-center gap-3">
            <LifeBuoy size={28} className="text-accent" /> Support Center
          </h1>
          <p className="text-sm text-text-secondary mt-1">Get help with your orders, payments, and account</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="bg-accent text-white shadow-sm flex items-center gap-2">
          <Plus size={16} /> Create Ticket
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center text-warning"><MessageSquare size={18} /></div>
          <div><p className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Open</p><p className="font-bold text-text-primary text-sm">{tickets?.filter((t:any) => t.status === 'Open').length || 0}</p></div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent"><Clock size={18} /></div>
          <div><p className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Pending</p><p className="font-bold text-text-primary text-sm">{tickets?.filter((t:any) => t.status === 'Pending').length || 0}</p></div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success"><CheckCircle2 size={18} /></div>
          <div><p className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Resolved</p><p className="font-bold text-text-primary text-sm">{tickets?.filter((t:any) => t.status === 'Resolved').length || 0}</p></div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-background border flex items-center justify-center text-text-secondary"><LifeBuoy size={18} /></div>
          <div><p className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Total</p><p className="font-bold text-text-primary text-sm">{tickets?.length || 0}</p></div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-background">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input 
              type="text" 
              placeholder="Search tickets by subject or ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-lg text-sm focus:border-accent focus:outline-none transition-colors"
            />
          </div>
          
          <div className="flex bg-surface border border-border rounded-lg p-1 overflow-x-auto scrollbar-none">
            {['All', 'Open', 'Pending', 'Resolved', 'Closed'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                  filter === f ? 'bg-text-primary text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background border-b border-border text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                <th className="p-4 whitespace-nowrap">Ticket ID</th>
                <th className="p-4 whitespace-nowrap w-full">Subject</th>
                <th className="p-4 whitespace-nowrap">Status</th>
                <th className="p-4 whitespace-nowrap">Created</th>
                <th className="p-4 whitespace-nowrap"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4"><div className="h-4 w-20 bg-border rounded" /></td>
                    <td className="p-4"><div className="h-4 w-48 bg-border rounded" /></td>
                    <td className="p-4"><div className="h-6 w-20 bg-border rounded-full" /></td>
                    <td className="p-4"><div className="h-4 w-24 bg-border rounded" /></td>
                    <td className="p-4"><div className="h-8 w-8 bg-border rounded" /></td>
                  </tr>
                ))
              ) : filtered.length > 0 ? (
                filtered.map((ticket: any) => (
                  <tr key={ticket._id} onClick={() => setActiveTicketId(ticket._id)} className="hover:bg-background/50 transition-colors cursor-pointer group">
                    <td className="p-4 text-xs font-mono font-bold text-text-primary">{ticket.ticketNumber}</td>
                    <td className="p-4">
                      <p className="text-sm font-bold text-text-primary mb-0.5">{ticket.subject}</p>
                      <p className="text-xs text-text-secondary">{ticket.category} • {ticket.priority} Priority</p>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-text-secondary whitespace-nowrap">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-text-secondary group-hover:text-accent border-border"><ChevronRight size={14}/></Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-16 text-center">
                    <LifeBuoy size={40} className="mx-auto text-text-secondary/20 mb-4" />
                    <p className="text-base font-bold text-text-primary">No tickets found</p>
                    <p className="text-sm text-text-secondary mt-1">Need help? Create a new support ticket.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Details Drawer */}
      {activeTicketId && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-surface h-full shadow-2xl flex flex-col border-l border-border animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b border-border flex justify-between items-center bg-background">
              <div>
                <h3 className="font-bold text-text-primary flex items-center gap-2">
                  {isLoadingTicket ? 'Loading...' : activeTicket?.ticketNumber}
                  {!isLoadingTicket && <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${getStatusColor(activeTicket?.status)}`}>{activeTicket?.status}</span>}
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">{activeTicket?.subject}</p>
              </div>
              <button onClick={() => setActiveTicketId(null)} className="text-text-secondary hover:text-danger p-2"><X size={20} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface">
              {isLoadingTicket ? (
                <div className="animate-pulse space-y-4"><div className="h-20 bg-border rounded-xl"/><div className="h-20 bg-border rounded-xl ml-8"/></div>
              ) : (
                activeTicket?.messages?.map((msg: any, i: number) => (
                  <div key={i} className={`flex ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${msg.sender === 'customer' ? 'bg-accent text-white rounded-tr-sm' : 'bg-background border border-border text-text-primary rounded-tl-sm'}`}>
                      <p className="whitespace-pre-wrap">{msg.message}</p>
                      <p className={`text-[10px] mt-2 font-medium ${msg.sender === 'customer' ? 'text-white/70' : 'text-text-secondary'}`}>
                        {new Date(msg.createdAt).toLocaleString([], {hour: '2-digit', minute:'2-digit', month: 'short', day: 'numeric'})}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {activeTicket?.status !== 'Closed' && activeTicket?.status !== 'Resolved' && (
              <div className="p-4 border-t border-border bg-background space-y-3">
                <div className="flex items-end gap-2">
                  <textarea 
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your reply..."
                    className="flex-1 max-h-32 min-h-[44px] p-3 text-sm bg-surface border border-border rounded-xl focus:border-accent focus:outline-none resize-none"
                    rows={1}
                  />
                  <Button onClick={handleReply} disabled={replyMutation.isPending || !replyMessage} className="bg-accent text-white h-11 w-11 p-0 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Send size={18} className={replyMessage ? "ml-1" : ""} />
                  </Button>
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
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl w-full max-w-md shadow-xl border border-border overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border flex justify-between items-center bg-background">
              <h3 className="font-bold text-text-primary">Create Support Ticket</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-text-secondary hover:text-danger"><Plus size={20} className="rotate-45" /></button>
            </div>
            <div className="p-5 space-y-4">
              <input type="text" placeholder="Subject" value={newTicket.subject} onChange={e => setNewTicket({...newTicket, subject: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-accent focus:outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <select value={newTicket.category} onChange={e => setNewTicket({...newTicket, category: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-accent focus:outline-none">
                  <option>Order Issue</option>
                  <option>Payment</option>
                  <option>Delivery</option>
                  <option>Account</option>
                  <option>Other</option>
                </select>
                <select value={newTicket.priority} onChange={e => setNewTicket({...newTicket, priority: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-accent focus:outline-none">
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Urgent</option>
                </select>
              </div>
              <textarea placeholder="Please describe your issue in detail..." rows={4} value={newTicket.message} onChange={e => setNewTicket({...newTicket, message: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-accent focus:outline-none resize-none" />
            </div>
            <div className="p-4 border-t border-border bg-background flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
              <Button className="flex-1 bg-accent text-white" onClick={handleCreate} disabled={createMutation.isPending}>{createMutation.isPending ? 'Submitting...' : 'Submit Ticket'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportPage;
