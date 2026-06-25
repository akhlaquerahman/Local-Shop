import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HelpCircle, Plus, Search, MessageSquare, Clock, CheckCircle2, ChevronRight, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNotificationStore } from '@/store/notificationStore';
import { useUserSupportTickets, useCreateTicket } from './services/support.queries';

type TicketStatus = 'open' | 'pending' | 'resolved' | 'closed';

export const SupportTicketsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use /app/support or whatever route we are currently in
  const basePath = location.pathname;

  const { addToast } = useNotificationStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TicketStatus>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: tickets = [], isLoading } = useUserSupportTickets();
  const createMutation = useCreateTicket();

  const [formData, setFormData] = useState({ category: '', subject: '', message: '' });

  const filteredTickets = tickets.filter((t: any) => {
    const s = t.status?.toLowerCase() || 'open';
    return (statusFilter === 'all' || s === statusFilter || (statusFilter === 'pending' && s === 'in progress')) &&
    (t.subject.toLowerCase().includes(search.toLowerCase()) || t.ticketNumber?.toLowerCase().includes(search.toLowerCase()))
  });

  const stats = {
    active: tickets.filter((t: any) => {
      const s = t.status?.toLowerCase();
      return s === 'open' || s === 'pending' || s === 'in progress';
    }).length,
    resolved: tickets.filter((t: any) => {
      const s = t.status?.toLowerCase();
      return s === 'resolved' || s === 'closed';
    }).length
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

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData, {
      onSuccess: () => {
        addToast({ title: 'Ticket Created', message: 'Support agent will connect with you shortly.', type: 'success' });
        setIsCreateModalOpen(false);
        setFormData({ category: '', subject: '', message: '' });
      },
      onError: (err: any) => {
        addToast({ title: 'Error', message: err.message, type: 'error' });
      }
    });
  };

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight flex items-center gap-3">
            <HelpCircle size={28} className="text-accent" /> Support Center
          </h1>
          <p className="text-sm text-text-secondary mt-1">Need help? Manage your support tickets here.</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
          <Plus size={16} /> New Ticket
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
          <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Active Issues</p>
          <p className="text-3xl font-black text-text-primary">{stats.active}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
          <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Resolved Issues</p>
          <p className="text-3xl font-black text-text-primary">{stats.resolved}</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by ticket ID or subject..."
            className="w-full pl-9 pr-4 py-2.5 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:border-accent text-text-primary transition-colors"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {(['all', 'open', 'pending', 'resolved', 'closed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors border ${
                statusFilter === f ? 'bg-accent/10 text-accent border-accent/20' : 'bg-surface border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Ticket List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-8 text-center animate-pulse text-text-secondary">Loading your tickets...</div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-16 space-y-4 border border-dashed border-border rounded-2xl bg-surface">
            <MessageSquare size={48} className="mx-auto text-text-secondary/30" />
            <div>
              <p className="font-bold text-text-primary text-lg">No tickets found</p>
              <p className="text-sm text-text-secondary mt-1">Change filters or create a new ticket if you need help.</p>
            </div>
          </div>
        ) : (
          filteredTickets.map((ticket: any) => (
            <div
              key={ticket._id}
              onClick={() => navigate(`${basePath}/${ticket._id}`)}
              className="bg-surface border border-border rounded-xl p-5 shadow-sm hover:border-accent/40 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-accent bg-accent/5 px-2 py-0.5 rounded">{ticket.ticketNumber || ticket._id.slice(-6).toUpperCase()}</span>
                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider border-l border-border pl-2">{ticket.category}</span>
                  </div>
                  <h3 className="font-bold text-sm text-text-primary truncate pr-4">{ticket.subject}</h3>
                  <p className="text-[11px] font-medium text-text-secondary">
                    Created At {new Date(ticket.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-4 sm:w-48">
                  {getStatusBadge(ticket.status)}
                  <div className="flex items-center gap-2">
                    <ChevronRight size={18} className="text-text-secondary group-hover:text-accent transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Ticket Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl w-full max-w-lg shadow-enterprise-xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border flex justify-between items-center bg-background">
              <h3 className="font-bold text-text-primary">Create Support Ticket</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-text-secondary hover:text-danger"><Plus size={20} className="rotate-45" /></button>
            </div>
            <form onSubmit={handleCreateTicket} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Issue Category</label>
                <select 
                  required 
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-accent text-text-primary appearance-none">
                  <option value="">Select a category...</option>
                  <option value="order">Order Tracking/Missing Items</option>
                  <option value="delivery">Delivery Partner Issues</option>
                  <option value="payment">Payment/Double Charge</option>
                  <option value="refund">Refund Status</option>
                  <option value="account">Account/Profile Issues</option>
                  <option value="technical">App Bug/Technical Error</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Subject</label>
                <input 
                  required 
                  type="text" 
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Brief summary of the issue" 
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-accent text-text-primary" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Description</label>
                <textarea 
                  required 
                  rows={4} 
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Please provide detailed information about your issue..." 
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-accent text-text-primary resize-none custom-scrollbar" />
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                <Button type="submit" isLoading={createMutation.isPending}>Submit Ticket</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default SupportTicketsPage;
