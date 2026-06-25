import React, { useState } from 'react';
import { Bell, CheckCheck, Trash2, Archive, Package, Ticket, Wallet, Info, Filter, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNotificationStore } from '@/store/notificationStore';

type NotificationType = 'order' | 'promotion' | 'wallet' | 'coupon' | 'system';

interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  link?: string;
}

const MOCK_NOTIFICATIONS: AppNotification[] = [
  { id: 'notif-1', type: 'order', title: 'Order Delivered! 🎉', message: 'Your order #ORD-2026-4591 has been delivered. Tap to rate your experience.', date: '2026-06-07T14:30:00Z', isRead: false, link: '/app/orders' },
  { id: 'notif-2', type: 'wallet', title: 'Cashback Credited', message: '₹50 cashback has been credited to your wallet for your recent referral.', date: '2026-06-06T09:15:00Z', isRead: false, link: '/app/wallet' },
  { id: 'notif-3', type: 'promotion', title: 'Weekend Super Sale!', message: 'Get up to 50% off on fresh fruits and vegetables this weekend only.', date: '2026-06-05T10:00:00Z', isRead: true },
  { id: 'notif-4', type: 'coupon', title: 'Coupon Expiring Soon', message: 'Your coupon SAVE50 expires in 2 days. Use it before you lose it!', date: '2026-06-04T18:20:00Z', isRead: true, link: '/app/coupons' },
  { id: 'notif-5', type: 'system', title: 'App Update Available', message: 'We have added new features! Please update your app from the Play Store.', date: '2026-06-01T11:45:00Z', isRead: true },
];

export const NotificationsPage: React.FC = () => {
  const { addToast, notifications, markAsReadAsync, markAllAsReadAsync } = useNotificationStore();
  const [activeTab, setActiveTab] = useState<'all' | NotificationType>('all');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Default to system type if category doesn't match
  const normalizedNotifications = notifications.map(n => ({
    ...n,
    type: (n.category?.toLowerCase() || 'system') as NotificationType,
    date: n.createdAt || new Date().toISOString()
  }));

  const filteredNotifications = normalizedNotifications.filter(n => activeTab === 'all' || n.type === activeTab);
  const unreadCount = normalizedNotifications.filter(n => !n.isRead).length;

  const markAllAsRead = async () => {
    await markAllAsReadAsync();
    addToast({ title: 'Marked as Read', message: 'All notifications marked as read.', type: 'success' });
  };

  const markAsRead = async (id: string) => {
    await markAsReadAsync(id);
    setOpenMenuId(null);
  };

  const deleteNotification = (id: string) => {
    // Implement delete if needed or keep local removal
    setOpenMenuId(null);
    addToast({ title: 'Deleted', message: 'Notification removed.', type: 'info' });
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'order': return <Package size={18} className="text-blue-500" />;
      case 'promotion': return <Bell size={18} className="text-pink-500" />;
      case 'wallet': return <Wallet size={18} className="text-success" />;
      case 'coupon': return <Ticket size={18} className="text-amber-500" />;
      case 'system': return <Info size={18} className="text-text-secondary" />;
    }
  };

  const tabs: { id: 'all' | NotificationType; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'order', label: 'Orders' },
    { id: 'promotion', label: 'Promotions' },
    { id: 'wallet', label: 'Wallet' },
    { id: 'coupon', label: 'Coupons' },
    { id: 'system', label: 'System' },
  ];

  return (
    <div className="space-y-6 text-left max-w-3xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight flex items-center gap-3">
            <Bell size={28} className="text-accent" /> Notifications
            {unreadCount > 0 && (
              <span className="bg-danger text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">{unreadCount}</span>
            )}
          </h1>
          <p className="text-sm text-text-secondary mt-1">Stay updated with orders, offers, and alerts.</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead} className="flex items-center gap-2">
            <CheckCheck size={16} /> Mark All as Read
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-border">
        {tabs.map(tab => {
          const count = normalizedNotifications.filter(n => (tab.id === 'all' || n.type === tab.id) && !n.isRead).length;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === tab.id ? 'border-accent text-accent' : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${activeTab === tab.id ? 'bg-accent text-white' : 'bg-danger text-white'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-16 space-y-4 border border-dashed border-border rounded-2xl bg-surface">
            <Filter size={48} className="mx-auto text-text-secondary/30" />
            <div>
              <p className="font-bold text-text-primary text-lg">All caught up!</p>
              <p className="text-sm text-text-secondary mt-1">You have no {activeTab !== 'all' ? activeTab : ''} notifications.</p>
            </div>
          </div>
        ) : (
          filteredNotifications.map(notif => (
            <div
              key={notif.id}
              className={`bg-surface border rounded-xl p-4 flex gap-4 transition-all relative group
                ${notif.isRead ? 'border-border opacity-75 hover:opacity-100' : 'border-accent/40 shadow-sm bg-accent/5'}
              `}
            >
              {/* Unread dot indicator */}
              {!notif.isRead && (
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_rgba(var(--accent),0.8)]" />
              )}

              {/* Icon */}
              <div className="w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center flex-shrink-0 shadow-sm">
                {getIcon(notif.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pr-8">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`text-sm ${notif.isRead ? 'font-semibold text-text-primary' : 'font-extrabold text-text-primary'}`}>
                    {notif.title}
                  </h3>
                  <span className="text-[10px] font-medium text-text-secondary whitespace-nowrap hidden sm:block">
                    • {new Date(notif.date).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className={`text-xs leading-relaxed ${notif.isRead ? 'text-text-secondary' : 'text-text-primary font-medium'}`}>
                  {notif.message}
                </p>
                <span className="text-[10px] font-medium text-text-secondary whitespace-nowrap sm:hidden block mt-1.5">
                  {new Date(notif.date).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
                
                {notif.link && (
                  <button onClick={() => addToast({ title: 'Navigation', message: `Would navigate to ${notif.link}`, type: 'info' })} className="mt-2 text-xs font-bold text-accent hover:underline">
                    View Details
                  </button>
                )}
              </div>

              {/* Menu */}
              <div className="absolute top-3 right-8 sm:right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setOpenMenuId(openMenuId === notif.id ? null : notif.id)}
                  className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-background rounded-md transition-colors"
                >
                  <MoreVertical size={16} />
                </button>
                {openMenuId === notif.id && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                    <div className="absolute right-0 top-full mt-1 w-36 bg-surface border border-border rounded-lg shadow-enterprise-lg z-20 py-1 overflow-hidden">
                      {!notif.isRead && (
                        <button onClick={() => markAsRead(notif.id)} className="w-full text-left px-4 py-2.5 text-xs font-semibold text-text-primary hover:bg-background flex items-center gap-2">
                          <CheckCheck size={14} /> Mark Read
                        </button>
                      )}
                      <button onClick={() => { setOpenMenuId(null); addToast({ title: 'Archived', message: 'Notification archived.', type: 'info' }); }} className="w-full text-left px-4 py-2.5 text-xs font-semibold text-text-primary hover:bg-background flex items-center gap-2">
                        <Archive size={14} /> Archive
                      </button>
                      <button onClick={() => deleteNotification(notif.id)} className="w-full text-left px-4 py-2.5 text-xs font-semibold text-danger hover:bg-danger/5 flex items-center gap-2">
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </>
                )}
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
