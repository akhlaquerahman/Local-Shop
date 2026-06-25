import React, { useState } from 'react';
import { Download, RefreshCw, CreditCard, Plus, X } from 'lucide-react';
import { KPICard } from '@/components/ui/KPI';
import { DataTable } from '@/components/table';
import { Button } from '@/components/ui/Button';
import { usePayouts, usePayoutSummary, useRequestPayout } from '../services/seller.queries';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormInput } from '@/components/form/FormFields';
import { useNotificationStore } from '@/store/notificationStore';

const payoutSchema = z.object({
  amount: z.coerce.number().min(100, 'Minimum payout is ₹100'),
  bankAccount: z.object({
    accountName: z.string().min(3, 'Account Name is required'),
    accountNumber: z.string().min(9, 'Valid Account Number is required'),
    bankName: z.string().min(3, 'Bank Name is required'),
    ifscCode: z.string().min(11, 'Valid IFSC is required')
  })
});

const PayoutsPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const { data: payouts, isLoading: payoutsLoading, refetch: refetchPayouts } = usePayouts();
  const { data: summary, isLoading: summaryLoading, refetch: refetchSummary } = usePayoutSummary();
  const requestMutation = useRequestPayout();
  const { addToast } = useNotificationStore();

  const methods = useForm({
    resolver: zodResolver(payoutSchema),
    defaultValues: {
      amount: 0,
      bankAccount: { accountName: '', accountNumber: '', bankName: '', ifscCode: '' }
    }
  });

  const handleRefresh = () => {
    refetchPayouts();
    refetchSummary();
  };

  const onSubmit = async (data: any) => {
    try {
      await requestMutation.mutateAsync(data);
      addToast({ title: 'Success', message: 'Payout requested successfully', type: 'success' });
      setShowModal(false);
      methods.reset();
    } catch (err: any) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  const columns = [
    { header: 'Payout ID', accessorKey: '_id', cell: (row: any) => <span className="font-mono text-xs">{row._id.substring(row._id.length - 8)}</span> },
    { header: 'Amount', accessorKey: 'amount', cell: (row: any) => <span className="font-bold text-text-primary">₹{row.amount}</span> },
    { header: 'Bank', accessorKey: 'bankAccount', cell: (row: any) => <span className="text-sm">{row.bankAccount?.bankName} (..{row.bankAccount?.accountNumber?.slice(-4)})</span> },
    { header: 'Status', accessorKey: 'status', cell: (row: any) => (
        <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${row.status === 'SETTLED' ? 'bg-success/10 text-success' : row.status === 'PENDING' ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'}`}>
          {row.status}
        </span>
      )
    },
    { header: 'Requested On', accessorKey: 'createdAt', cell: (row: any) => <span className="text-xs text-text-secondary">{new Date(row.createdAt).toLocaleString()}</span> },
    { header: 'Processed On', accessorKey: 'processedAt', cell: (row: any) => <span className="text-xs text-text-secondary">{row.processedAt ? new Date(row.processedAt).toLocaleString() : '-'}</span> },
    { header: 'Ref No.', accessorKey: 'referenceNumber', cell: (row: any) => <span className="font-mono text-xs">{row.referenceNumber || '-'}</span> }
  ];

  return (
    <div className="space-y-6 text-left max-w-[1440px] mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Payouts & Settlements</h1>
          <p className="text-sm text-text-secondary">Manage your earnings and bank transfers</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2"><RefreshCw size={14} /> Refresh</Button>
          <Button variant="outline" size="sm" className="gap-2"><Download size={14} /> Export</Button>
          <Button onClick={() => setShowModal(true)} icon={<Plus size={16} />}>Request Settlement</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Available Balance" value={`₹${summary?.availableBalance || 0}`} loading={summaryLoading} icon={<CreditCard className="text-primary" />} className="border-primary/20" />
        <KPICard title="Pending Balance" value={`₹${summary?.pendingBalance || 0}`} loading={summaryLoading} className="border-warning/20" />
        <KPICard title="Settled Amount" value={`₹${summary?.settledAmount || 0}`} loading={summaryLoading} className="border-success/20" />
        <KPICard title="Next Payout Date" value={summary?.nextPayoutDate ? new Date(summary.nextPayoutDate).toLocaleDateString() : '-'} loading={summaryLoading} />
      </div>

      <div className="bg-surface border border-border rounded-xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider">Settlement History</h3>
        </div>
        <DataTable 
          columns={columns} 
          data={payouts || []} 
          isLoading={payoutsLoading} 
          exportFileName="payouts"
        />
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-surface border border-border rounded-xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b border-border">
              <h2 className="text-lg font-bold text-text-primary">Request Settlement</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}><X size={16} /></Button>
            </div>
            <div className="p-6">
              <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
                  <FormInput name="amount" label="Amount to Withdraw (₹)" type="number" />
                  <div className="bg-background/50 p-4 rounded-lg space-y-4 border border-border">
                    <h3 className="text-sm font-bold text-text-secondary">Bank Account Details</h3>
                    <FormInput name="bankAccount.accountName" label="Account Holder Name" />
                    <FormInput name="bankAccount.accountNumber" label="Account Number" />
                    <FormInput name="bankAccount.bankName" label="Bank Name" />
                    <FormInput name="bankAccount.ifscCode" label="IFSC Code" />
                  </div>
                  <Button type="submit" className="w-full" isLoading={requestMutation.isPending}>Submit Request</Button>
                </form>
              </FormProvider>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayoutsPage;
