import React from 'react';
import { Clock, Check, X, RefreshCw } from 'lucide-react';
import { useRiderRequests } from '../services/rider.queries';
import { KPICard } from '@/components/ui/KPI';
import { useRiderSocket } from '../services/rider.socket';

export const RequestedDeliveriesPage: React.FC = () => {
  const { data: requests, isLoading, refetch } = useRiderRequests();
  const { socket } = useRiderSocket();

  React.useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => refetch();
    socket.on('request_approved', handleUpdate);
    socket.on('request_rejected', handleUpdate);
    return () => {
      socket.off('request_approved', handleUpdate);
      socket.off('request_rejected', handleUpdate);
    };
  }, [socket, refetch]);

  const reqList = requests || [];

  const pending = reqList.filter((r: any) => r.status === 'pending').length;
  const approved = reqList.filter((r: any) => r.status === 'approved').length;
  const rejected = reqList.filter((r: any) => r.status === 'rejected').length;
  const expired = reqList.filter((r: any) => r.status === 'expired').length;

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Request Tracking</h1>
          <p className="text-sm text-text-secondary">Monitor your delivery request statuses</p>
        </div>
        <button onClick={() => refetch()} className="p-2 border border-border rounded hover:bg-surface"><RefreshCw size={16} className={isLoading ? 'animate-spin' : ''}/></button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Pending" value={pending} loading={isLoading} />
        <KPICard title="Approved" value={approved} loading={isLoading} />
        <KPICard title="Rejected" value={rejected} loading={isLoading} />
        <KPICard title="Expired" value={expired} loading={isLoading} />
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-background text-text-secondary uppercase text-[10px] font-bold border-b border-border">
              <tr>
                <th className="px-6 py-4">Request ID</th>
                <th className="px-6 py-4">Shop</th>
                <th className="px-6 py-4">Requested At</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Expires At</th>
                <th className="px-6 py-4">Notes</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-text-secondary">
                     Loading requests...
                  </td>
                </tr>
              ) : reqList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center text-text-secondary/50">
                      <Clock size={32} className="mb-2" />
                      <p>No delivery requests found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                reqList.map((req: any) => (
                  <tr key={req._id} className="border-b border-border hover:bg-background/50">
                    <td className="px-6 py-4 font-mono text-xs">{req._id.substring(0, 8)}</td>
                    <td className="px-6 py-4 font-bold">{req.deliveryId?.shopId?.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-xs text-text-secondary">{new Date(req.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                        ${req.status === 'pending' ? 'bg-accent/10 text-accent' : 
                          req.status === 'approved' ? 'bg-success/10 text-success' : 
                          'bg-error/10 text-error'}`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-text-secondary">{new Date(req.expiresAt).toLocaleTimeString()}</td>
                    <td className="px-6 py-4 text-xs text-text-secondary">{req.reason || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default RequestedDeliveriesPage;
