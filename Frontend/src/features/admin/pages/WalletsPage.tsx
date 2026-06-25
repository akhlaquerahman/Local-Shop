import React, { useState } from 'react';
import { useAdminWallets } from '../services/admin.queries';
import { AdminDataTable } from '@/components/table/AdminDataTable';
import { PaginationState, SortingState } from '@tanstack/react-table';
import { Button } from '@/components/ui/Button';
import { KPICard } from '@/components/ui/KPI';

export const WalletsPage: React.FC = () => {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  const { data, isLoading } = useAdminWallets({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search,
    sortBy: sorting[0]?.id,
    sortOrder: sorting[0]?.desc ? 'desc' : 'asc'
  });

  const columns = [
    {
      header: 'Transaction ID',
      accessorKey: 'transactionId',
      cell: (info: any) => {
        const id = info.getValue() as string;
        return (
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold">{id.slice(0, 8)}...</span>
          </div>
        );
      }
    },
    {
      header: 'User',
      accessorKey: 'user',
      cell: (info: any) => {
        const user = info.getValue() as string;
        return <span className="text-text-secondary text-sm">{user.length > 15 ? user.slice(0, 8) + '...' : user}</span>;
      }
    },
    {
      header: 'Wallet Type',
      accessorKey: 'walletType',
      cell: (info: any) => (
        <span className="px-2 py-1 text-xs font-semibold rounded-md bg-surface border border-border">
          {info.getValue()}
        </span>
      )
    },
    {
      header: 'Type',
      accessorKey: 'type',
      cell: (info: any) => {
        const val = info.getValue();
        return (
          <span className={`px-2 py-1 text-[10px] uppercase font-black tracking-wider rounded-full ${val === 'CREDIT' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
            {val}
          </span>
        );
      }
    },
    {
      header: 'Amount',
      accessorKey: 'amount',
      cell: (info: any) => {
        const type = info.row.original.type;
        const amount = info.getValue();
        return (
          <span className={`font-bold ${type === 'CREDIT' ? 'text-success' : 'text-danger'}`}>
            {type === 'CREDIT' ? '+' : '-'}₹{amount.toLocaleString()}
          </span>
        );
      }
    },
    {
      header: 'Balance',
      accessorKey: 'balanceAfter',
      cell: (info: any) => <span className="font-bold text-text-primary">₹{info.getValue().toLocaleString()}</span>
    },
    {
      header: 'Source',
      accessorKey: 'source',
      cell: (info: any) => <span className="text-sm text-text-secondary capitalize">{info.getValue().replace('_', ' ')}</span>
    },
    {
      header: 'Date',
      accessorKey: 'date',
      cell: (info: any) => (
        <span className="text-sm text-text-secondary">
          {new Date(info.getValue()).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      )
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: (info: any) => (
        <Button 
          size="sm" 
          onClick={() => setSelectedTransaction(info.row.original)}
          className="h-8 text-xs bg-primary text-white hover:bg-primary/90 rounded-md"
        >
          View Details
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* View Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-surface/50">
              <h3 className="text-lg font-bold text-text-primary">Transaction Details</h3>
              <button 
                onClick={() => setSelectedTransaction(null)}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-text-secondary uppercase mb-1">Transaction ID</p>
                  <p className="font-mono text-sm">{selectedTransaction.transactionId}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-text-secondary uppercase mb-1">Date</p>
                  <p className="text-sm">
                    {new Date(selectedTransaction.date).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-surface border border-border flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-text-secondary uppercase mb-1">Amount</p>
                  <p className={`text-2xl font-black ${selectedTransaction.type === 'CREDIT' ? 'text-success' : 'text-danger'}`}>
                    {selectedTransaction.type === 'CREDIT' ? '+' : '-'}₹{selectedTransaction.amount.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-text-secondary uppercase mb-1">Type</p>
                  <span className={`px-3 py-1 text-xs uppercase font-black tracking-wider rounded-full ${selectedTransaction.type === 'CREDIT' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                    {selectedTransaction.type}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-text-secondary uppercase mb-1">User ID</p>
                  <p className="text-sm font-mono">{selectedTransaction.user}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-text-secondary uppercase mb-1">Wallet Type</p>
                  <p className="text-sm">{selectedTransaction.walletType}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-text-secondary uppercase mb-1">Source</p>
                  <p className="text-sm capitalize">{selectedTransaction.source?.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-text-secondary uppercase mb-1">Balance After</p>
                  <p className="text-sm font-bold">₹{selectedTransaction.balanceAfter?.toLocaleString()}</p>
                </div>
              </div>

              {selectedTransaction.description && (
                <div className="pt-4 border-t border-border">
                  <p className="text-xs font-bold text-text-secondary uppercase mb-1">Description</p>
                  <p className="text-sm">{selectedTransaction.description}</p>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-border bg-surface/50 flex justify-end">
              <Button onClick={() => setSelectedTransaction(null)} variant="outline">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
            Wallet Management <span className="text-text-secondary text-lg font-medium">({data?.meta?.total || 0})</span>
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Monitor and manage customer, seller, and delivery partner wallets across the platform.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-surface border-border hover:bg-white/5 font-semibold">
            Export Transactions
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Total Balance" value={`₹${(data?.kpis?.totalBalance || 0).toLocaleString()}`} loading={isLoading} />
        <KPICard title="Credits" value={`₹${(data?.kpis?.credits || 0).toLocaleString()}`} loading={isLoading} className="border-success/20" />
        <KPICard title="Debits" value={`₹${(data?.kpis?.debits || 0).toLocaleString()}`} loading={isLoading} className="border-danger/20" />
        <KPICard title="Frozen Balance" value={`₹${(data?.kpis?.frozenBalance || 0).toLocaleString()}`} loading={isLoading} className="border-brand-primary/20" />
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
    </div>
  );
};
export default WalletsPage;
