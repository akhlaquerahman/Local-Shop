import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search, X, Download } from 'lucide-react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { KPICard } from '@/components/ui/KPI';
import { DataTable } from '@/components/table';
import { usePromotions, useMarketingOverview, useCreatePromotion, useUpdatePromotion, useDeletePromotion } from '../services/seller.queries';
import { Button } from '@/components/ui/Button';
import { FormInput, FormSelect } from '@/components/form/FormFields';
import { useNotificationStore } from '@/store/notificationStore';

const promoSchema = z.object({
  name: z.string().min(3, 'Name is required'),
  type: z.enum(['DISCOUNT', 'BOGO', 'FREE_SHIPPING', 'FLASH_SALE', 'SPONSORED']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  budget: z.coerce.number().min(0),
  status: z.enum(['ACTIVE', 'PAUSED', 'COMPLETED', 'SCHEDULED']),
  targetAudience: z.string().optional()
});

export const PromotionsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: stats, isLoading: statsLoading } = useMarketingOverview();
  const { data: promotions, isLoading: promosLoading } = usePromotions();
  
  const createMutation = useCreatePromotion();
  const updateMutation = useUpdatePromotion();
  const deleteMutation = useDeletePromotion();
  const { addToast } = useNotificationStore();

  const methods = useForm({
    resolver: zodResolver(promoSchema),
    defaultValues: {
      name: '', type: 'DISCOUNT', startDate: '', endDate: '', budget: 0, status: 'SCHEDULED', targetAudience: 'All Customers'
    }
  });

  const onSubmit = async (data: any) => {
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data });
        addToast({ title: 'Success', message: 'Campaign updated', type: 'success' });
      } else {
        await createMutation.mutateAsync(data);
        addToast({ title: 'Success', message: 'Campaign created', type: 'success' });
      }
      setShowForm(false);
      setEditingId(null);
      methods.reset();
    } catch (err: any) {
      addToast({ title: 'Error', message: err.message || 'Failed to save', type: 'error' });
    }
  };

  const handleEdit = (promo: any) => {
    setEditingId(promo._id);
    methods.reset({
      name: promo.name,
      type: promo.type,
      startDate: promo.startDate ? new Date(promo.startDate).toISOString().split('T')[0] : '',
      endDate: promo.endDate ? new Date(promo.endDate).toISOString().split('T')[0] : '',
      budget: promo.budget,
      status: promo.status,
      targetAudience: promo.targetAudience
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this campaign?')) {
      try {
        await deleteMutation.mutateAsync(id);
        addToast({ title: 'Success', message: 'Campaign deleted', type: 'success' });
      } catch (err: any) {
        addToast({ title: 'Error', message: err.message, type: 'error' });
      }
    }
  };

  const handlePauseResume = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      await updateMutation.mutateAsync({ id, data: { status: newStatus } });
      addToast({ title: 'Success', message: `Campaign ${newStatus.toLowerCase()}`, type: 'success' });
    } catch (err: any) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  const columns = [
    { header: 'Campaign', accessorKey: 'name', cell: (row: any) => <span className="font-bold text-text-primary text-sm">{row.name}</span> },
    { header: 'Type', accessorKey: 'type', cell: (row: any) => <span className="text-xs">{row.type.replace('_', ' ')}</span> },
    { header: 'Reach', accessorKey: 'reach', cell: (row: any) => <span>{row.reach}</span> },
    { header: 'Clicks', accessorKey: 'clicks', cell: (row: any) => <span>{row.clicks}</span> },
    { header: 'Orders', accessorKey: 'ordersAttributed', cell: (row: any) => <span>{row.ordersAttributed}</span> },
    { header: 'Revenue', accessorKey: 'revenueGenerated', cell: (row: any) => <span className="text-success font-semibold">₹{row.revenueGenerated}</span> },
    { header: 'ROI', accessorKey: 'roi', cell: (row: any) => <span>{row.roi}x</span> },
    { header: 'Status', accessorKey: 'status', cell: (row: any) => (
        <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${row.status === 'ACTIVE' ? 'bg-success/10 text-success' : row.status === 'PAUSED' ? 'bg-warning/10 text-warning' : 'bg-surface text-text-secondary border border-border'}`}>
          {row.status}
        </span>
      )
    },
    { header: 'Actions', accessorKey: 'actions', cell: (row: any) => (
        <div className="flex gap-2">
          {row.status === 'ACTIVE' || row.status === 'PAUSED' ? (
            <Button size="sm" variant="outline" onClick={() => handlePauseResume(row._id, row.status)} className="text-xs px-2 py-1 h-auto">
              {row.status === 'ACTIVE' ? 'Pause' : 'Resume'}
            </Button>
          ) : null}
          <Button size="sm" variant="ghost" onClick={() => handleEdit(row)} className="text-text-secondary hover:text-accent"><Edit size={14}/></Button>
          <Button size="sm" variant="ghost" onClick={() => handleDelete(row._id)} className="text-danger hover:bg-danger/10"><Trash2 size={14}/></Button>
        </div>
      )
    }
  ];

  const filteredData = promotions?.filter((p: any) => p.name?.toLowerCase().includes(search.toLowerCase())) || [];

  return (
    <div className="space-y-6 text-left max-w-[1440px] mx-auto pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Promotions & Campaigns</h1>
          <p className="text-sm text-text-secondary">Manage and track your marketing campaigns</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} icon={<Plus size={16} />}>Create Campaign</Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Active Campaigns" value={stats?.activeCampaigns || 0} loading={statsLoading} className="border-success/20" />
        <KPICard title="Scheduled" value={stats?.scheduledCampaigns || 0} loading={statsLoading} />
        <KPICard title="Total Reach" value={stats?.totalReach || 0} loading={statsLoading} />
        <KPICard title="Revenue Generated" value={`₹${stats?.revenueGenerated || 0}`} loading={statsLoading} className="border-accent/20" />
      </div>

      {showForm ? (
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex justify-between items-center border-b border-border pb-4 mb-6">
            <h2 className="text-lg font-bold text-text-primary">{editingId ? 'Edit Campaign' : 'Create New Campaign'}</h2>
            <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setEditingId(null); methods.reset(); }}><X size={16}/></Button>
          </div>
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput name="name" label="Campaign Name" placeholder="e.g. Diwali Mega Sale" />
                <FormSelect name="type" label="Campaign Type" options={[
                  { label: 'Discount', value: 'DISCOUNT' }, 
                  { label: 'BOGO', value: 'BOGO' },
                  { label: 'Free Shipping', value: 'FREE_SHIPPING' },
                  { label: 'Flash Sale', value: 'FLASH_SALE' },
                  { label: 'Sponsored', value: 'SPONSORED' }
                ]} />
                <FormInput name="startDate" label="Start Date" type="date" />
                <FormInput name="endDate" label="End Date" type="date" />
                <FormInput name="budget" label="Budget (₹)" type="number" />
                <FormInput name="targetAudience" label="Target Audience" placeholder="e.g. All Customers" />
                <FormSelect name="status" label="Status" options={[
                  { label: 'Active', value: 'ACTIVE' }, 
                  { label: 'Scheduled', value: 'SCHEDULED' }, 
                  { label: 'Paused', value: 'PAUSED' }
                ]} />
              </div>
              <div className="flex justify-end gap-4">
                <Button variant="outline" type="button" onClick={() => { setShowForm(false); setEditingId(null); methods.reset(); }}>Cancel</Button>
                <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>Save Campaign</Button>
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
                placeholder="Search campaigns..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2"><Download size={14} /> Export</Button>
          </div>

          <DataTable 
            columns={columns} 
            data={filteredData.map((d: any) => ({ ...d, id: d._id }))} 
            isLoading={promosLoading}
            exportFileName="promotions"
          />
        </div>
      )}
    </div>
  );
};

export default PromotionsPage;
