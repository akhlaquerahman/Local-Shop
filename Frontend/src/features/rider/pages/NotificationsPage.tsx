import React from 'react';
import { useRiderNotifications, useRiderSupportTickets } from '../services/rider.queries';
import { Bell, CheckCheck, Loader2, Info, AlertTriangle, Circle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const NotificationsPage: React.FC = () => {
  const { data, isLoading } = useRiderNotifications();
  const notifications = data || [];

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Notifications</h1>
          <p className="text-sm text-text-secondary">System alerts, updates, and messages</p>
        </div>
        <Button variant="outline" icon={<CheckCheck size={16}/>} disabled={unreadCount === 0}>
          Mark All Read
        </Button>
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 border-r border-border bg-background/30 p-4 space-y-1 shrink-0">
          <div className="px-4 py-2 bg-background border border-border rounded-lg text-sm font-bold text-primary flex justify-between items-center cursor-pointer">
            All <span className="bg-primary/10 text-primary px-2 rounded-full text-xs">{notifications.length}</span>
          </div>
          <div className="px-4 py-2 text-text-secondary hover:bg-background/50 rounded-lg text-sm font-medium cursor-pointer transition-colors">
            Orders
          </div>
          <div className="px-4 py-2 text-text-secondary hover:bg-background/50 rounded-lg text-sm font-medium cursor-pointer transition-colors">
            Earnings
          </div>
          <div className="px-4 py-2 text-text-secondary hover:bg-background/50 rounded-lg text-sm font-medium cursor-pointer transition-colors">
            Compliance
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
             <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-accent" size={32}/></div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-text-secondary p-10 text-center">
              <Bell size={40} className="opacity-50 mb-4" />
              <h3 className="font-bold text-text-primary">All caught up!</h3>
              <p className="text-sm">You have no new notifications.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notif: any) => (
                <div key={notif._id} className={`p-5 flex gap-4 hover:bg-background/50 transition-colors cursor-pointer ${notif.isRead ? 'opacity-70' : 'bg-primary/5'}`}>
                  <div className="shrink-0 mt-1">
                    {notif.type === 'ALERT' ? <AlertTriangle size={20} className="text-error" /> : 
                     notif.type === 'INFO' ? <Info size={20} className="text-primary" /> : 
                     <Bell size={20} className="text-accent" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`text-sm ${notif.isRead ? 'font-medium text-text-primary' : 'font-bold text-text-primary'}`}>{notif.title}</h4>
                      <span className="text-[10px] text-text-secondary whitespace-nowrap ml-2">{new Date(notif.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-text-secondary">{notif.message}</p>
                  </div>
                  {!notif.isRead && (
                    <div className="shrink-0 flex items-center justify-center pt-1">
                      <Circle size={10} className="fill-primary text-primary" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default NotificationsPage;
