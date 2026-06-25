import React from 'react';
import { Megaphone, Mail, MessageSquare, Ticket, Image as ImageIcon, Users, RefreshCw } from 'lucide-react';
import { KPICard } from '@/components/ui/KPI';
import { Button } from '@/components/ui/Button';
import { useMarketingOverview, useMarketingActivity } from '../services/seller.queries';
import { useNavigate } from 'react-router-dom';

const MarketingModule = ({ title, description, icon, actionText, onClick }: any) => (
  <div className="bg-surface border border-border p-6 rounded-xl flex items-start gap-4 hover:border-primary/50 transition-colors">
    <div className="p-3 bg-primary/10 text-primary rounded-lg">
      {icon}
    </div>
    <div className="flex-1">
      <h3 className="font-bold text-text-primary mb-1">{title}</h3>
      <p className="text-sm text-text-secondary mb-4">{description}</p>
      <Button variant="outline" size="sm" onClick={onClick}>{actionText}</Button>
    </div>
  </div>
);

const MarketingPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useMarketingOverview();
  const { data: activities, isLoading: activitiesLoading, refetch } = useMarketingActivity();

  const modules = [
    { title: 'Campaign Builder', desc: 'Create and manage promotional campaigns', icon: <Megaphone size={24} />, action: 'Manage Campaigns', path: '/seller/promotions' },
    { title: 'Coupon Manager', desc: 'Generate discount codes and track usage', icon: <Ticket size={24} />, action: 'Manage Coupons', path: '/seller/coupons' },
    { title: 'Push Notifications', desc: 'Send direct alerts to customer devices', icon: <MessageSquare size={24} />, action: 'Send Push' },
    { title: 'Email Marketing', desc: 'Design and schedule email newsletters', icon: <Mail size={24} />, action: 'Create Email' },
    { title: 'SMS Marketing', desc: 'Send promotional SMS directly to customers', icon: <MessageSquare size={24} />, action: 'Send SMS' },
    { title: 'Banner Manager', desc: 'Update shop banners and highlighted deals', icon: <ImageIcon size={24} />, action: 'Manage Banners' },
    { title: 'Referral Campaigns', desc: 'Set up customer referral rewards', icon: <Users size={24} />, action: 'Setup Referrals' },
  ];

  return (
    <div className="space-y-6 text-left max-w-[1440px] mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Marketing Tools</h1>
          <p className="text-sm text-text-secondary">Grow your business with powerful marketing integrations</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2"><RefreshCw size={14} /> Refresh</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Active Campaigns" value={stats?.activeCampaigns || 0} loading={statsLoading} className="border-success/20" />
        <KPICard title="Scheduled Campaigns" value={stats?.scheduledCampaigns || 0} loading={statsLoading} />
        <KPICard title="Messages Sent" value={stats?.totalReach || 0} loading={statsLoading} />
        <KPICard title="Revenue Generated" value={`₹${stats?.revenueGenerated || 0}`} loading={statsLoading} className="border-accent/20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2">
          <h2 className="text-lg font-bold text-text-primary mb-4">Marketing Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modules.map((m, idx) => (
              <MarketingModule 
                key={idx} 
                title={m.title} 
                description={m.desc} 
                icon={m.icon} 
                actionText={m.action} 
                onClick={() => m.path ? navigate(m.path) : alert('Module coming soon!')}
              />
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-text-primary mb-4">Recent Activity</h2>
          <div className="bg-surface border border-border rounded-xl p-5">
            {activitiesLoading ? (
              <div className="space-y-4 animate-pulse">
                {[1,2,3,4].map(i => <div key={i} className="h-12 bg-background rounded-lg" />)}
              </div>
            ) : activities?.length > 0 ? (
              <div className="space-y-4">
                {activities.map((act: any) => (
                  <div key={act.id} className="flex gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-text-primary">{act.title}</p>
                      <p className="text-xs text-text-secondary mt-1">{act.description}</p>
                      <p className="text-[10px] text-text-secondary mt-1 uppercase tracking-wider">{new Date(act.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-text-secondary text-sm">
                No recent marketing activity.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingPage;
