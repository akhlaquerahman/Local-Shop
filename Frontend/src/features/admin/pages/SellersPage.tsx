import React, { useState } from 'react';
import { useAdminSellers, useSuspendAdminSeller } from '../services/admin.queries';
import { AdminDataTable } from '@/components/table/AdminDataTable';
import { PaginationState, SortingState } from '@tanstack/react-table';
import { Button } from '@/components/ui/Button';
import { LayoutGrid, List, Map } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export const SellersPage: React.FC = () => {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'map'>('table');

  const { data, isLoading } = useAdminSellers({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search,
    sortBy: sorting[0]?.id,
    sortOrder: sorting[0]?.desc ? 'desc' : 'asc'
  });

  const suspendMutation = useSuspendAdminSeller();

  const columns = [
    {
      header: 'Store',
      accessorKey: 'name',
      cell: (info: any) => <span className="font-semibold text-text-primary">{info.getValue()}</span>
    },
    {
      header: 'Owner',
      accessorKey: 'owner',
    },
    {
      header: 'City',
      accessorKey: 'city',
    },
    {
      header: 'Category',
      accessorKey: 'category',
    },
    {
      header: 'Orders',
      accessorKey: 'orders',
    },
    {
      header: 'Revenue',
      accessorKey: 'revenue',
      cell: (info: any) => `₹${info.getValue().toLocaleString()}`
    },
    {
      header: 'Rating',
      accessorKey: 'rating',
      cell: (info: any) => {
        const rating = info.getValue() || 0;
        return (
          <div className="flex items-center gap-1">
            <span className="text-yellow-500 font-black">★</span>
            <span className="font-bold text-text-primary">{rating.toFixed(1)}</span>
          </div>
        );
      }
    },
    {
      header: 'Verification',
      accessorKey: 'verification',
      cell: (info: any) => (
        <span className={`px-2 py-1 text-xs font-bold rounded-full ${info.getValue() === 'VERIFIED' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
          {info.getValue()}
        </span>
      )
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (info: any) => (
        <span className={`px-2 py-1 text-xs font-bold rounded-full ${info.getValue() === 'ACTIVE' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
          {info.getValue()}
        </span>
      )
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: (info: any) => {
        const isSuspended = info.row.original.ownerStatus === 'SUSPENDED';
        return (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = `/admin/users/${info.row.original.ownerId}`}
            >
              View
            </Button>
            <Button 
              variant={isSuspended ? 'outline' : 'danger'} 
              size="sm"
              onClick={() => suspendMutation.mutate(info.row.original.ownerId)}
              disabled={suspendMutation.isPending}
            >
              {isSuspended ? 'Activate' : 'Suspend'}
            </Button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
            Sellers <span className="text-text-secondary text-lg font-medium">({data?.meta?.total || 0})</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex border border-border rounded-md overflow-hidden bg-surface">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center ${viewMode === 'table' ? 'bg-accent/10 text-accent font-semibold' : 'hover:bg-border/30 text-text-secondary'}`}
              title="Table View"
            >
              <List size={15} />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 border-l border-border transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center ${viewMode === 'map' ? 'bg-accent/10 text-accent font-semibold' : 'hover:bg-border/30 text-text-secondary'}`}
              title="Global Map View"
            >
              <Map size={15} />
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'map' ? (
        <div className="h-[600px] w-full rounded-xl overflow-hidden border border-border relative z-0 shadow-sm">
          <MapContainer 
            center={[28.6139, 77.2090]} // Fallback center
            zoom={12} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {(data?.data || []).map((shop: any) => {
              // Assume shops might have location embedded or use a fallback for demo purposes
              // In production, the admin query should return location coordinates
              if (!shop.location?.coordinates || shop.location.coordinates.length < 2) return null;
              return (
                <Marker 
                  key={shop.id || shop._id} 
                  position={[shop.location.coordinates[1], shop.location.coordinates[0]]}
                >
                  <Popup>
                    <div className="text-center">
                      <b className="text-sm font-bold block mb-1">{shop.name}</b>
                      <span className="text-xs text-text-secondary block mb-1">{shop.city} - {shop.category}</span>
                      <span className="text-[10px] bg-accent/10 text-accent px-1.5 py-0.5 rounded font-bold">{shop.status}</span>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      ) : (
        <AdminDataTable
          columns={columns}
          data={data?.data || []}
          pageCount={data?.meta?.totalPages || -1}
          totalRecords={data?.meta?.total || 0}
          isLoading={isLoading}
          onPaginationChange={setPagination}
          onSortingChange={setSorting}
          onSearchChange={setSearch}
          initialState={{ pagination, sorting }}
        />
      )}
    </div>
  );
};
export default SellersPage;
