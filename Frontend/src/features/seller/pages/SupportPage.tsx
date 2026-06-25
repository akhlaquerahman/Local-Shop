import React, { useState } from 'react';
import { Plus, X, MessageSquare, Clock, CheckCircle, Search, Download } from 'lucide-react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { KPICard } from '@/components/ui/KPI';
import { DataTable } from '@/components/table';
import { Button } from '@/components/ui/Button';
import { useTickets, useCreateTicket } from '../services/seller.queries';
import { FormInput, FormSelect } from '@/components/form/FormFields';
import { useNotificationStore } from '@/store/notificationStore';
import TicketChatModal from './TicketChatModal';

const ticketSchema = z.object({
  subject: z.string().min(5, 'Subject is required'),
  category: z.enum(['Payouts', 'Account', 'Technical', 'Order Dispute', 'Other']),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),
  message: z.string().min(10, 'Please provide more details')
});

const SupportPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const { data: tickets, isLoading, refetch } = useTickets();
  const createMutation = useCreateTicket();
  const { addToast } = useNotificationStore();

  const methods = useForm({
    resolver: zodResolver(ticketSchema),
    defaultValues: { subject: '', category: 'Technical', priority: 'Medium', message: '' }
  });

  const onSubmit = async (formData: any) => {
    try {
      await createMutation.mutateAsync(formData);
      addToast({ title: 'Success', message: 'Ticket created successfully', type: 'success' });
      setShowForm(false);
      methods.reset();
    } catch (err: any) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  const columns = [
    { id: 'ticketNumber', header: 'Ticket ID', accessorKey: 'ticketNumber', cell: (row: any) => <span className="font-mono text-xs font-bold">{row.ticketNumber}</span> },
    { id: 'subject', header: 'Subject', accessorKey: 'subject', cell: (row: any) => <span className="font-bold text-sm text-text-primary truncate max-w-[200px] block">{row.subject}</span> },
    { id: 'category', header: 'Category', accessorKey: 'category', cell: (row: any) => <span className="text-xs text-text-secondary">{row.category}</span> },
    { id: 'priority', header: 'Priority', accessorKey: 'priority', cell: (row: any) => (
        <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${row.priority === 'Urgent' || row.priority === 'High' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'}`}>
          {row.priority}
        </span>
      )
    },
    { id: 'status', header: 'Status', accessorKey: 'status', cell: (row: any) => (
        <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${row.status === 'Resolved' || row.status === 'Closed' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>
          {row.status}
        </span>
      )
    },
    { id: 'createdAt', header: 'Created', accessorKey: 'createdAt', cell: (row: any) => <span className="text-xs text-text-secondary">{new Date(row.createdAt).toLocaleDateString()}</span> },
    { id: 'actions', header: 'Actions', accessorKey: 'actions', cell: (row: any) => (
        <Button size="sm" variant="ghost" className="text-primary hover:text-primary-hover px-2 text-xs" onClick={() => setSelectedTicketId(row._id || row.id)}>View Thread</Button>
      )
    }
  ];

  const filteredData = tickets
    ?.filter((t: any) => t.subject?.toLowerCase().includes(search.toLowerCase()) || t.ticketNumber?.toLowerCase().includes(search.toLowerCase()))
    ?.map((t: any) => ({ ...t, id: t._id })) || [];
  
  // Calculate stats
  const openCount = tickets?.filter((t:any) => t.status === 'Open').length || 0;
  const inProgressCount = tickets?.filter((t:any) => t.status === 'Pending').length || 0;
  const resolvedCount = tickets?.filter((t:any) => t.status === 'Resolved' || t.status === 'Closed').length || 0;

  return (
    <div className="space-y-6 text-left max-w-[1440px] mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Seller Help Desk</h1>
          <p className="text-sm text-text-secondary">Get support and track your open inquiries</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} icon={<Plus size={16} />}>Create Ticket</Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Open Tickets" value={openCount} loading={isLoading} icon={<MessageSquare className="text-primary" />} className="border-primary/20" />
        <KPICard title="In Progress" value={inProgressCount} loading={isLoading} icon={<Clock className="text-warning" />} />
        <KPICard title="Resolved" value={resolvedCount} loading={isLoading} icon={<CheckCircle className="text-success" />} className="border-success/20" />
        <KPICard title="Avg Response" value="< 2 hrs" loading={isLoading} className="border-border" />
      </div>

      {showForm ? (
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex justify-between items-center border-b border-border pb-4 mb-6">
            <h2 className="text-lg font-bold text-text-primary">Create Support Ticket</h2>
            <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); methods.reset(); }}><X size={16}/></Button>
          </div>
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <FormInput name="subject" label="Subject" placeholder="Brief summary of your issue" />
                </div>
                <FormSelect name="category" label="Category" options={[
                  { label: 'Technical Issue', value: 'Technical' },
                  { label: 'Payouts & Billing', value: 'Payouts' },
                  { label: 'Account Management', value: 'Account' },
                  { label: 'Order Dispute', value: 'Order Dispute' },
                  { label: 'Other', value: 'Other' }
                ]} />
                <FormSelect name="priority" label="Priority" options={[
                  { label: 'Low', value: 'Low' },
                  { label: 'Medium', value: 'Medium' },
                  { label: 'High', value: 'High' },
                  { label: 'Urgent', value: 'Urgent' }
                ]} />
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-text-primary mb-2">Message</label>
                  <textarea 
                    className="w-full bg-background border border-border rounded-lg p-3 text-sm min-h-[150px] focus:outline-none focus:border-primary"
                    placeholder="Provide detailed information so we can assist you better..."
                    {...methods.register('message')}
                  />
                  {methods.formState.errors.message && (
                    <p className="text-danger text-xs mt-1">{methods.formState.errors.message.message as string}</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-4 border-t border-border pt-4">
                <Button variant="outline" type="button" onClick={() => { setShowForm(false); methods.reset(); }}>Cancel</Button>
                <Button type="submit" isLoading={createMutation.isPending}>Submit Ticket</Button>
              </div>
            </form>
          </FormProvider>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
              <input 
                type="text" 
                placeholder="Search tickets..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">Refresh List</Button>
          </div>

          <DataTable 
            columns={columns} 
            data={filteredData} 
            isLoading={isLoading}
            exportFileName="support-tickets"
          />
        </div>
      )}

      {selectedTicketId && (
        <TicketChatModal 
          ticketId={selectedTicketId} 
          onClose={() => setSelectedTicketId(null)} 
        />
      )}
    </div>
  );
};

export default SupportPage;
