import React, { useState } from 'react';
import { useAdminBannersList, useToggleBannerStatus, useDeleteBanner } from '../services/admin.queries';
import { Button } from '@/components/ui/Button';
import { KPICard } from '@/components/ui/KPI';
import { BannerFormModal } from '../components/banners/BannerFormModal';

export const BannersPage: React.FC = () => {
  const { data, isLoading } = useAdminBannersList();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);

  const toggleMutation = useToggleBannerStatus();
  const deleteMutation = useDeleteBanner();

  const handleCreateNew = () => {
    setEditingBannerId(null);
    setIsModalOpen(true);
  };

  const handleEdit = (id: string) => {
    setEditingBannerId(id);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this banner?')) {
      deleteMutation.mutate(id);
    }
  };

  const banners = data?.data || [];
  const stats = data?.stats || { total: 0, active: 0, hero: 0 };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
            Banners Configuration
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Manage homepage hero sliders and promotional graphics
          </p>
        </div>
        <Button onClick={handleCreateNew} className="bg-primary text-white font-bold">
          + Create New Banner
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard title="Total Banners" value={stats.total} loading={isLoading} />
        <KPICard title="Active Promos" value={stats.active} loading={isLoading} className="border-success/30 bg-success/5 text-success" />
        <KPICard title="Hero Sliders" value={stats.hero} loading={isLoading} />
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12 text-text-secondary">Loading Banners...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {banners.map((banner: any) => (
            <div key={banner._id} className={`bg-surface border rounded-xl overflow-hidden shadow-sm transition-all ${banner.isActive ? 'border-border' : 'border-border/50 opacity-70'}`}>
              <div className="relative h-40 bg-background flex items-center justify-center overflow-hidden">
                {banner.desktopImage ? (
                  <img src={banner.desktopImage} alt={banner.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-text-secondary">No Image</span>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded shadow ${banner.isActive ? 'bg-success text-white' : 'bg-background text-text-secondary'}`}>
                    {banner.isActive ? 'Active' : 'Draft'}
                  </span>
                </div>
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-1 text-[10px] font-bold uppercase rounded shadow bg-primary text-white">
                    {banner.position.replace('_', ' ')}
                  </span>
                </div>
              </div>
              
              <div className="p-4 space-y-4">
                <div>
                  <h3 className="font-bold text-text-primary truncate">{banner.title}</h3>
                  <p className="text-xs text-text-secondary mt-1 truncate">Links to: {banner.linkType} ({banner.linkTarget || 'None'})</p>
                </div>
                
                <div className="flex justify-between items-center text-xs text-text-secondary border-t border-border pt-4">
                  <span>Sort Order: {banner.sortOrder}</span>
                  <div className="flex gap-3">
                    <button onClick={() => handleEdit(banner._id)} className="hover:text-primary transition-colors font-medium">Edit</button>
                    <button 
                      onClick={() => toggleMutation.mutate(banner._id)} 
                      className={`font-medium transition-colors ${banner.isActive ? 'text-warning hover:text-warning/80' : 'text-success hover:text-success/80'}`}
                      disabled={toggleMutation.isPending}
                    >
                      {banner.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => handleDelete(banner._id)} className="hover:text-danger transition-colors font-medium text-danger">Delete</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {banners.length === 0 && (
            <div className="col-span-full text-center p-12 bg-surface rounded-xl border border-border border-dashed">
              <p className="text-text-secondary">No banners found. Create one to get started.</p>
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <BannerFormModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          bannerId={editingBannerId}
        />
      )}
    </div>
  );
};

export default BannersPage;
