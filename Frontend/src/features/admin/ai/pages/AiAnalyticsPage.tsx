import React, { useState, useEffect } from 'react';
import { api as axios } from '@/lib/axios';
import { BarChart3, MessageSquare, Zap, Activity } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';

export const AiAnalyticsPage = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get('/ai/analytics');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return <div className="p-6"><Skeleton className="h-64 w-full rounded-xl" /></div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">AI Analytics Dashboard</h1>
          <p className="text-text-secondary mt-1">Monitor API usage, token consumption, and response health.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface p-6 rounded-xl border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <span className="text-sm font-medium text-text-secondary">Total Queries</span>
          </div>
          <h3 className="text-3xl font-bold text-text">{stats.totalRequests}</h3>
        </div>

        <div className="bg-surface p-6 rounded-xl border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-success/10 rounded-lg">
              <Zap className="w-6 h-6 text-success" />
            </div>
            <span className="text-sm font-medium text-text-secondary">Success Rate</span>
          </div>
          <h3 className="text-3xl font-bold text-text">
            {stats.totalRequests > 0 ? Math.round((stats.successfulRequests / stats.totalRequests) * 100) : 0}%
          </h3>
        </div>

        <div className="bg-surface p-6 rounded-xl border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-warning/10 rounded-lg">
              <Activity className="w-6 h-6 text-warning" />
            </div>
            <span className="text-sm font-medium text-text-secondary">Tokens Processed</span>
          </div>
          <h3 className="text-3xl font-bold text-text">
            {stats.roleStats.reduce((acc: number, cur: any) => acc + cur.tokens, 0).toLocaleString()}
          </h3>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="text-lg font-bold text-text mb-4">Usage by Role</h2>
        <div className="space-y-4">
          {stats.roleStats.map((roleStat: any) => (
            <div key={roleStat._id} className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <p className="font-medium text-text">{roleStat._id}</p>
                <p className="text-sm text-text-secondary">{roleStat.count} Queries</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-text">{roleStat.tokens.toLocaleString()}</p>
                <p className="text-sm text-text-secondary">Tokens</p>
              </div>
            </div>
          ))}
          {stats.roleStats.length === 0 && (
            <p className="text-text-secondary text-center py-4">No AI usage data recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
