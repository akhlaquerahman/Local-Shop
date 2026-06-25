import React, { useState } from 'react';
import { Search, Truck, MapPin, Star, Phone, X, CheckCircle } from 'lucide-react';
import { KPICard } from '@/components/ui/KPI';
import { DataTable } from '@/components/table';
import { useRiders, useRiderStats } from '../services/seller.queries';
import { Button } from '@/components/ui/Button';

export const DeliveryPartnersPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedRider, setSelectedRider] = useState<any>(null);
  
  const { data: stats, isLoading: statsLoading } = useRiderStats();
  const { data: riders, isLoading: ridersLoading } = useRiders();

  const columns = [
    {
      header: 'Rider',
      accessorKey: 'name',
      cell: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent overflow-hidden shrink-0">
            {row.avatarUrl ? <img src={row.avatarUrl} alt={row.name} className="w-full h-full object-cover" /> : <Truck size={14} />}
          </div>
          <span className="font-bold text-text-primary text-sm">{row.name}</span>
        </div>
      )
    },
    {
      header: 'Phone',
      accessorKey: 'phone',
      cell: (row: any) => (
        <div className="flex items-center gap-2">
          <Phone size={14} className="text-text-secondary" />
          <span className="text-sm">{row.phone}</span>
        </div>
      )
    },
    {
      header: 'Zone',
      accessorKey: 'zone',
      cell: (row: any) => (
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-text-secondary" />
          <span className="text-sm">{row.zone || 'Primary Zone'}</span>
        </div>
      )
    },
    {
      header: 'Completed Orders',
      accessorKey: 'completedOrders',
      cell: (row: any) => <span className="text-sm font-medium">{row.completedOrders || 0}</span>
    },
    {
      header: 'Rating',
      accessorKey: 'rating',
      cell: (row: any) => (
        <div className="flex items-center gap-1 text-sm font-medium">
          <Star size={14} className="text-amber-500 fill-amber-500" />
          {row.rating || '4.8'}
        </div>
      )
    },
    {
      header: 'Availability',
      accessorKey: 'status',
      cell: (row: any) => (
        <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${row.status === 'ACTIVE' ? 'bg-success/10 text-success' : row.status === 'BUSY' ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'}`}>
          {row.status === 'ACTIVE' ? 'AVAILABLE' : row.status}
        </span>
      )
    },
    {
      header: 'Last Active',
      accessorKey: 'updatedAt',
      cell: (row: any) => <span className="text-xs text-text-secondary">{new Date(row.updatedAt).toLocaleDateString()}</span>
    },
    {
      header: 'Actions',
      accessorKey: 'actions',
      cell: (row: any) => (
        <Button size="sm" variant="outline" className="text-xs px-2 py-1 h-auto" onClick={() => setSelectedRider(row)}>
          View Profile
        </Button>
      )
    }
  ];

  const filteredData = riders?.filter((r: any) => r.name?.toLowerCase().includes(search.toLowerCase()) || r.phone?.includes(search)) || [];

  return (
    <div className="space-y-6 text-left max-w-[1440px] mx-auto pb-20">
      <div>
        <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Delivery Partners</h1>
        <p className="text-sm text-text-secondary">Manage your dedicated delivery fleet</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Total Riders" value={stats?.total || 0} loading={statsLoading} />
        <KPICard title="Available" value={stats?.available || 0} loading={statsLoading} className="border-success/20" />
        <KPICard title="Busy" value={stats?.busy || 0} loading={statsLoading} className="border-warning/20" />
        <KPICard title="Offline" value={stats?.offline || 0} loading={statsLoading} />
      </div>

      <div className="bg-surface border border-border rounded-xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or phone..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <DataTable 
          columns={columns} 
          data={filteredData.map((d: any) => ({ ...d, id: d._id }))} 
          isLoading={ridersLoading}
          exportFileName="delivery-partners"
        />
      </div>

      {/* RIDER PROFILE MODAL */}
      {selectedRider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-surface border border-border rounded-xl shadow-enterprise-lg p-6 relative animate-in zoom-in-95 duration-200 text-left">
            <button 
              onClick={() => setSelectedRider(null)} 
              className="absolute top-4 right-4 p-1.5 hover:bg-border rounded-lg text-text-secondary transition-colors"
            >
              <X size={18} />
            </button>
            
            <div className="flex flex-col items-center text-center pb-6 border-b border-border">
              <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center text-accent overflow-hidden mb-3 border-2 border-surface shadow-sm">
                {selectedRider.avatarUrl ? (
                  <img src={selectedRider.avatarUrl} alt={selectedRider.name} className="w-full h-full object-cover" />
                ) : (
                  <Truck size={32} />
                )}
              </div>
              <h3 className="font-extrabold text-xl text-text-primary">{selectedRider.name}</h3>
              <p className="text-sm text-text-secondary flex items-center gap-1 mt-1 justify-center">
                <MapPin size={14} /> {selectedRider.zone || 'Primary Zone'}
              </p>
              <div className="mt-3">
                <span className={`px-3 py-1 text-xs font-black rounded-full uppercase tracking-wider ${selectedRider.status === 'ACTIVE' ? 'bg-success/10 text-success border border-success/20' : selectedRider.status === 'BUSY' ? 'bg-warning/10 text-warning border border-warning/20' : 'bg-danger/10 text-danger border border-danger/20'}`}>
                  {selectedRider.status === 'ACTIVE' ? 'AVAILABLE FOR DELIVERY' : selectedRider.status}
                </span>
              </div>
            </div>

            <div className="py-4 space-y-4">
              <div className="flex items-center justify-between p-3 bg-background border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/10 text-accent rounded-md"><Phone size={16} /></div>
                  <div>
                    <p className="text-[10px] font-bold text-text-secondary uppercase">Contact Number</p>
                    <p className="text-sm font-semibold text-text-primary">{selectedRider.phone}</p>
                  </div>
                </div>
                <a href={`tel:${selectedRider.phone}`} className="text-xs font-bold text-accent hover:underline">Call</a>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-background border border-border rounded-lg text-center">
                  <p className="text-[10px] font-bold text-text-secondary uppercase mb-1">Total Deliveries</p>
                  <p className="text-xl font-black text-text-primary flex items-center justify-center gap-1">
                    <CheckCircle size={16} className="text-success" /> {selectedRider.completedOrders || 0}
                  </p>
                </div>
                <div className="p-3 bg-background border border-border rounded-lg text-center">
                  <p className="text-[10px] font-bold text-text-secondary uppercase mb-1">Customer Rating</p>
                  <p className="text-xl font-black text-text-primary flex items-center justify-center gap-1">
                    <Star size={16} className="text-amber-500 fill-amber-500" /> {selectedRider.rating || '4.8'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Button className="w-full justify-center bg-text-primary hover:bg-text-primary/90 text-surface" onClick={() => setSelectedRider(null)}>
                Close Profile
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default DeliveryPartnersPage;
