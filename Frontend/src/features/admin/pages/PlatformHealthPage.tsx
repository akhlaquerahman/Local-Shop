import React from 'react';
import { useAdminPlatformHealth } from '../services/admin.queries';
import { KPICard } from '@/components/ui/KPI';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';

export const PlatformHealthPage: React.FC = () => {
  const { data, isLoading } = useAdminPlatformHealth();

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
            Platform Health
          </h1>
          <p className="text-sm text-text-secondary mt-1">Real-time infrastructure and service monitoring.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Global Uptime" value={data?.kpis?.uptime || '0%'} loading={isLoading} className="border-success/20" />
        <KPICard title="Avg Latency" value={data?.kpis?.latency || '0ms'} loading={isLoading} className="border-brand-primary/20" />
        <KPICard title="Error Rate" value={data?.kpis?.errorRate || '0%'} loading={isLoading} className="border-warning/20" />
        <KPICard title="Queue Health" value={data?.kpis?.queueHealth || 'Unknown'} loading={isLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Core Services List */}
        <div className="col-span-1 p-6 rounded-xl bg-surface border border-border">
          <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-brand-primary" />
            Core Services
          </h3>
          {isLoading ? (
            <div className="text-sm text-text-secondary">Loading services...</div>
          ) : (
            <div className="space-y-4">
              {data?.data?.services?.map((svc: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-3 rounded bg-white/5 border border-white/10">
                  <div>
                    <div className="font-semibold text-text-primary">{svc.name}</div>
                    <div className="text-xs text-text-secondary">Latency: {svc.latency}</div>
                  </div>
                  <div className={`px-2 py-1 text-xs font-bold rounded-full ${svc.status === 'Healthy' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                    {svc.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Latency Chart */}
        <div className="col-span-1 lg:col-span-2 p-6 rounded-xl bg-surface border border-border">
          <h3 className="text-lg font-bold text-text-primary mb-4">API Latency Trend (ms)</h3>
          {isLoading ? (
            <div className="h-64 flex items-center justify-center text-text-secondary">Loading chart...</div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.charts?.latencyTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="time" stroke="#888888" />
                  <YAxis stroke="#888888" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#333' }} />
                  <Line type="monotone" dataKey="value" stroke="#ffb400" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default PlatformHealthPage;
