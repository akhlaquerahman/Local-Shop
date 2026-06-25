import React, { useState } from 'react';
import { useAdminDisputeDashboard } from '../services/admin.queries';
import { KPICard } from '@/components/ui/KPI';
import { DisputeDataTable } from '../components/disputes/DisputeDataTable';

export const DisputesPage: React.FC = () => {
  const { data, isLoading } = useAdminDisputeDashboard();
  const [activeTab, setActiveTab] = useState(''); // Empty string means ALL

  const tabs = [
    { id: '', label: 'All Disputes' },
    { id: 'OPEN', label: 'Open' },
    { id: 'IN_REVIEW', label: 'In Review' },
    { id: 'ESCALATED', label: 'Escalated' },
    { id: 'RESOLVED', label: 'Resolved' },
    { id: 'DISMISSED', label: 'Dismissed' }
  ];

  return (
    <div className="space-y-6 max-w-full overflow-hidden pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
            Disputes Center
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Investigate and resolve escalated customer-merchant conflicts.
          </p>
        </div>
      </div>

      {/* KPI DASHBOARD */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Total Open" value={(data?.kpis?.openDisputes || 0).toLocaleString()} loading={isLoading} className="border-primary/30 bg-primary/5" />
        <KPICard title="In Review" value={(data?.kpis?.inReviewDisputes || 0).toLocaleString()} loading={isLoading} className="text-warning" />
        <KPICard title="Escalated" value={(data?.kpis?.escalatedDisputes || 0).toLocaleString()} loading={isLoading} className="text-danger" />
        <KPICard title="Resolved / Dismissed" value={(data?.kpis?.resolvedDisputes || 0).toLocaleString()} loading={isLoading} className="border-success/30 bg-success/5" />
      </div>

      {/* TABS */}
      <div className="flex overflow-x-auto border-b border-border mt-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-bold whitespace-nowrap transition-colors ${
              activeTab === tab.id 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <DisputeDataTable activeTab={activeTab} />
      </div>
    </div>
  );
};
export default DisputesPage;
