import React, { useEffect, useState } from 'react';
import { api as axios } from '@/lib/axios';
import { Database, Key, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function ConfigDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // In a real app, you'd have a specific stats endpoint, but we can aggregate here
      const res = await axios.get('/admin/configuration');
      if (res.data.success) {
        const configs = res.data.data;
        setStats({
          total: configs.length,
          secrets: configs.filter((c: any) => c.isSecret).length,
          active: configs.filter((c: any) => c.isActive).length,
          inactive: configs.filter((c: any) => !c.isActive).length,
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReloadCache = async () => {
    try {
      const res = await axios.post('/admin/configuration/cache/reload');
      if (res.data.success) {
        alert('Configuration Cache reloaded successfully!');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to reload cache.');
    }
  };

  if (loading || !stats) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Configuration Overview</h1>
          <p className="text-text-secondary mt-1">Real-time status of your system configurations and secrets.</p>
        </div>
        <button 
          onClick={handleReloadCache}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Reload Cache
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface p-6 rounded-xl border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Database className="w-6 h-6 text-primary" />
            </div>
            <span className="text-sm font-medium text-text-secondary">Configs</span>
          </div>
          <h3 className="text-3xl font-bold text-text">{stats.total}</h3>
        </div>

        <div className="bg-surface p-6 rounded-xl border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-warning/10 rounded-lg">
              <Key className="w-6 h-6 text-warning" />
            </div>
            <span className="text-sm font-medium text-text-secondary">Secrets</span>
          </div>
          <h3 className="text-3xl font-bold text-text">{stats.secrets}</h3>
        </div>

        <div className="bg-surface p-6 rounded-xl border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-success/10 rounded-lg">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
            <span className="text-sm font-medium text-text-secondary">Active</span>
          </div>
          <h3 className="text-3xl font-bold text-text">{stats.active}</h3>
        </div>

        <div className="bg-surface p-6 rounded-xl border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-error/10 rounded-lg">
              <XCircle className="w-6 h-6 text-error" />
            </div>
            <span className="text-sm font-medium text-text-secondary">Inactive</span>
          </div>
          <h3 className="text-3xl font-bold text-text">{stats.inactive}</h3>
        </div>
      </div>
      
      <div className="bg-surface border border-border rounded-xl p-6">
         <h2 className="text-lg font-bold text-text mb-4">Quick Actions</h2>
         <p className="text-sm text-text-secondary mb-4">Manage critical system settings.</p>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="text-left p-4 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
               <h3 className="font-semibold text-text">Rotate Master Key</h3>
               <p className="text-xs text-text-secondary mt-1">Re-encrypt all secrets with a new master key.</p>
            </button>
            <button className="text-left p-4 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
               <h3 className="font-semibold text-text">Export Configurations</h3>
               <p className="text-xs text-text-secondary mt-1">Download a JSON backup of all configurations (excluding secrets).</p>
            </button>
         </div>
      </div>
    </div>
  );
}
