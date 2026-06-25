import React, { useEffect, useState } from 'react';
import { api as axios } from '@/lib/axios';
import { Database, FileText, Activity } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';

export const AuditCenter = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get('/ai/audit-logs');
        setLogs(res.data);
      } catch (error) {
        console.error('Failed to fetch logs', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) return <div className="p-6"><Skeleton className="h-64 w-full" /></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Database className="w-8 h-8 text-primary" />
        <h2 className="text-2xl font-bold text-text">AI Audit & Governance</h2>
      </div>

      <div className="overflow-x-auto bg-surface border border-border rounded-xl">
        <table className="w-full text-left text-sm text-text">
          <thead className="bg-background border-b border-border">
            <tr>
              <th className="px-4 py-3 font-semibold">Time</th>
              <th className="px-4 py-3 font-semibold">Agent</th>
              <th className="px-4 py-3 font-semibold">Action Type</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Tokens</th>
              <th className="px-4 py-3 font-semibold">Latency</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log._id} className="border-b border-border hover:bg-surface-hover">
                <td className="px-4 py-3 text-text-secondary">{new Date(log.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3 font-medium">{log.agentId}</td>
                <td className="px-4 py-3">{log.actionType}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    log.status === 'SUCCESS' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                  }`}>
                    {log.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-text-secondary">{log.tokensUsed}</td>
                <td className="px-4 py-3 text-text-secondary">{log.executionTimeMs}ms</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-text-secondary">
                  No audit logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditCenter;
