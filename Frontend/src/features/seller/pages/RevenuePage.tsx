import React from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { KPICard } from '@/components/ui/KPI';
import { DataTable } from '@/components/table';
import { Button } from '@/components/ui/Button';
import { useRevenueOverview, useRevenueChart, useTransactions } from '../services/seller.queries';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DateRangeSelector = () => (
  <select className="bg-background border border-border text-sm rounded-lg px-3 py-1.5 outline-none focus:border-primary">
    <option>Today</option>
    <option>Last 7 Days</option>
    <option>Last 30 Days</option>
    <option>This Month</option>
  </select>
);

const RevenuePage: React.FC = () => {
  const { data: overview, isLoading: overviewLoading, refetch: refetchOverview } = useRevenueOverview();
  const { data: chartData, isLoading: chartLoading, refetch: refetchChart } = useRevenueChart();
  const { data: transactions, isLoading: txLoading, refetch: refetchTx } = useTransactions();

  const handleRefresh = () => {
    refetchOverview();
    refetchChart();
    refetchTx();
  };

  const columns = [
    { header: 'Order ID', accessorKey: 'orderId', cell: (row: any) => <span className="font-mono font-bold text-accent bg-accent/10 px-2 py-1 rounded tracking-wider">{row.orderId}</span> },
    { header: 'Customer', accessorKey: 'customerName', cell: (row: any) => <span className="font-bold text-sm text-text-primary">{row.customerName}</span> },
    { header: 'Amount', accessorKey: 'total', cell: (row: any) => <span className="text-success font-semibold">₹{row.total}</span> },
    { header: 'Date', accessorKey: 'createdAt', cell: (row: any) => <span className="text-xs text-text-secondary">{new Date(row.createdAt).toLocaleString()}</span> },
    { header: 'Status', accessorKey: 'status', cell: (row: any) => (
        <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${row.status === 'delivered' ? 'bg-success/10 text-success' : row.status === 'cancelled' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'}`}>
          {row.status}
        </span>
      )
    },
    { header: 'Payment', accessorKey: 'paymentStatus', cell: (row: any) => (
        <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${row.paymentStatus === 'paid' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
          {row.paymentStatus}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6 text-left max-w-[1440px] mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Revenue Summary</h1>
          <p className="text-sm text-text-secondary">Track your earnings, commissions, and settlements</p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangeSelector />
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2"><RefreshCw size={14} /> Refresh</Button>
          <Button variant="outline" size="sm" className="gap-2"><Download size={14} /> Export CSV</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard title="Gross Revenue" value={`₹${overview?.grossRevenue || 0}`} loading={overviewLoading} className="border-primary/20" />
        <KPICard title="Net Revenue" value={`₹${overview?.netRevenue || 0}`} loading={overviewLoading} className="border-success/20" />
        <KPICard title="Commission" value={`₹${overview?.commissionDeducted || 0}`} loading={overviewLoading} className="border-danger/20" />
        <KPICard title="Refunds" value={`₹${overview?.refundAmount || 0}`} loading={overviewLoading} className="border-danger/20" />
        <KPICard title="Taxes" value={`₹${overview?.taxes || 0}`} loading={overviewLoading} />
        <KPICard title="Pending Settlement" value={`₹${overview?.pendingSettlement || 0}`} loading={overviewLoading} className="border-warning/20" />
      </div>

      <div className="bg-surface border border-border rounded-xl p-5">
        <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-6">Revenue Trend</h3>
        <div className="h-80">
          {chartLoading ? (
            <div className="w-full h-full bg-background animate-pulse rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData || []} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                <XAxis dataKey="date" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e1e2d', borderColor: '#2b2b40', borderRadius: '8px' }}
                  itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider">Recent Transactions</h3>
        </div>
        <DataTable 
          columns={columns} 
          data={transactions || []} 
          isLoading={txLoading} 
          exportFileName="transactions"
        />
      </div>
    </div>
  );
};

export default RevenuePage;
