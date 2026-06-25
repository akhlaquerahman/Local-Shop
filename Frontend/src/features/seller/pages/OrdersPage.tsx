import React, { useState } from 'react';
import { Package, Search, Filter, Calendar, ChevronDown, CheckCircle, XCircle, Truck, Box, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { KPICard } from '@/components/ui/KPI';
import { DataTable } from '@/components/table';
import { useSellerOrders, useSellerOrderStats, useUpdateOrderStatus } from '../services/seller.queries';
import { useNotificationStore } from '@/store/notificationStore';
import { SellerOrderDetailsDrawer } from '../components/SellerOrderDetailsDrawer';

export const OrdersPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  
  const { data: stats, isLoading: statsLoading } = useSellerOrderStats();
  const { data: orders, isLoading: ordersLoading } = useSellerOrders({ search, status: statusFilter });
  const updateMutation = useUpdateOrderStatus();
  const { addToast } = useNotificationStore();

  const [verificationCode, setVerificationCode] = React.useState<Record<string, string>>({});

  const handleStatusChange = async (id: string, status: string) => {
    try {
      if (status === 'delivered') {
        const code = verificationCode[id];
        if (!code || code.length !== 6) {
          addToast({ title: 'Error', message: 'Please enter the 6-digit delivery verification code', type: 'error' });
          return;
        }
        await updateMutation.mutateAsync({ id, status, verificationCode: code });
        setVerificationCode(prev => ({ ...prev, [id]: '' }));
      } else {
        await updateMutation.mutateAsync({ id, status });
      }
      addToast({ title: 'Success', message: `Order marked as ${status}`, type: 'success' });
    } catch (err: any) {
      addToast({ title: 'Error', message: err.message || 'Failed to update status', type: 'error' });
    }
  };

  const columns = [
    { header: 'Order ID', id: 'orderId', cell: (row: any) => <span className="font-mono text-xs">{row.orderId || row._id.substring(0, 8)}</span> },
    { header: 'Date', id: 'date', cell: (row: any) => new Date(row.createdAt).toLocaleString() },
    { header: 'Customer', id: 'customer', cell: (row: any) => (
        <div>
          <div className="font-bold">{row.customerName || 'Customer'}</div>
          <div className="text-xs text-text-secondary truncate max-w-[150px]">{row.deliveryDetails?.deliveryAddress || 'No address provided'}</div>
        </div>
      )
    },
    { header: 'Items', id: 'items', cell: (row: any) => <span className="font-bold">{row.items?.length || 0} items</span> },
    { header: 'Amount', id: 'amount', cell: (row: any) => <span className="font-bold">₹{(row.total || 0).toFixed(2)}</span> },
    { header: 'Payment', id: 'payment', cell: (row: any) => (
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${row.paymentStatus === 'paid' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
        {(row.paymentStatus || 'pending').toUpperCase()}
      </span>
    )},
    {
      header: 'Order Status',
      id: 'status',
      cell: (row: any) => {
        const colors: Record<string, string> = {
          pending: 'bg-accent/10 text-accent',
          accepted: 'bg-info/10 text-blue-600',
          preparing: 'bg-warning/10 text-warning',
          ready_for_pickup: 'bg-primary/10 text-primary',
          out_for_delivery: 'bg-accent/10 text-accent',
          delivered: 'bg-success/10 text-success',
          cancelled: 'bg-danger/10 text-danger'
        };
        const st = row.status || 'pending';
        return (
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${colors[st] || colors.pending}`}>
            {st.replace(/_/g, ' ').toUpperCase()}
          </span>
        );
      }
    },
    {
      header: 'Delivery Partner',
      id: 'rider',
      cell: (row: any) => (
        <div className="flex items-center gap-2">
          <Truck size={14} className="text-text-secondary" />
          <span className={`text-xs font-bold ${row.deliveryDetails?.riderName ? 'text-text-primary' : 'text-text-secondary italic'}`}>
            {row.deliveryDetails?.riderName || 'Unassigned'}
          </span>
        </div>
      )
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: (row: any) => {
        const status = (row.status || 'pending').toUpperCase();
        const id = row._id;
        const isPending = updateMutation.isPending;

        return (
          <div className="flex flex-wrap gap-2 items-center">
            <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => setSelectedOrder(row)}>
              View
            </Button>
            {(status === 'PENDING' || status === 'PLACED') && (
              <>
                <Button size="sm" isLoading={isPending} onClick={() => handleStatusChange(id, 'accepted')} icon={<CheckCircle size={14}/>}>Accept</Button>
                <Button variant="danger" size="sm" isLoading={isPending} onClick={() => handleStatusChange(id, 'cancelled')} icon={<XCircle size={14}/>}>Reject</Button>
              </>
            )}
            {status === 'ACCEPTED' && (
              <Button size="sm" isLoading={isPending} onClick={() => handleStatusChange(id, 'preparing')} icon={<Box size={14}/>}>Mark Packed</Button>
            )}
            {status === 'PREPARING' && (
              <Button size="sm" isLoading={isPending} onClick={() => handleStatusChange(id, 'ready_for_pickup')} icon={<Truck size={14}/>}>Ready for Pickup</Button>
            )}
            {status === 'READY_FOR_PICKUP' && (
              <div className="flex flex-col gap-2 w-40">
                <input
                  type="text"
                  placeholder="Enter 6-digit Code"
                  value={verificationCode[id] || ''}
                  onChange={(e) => setVerificationCode(prev => ({ ...prev, [id]: e.target.value }))}
                  className="border border-border rounded-md px-2 py-1 text-xs text-center tracking-widest font-mono w-full"
                  maxLength={6}
                />
                <Button size="sm" isLoading={isPending} onClick={() => handleStatusChange(id, 'delivered')} icon={<CheckCircle size={14}/>} className="w-full justify-center" disabled={(verificationCode[id]?.length || 0) !== 6}>Mark Delivered</Button>
              </div>
            )}
          </div>
        );
      }
    }
  ];

  const tableData = (orders || []).map((o: any) => ({ ...o, id: o._id }));

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto text-left pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Order Management</h1>
          <p className="text-sm text-text-secondary">Manage and fulfill your customer orders</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard title="Pending" value={stats?.pending || 0} icon={<Clock size={16} />} trend="Needs action" trendType="warning" loading={statsLoading} />
        <KPICard title="Accepted" value={stats?.accepted || 0} icon={<CheckCircle size={16} />} loading={statsLoading} />
        <KPICard title="Packed" value={stats?.packed || 0} icon={<Box size={16} />} loading={statsLoading} />
        <KPICard title="Ready" value={stats?.ready || 0} icon={<Truck size={16} />} loading={statsLoading} />
        <KPICard title="Delivered" value={stats?.delivered || 0} icon={<CheckCircle size={16} />} trendType="success" loading={statsLoading} />
        <KPICard title="Cancelled" value={stats?.cancelled || 0} icon={<XCircle size={16} />} trendType="danger" loading={statsLoading} />
      </div>

      <div className="bg-surface border border-border rounded-xl flex flex-col">
        <div className="p-4 border-b border-border bg-background flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
            <input 
              type="text" 
              placeholder="Search Order ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <select className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-primary focus:outline-none" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="placed">Pending / Placed</option>
              <option value="accepted">Accepted</option>
              <option value="preparing">Packed / Preparing</option>
              <option value="ready_for_pickup">Ready for Pickup</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Button variant="outline" icon={<Calendar size={16} />}>Date Range</Button>
          </div>
        </div>
        
        <div className="p-4 overflow-x-auto">
          {ordersLoading ? (
            <div className="h-64 flex items-center justify-center text-text-secondary">Loading orders...</div>
          ) : (
            <DataTable columns={columns} data={tableData} />
          )}
        </div>
      </div>

      {selectedOrder && (
        <SellerOrderDetailsDrawer 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
        />
      )}
    </div>
  );
};

export default OrdersPage;

