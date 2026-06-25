import React, { useState } from 'react';
import {
  Wallet, ArrowUpRight, ArrowDownRight, RefreshCw,
  Plus, History, Filter, AlertCircle, HelpCircle, IndianRupee,
  Search, Download
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNotificationStore } from '@/store/notificationStore';
import { trackAnalyticsEvent } from '@/utils/analytics';
import { useWallet, useWalletStats, useTransactions, useTopupWallet } from '@/hooks/queries';

export const WalletPage: React.FC = () => {
  const { addToast } = useNotificationStore();
  const [filter, setFilter] = useState<'all' | 'credit' | 'debit' | 'refund'>('all');
  const [search, setSearch] = useState('');
  const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');

  const { data: walletData, isLoading: isWalletLoading } = useWallet();
  const { data: statsData, isLoading: isStatsLoading } = useWalletStats();
  const { data: transactions, isLoading: isTxnLoading } = useTransactions(filter);
  const topupMutation = useTopupWallet();

  const handleTopup = async () => {
    const amount = parseInt(topupAmount);
    if (!amount || amount < 100) {
      addToast({ title: 'Invalid Amount', message: 'Minimum topup is ₹100', type: 'error' });
      return;
    }
    trackAnalyticsEvent('WALLET_TOPUP_INITIATED', { amount });
    
    try {
      await topupMutation.mutateAsync(amount);
      addToast({ title: 'Topup Successful', message: `Added ₹${amount} to your wallet.`, type: 'success' });
      setIsTopupModalOpen(false);
      setTopupAmount('');
    } catch (error: any) {
      addToast({ title: 'Topup Failed', message: error.message || 'Something went wrong', type: 'error' });
    }
  };

  const filteredTxns = transactions?.filter((t: any) => 
    t.description.toLowerCase().includes(search.toLowerCase()) || 
    (t.referenceId && t.referenceId.toLowerCase().includes(search.toLowerCase()))
  ) || [];

  const getIcon = (type: string) => {
    switch (type) {
      case 'credit': return <ArrowDownRight size={18} className="text-success" />;
      case 'debit': return <ArrowUpRight size={18} className="text-danger" />;
      case 'refund': return <RefreshCw size={18} className="text-accent" />;
      default: return <History size={18} />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'credit': return 'text-success';
      case 'debit': return 'text-text-primary';
      case 'refund': return 'text-accent';
      default: return 'text-text-primary';
    }
  };

  const isLoading = isWalletLoading || isStatsLoading || isTxnLoading;

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight flex items-center gap-3">
            <Wallet size={28} className="text-accent" /> My Wallet
          </h1>
          <p className="text-sm text-text-secondary mt-1">Manage your balance and view transaction history</p>
        </div>
        <Button onClick={() => setIsTopupModalOpen(true)} className="bg-accent text-white shadow-sm flex items-center gap-2">
          <Plus size={16} /> Add Money
        </Button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Available Balance</span>
            <Wallet size={18} className="text-accent" />
          </div>
          {isLoading ? <div className="h-8 w-24 bg-border animate-pulse rounded" /> : (
            <div className="text-2xl font-black text-text-primary">₹{statsData?.balance || 0}</div>
          )}
        </div>

        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Lifetime Cashback</span>
            <IndianRupee size={18} className="text-success" />
          </div>
          {isLoading ? <div className="h-8 w-24 bg-border animate-pulse rounded" /> : (
            <div className="text-2xl font-black text-text-primary">₹{statsData?.lifetimeCashback || 0}</div>
          )}
        </div>

        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Pending Cashback</span>
            <RefreshCw size={18} className="text-warning" />
          </div>
          {isLoading ? <div className="h-8 w-24 bg-border animate-pulse rounded" /> : (
            <div className="text-2xl font-black text-text-primary">₹{statsData?.pendingCashback || 0}</div>
          )}
        </div>

        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Total Transactions</span>
            <History size={18} className="text-text-secondary" />
          </div>
          {isLoading ? <div className="h-8 w-24 bg-border animate-pulse rounded" /> : (
            <div className="text-2xl font-black text-text-primary">{statsData?.totalTransactions || 0}</div>
          )}
        </div>
      </div>

      {/* Transactions Table Section */}
      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-background">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input 
              type="text" 
              placeholder="Search descriptions or ref..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-lg text-sm focus:border-accent focus:outline-none transition-colors"
            />
          </div>
          
          <div className="flex items-center gap-3 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <div className="flex bg-surface border border-border rounded-lg p-1">
              {(['all', 'credit', 'debit', 'refund'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-colors ${
                    filter === f ? 'bg-accent text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" className="flex items-center gap-2 flex-shrink-0" title="Export CSV">
              <Download size={14} /> Export
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background border-b border-border text-xs font-bold text-text-secondary uppercase tracking-wider">
                <th className="p-4 whitespace-nowrap">Date</th>
                <th className="p-4 whitespace-nowrap">Transaction ID</th>
                <th className="p-4 whitespace-nowrap">Description</th>
                <th className="p-4 whitespace-nowrap text-right">Amount</th>
                <th className="p-4 whitespace-nowrap text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                // Loading State
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4"><div className="h-4 w-24 bg-border rounded" /></td>
                    <td className="p-4"><div className="h-4 w-24 bg-border rounded" /></td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-border" />
                        <div className="h-4 w-40 bg-border rounded" />
                      </div>
                    </td>
                    <td className="p-4"><div className="h-4 w-16 bg-border rounded ml-auto" /></td>
                    <td className="p-4"><div className="h-5 w-20 bg-border rounded-full mx-auto" /></td>
                  </tr>
                ))
              ) : filteredTxns.length > 0 ? (
                filteredTxns.map((txn: any) => (
                  <tr key={txn.id || txn.transactionId} className="hover:bg-background/50 transition-colors group">
                    <td className="p-4 text-xs text-text-secondary whitespace-nowrap">
                      {new Date(txn.createdAt || txn.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-4 text-xs font-medium text-text-secondary font-mono">
                      {txn.transactionId}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-surface border border-border group-hover:bg-background transition-colors`}>
                          {getIcon(txn.type)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-text-primary">{txn.description}</p>
                          {txn.referenceId && (
                            <p className="text-[10px] text-text-secondary mt-0.5">Ref: {txn.referenceId}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <span className={`text-sm font-extrabold ${getColor(txn.type)}`}>
                        {txn.type === 'debit' ? '-' : '+'}₹{txn.amount}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                        ${txn.status === 'completed' ? 'bg-success/10 text-success' : 
                          txn.status === 'failed' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'}`}
                      >
                        {txn.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <Filter size={32} className="mx-auto text-text-secondary/30 mb-3" />
                    <p className="text-sm font-bold text-text-primary">No transactions found</p>
                    <p className="text-xs text-text-secondary mt-1">Try adjusting your filters or search query.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Dummy */}
        {!isLoading && filteredTxns.length > 0 && (
          <div className="p-4 border-t border-border flex items-center justify-between text-xs text-text-secondary bg-background">
            <span>Showing 1 to {filteredTxns.length} of {filteredTxns.length} entries</span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled>Prev</Button>
              <Button variant="outline" size="sm" disabled>Next</Button>
            </div>
          </div>
        )}
      </div>

      {/* Topup Modal */}
      {isTopupModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl w-full max-w-sm shadow-enterprise-xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border flex justify-between items-center bg-background">
              <h3 className="font-bold text-text-primary">Add Money to Wallet</h3>
              <button onClick={() => setIsTopupModalOpen(false)} className="text-text-secondary hover:text-danger"><Plus size={20} className="rotate-45" /></button>
            </div>
            <div className="p-5 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Amount (₹)</label>
                <input
                  type="number"
                  value={topupAmount}
                  onChange={e => setTopupAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-lg font-bold focus:outline-none focus:border-accent transition-colors"
                  autoFocus
                />
                <div className="flex gap-2">
                  {[100, 500, 1000].map(amt => (
                    <button
                      key={amt}
                      onClick={() => setTopupAmount(amt.toString())}
                      className="flex-1 py-1.5 border border-border rounded-lg text-xs font-semibold hover:border-accent hover:text-accent transition-colors bg-background"
                    >
                      +₹{amt}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-accent/5 border border-accent/20 rounded-lg p-3 flex gap-3 items-start">
                <HelpCircle size={16} className="text-accent flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-text-secondary leading-relaxed font-medium">Wallet balance never expires and can be used for any purchase on LocalShop with 1-click checkout.</p>
              </div>
              <Button 
                onClick={handleTopup} 
                className="w-full justify-center" 
                disabled={topupMutation.isPending}
              >
                {topupMutation.isPending ? 'Processing...' : 'Proceed to Pay'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletPage;
