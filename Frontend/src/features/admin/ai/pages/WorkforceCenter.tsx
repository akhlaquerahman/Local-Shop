import React, { useEffect, useState } from 'react';
import { api as axios } from '@/lib/axios';
import { Bot, Activity, CheckCircle, XCircle, Clock, ShieldAlert } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';

export const WorkforceCenter = () => {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await axios.get('/ai/agents');
        setAgents(res.data);
      } catch (error) {
        console.error('Failed to fetch agents', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
    const interval = setInterval(fetchAgents, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="p-6"><Skeleton className="h-64 w-full" /></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Bot className="w-8 h-8 text-primary" />
        <h2 className="text-2xl font-bold text-text">AI Workforce Center</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map(agent => (
          <div key={agent.agentId} className="bg-surface border border-border p-5 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-text flex items-center gap-2">
                <Activity className="w-5 h-5 text-accent" />
                {agent.name}
              </h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                agent.status === 'ONLINE' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
              }`}>
                {agent.status}
              </span>
            </div>
            
            <div className="space-y-3 text-sm text-text-secondary">
              <div className="flex justify-between">
                <span>Total Runs</span>
                <span className="font-medium text-text">{agent.totalRuns}</span>
              </div>
              <div className="flex justify-between">
                <span>Success Rate</span>
                <span className="font-medium text-text">{agent.successRate}%</span>
              </div>
              <div className="flex justify-between">
                <span>Tokens Used</span>
                <span className="font-medium text-text">{agent.totalTokensUsed.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border mt-2">
                <span className="flex items-center gap-1"><Clock className="w-4 h-4"/> Last Run</span>
                <span>{agent.lastRunAt ? new Date(agent.lastRunAt).toLocaleString() : 'Never'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkforceCenter;
