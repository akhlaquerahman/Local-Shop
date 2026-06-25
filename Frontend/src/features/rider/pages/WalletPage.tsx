import React from 'react';
import { Wallet, ArrowUpRight, ArrowDownRight, Clock, Download, Plus, Loader2 } from 'lucide-react';
import { useRiderWallet } from '../services/rider.queries';
import { Button } from '@/components/ui/Button';

export const WalletPage: React.FC = () => {
  const { data, isLoading } = useRiderWallet();

  const balance = data?.wallet?.balance || 0;
  const lifetime = data?.wallet?.lifetimeCashback || 0;
  const transactions = data?.transactions || [];

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Wallet & Payouts</h1>
          <p className="text-sm text-text-secondary">Manage your earnings and withdraw funds</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon={<Download size={14}/>}>Statement</Button>
          <Button variant="primary" icon={<Plus size={14}/>}>Withdraw</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-primary to-accent text-white rounded-xl p-6 shadow-enterprise-md relative overflow-hidden md:col-span-1">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-white/80">Available Balance</h3>
          <p className="text-4xl font-black mt-2">₹{balance}</p>
          <div className="mt-6 flex justify-between items-center text-xs font-medium text-white/90">
            <span>Lifetime Earned</span>
            <span className="font-bold">₹{lifetime}</span>
          </div>
        </div>

        <div className="md:col-span-2 bg-surface border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h3 className="font-bold text-text-primary">Recent Transactions</h3>
            <span className="text-xs text-primary font-bold cursor-pointer hover:underline">View All</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
               <div className="flex justify-center items-center h-40"><Loader2 className="animate-spin text-accent" size={32}/></div>
            ) : transactions.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-40 text-text-secondary">
                 <Wallet size={32} className="opacity-50 mb-2"/>
                 <p className="text-sm">No transactions yet</p>
               </div>
            ) : (
              <div className="divide-y divide-border">
                {transactions.map((tx: any) => (
                  <div key={tx._id} className="p-4 flex justify-between items-center hover:bg-background/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${tx.type === 'credit' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                        {tx.type === 'credit' ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-text-primary">{tx.description}</p>
                        <p className="text-xs text-text-secondary flex items-center gap-1"><Clock size={10}/> {new Date(tx.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className={`font-black text-right ${tx.type === 'credit' ? 'text-success' : 'text-text-primary'}`}>
                      {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default WalletPage;
