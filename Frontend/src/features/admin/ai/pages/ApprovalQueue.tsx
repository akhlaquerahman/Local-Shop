import React, { useEffect, useState } from 'react';
import { api as axios } from '@/lib/axios';
import { ShieldAlert, CheckCircle, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';

export const ApprovalQueue = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const res = await axios.get('/ai/approvals');
      setTasks(res.data);
    } catch (error) {
      console.error('Failed to fetch approvals', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleApprove = async (taskId: string) => {
    try {
      await axios.post(`/ai/approvals/${taskId}/approve`);
      fetchTasks();
    } catch (error) {
      console.error('Failed to approve task', error);
    }
  };

  if (loading) return <div className="p-6"><Skeleton className="h-64 w-full" /></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <ShieldAlert className="w-8 h-8 text-warning" />
        <h2 className="text-2xl font-bold text-text">AI Action Approval Queue</h2>
      </div>

      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="p-8 text-center bg-surface border border-border rounded-xl text-text-secondary">
            No pending AI actions require your approval.
          </div>
        ) : (
          tasks.map(task => (
            <div key={task._id} className="bg-surface border border-border p-5 rounded-xl flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg text-text mb-2">Agent: {task.agentId}</h3>
                <p className="text-sm font-medium text-warning mb-1">Action: {task.taskType}</p>
                <p className="text-sm text-text-secondary mb-3">Reason: {task.result?.reason}</p>
                <div className="bg-background p-3 rounded text-xs font-mono text-text overflow-auto max-w-2xl">
                  {JSON.stringify(task.payload, null, 2)}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => handleApprove(task._id)}
                  className="px-4 py-2 bg-success text-white rounded-lg flex items-center gap-2 hover:bg-success-hover"
                >
                  <CheckCircle className="w-4 h-4" /> Approve Action
                </button>
                <button 
                  className="px-4 py-2 bg-surface text-danger border border-danger rounded-lg flex items-center gap-2 hover:bg-danger/10"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ApprovalQueue;
