import React, { useState, useEffect } from 'react';
import { api as axios } from '@/lib/axios';
import { Bell, Lightbulb, AlertTriangle, Zap, CheckCircle, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';

export const AiNotificationCenter = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In production, this would be a real API call. Mocking for demonstration.
    setTimeout(() => {
      setNotifications([
        { _id: '1', category: 'Insight', title: 'Sales Trend', message: 'Your sales have dropped by 12% this week compared to last week.', createdAt: new Date().toISOString() },
        { _id: '2', category: 'Warning', title: 'Low Stock Alert', message: 'Your top product "Organic Milk" is running low on stock.', createdAt: new Date().toISOString() },
        { _id: '3', category: 'Recommendation', title: 'Pricing Suggestion', message: 'Consider lowering the price of "Whole Wheat Bread" to match competitors.', createdAt: new Date().toISOString() }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getIcon = (category: string) => {
    switch (category) {
      case 'Insight': return <Lightbulb className="w-5 h-5 text-primary" />;
      case 'Warning': return <AlertTriangle className="w-5 h-5 text-warning" />;
      case 'Recommendation': return <Zap className="w-5 h-5 text-success" />;
      case 'Action Required': return <CheckCircle className="w-5 h-5 text-error" />;
      default: return <Bell className="w-5 h-5 text-text-secondary" />;
    }
  };

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden flex flex-col max-h-[400px]">
      <div className="p-4 border-b border-border flex items-center justify-between bg-background/50">
        <h3 className="font-semibold text-text flex items-center gap-2">
          <Bell className="w-4 h-4" /> AI Insights & Alerts
        </h3>
        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
          {notifications.length} New
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="space-y-2 p-2">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-text-secondary">
            <Bell className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-sm">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(notif => (
              <div key={notif._id} className="p-3 hover:bg-surface-hover rounded-lg cursor-pointer transition-colors border border-transparent hover:border-border flex gap-3">
                <div className="mt-0.5">{getIcon(notif.category)}</div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-text">{notif.title}</span>
                    <span className="text-[10px] text-text-secondary flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">{notif.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
