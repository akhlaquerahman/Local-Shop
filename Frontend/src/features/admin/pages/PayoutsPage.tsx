import React, { useState } from 'react';
import { useAdminPayoutsAggregated } from '../services/admin.queries';
import { AdminDataTable } from '@/components/table/AdminDataTable';
import { PaginationState, SortingState } from '@tanstack/react-table';
import { Button } from '@/components/ui/Button';
import { KPICard } from '@/components/ui/KPI';
import { Download, RefreshCw, Layers } from 'lucide-react';
import { PayoutsActionDropdown } from '../components/PayoutsActionDropdown';
import { PayoutDetailsDrawer } from '../components/PayoutDetailsDrawer';

export const PayoutsPage: React.FC = () => {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');
  
  // Modals & Drawers State
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { data, isLoading } = useAdminPayoutsAggregated({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search,
    sortBy: sorting[0]?.id,
    sortOrder: sorting[0]?.desc ? 'desc' : 'asc'
  });

  const columns = [
    {
      header: 'Profile',
      accessorKey: 'name',
      cell: (info: any) => {
        const row = info.row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {row.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-sm text-text-primary leading-tight">{row.name}</p>
              <p className="text-xs text-text-secondary">{row.id.substring(0,8).toUpperCase()}</p>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Type',
      accessorKey: 'accountType',
      cell: (info: any) => {
        const type = info.getValue();
        return (
          <span className={`px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-full ${type === 'SELLER' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'}`}>
            {type}
          </span>
        );
      }
    },
    {
      header: 'Revenue',
      accessorKey: 'totalRevenue',
      cell: (info: any) => <span className="font-semibold">₹{info.getValue()?.toLocaleString()}</span>
    },
    {
      header: 'Commission',
      accessorKey: 'platformCommission',
      cell: (info: any) => <span className="text-danger">₹{info.getValue()?.toLocaleString()}</span>
    },
    {
      header: 'Net Earnings',
      accessorKey: 'netEarnings',
      cell: (info: any) => <span className="font-bold text-success">₹{info.getValue()?.toLocaleString()}</span>
    },
    {
      header: 'Pending Payout',
      accessorKey: 'pendingPayout',
      cell: (info: any) => {
        const val = info.getValue();
        return (
          <span className={`font-extrabold ${val > 0 ? 'text-warning bg-warning/10 px-2 py-1 rounded' : 'text-text-secondary'}`}>
            ₹{val?.toLocaleString()}
          </span>
        );
      }
    },
    {
      header: 'KYC',
      accessorKey: 'kycStatus',
      cell: (info: any) => {
        const status = info.getValue();
        return (
          <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${status === 'VERIFIED' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
            {status}
          </span>
        );
      }
    },
    {
      header: 'Status',
      accessorKey: 'accountStatus',
      cell: (info: any) => {
        const status = info.getValue();
        return (
          <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${status === 'ACTIVE' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
            {status}
          </span>
        );
      }
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: (info: any) => (
        <PayoutsActionDropdown 
          account={info.row.original} 
          onViewDetails={() => {
            setSelectedAccount(info.row.original);
            setIsDetailsOpen(true);
          }} 
        />
      )
    }
  ];

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
            Merchant & Rider Payout Center
          </h1>
          <p className="text-sm text-text-secondary">Manage earnings, settlements, payouts and account status.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-surface border-border hover:bg-white/5" onClick={() => {}}>
            <Download size={16} className="mr-2" /> Export
          </Button>
          <Button className="bg-primary text-white shadow-enterprise hover:bg-primary/90">
            <Layers size={16} className="mr-2" /> Run Batch Payout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Total Pending Payouts" value={`₹${(data?.kpis?.totalPendingPayouts || 0).toLocaleString()}`} loading={isLoading} className="border-warning/30 bg-warning/5" />
        <KPICard title="Paid This Month" value={`₹${(data?.kpis?.totalPaidThisMonth || 0).toLocaleString()}`} loading={isLoading} className="border-success/30 bg-success/5" />
        <KPICard title="Failed Settlements" value={data?.kpis?.failedSettlements || 0} loading={isLoading} className="border-danger/30 bg-danger/5 text-danger" />
        <KPICard title="Suspended Accounts" value={data?.kpis?.suspendedAccounts || 0} loading={isLoading} />
      </div>

      <AdminDataTable
        columns={columns}
        data={data?.data || []}
        pageCount={data?.meta?.totalPages || -1}
        totalRecords={data?.meta?.total || 0}
        isLoading={isLoading}
        onPaginationChange={setPagination}
        onSortingChange={setSorting}
        onSearchChange={setSearch}
        initialState={{ pagination, sorting }}
      />

      <PayoutDetailsDrawer 
        isOpen={isDetailsOpen} 
        onClose={() => setIsDetailsOpen(false)} 
        accountId={selectedAccount?.id} 
      />
    </div>
  );
};

export default PayoutsPage;
