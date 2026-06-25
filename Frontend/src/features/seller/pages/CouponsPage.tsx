import React, { useState } from 'react';
import { Tag, Plus, Edit, Trash2, Search, X } from 'lucide-react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { KPICard } from '@/components/ui/KPI';
import { DataTable } from '@/components/table';
import { useCoupons, useCouponStats, useCreateCoupon, useUpdateCoupon, useDeleteCoupon } from '../services/seller.queries';
import { Button } from '@/components/ui/Button';
import { FormInput, FormSelect } from '@/components/form/FormFields';
import { useNotificationStore } from '@/store/notificationStore';

const couponSchema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters'),
  type: z.enum(['PERCENTAGE', 'FIXED']),
  discountAmount: z.coerce.number().min(1, 'Discount is required'),
  minOrderAmount: z.coerce.number().min(0),
  startDate: z.string().optional(),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  status: z.enum(['ACTIVE', 'SCHEDULED', 'EXPIRED', 'DISABLED'])
});

export const CouponsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: stats, isLoading: statsLoading } = useCouponStats();
  const { data: coupons, isLoading: couponsLoading } = useCoupons();
  
  const createMutation = useCreateCoupon();
  const updateMutation = useUpdateCoupon();
  const deleteMutation = useDeleteCoupon();
  const { addToast } = useNotificationStore();

  const methods = useForm({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: '', type: 'FIXED', discountAmount: 0, minOrderAmount: 0, startDate: '', expiryDate: '', status: 'ACTIVE'
    }
  });

  const onSubmit = async (data: any) => {
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data });
        addToast({ title: 'Success', message: 'Coupon updated', type: 'success' });
      } else {
        await createMutation.mutateAsync(data);
        addToast({ title: 'Success', message: 'Coupon created', type: 'success' });
      }
      setShowForm(false);
      setEditingId(null);
      methods.reset();
    } catch (err: any) {
      addToast({ title: 'Error', message: err.message || 'Failed to save coupon', type: 'error' });
    }
  };

  const handleEdit = (coupon: any) => {
    setEditingId(coupon._id);
    methods.reset({
      code: coupon.code,
      type: coupon.type || 'FIXED',
      discountAmount: coupon.discountAmount,
      minOrderAmount: coupon.minOrderAmount,
      startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().split('T')[0] : '',
      expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : '',
      status: coupon.status || 'ACTIVE'
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this coupon?')) {
      try {
        await deleteMutation.mutateAsync(id);
        addToast({ title: 'Success', message: 'Coupon deleted', type: 'success' });
      } catch (err: any) {
        addToast({ title: 'Error', message: err.message, type: 'error' });
      }
    }
  };

  const columns = [
    {
      header: 'Coupon Code',
      accessorKey: 'code',
      cell: (row: any) => <span className="font-mono font-bold text-accent bg-accent/10 px-2 py-1 rounded tracking-wider">{row.code}</span>
    },
    {
      header: 'Discount',
      accessorKey: 'discountAmount',
      cell: (row: any) => <span className="font-bold">{row.type === 'PERCENTAGE' ? `${row.discountAmount}% OFF` : `₹${row.discountAmount} OFF`}</span>
    },
    {
      header: 'Min Order',
      accessorKey: 'minOrderAmount',
      cell: (row: any) => <span>₹{row.minOrderAmount}</span>
    },
    {
      header: 'Usage',
      accessorKey: 'usageCount',
      cell: (row: any) => <span className="font-medium">{row.usageCount || 0}</span>
    },
    {
      header: 'Revenue',
      accessorKey: 'revenueGenerated',
      cell: (row: any) => <span className="font-semibold text-success">₹{row.revenueGenerated || 0}</span>
    },
    {
      header: 'Valid Till',
      accessorKey: 'expiryDate',
      cell: (row: any) => <span className="text-xs text-text-secondary">{new Date(row.expiryDate).toLocaleDateString()}</span>
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row: any) => (
        <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${row.status === 'ACTIVE' ? 'bg-success/10 text-success' : row.status === 'EXPIRED' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'}`}>
          {row.status || 'ACTIVE'}
        </span>
      )
    },
    {
      header: 'Actions',
      accessorKey: 'actions',
      cell: (row: any) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => handleEdit(row)} className="text-text-secondary hover:text-accent"><Edit size={14}/></Button>
          <Button size="sm" variant="ghost" onClick={() => handleDelete(row._id)} className="text-danger hover:bg-danger/10"><Trash2 size={14}/></Button>
        </div>
      )
    }
  ];

  const filteredData = coupons?.filter((c: any) => c.code?.toLowerCase().includes(search.toLowerCase())) || [];

  return (
    <div className="space-y-6 text-left max-w-[1440px] mx-auto pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Coupons & Discounts</h1>
          <p className="text-sm text-text-secondary">Create promo codes to boost sales</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} icon={<Plus size={16} />}>Create Coupon</Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Active Coupons" value={stats?.active || 0} loading={statsLoading} className="border-success/20" />
        <KPICard title="Scheduled" value={stats?.scheduled || 0} loading={statsLoading} />
        <KPICard title="Expired" value={stats?.expired || 0} loading={statsLoading} className="border-danger/20" />
        <KPICard title="Revenue Generated" value={`₹${stats?.revenueGenerated || 0}`} loading={statsLoading} />
      </div>

      {showForm ? (
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex justify-between items-center border-b border-border pb-4 mb-6">
            <h2 className="text-lg font-bold text-text-primary">{editingId ? 'Edit Coupon' : 'Create New Coupon'}</h2>
            <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setEditingId(null); methods.reset(); }}><X size={16}/></Button>
          </div>
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput name="code" label="Coupon Code" placeholder="e.g. SUMMER50" />
                <FormSelect name="type" label="Discount Type" options={[{ label: 'Fixed Amount (₹)', value: 'FIXED' }, { label: 'Percentage (%)', value: 'PERCENTAGE' }]} />
                <FormInput name="discountAmount" label="Discount Value" type="number" />
                <FormInput name="minOrderAmount" label="Min Order Amount (₹)" type="number" />
                <FormInput name="startDate" label="Start Date" type="date" />
                <FormInput name="expiryDate" label="Expiry Date" type="date" />
                <FormSelect name="status" label="Status" options={[{ label: 'Active', value: 'ACTIVE' }, { label: 'Scheduled', value: 'SCHEDULED' }, { label: 'Disabled', value: 'DISABLED' }]} />
              </div>
              <div className="flex justify-end gap-4">
                <Button variant="outline" type="button" onClick={() => { setShowForm(false); setEditingId(null); methods.reset(); }}>Cancel</Button>
                <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>Save Coupon</Button>
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
                placeholder="Search by coupon code..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <DataTable 
            columns={columns} 
            data={filteredData.map((d: any) => ({ ...d, id: d._id }))} 
            isLoading={couponsLoading}
            exportFileName="coupons-export"
          />
        </div>
      )}
    </div>
  );
};
export default CouponsPage;
