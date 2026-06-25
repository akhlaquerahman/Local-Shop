import React, { useState } from 'react';
import { useAdminCommissionDashboard } from '../services/admin.queries';
import { KPICard } from '@/components/ui/KPI';
import { Button } from '@/components/ui/Button';
import { GlobalRulesTab } from '../components/commissions/GlobalRulesTab';
import { CategoryRulesTab } from '../components/commissions/CategoryRulesTab';
import { SellerOverridesTab } from '../components/commissions/SellerOverridesTab';
import { DeliveryRulesTab } from '../components/commissions/DeliveryRulesTab';
import { PromotionalRulesTab } from '../components/commissions/PromotionalRulesTab';
import { CommissionSimulatorTab } from '../components/commissions/CommissionSimulatorTab';
import { CommissionHistoryTab } from '../components/commissions/CommissionHistoryTab';
import { CommissionAuditTab } from '../components/commissions/CommissionAuditTab';

export const CommissionsPage: React.FC = () => {
  const { data, isLoading } = useAdminCommissionDashboard();
  const [activeTab, setActiveTab] = useState('global');

  const tabs = [
    { id: 'global', label: 'Global Rules' },
    { id: 'categories', label: 'Category Rules' },
    { id: 'sellers', label: 'Seller Overrides' },
    { id: 'delivery', label: 'Delivery Rules' },
    { id: 'promotions', label: 'Promotions' },
    { id: 'simulator', label: 'Simulator' },
    { id: 'history', label: 'History' },
    { id: 'audit', label: 'Audit Logs' }
  ];

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
            Revenue & Commission Management
          </h1>
          <p className="text-sm text-text-secondary">
            Manage marketplace revenue rules, commissions, fees, overrides and settlement calculations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-primary text-white hover:bg-primary/90">
            Export Commission Report
          </Button>
        </div>
      </div>

      {/* KPI DASHBOARD */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Commission Earned" value={`₹${(data?.kpis?.totalCommissionEarned || 0).toLocaleString()}`} loading={isLoading} className="border-primary/30 bg-primary/5" />
        <KPICard title="Today's Commission" value={`₹${(data?.kpis?.todayCommission || 0).toLocaleString()}`} loading={isLoading} />
        <KPICard title="Average Commission Rate" value={`${data?.kpis?.averageCommissionRate || 0}%`} loading={isLoading} />
        <KPICard title="Revenue Forecast" value={`₹${(data?.kpis?.revenueForecast || 0).toLocaleString()}`} loading={isLoading} className="border-success/30 bg-success/5" />
      </div>

      <div className="w-full space-y-6">
        <div className="flex overflow-x-auto border-b border-border bg-surface rounded-t-xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab.id 
                  ? 'border-b-2 border-primary text-primary' 
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="bg-surface border border-t-0 border-border rounded-b-xl p-6 mt-0">
          {activeTab === 'global' && <GlobalRulesTab />}
          {activeTab === 'categories' && <CategoryRulesTab />}
          {activeTab === 'sellers' && <SellerOverridesTab />}
          {activeTab === 'delivery' && <DeliveryRulesTab />}
          {activeTab === 'promotions' && <PromotionalRulesTab />}
          {activeTab === 'simulator' && <CommissionSimulatorTab />}
          {activeTab === 'history' && <CommissionHistoryTab />}
          {activeTab === 'audit' && <CommissionAuditTab />}
        </div>
      </div>
    </div>
  );
};

export default CommissionsPage;
