import React, { useState } from 'react';
import { Plus, X, FileText, Download, Clock, HardDrive, Search } from 'lucide-react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { KPICard } from '@/components/ui/KPI';
import { DataTable } from '@/components/table';
import { Button } from '@/components/ui/Button';
import { useReports, useGenerateReport } from '../services/seller.queries';
import { FormInput, FormSelect } from '@/components/form/FormFields';
import { useNotificationStore } from '@/store/notificationStore';

const reportSchema = z.object({
  reportName: z.string().min(3, 'Name is required'),
  category: z.enum(['Sales', 'Inventory', 'Payouts', 'Tax', 'Customers']),
  format: z.enum(['CSV', 'Excel', 'PDF'])
});

const ReportsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const { data: reports, isLoading, refetch } = useReports();
  const generateMutation = useGenerateReport();
  const { addToast } = useNotificationStore();

  const methods = useForm({
    resolver: zodResolver(reportSchema),
    defaultValues: { reportName: '', category: 'Sales', format: 'CSV' }
  });

  const onSubmit = async (formData: any) => {
    try {
      await generateMutation.mutateAsync(formData);
      addToast({ title: 'Success', message: 'Report generated successfully', type: 'success' });
      setShowForm(false);
      methods.reset();
    } catch (err: any) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  const columns = [
    { header: 'Report Name', accessorKey: 'reportName', cell: (row: any) => <span className="font-bold text-sm text-text-primary truncate block max-w-[200px]">{row.reportName}</span> },
    { header: 'Category', accessorKey: 'category', cell: (row: any) => <span className="text-xs text-text-secondary">{row.category}</span> },
    { header: 'Format', accessorKey: 'format', cell: (row: any) => (
        <span className={`px-2 py-1 text-[10px] font-bold rounded bg-surface border border-border text-text-primary`}>
          {row.format}
        </span>
      )
    },
    { header: 'Status', accessorKey: 'status', cell: (row: any) => (
        <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${row.status === 'COMPLETED' ? 'bg-success/10 text-success' : row.status === 'GENERATING' ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'}`}>
          {row.status}
        </span>
      )
    },
    { header: 'Generated On', accessorKey: 'generatedAt', cell: (row: any) => <span className="text-xs text-text-secondary">{row.generatedAt ? new Date(row.generatedAt).toLocaleString() : '-'}</span> },
    { header: 'Actions', accessorKey: 'actions', cell: (row: any) => (
        <div className="flex gap-2">
          {row.status === 'COMPLETED' && row.fileUrl ? (
            <a href={row.fileUrl} download={`${row.reportName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`} className="text-primary hover:underline text-xs flex items-center gap-1 font-bold">
              <Download size={12}/> Download
            </a>
          ) : (
            <span className="text-xs text-text-secondary">Processing...</span>
          )}
        </div>
      )
    }
  ];

  const filteredData = reports?.filter((r: any) => r.reportName?.toLowerCase().includes(search.toLowerCase())) || [];
  
  const completedCount = reports?.filter((r:any) => r.status === 'COMPLETED').length || 0;

  return (
    <div className="space-y-6 text-left max-w-[1440px] mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Report Center</h1>
          <p className="text-sm text-text-secondary">Generate and download data extracts</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} icon={<Plus size={16} />}>Generate Report</Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Generated Reports" value={reports?.length || 0} loading={isLoading} icon={<FileText className="text-primary" />} className="border-primary/20" />
        <KPICard title="Ready for Download" value={completedCount} loading={isLoading} icon={<Download className="text-success" />} className="border-success/20" />
        <KPICard title="Scheduled" value="0" loading={isLoading} icon={<Clock className="text-warning" />} />
        <KPICard title="Storage Used" value="1.2 MB" loading={isLoading} icon={<HardDrive className="text-accent opacity-50" />} />
      </div>

      {showForm ? (
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex justify-between items-center border-b border-border pb-4 mb-6">
            <h2 className="text-lg font-bold text-text-primary">Generate New Report</h2>
            <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); methods.reset(); }}><X size={16}/></Button>
          </div>
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <FormInput name="reportName" label="Report Name" placeholder="e.g. November Sales Report" />
                </div>
                <FormSelect name="category" label="Data Category" options={[
                  { label: 'Sales & Orders', value: 'Sales' },
                  { label: 'Inventory Status', value: 'Inventory' },
                  { label: 'Payouts & Finances', value: 'Payouts' },
                  { label: 'Tax Report', value: 'Tax' },
                  { label: 'Customer List', value: 'Customers' }
                ]} />
                <FormSelect name="format" label="Export Format" options={[
                  { label: 'CSV (Spreadsheet)', value: 'CSV' },
                  { label: 'Excel (.xlsx)', value: 'Excel' },
                  { label: 'PDF Document', value: 'PDF' }
                ]} />
              </div>
              <div className="flex justify-end gap-4 border-t border-border pt-4">
                <Button variant="outline" type="button" onClick={() => { setShowForm(false); methods.reset(); }}>Cancel</Button>
                <Button type="submit" isLoading={generateMutation.isPending}>Generate Now</Button>
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
                placeholder="Search reports..." 
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
            exportFileName="generated-reports"
          />
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
