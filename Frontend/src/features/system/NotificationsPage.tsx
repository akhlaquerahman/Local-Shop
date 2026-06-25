import React, { useState } from 'react';
import { Bell, Search, CheckCircle2, Trash2, Box, Tag, Wallet, Ticket, Monitor, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNotifications, useMarkNotificationRead, useClearNotifications } from '@/hooks/queries';
import { useNotificationStore } from '@/store/notificationStore';

export const NotificationsPage: React.FC = () => {
  const { addToast } = useNotificationStore();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  
  const { data: notifications, isLoading } = useNotifications();
  const markReadMutation = useMarkNotificationRead();
  const clearReadMutation = useClearNotifications();

  const handleMarkRead = async (id?: string) => {
    try {
      await markReadMutation.mutateAsync(id);
      addToast({ title: 'Success', message: id ? 'Marked as read' : 'All marked as read', type: 'success' });
    } catch (error) {
      addToast({ title: 'Error', message: 'Failed to mark read', type: 'error' });
    }
  };

  const handleClearRead = async () => {
    try {
      await clearReadMutation.mutateAsync();
      addToast({ title: 'Success', message: 'Read notifications cleared', type: 'success' });
    } catch (error) {
      addToast({ title: 'Error', message: 'Failed to clear notifications', type: 'error' });
    }
  };

  const filtered = notifications?.filter((n: any) => {
    if (filter !== 'All' && n.category !== filter) return false;
    if (search && !n.title.toLowerCase().includes(search.toLowerCase()) && !n.message.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }) || [];

  const unreadCount = notifications?.filter((n: any) => !n.isRead).length || 0;

  const getIcon = (category: string) => {
    switch(category) {
      case 'Order': return <Box size={16} className="text-accent" />;
      case 'Promotion': return <Tag size={16} className="text-success" />;
      case 'Wallet': return <Wallet size={16} className="text-warning" />;
      case 'Coupon': return <Ticket size={16} className="text-yellow-500" />;
      case 'System': return <Monitor size={16} className="text-text-primary" />;
      default: return <AlertCircle size={16} className="text-text-secondary" />;
    }
  };

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight flex items-center gap-3">
            <Bell size={28} className="text-accent" /> Notification Center
          </h1>
          <p className="text-sm text-text-secondary mt-1">You have {unreadCount} unread notifications</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleMarkRead()} disabled={unreadCount === 0 || markReadMutation.isPending} className="border-border text-xs h-9">
            <CheckCircle2 size={14} className="mr-1.5" /> Mark All Read
          </Button>
          <Button variant="outline" size="sm" onClick={handleClearRead} disabled={clearReadMutation.isPending} className="border-border text-danger hover:bg-danger/10 text-xs h-9">
            <Trash2 size={14} className="mr-1.5" /> Clear Read
          </Button>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-background">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input 
              type="text" 
              placeholder="Search notifications..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-lg text-sm focus:border-accent focus:outline-none transition-colors"
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <div className="flex bg-surface border border-border rounded-lg p-1">
              {['All', 'Order', 'Promotion', 'Wallet', 'Coupon', 'System'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    filter === f ? 'bg-text-primary text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="divide-y divide-border">
          {isLoading ? (
             Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 flex gap-4 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-border" />
                <div className="space-y-2 flex-1"><div className="h-4 w-1/3 bg-border rounded"/><div className="h-3 w-2/3 bg-border rounded"/></div>
              </div>
            ))
          ) : filtered.length > 0 ? (
            filtered.map((item: any) => (
              <div key={item._id} className={`p-4 flex gap-4 transition-colors hover:bg-background/50 ${!item.isRead ? 'bg-accent/5' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center border ${!item.isRead ? 'bg-accent/10 border-accent/20' : 'bg-background border-border'}`}>
                  {getIcon(item.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-4 mb-1">
                    <h4 className={`text-sm font-bold truncate ${!item.isRead ? 'text-text-primary' : 'text-text-secondary'}`}>
                      {item.title}
                    </h4>
                    <span className="text-[10px] font-medium text-text-secondary whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className={`text-sm ${!item.isRead ? 'text-text-primary font-medium' : 'text-text-secondary'}`}>{item.message}</p>
                </div>
                {!item.isRead && (
                  <button onClick={() => handleMarkRead(item._id)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-background border border-transparent hover:border-border text-text-secondary hover:text-accent transition-colors flex-shrink-0" title="Mark as Read">
                    <CheckCircle2 size={16} />
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="p-16 text-center">
              <Bell size={40} className="mx-auto text-text-secondary/20 mb-4" />
              <p className="text-base font-bold text-text-primary">No notifications</p>
              <p className="text-sm text-text-secondary mt-1">You're all caught up!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
