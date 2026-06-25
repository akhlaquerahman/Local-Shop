import React, { useState } from 'react';
import apiClient from '@/lib/apiClient';
import { Button } from '@/components/ui/Button';

export const ReportsPage: React.FC = () => {
  const [loadingType, setLoadingType] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const handleGenerate = async (type: string, format: string) => {
    setLoadingType(type);
    setSuccessMsg('');
    try {
      const response = await apiClient.post('/admin/reports/generate', { reportType: type, format }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_Report.${format.toLowerCase()}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      setSuccessMsg(`${type} report generated and downloaded successfully.`);
    } catch (err: any) {
      alert('Error downloading report.');
    } finally {
      setLoadingType(null);
    }
  };

  const reports = [
    { title: 'Financial Revenue Report', type: 'Revenue', desc: 'Aggregated revenue from sales, commissions, and subscriptions.' },
    { title: 'Global Order Export', type: 'Orders', desc: 'Export all marketplace orders with fulfillment statuses.' },
    { title: 'Customer Database', type: 'Customers', desc: 'Active customers list with lifetime value metrics.' },
    { title: 'Seller Payouts', type: 'Payouts', desc: 'Pending and completed payout ledgers for all shops.' },
    { title: 'Fraud & Blocklist', type: 'Fraud', desc: 'Details of all high risk and blocked users.' },
  ];

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
            Enterprise Reporting
          </h1>
          <p className="text-sm text-text-secondary mt-1">Generate and download platform-wide analytics.</p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-success/10 border border-success/20 text-success rounded-lg font-medium">
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reports.map((r, i) => (
          <div key={i} className="p-6 bg-surface border border-border rounded-xl flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-text-primary">{r.title}</h3>
              <p className="text-sm text-text-secondary mt-2 mb-6">{r.desc}</p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => handleGenerate(r.type, 'CSV')} 
                disabled={loadingType === r.type}
                className="bg-primary hover:bg-primary/90 text-white flex-1"
              >
                {loadingType === r.type ? 'Generating...' : 'Export CSV'}
              </Button>
              <Button 
                onClick={() => handleGenerate(r.type, 'PDF')} 
                disabled={loadingType === r.type}
                variant="outline" 
                className="flex-1 bg-surface border-border hover:bg-white/5"
              >
                Export PDF
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default ReportsPage;
