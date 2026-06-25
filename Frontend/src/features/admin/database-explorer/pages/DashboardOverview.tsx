import React, { useEffect, useState } from 'react';
import { api as axios } from '@/lib/axios';
import { Database, FileText, Trash2, Activity, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';

const API_BASE = '/admin/database';

export const DashboardOverview = () => {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_BASE}/collections`);
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (error) {
        console.error('Failed to load stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const totalCollections = stats.length;
  const totalDocs = stats.reduce((acc, col) => acc + col.count, 0);
  const totalDeleted = stats.reduce((acc, col) => acc + (col.deletedCount || 0), 0);
  const activeDocs = totalDocs - totalDeleted;

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Database Overview</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text">Database Overview</h1>
          <p className="text-text-secondary mt-1">Real-time metrics from your MongoDB cluster</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-text-tertiary">
          <Clock className="w-4 h-4" />
          Last synced: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface p-4 rounded-xl border border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <Database className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-text-secondary">Collections</span>
          </div>
          <div className="text-3xl font-bold text-text">{totalCollections}</div>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-text-secondary">Total Documents</span>
          </div>
          <div className="text-3xl font-bold text-text">{totalDocs.toLocaleString()}</div>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-text-secondary">Active Records</span>
          </div>
          <div className="text-3xl font-bold text-text">{activeDocs.toLocaleString()}</div>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-500/10 text-red-500 rounded-lg">
              <Trash2 className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-text-secondary">Soft Deleted</span>
          </div>
          <div className="text-3xl font-bold text-text">{totalDeleted.toLocaleString()}</div>
        </div>
      </div>

      {/* Collections Table */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Collection Summary</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-text-secondary">
            <thead className="text-xs text-text-tertiary uppercase bg-surface-hover/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Collection Name</th>
                <th className="px-6 py-4 font-medium">Model Name</th>
                <th className="px-6 py-4 font-medium text-right">Document Count</th>
                <th className="px-6 py-4 font-medium text-right">Created Today</th>
                <th className="px-6 py-4 font-medium text-right">Updated Today</th>
                <th className="px-6 py-4 font-medium text-right">Deleted Records</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stats.sort((a, b) => b.count - a.count).map((stat) => (
                <tr key={stat.modelName} className="hover:bg-surface-hover/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-text">{stat.name}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-surface-hover rounded-md font-mono text-xs text-text-secondary">
                      {stat.modelName}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-text">{stat.count.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">{stat.createdToday.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">{stat.updatedToday.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-red-400">{stat.deletedCount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
