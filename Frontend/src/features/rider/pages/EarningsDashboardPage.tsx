import React from 'react';
import { useRiderEarnings, useRiderPayouts } from '../services/rider.queries';
import { IndianRupee, TrendingUp, Download, Loader2, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const EarningsDashboardPage: React.FC = () => {
  const { data: earningsData, isLoading: eLoading } = useRiderEarnings();
  const { data: payouts, isLoading: pLoading } = useRiderPayouts();

  const stats = earningsData?.breakdown || { base: 0, distance: 0, tips: 0, penalties: 0 };
  const total = earningsData?.totalEarnings || 0;
  const payoutList = payouts || [];

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Earnings Dashboard</h1>
          <p className="text-sm text-text-secondary">Track your daily income and payouts</p>
        </div>
        <Button variant="primary" icon={<Wallet size={16}/>}>Request Payout</Button>
      </div>

      {/* KPI ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-primary to-accent text-white p-5 rounded-xl shadow-enterprise-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-white/80">Lifetime Earnings</div>
          <div className="text-3xl font-black mt-2">₹{total}</div>
          <div className="mt-4 text-xs font-medium flex items-center gap-1 text-white/90">
            <ArrowUpRight size={14}/> +12% from last month
          </div>
        </div>
        
        <div className="bg-surface border border-border p-5 rounded-xl">
          <div className="text-[10px] font-bold uppercase text-text-secondary tracking-wider">Today's Earnings</div>
          <div className="text-2xl font-black mt-2 text-text-primary">₹0</div>
          <div className="mt-4 text-xs font-medium flex items-center gap-1 text-success">
            <ArrowUpRight size={14}/> +₹0 today
          </div>
        </div>

        <div className="bg-surface border border-border p-5 rounded-xl">
          <div className="text-[10px] font-bold uppercase text-text-secondary tracking-wider">Pending Payout</div>
          <div className="text-2xl font-black mt-2 text-amber-500">₹{total}</div>
          <div className="mt-4 text-xs font-medium text-text-secondary">Ready to withdraw</div>
        </div>

        <div className="bg-surface border border-border p-5 rounded-xl">
          <div className="text-[10px] font-bold uppercase text-text-secondary tracking-wider">Tips Received</div>
          <div className="text-2xl font-black mt-2 text-text-primary">₹{stats.tips}</div>
          <div className="mt-4 text-xs font-medium text-text-secondary">Lifetime tips</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Earnings Breakdown */}
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm col-span-1">
          <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2"><IndianRupee size={16}/> Earnings Breakdown</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <span className="text-sm text-text-secondary">Base Delivery Fee</span>
              <span className="font-bold text-text-primary">₹{stats.base || total}</span>
            </div>
            <div className="flex justify-between items-center border-b border-border pb-3">
              <span className="text-sm text-text-secondary">Distance Pay</span>
              <span className="font-bold text-text-primary">₹{stats.distance}</span>
            </div>
            <div className="flex justify-between items-center border-b border-border pb-3">
              <span className="text-sm text-text-secondary">Customer Tips</span>
              <span className="font-bold text-success">+ ₹{stats.tips}</span>
            </div>
            <div className="flex justify-between items-center pb-1">
              <span className="text-sm text-text-secondary">Penalties</span>
              <span className="font-bold text-error">- ₹{stats.penalties}</span>
            </div>
            <div className="pt-4 mt-2 border-t border-border flex justify-between items-center">
              <span className="font-bold uppercase text-xs tracking-wider text-text-primary">Total Generated</span>
              <span className="font-black text-xl text-primary">₹{total}</span>
            </div>
          </div>
        </div>

        {/* Payout History Table */}
        <div className="bg-surface border border-border rounded-xl shadow-sm col-span-1 lg:col-span-2 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-border flex justify-between items-center">
            <h3 className="font-bold text-text-primary">Payout History</h3>
            <Button size="sm" variant="outline" icon={<Download size={14}/>}>Statement</Button>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="bg-background text-text-secondary uppercase text-[10px] font-bold border-b border-border">
                <tr>
                  <th className="px-6 py-4">Ref ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pLoading ? (
                   <tr><td colSpan={4} className="px-6 py-12 text-center"><Loader2 className="animate-spin text-accent mx-auto" size={24}/></td></tr>
                ) : payoutList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-text-secondary">
                      No payout history available.
                    </td>
                  </tr>
                ) : (
                  payoutList.map((p: any) => (
                    <tr key={p._id} className="hover:bg-background/50">
                      <td className="px-6 py-4 font-mono font-bold text-text-primary text-xs">{p._id.substring(0,8)}</td>
                      <td className="px-6 py-4 text-text-secondary text-xs">{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                          ${p.status === 'SETTLED' ? 'bg-success/10 text-success' : 
                            p.status === 'FAILED' ? 'bg-error/10 text-error' : 
                            'bg-amber-500/10 text-amber-500'}`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-text-primary">₹{p.amount}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
export default EarningsDashboardPage;
