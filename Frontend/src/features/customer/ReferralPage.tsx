import React, { useState } from 'react';
import { Share2, Copy, Users, CheckCircle2, IndianRupee, Search, Gift, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNotificationStore } from '@/store/notificationStore';
import { trackAnalyticsEvent } from '@/utils/analytics';
import { useReferrals, useReferralStats } from '@/hooks/queries';

export const ReferralPage: React.FC = () => {
  const { addToast } = useNotificationStore();
  const [search, setSearch] = useState('');

  const { data: referrals, isLoading: isReferralsLoading } = useReferrals();
  const { data: stats, isLoading: isStatsLoading } = useReferralStats();

  const handleCopyCode = () => {
    if (!stats?.referralCode) return;
    navigator.clipboard.writeText(stats.referralCode);
    addToast({ title: 'Code Copied', message: 'Referral code copied to clipboard!', type: 'success' });
    trackAnalyticsEvent('REFERRAL_CODE_COPIED', { code: stats.referralCode });
  };

  const handleShare = () => {
    if (navigator.share && stats?.referralCode) {
      navigator.share({
        title: 'Join Local Shop',
        text: `Use my referral code ${stats.referralCode} to get ₹50 off on your first order!`,
        url: window.location.origin
      }).catch(console.error);
    } else {
      handleCopyCode();
    }
  };

  const filteredReferrals = referrals?.filter((r: any) => 
    r.referredEmail.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const isLoading = isReferralsLoading || isStatsLoading;

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight flex items-center gap-3">
            <Users size={28} className="text-accent" /> Refer & Earn
          </h1>
          <p className="text-sm text-text-secondary mt-1">Invite friends and earn cashback on their first order</p>
        </div>
      </div>

      {/* Hero / Action Row */}
      <div className="bg-gradient-to-br from-accent/90 to-accent rounded-xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-8 translate-x-8" />
        <div className="relative z-10 space-y-2 max-w-md">
          <h2 className="text-lg font-bold">Earn ₹50 for every friend!</h2>
          <p className="text-sm text-white/80 leading-relaxed">
            Share your unique code. When they place their first order, you both get ₹50 added to your Wallet instantly.
          </p>
        </div>
        
        <div className="relative z-10 bg-white p-2 pl-4 rounded-xl flex items-center gap-3 shadow-md w-full md:w-auto">
          <div className="flex-1 text-center md:text-left">
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block mb-0.5">Your Code</span>
            <span className="text-xl font-black text-text-primary font-mono tracking-widest">
              {isLoading ? '...' : stats?.referralCode || 'N/A'}
            </span>
          </div>
          <div className="flex gap-2 border-l border-border pl-3">
            <Button 
              onClick={handleCopyCode} 
              variant="outline" 
              className="border-border text-text-primary hover:bg-surface hover:text-accent h-10 px-3"
              disabled={isLoading || !stats?.referralCode}
            >
              <Copy size={16} />
            </Button>
            <Button 
              onClick={handleShare} 
              className="bg-accent text-white hover:bg-accent/90 h-10 px-4"
              disabled={isLoading || !stats?.referralCode}
            >
              <Share2 size={16} className="mr-2" /> Share
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Successful</span>
            <CheckCircle2 size={18} className="text-success" />
          </div>
          {isLoading ? <div className="h-8 w-16 bg-border animate-pulse rounded" /> : (
            <div className="text-2xl font-black text-text-primary">{stats?.successfulReferrals || 0}</div>
          )}
        </div>

        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Pending</span>
            <Clock size={18} className="text-warning" />
          </div>
          {isLoading ? <div className="h-8 w-16 bg-border animate-pulse rounded" /> : (
            <div className="text-2xl font-black text-text-primary">{stats?.pendingReferrals || 0}</div>
          )}
        </div>

        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Rewards Earned</span>
            <Gift size={18} className="text-accent" />
          </div>
          {isLoading ? <div className="h-8 w-24 bg-border animate-pulse rounded" /> : (
            <div className="text-2xl font-black text-text-primary">₹{stats?.totalRewardsEarned || 0}</div>
          )}
        </div>

        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Lifetime Rewards</span>
            <IndianRupee size={18} className="text-text-primary" />
          </div>
          {isLoading ? <div className="h-8 w-24 bg-border animate-pulse rounded" /> : (
            <div className="text-2xl font-black text-text-primary">₹{stats?.lifetimeRewards || 0}</div>
          )}
        </div>
      </div>

      {/* Referrals Table Section */}
      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-background">
          <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
            <Users size={18} className="text-text-secondary" /> My Referrals
          </h2>
          <div className="relative w-full md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input 
              type="text" 
              placeholder="Search by email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-lg text-sm focus:border-accent focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background border-b border-border text-xs font-bold text-text-secondary uppercase tracking-wider">
                <th className="p-4 whitespace-nowrap">Friend</th>
                <th className="p-4 whitespace-nowrap">Date Joined</th>
                <th className="p-4 whitespace-nowrap">Status</th>
                <th className="p-4 whitespace-nowrap text-right">Reward</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                // Loading State
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4"><div className="h-4 w-40 bg-border rounded" /></td>
                    <td className="p-4"><div className="h-4 w-24 bg-border rounded" /></td>
                    <td className="p-4"><div className="h-5 w-20 bg-border rounded-full" /></td>
                    <td className="p-4"><div className="h-4 w-16 bg-border rounded ml-auto" /></td>
                  </tr>
                ))
              ) : filteredReferrals.length > 0 ? (
                filteredReferrals.map((ref: any) => (
                  <tr key={ref._id} className="hover:bg-background/50 transition-colors group">
                    <td className="p-4">
                      <p className="text-sm font-bold text-text-primary">{ref.referredEmail}</p>
                    </td>
                    <td className="p-4 text-xs text-text-secondary whitespace-nowrap">
                      {new Date(ref.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                        ${ref.status === 'completed' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}
                      >
                        {ref.status === 'completed' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                        {ref.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {ref.status === 'completed' ? (
                        <span className="text-sm font-extrabold text-success">+₹{ref.rewardAmount}</span>
                      ) : (
                        <span className="text-sm font-medium text-text-secondary">-</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-12 text-center">
                    <Users size={32} className="mx-auto text-text-secondary/30 mb-3" />
                    <p className="text-sm font-bold text-text-primary">No referrals found</p>
                    <p className="text-xs text-text-secondary mt-1">Start sharing your code to earn rewards!</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Dummy */}
        {!isLoading && filteredReferrals.length > 0 && (
          <div className="p-4 border-t border-border flex items-center justify-between text-xs text-text-secondary bg-background">
            <span>Showing 1 to {filteredReferrals.length} of {filteredReferrals.length} entries</span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled>Prev</Button>
              <Button variant="outline" size="sm" disabled>Next</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferralPage;
