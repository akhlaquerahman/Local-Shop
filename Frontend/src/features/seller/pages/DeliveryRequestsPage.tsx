import React, { useState } from 'react';
import { Truck, Check, X, Search, User, MapPin, Users, Star, Phone } from 'lucide-react';
import { KPICard } from '@/components/ui/KPI';
import { DataTable } from '@/components/table';
import { useDeliveryRequests, useDeliveryRequestStats, useUpdateDeliveryRequest, useOrderBids, useAcceptRiderBid } from '../services/seller.queries';
import { useNotificationStore } from '@/store/notificationStore';
import { Button } from '@/components/ui/Button';

// Modal component for viewing and accepting rider bids
const RiderBidsModal = ({ isOpen, onClose, orderId, orderName }: { isOpen: boolean, onClose: () => void, orderId: string, orderName: string }) => {
  const { data: bids, isLoading } = useOrderBids(orderId);
  const acceptMutation = useAcceptRiderBid();
  const { addToast } = useNotificationStore();

  if (!isOpen) return null;

  const handleAccept = async (riderId: string) => {
    try {
      await acceptMutation.mutateAsync({ id: orderId, riderId });
      addToast({ title: 'Success', message: 'Rider assigned successfully!', type: 'success' });
      onClose();
    } catch (err: any) {
      addToast({ title: 'Error', message: err.message || 'Failed to assign rider', type: 'error' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h2 className="text-lg font-bold">Assign Rider for Order {orderName}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-text-secondary"><X size={20} /></button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="py-8 text-center text-text-secondary">Loading rider requests...</div>
          ) : bids && bids.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-text-secondary mb-4">{bids.length} rider(s) are interested in this delivery.</p>
              {bids.map((bid: any) => (
                <div key={bid._id} className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center p-3 bg-background border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0 overflow-hidden">
                      {bid.riderId?.avatarUrl ? <img src={bid.riderId.avatarUrl} alt="" className="w-full h-full object-cover" /> : <User size={18} />}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-text-primary">{bid.riderId?.name || 'Rider'}</p>
                      <div className="flex items-center gap-3 text-xs text-text-secondary mt-1">
                        <span className="flex items-center gap-1"><Star size={12} className="text-amber-500 fill-amber-500"/> {bid.riderId?.rating || '4.8'}</span>
                        <span className="flex items-center gap-1"><Phone size={12}/> {bid.riderId?.phone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => handleAccept(bid.riderId?._id)} disabled={acceptMutation.isPending} className="w-full sm:w-auto text-xs px-4 h-8 bg-success hover:bg-success/90 text-white border-0">
                    {acceptMutation.isPending ? 'Assigning...' : 'Accept'}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center flex flex-col items-center">
              <Users size={48} className="text-text-secondary/30 mb-4" />
              <h3 className="font-bold text-text-primary mb-1">No Rider Requests Yet</h3>
              <p className="text-sm text-text-secondary">Waiting for nearby delivery partners to accept this delivery.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const DeliveryRequestsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<{ id: string, name: string } | null>(null);
  const { data: stats, isLoading: statsLoading } = useDeliveryRequestStats();
  const { data: requests, isLoading: requestsLoading } = useDeliveryRequests();
  const updateMutation = useUpdateDeliveryRequest();
  const { addToast } = useNotificationStore();

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateMutation.mutateAsync({ id, data: { orderStatus: status } });
      addToast({ title: 'Success', message: `Delivery updated to ${status}`, type: 'success' });
    } catch (err: any) {
      addToast({ title: 'Error', message: err.message || 'Failed to update delivery', type: 'error' });
    }
  };

  const columns = [
    {
      header: 'Order ID',
      accessorKey: 'orderId',
      cell: (row: any) => <span className="font-bold text-text-primary text-sm">{row.orderId}</span>
    },
    {
      header: 'Customer',
      accessorKey: 'customerName',
      cell: (row: any) => (
        <div className="flex items-center gap-2">
          <User size={14} className="text-text-secondary" />
          <span className="text-sm">{row.customerName || 'Guest'}</span>
        </div>
      )
    },
    {
      header: 'Address',
      accessorKey: 'deliveryDetails',
      cell: (row: any) => (
        <div className="flex items-start gap-2 max-w-[200px]">
          <MapPin size={14} className="text-text-secondary mt-0.5 shrink-0" />
          <span className="text-xs text-text-secondary truncate" title={row.deliveryDetails?.deliveryAddress}>
            {row.deliveryDetails?.deliveryAddress || 'Pickup / N/A'}
          </span>
        </div>
      )
    },
    {
      header: 'Amount',
      accessorKey: 'total',
      cell: (row: any) => <span className="font-semibold">₹{row.total}</span>
    },
    {
      header: 'Assigned Rider',
      accessorKey: 'rider',
      cell: (row: any) => (
        <span className="text-sm">{row.deliveryDetails?.riderName || <span className="text-text-secondary italic">Unassigned</span>}</span>
      )
    },
    {
      header: 'Created At',
      accessorKey: 'createdAt',
      cell: (row: any) => <span className="text-xs text-text-secondary">{new Date(row.createdAt).toLocaleString()}</span>
    },
    {
      header: 'Status',
      accessorKey: 'orderStatus',
      cell: (row: any) => (
        <span className={`px-2 py-1 text-xs font-bold rounded-full ${row.orderStatus === 'DELIVERED' ? 'bg-success/10 text-success' : row.orderStatus === 'FAILED_DELIVERY' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'}`}>
          {row.orderStatus}
        </span>
      )
    },
    {
      header: 'Actions',
      accessorKey: 'actions',
      cell: (row: any) => (
        <div className="flex gap-2">
          {row.orderStatus === 'PACKED' || row.orderStatus === 'READY_FOR_PICKUP' ? (
            row.deliveryDetails?.riderId ? (
              <Button size="sm" onClick={() => handleUpdateStatus(row._id, 'OUT_FOR_DELIVERY')} className="text-xs px-2 py-1 h-auto">Dispatch</Button>
            ) : (
              <Button size="sm" onClick={() => setSelectedOrder({ id: row._id, name: row.orderId })} className="text-xs px-2 py-1 h-auto bg-primary hover:bg-primary/90 text-white border-0">Assign Rider</Button>
            )
          ) : row.orderStatus === 'OUT_FOR_DELIVERY' ? (
            <>
              <Button size="sm" variant="outline" className="text-success hover:bg-success/10 hover:text-success text-xs px-2 py-1 h-auto" onClick={() => handleUpdateStatus(row._id, 'DELIVERED')}><Check size={14}/></Button>
              <Button size="sm" variant="outline" className="text-danger hover:bg-danger/10 hover:text-danger text-xs px-2 py-1 h-auto" onClick={() => handleUpdateStatus(row._id, 'FAILED_DELIVERY')}><X size={14}/></Button>
            </>
          ) : null}
        </div>
      )
    }
  ];

  const filteredData = requests?.filter((r: any) => r.orderId?.toLowerCase().includes(search.toLowerCase()) || r.customerName?.toLowerCase().includes(search.toLowerCase())) || [];

  return (
    <div className="space-y-6 text-left max-w-[1440px] mx-auto pb-20">
      <div>
        <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Delivery Requests</h1>
        <p className="text-sm text-text-secondary">Manage and track your active deliveries and assignments</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KPICard title="Pending Assignment" value={stats?.pendingAssignment || 0} loading={statsLoading} trend="+2 today" />
        <KPICard title="Assigned" value={stats?.assigned || 0} loading={statsLoading} />
        <KPICard title="Picked Up" value={stats?.pickedUp || 0} loading={statsLoading} />
        <KPICard title="Delivered" value={stats?.delivered || 0} loading={statsLoading} trend="+12% this week" />
        <KPICard title="Failed" value={stats?.failed || 0} loading={statsLoading} className="border-danger/20" />
      </div>

      <div className="bg-surface border border-border rounded-xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
            <input 
              type="text" 
              placeholder="Search by Order ID or Customer..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <DataTable 
          columns={columns} 
          data={filteredData.map((d: any) => ({ ...d, id: d._id }))} 
          isLoading={requestsLoading}
          exportFileName="delivery-requests"
        />
      </div>

      <RiderBidsModal 
        isOpen={!!selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
        orderId={selectedOrder?.id || ''} 
        orderName={selectedOrder?.name || ''} 
      />
    </div>
  );
};
export default DeliveryRequestsPage;
