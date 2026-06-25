import React, { useState } from 'react';
import { useAdminReviewDashboard } from '../services/admin.queries';
import { KPICard } from '@/components/ui/KPI';
import { Button } from '@/components/ui/Button';
import { ReviewAnalyticsChart } from '../components/reviews/ReviewAnalyticsChart';
import { ReviewDataTable } from '../components/reviews/ReviewDataTable';
import { ReviewFilterBar } from '../components/reviews/ReviewFilterBar';

export const AdminReviewsPage: React.FC = () => {
  const { data, isLoading } = useAdminReviewDashboard();
  const [activeTab, setActiveTab] = useState('ALL');
  const [filters, setFilters] = useState({});

  const tabs = [
    { id: 'ALL', label: 'All Reviews' },
    { id: 'PRODUCT', label: 'Product Reviews' },
    { id: 'SHOP', label: 'Shop Reviews' },
    { id: 'DELIVERY', label: 'Delivery Reviews' },
    { id: 'ANALYTICS', label: 'Analytics' }
  ];

  return (
    <div className="space-y-6 max-w-full overflow-hidden pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
            Reviews & Reputation Management
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Monitor, moderate and analyze reviews across products, shops, sellers and delivery partners.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-surface border-border font-semibold">
            Export Report
          </Button>
          <Button className="bg-primary text-white hover:bg-primary/90 font-semibold">
            Moderation Settings
          </Button>
        </div>
      </div>

      {/* KPI DASHBOARD */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KPICard title="Total Reviews" value={(data?.kpis?.totalReviews || 0).toLocaleString()} loading={isLoading} className="border-primary/30 bg-primary/5" />
        <KPICard title="Average Platform Rating" value={`${data?.kpis?.averagePlatformRating || 0}★`} loading={isLoading} className="text-warning" />
        <KPICard title="Product Reviews" value={(data?.kpis?.productReviews || 0).toLocaleString()} loading={isLoading} />
        <KPICard title="Shop Reviews" value={(data?.kpis?.shopReviews || 0).toLocaleString()} loading={isLoading} />
        <KPICard title="1-Star Reviews" value={(data?.kpis?.oneStarReviews || 0).toLocaleString()} loading={isLoading} className="text-danger" />
      </div>

      {activeTab === 'ANALYTICS' && (
        <div className="bg-surface border border-border rounded-xl p-6">
          <ReviewAnalyticsChart />
        </div>
      )}

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

      {activeTab !== 'ANALYTICS' && (
        <div className="space-y-4">
          <ReviewFilterBar onFilterChange={setFilters} />
          <ReviewDataTable activeTab={activeTab} filters={filters} />
        </div>
      )}
    </div>
  );
};
export default AdminReviewsPage;
