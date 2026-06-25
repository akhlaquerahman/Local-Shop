import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  ShoppingBag, RefreshCw, FileText, MapPin, HelpCircle,
  Clock, CheckCircle, XCircle, Package, Truck, ChevronRight,
  AlertCircle, Search, Eye, Bike, Store, ArrowRightLeft
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNotificationStore } from '@/store/notificationStore';
import { useOrders, useOrderStats, useCreateTicket } from '@/hooks/queries';
import { Order, OrderStatus } from '@/domain/order';
import { api } from '@/lib/axios';
import { OrderDetailsDrawer } from './components/OrderDetailsDrawer';
import { ReturnRequestModal } from './components/ReturnRequestModal';
import { CancelOrderModal } from './components/CancelOrderModal';

type TabKey = 'all' | 'active' | 'delivered' | 'cancelled' | 'refunded';

const STATUS_BADGES: Record<OrderStatus, { color: string, bg: string, label: string }> = {
  pending: { color: 'text-blue-600', bg: 'bg-blue-100', label: 'Placed' },
  accepted: { color: 'text-indigo-600', bg: 'bg-indigo-100', label: 'Accepted' },
  preparing: { color: 'text-amber-600', bg: 'bg-amber-100', label: 'Preparing' },
  packed: { color: 'text-orange-600', bg: 'bg-orange-100', label: 'Packed' },
  ready_for_pickup: { color: 'text-purple-600', bg: 'bg-purple-100', label: 'Ready' },
  assigned_to_rider: { color: 'text-purple-600', bg: 'bg-purple-100', label: 'Rider Assigned' },
  arrived_at_pickup: { color: 'text-purple-600', bg: 'bg-purple-100', label: 'Rider Arrived' },
  picked_up: { color: 'text-purple-600', bg: 'bg-purple-100', label: 'Shipped' },
  in_transit: { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'On The Way' },
  arrived_at_destination: { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Out For Delivery' },
  delivered: { color: 'text-green-600', bg: 'bg-green-100', label: 'Delivered' },
  cancelled: { color: 'text-red-600', bg: 'bg-red-100', label: 'Cancelled' },
  refunded: { color: 'text-red-600', bg: 'bg-red-100', label: 'Refunded' },
  returned: { color: 'text-gray-600', bg: 'bg-gray-100', label: 'Returned' },
};

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId?: string }>();
  const queryClient = useQueryClient();
  const { addToast } = useNotificationStore();

  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Modals state
  const [selectedDetailsOrder, setSelectedDetailsOrder] = useState<Order | null>(null);
  const [returnOrder, setReturnOrder] = useState<Order | null>(null);
  const [cancelOrder, setCancelOrder] = useState<Order | null>(null);

  const { data: stats } = useOrderStats();
  const { data: orders = [], isLoading, isError } = useOrders({
    search: debouncedSearch,
    tab: activeTab
  });

  // Handle direct routing to order details drawer
  useEffect(() => {
    if (orderId && orders.length > 0) {
      const order = orders.find((o) => (o.orderId || o.id) === orderId);
      if (order) {
        setSelectedDetailsOrder(order);
      }
    } else if (!orderId) {
      setSelectedDetailsOrder(null);
    }
  }, [orderId, orders]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    const handler = setTimeout(() => {
      setDebouncedSearch(value);
    }, 400);
    return () => clearTimeout(handler);
  };

  const handleReorder = async (order: Order) => {
    try {
      addToast({ title: 'Processing Reorder', message: 'Adding items to your cart...', type: 'info' });
      for (const item of order.items) {
        await api.post('/v1/cart', {
          shopId: order.shopId,
          shopName: order.shopName,
          item: {
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            imageUrl: item.imageUrl
          }
        });
      }
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      addToast({ title: 'Reordered! 🛒', message: `Items added from ${order.shopName}`, type: 'success' });
      navigate('/app/cart');
    } catch (e) {
      addToast({ title: 'Error', message: 'Failed to reorder items.', type: 'danger' });
    }
  };

  const tabList: { key: TabKey; label: string; count: number }[] = [
    { key: 'all', label: 'All Orders', count: stats?.all || 0 },
    { key: 'active', label: 'Active', count: stats?.active || 0 },
    { key: 'delivered', label: 'Delivered', count: stats?.delivered || 0 },
    { key: 'cancelled', label: 'Cancelled', count: stats?.cancelled || 0 },
    { key: 'refunded', label: 'Returns/Refunds', count: stats?.refunded || 0 },
  ];

  return (
    <div className="space-y-6 text-left pb-16 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight">Your Orders</h1>
          <p className="text-sm text-text-secondary mt-1">Manage all your marketplace purchases and returns</p>
        </div>
        <div className="relative max-w-md w-full md:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search your orders..."
            className="w-full pl-9 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-text-primary"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b border-border scrollbar-none">
        {tabList.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === tab.key ? 'border-accent text-accent' : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.label}
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${activeTab === tab.key ? 'bg-accent text-white' : 'bg-surface border border-border text-text-secondary'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* States */}
      {isLoading && (
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-2xl h-48 w-full" />
          ))}
        </div>
      )}
      {isError && (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-danger/30 bg-danger/5 rounded-2xl">
          <AlertCircle size={40} className="text-danger mb-3" />
          <p className="font-bold text-text-primary">Failed to load orders</p>
        </div>
      )}
      {!isLoading && !isError && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 space-y-4 border border-dashed border-border rounded-2xl bg-surface/30">
          <Package size={56} className="text-border" />
          <div className="text-center">
            <p className="font-bold text-lg text-text-primary">No orders found</p>
            <p className="text-sm text-text-secondary mt-1">When you place an order, it will appear here.</p>
          </div>
          <Button onClick={() => navigate('/app')}>Continue Shopping</Button>
        </div>
      )}

      {/* Enterprise Cards List */}
      {!isLoading && !isError && orders.length > 0 && (
        <div className="space-y-5">
          {orders.map(order => {
            const badge = STATUS_BADGES[order.status as OrderStatus] || { color: 'text-gray-600', bg: 'bg-gray-100', label: order.status };
            const isActive = !['delivered', 'cancelled', 'refunded'].includes(order.status);
            const mainItem = order.items[0];

            return (
              <div key={order.orderId || order.id} className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-enterprise transition-all flex flex-col md:flex-row">
                
                {/* Left Section: Product & Shop Info */}
                <div className="p-5 md:w-5/12 border-b md:border-b-0 md:border-r border-border flex gap-4">
                  <div className="w-20 h-20 bg-background border border-border rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {mainItem?.imageUrl ? (
                      <img src={mainItem.imageUrl} alt={mainItem.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package size={24} className="text-text-secondary/50" />
                    )}
                  </div>
                  <div className="flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-text-primary text-sm line-clamp-1">{mainItem?.name || 'Multiple Items'}</h3>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {order.items.length > 1 ? `+${order.items.length - 1} more items` : `Qty: ${mainItem?.quantity}`}
                      </p>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-text-primary">
                        <Store size={14} className="text-accent" />
                        {order.shopName}
                      </div>
                      <button onClick={() => navigate(`/app/shops/${order.shopId}`)} className="text-[10px] text-accent hover:underline mt-0.5 font-medium">View Shop</button>
                    </div>
                  </div>
                </div>

                {/* Center Section: Order Info & Timeline */}
                <div className="p-5 md:w-4/12 border-b md:border-b-0 md:border-r border-border flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-text-secondary">Order #</span>
                      <span className="font-bold font-mono text-text-primary">{order.orderId || order.id}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-text-secondary">Order Date</span>
                      <span className="font-semibold text-text-primary">{formatDate(order.createdAt)}</span>
                    </div>
                  </div>

                  {/* Mini Timeline */}
                  <div className="mt-4 flex items-center justify-between relative">
                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-border -z-10" />
                    {['pending', 'packed', 'picked_up', 'delivered'].map((step, idx) => {
                      const stages = ['pending', 'packed', 'picked_up', 'delivered'];
                      const currentIdx = stages.indexOf(order.status === 'arrived_at_destination' ? 'picked_up' : order.status);
                      const isCompleted = currentIdx >= idx || order.status === 'delivered';
                      return (
                        <div key={step} className={`w-3 h-3 rounded-full border-2 ${isCompleted ? 'bg-accent border-accent' : 'bg-surface border-border'} flex items-center justify-center`}>
                          {isCompleted && <CheckCircle size={8} className="text-white" />}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-text-secondary mt-1.5">
                    <span>Placed</span>
                    <span>Delivered</span>
                  </div>
                </div>

                {/* Right Section: Amount & Actions */}
                <div className="p-5 md:w-3/12 flex flex-col justify-between bg-background/50">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide ${badge.color} ${badge.bg}`}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-text-secondary block font-semibold mb-0.5 uppercase">{order.paymentMethod}</span>
                      <span className="font-black text-lg text-text-primary leading-none">₹{order.total}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-2">
                    <Button 
                      onClick={() => navigate(`/app/orders/${order.orderId || order.id}`)} 
                      className="w-full justify-center shadow-none text-sm bg-text-primary hover:bg-text-primary/90 text-surface"
                    >
                      View Details
                    </Button>
                    
                    <div className="flex gap-2">
                      {isActive ? (
                        <Button 
                          variant="outline" 
                          onClick={() => navigate(`/app/orders/${order.orderId || order.id}/track`)} 
                          className="flex-1 justify-center text-xs h-9 border-accent text-accent hover:bg-accent hover:text-white"
                        >
                          <MapPin size={14} className="mr-1.5" /> Track
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          onClick={() => handleReorder(order)} 
                          className="flex-1 justify-center text-xs h-9 text-text-secondary hover:text-text-primary"
                        >
                          <RefreshCw size={14} className="mr-1.5" /> Reorder
                        </Button>
                      )}
                      
                      {['pending', 'accepted', 'preparing'].includes(order.status) && (
                        <Button 
                          variant="outline" 
                          onClick={() => setCancelOrder(order)} 
                          className="flex-1 justify-center text-xs h-9 text-text-secondary hover:text-danger hover:border-danger hover:bg-danger/5"
                        >
                          <XCircle size={14} className="mr-1.5" /> Cancel
                        </Button>
                      )}
                      
                      {order.status === 'delivered' && (
                        <Button 
                          variant="outline" 
                          onClick={() => setReturnOrder(order)} 
                          className="flex-1 justify-center text-xs h-9 text-text-secondary hover:text-danger hover:border-danger hover:bg-danger/5"
                        >
                          <ArrowRightLeft size={14} className="mr-1.5" /> Return
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DRAWERS & MODALS */}
      {selectedDetailsOrder && (
        <OrderDetailsDrawer 
          order={selectedDetailsOrder} 
          onClose={() => navigate('/app/orders')} 
        />
      )}

      {returnOrder && (
        <ReturnRequestModal 
          order={returnOrder} 
          onClose={() => setReturnOrder(null)} 
        />
      )}

      {cancelOrder && (
        <CancelOrderModal 
          order={cancelOrder} 
          onClose={() => setCancelOrder(null)} 
        />
      )}
    </div>
  );
};

export default OrdersPage;
