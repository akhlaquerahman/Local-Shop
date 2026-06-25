import React, { useState } from 'react';
import { Bell, CheckCircle2, Circle, Inbox, Megaphone, ShieldAlert, ShoppingBag, Wallet } from 'lucide-react';
import { useNotifications, useMarkNotificationRead } from '../services/seller.queries';
import { Button } from '@/components/ui/Button';

const NotificationsPage: React.FC = () => {
  const [filter, setFilter] = useState('All');
  const { data, isLoading } = useNotifications();
  const readMutation = useMarkNotificationRead();

  const handleMarkRead = (id: string) => {
    readMutation.mutate(id);
  };

  const handleMarkAllRead = () => {
    readMutation.mutate('all');
  };

  const getIcon = (category: string) => {
    switch (category) {
      case 'Order': return <ShoppingBag size={20} className="text-primary" />;
      case 'Promotion': return <Megaphone size={20} className="text-accent" />;
      case 'Wallet': return <Wallet size={20} className="text-success" />;
      case 'System': return <ShieldAlert size={20} className="text-warning" />;
      default: return <Bell size={20} className="text-text-secondary" />;
    }
  };

  const filteredData = data?.filter((n: any) => {
    if (filter === 'Unread') return !n.isRead;
    if (filter !== 'All') return n.category === filter;
    return true;
  }) || [];

  return (
    <div className="space-y-6 text-left max-w-[1000px] mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Notifications</h1>
          <p className="text-sm text-text-secondary">Stay updated with your shop activity</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleMarkAllRead} isLoading={readMutation.isPending} className="gap-2">
          <CheckCircle2 size={14} /> Mark all as read
        </Button>
      </div>

      <div className="flex gap-2 border-b border-border pb-2 overflow-x-auto hide-scrollbar">
        {['All', 'Unread', 'Order', 'Promotion', 'System'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${filter === f ? 'bg-primary text-white' : 'bg-surface text-text-secondary hover:bg-surface-hover'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-surface border border-border rounded-xl flex flex-col overflow-hidden min-h-[400px]">
        {isLoading ? (
          <div className="p-8 text-center animate-pulse">Loading notifications...</div>
        ) : filteredData.length > 0 ? (
          <div className="divide-y divide-border">
            {filteredData.map((notification: any) => (
              <div key={notification._id} className={`p-4 sm:p-6 flex items-start gap-4 transition-colors hover:bg-background/50 ${!notification.isRead ? 'bg-primary/5' : ''}`}>
                <div className="p-3 bg-background rounded-full border border-border flex-shrink-0">
                  {getIcon(notification.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-4">
                    <h4 className={`text-sm md:text-base truncate ${!notification.isRead ? 'font-extrabold text-text-primary' : 'font-bold text-text-secondary'}`}>
                      {notification.title}
                    </h4>
                    <span className="text-[10px] sm:text-xs text-text-secondary flex-shrink-0 whitespace-nowrap">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary mt-1">{notification.message}</p>
                </div>
                <div className="flex-shrink-0 ml-2">
                  {!notification.isRead && (
                    <button 
                      onClick={() => handleMarkRead(notification._id)}
                      className="text-primary hover:text-primary-hover p-1"
                      title="Mark as read"
                    >
                      <Circle size={12} fill="currentColor" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 py-20 text-text-secondary">
            <Inbox size={48} className="opacity-20 mb-4" />
            <p className="text-lg font-bold">No notifications found</p>
            <p className="text-sm mt-1">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
