import React, { useState } from 'react';
import { Download, RefreshCw, Search, ShieldAlert } from 'lucide-react';
import { DataTable } from '@/components/table';
import { Button } from '@/components/ui/Button';
import { useAuditLogs } from '../services/seller.queries';

const ActivityLogsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('');
  
  const { data, isLoading, refetch } = useAuditLogs();

  const columns = [
    { header: 'Action', accessorKey: 'action', cell: (row: any) => (
        <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${row.action.includes('DELETE') || row.action.includes('REMOVE') ? 'bg-danger/10 text-danger' : row.action.includes('CREATE') || row.action.includes('UPLOAD') ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>
          {row.action}
        </span>
      )
    },
    { header: 'Entity', accessorKey: 'entityType', cell: (row: any) => <span className="text-xs text-text-secondary">{row.entityType}</span> },
    { header: 'Entity ID', accessorKey: 'entityId', cell: (row: any) => <span className="font-mono text-[10px] text-text-secondary">{row.entityId || '-'}</span> },
    { header: 'User', accessorKey: 'userId', cell: (row: any) => <span className="text-sm font-bold text-text-primary">{row.userId?.name || 'System / Unknown'}</span> },
    { header: 'Details', accessorKey: 'details', cell: (row: any) => (
        <span className="text-[10px] text-text-secondary font-mono bg-background px-2 py-1 rounded border border-border block max-w-xs truncate">
          {JSON.stringify(row.details || {})}
        </span>
      ) 
    },
    { header: 'Timestamp', accessorKey: 'createdAt', cell: (row: any) => <span className="text-xs text-text-secondary whitespace-nowrap">{new Date(row.createdAt).toLocaleString()}</span> }
  ];

  const filteredData = data?.filter((log: any) => {
    if (filterAction && !log.action.includes(filterAction)) return false;
    if (search && !(log.userId?.name?.toLowerCase().includes(search.toLowerCase()) || log.entityType?.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  }) || [];

  return (
    <div className="space-y-6 text-left max-w-[1440px] mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Audit Logs</h1>
          <p className="text-sm text-text-secondary">Track all system events and user actions</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2"><RefreshCw size={14} /> Refresh</Button>
          <Button variant="outline" size="sm" className="gap-2"><Download size={14} /> Export Logs</Button>
        </div>
      </div>

      <div className="bg-warning/10 border border-warning/20 p-4 rounded-xl flex items-start gap-4">
        <ShieldAlert className="text-warning flex-shrink-0" size={24} />
        <div>
          <h3 className="font-bold text-text-primary text-sm">Security & Compliance Log</h3>
          <p className="text-xs text-text-secondary mt-1">Audit logs are immutable records of all read and write operations performed on your shop's data. These logs are maintained for compliance and security forensics.</p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex gap-4 w-full sm:w-auto flex-1">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
              <input 
                type="text" 
                placeholder="Search by User or Entity..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <select 
              value={filterAction} 
              onChange={(e) => setFilterAction(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none w-36"
            >
              <option value="">All Actions</option>
              <option value="UPDATE">Updates</option>
              <option value="CREATE">Creates</option>
              <option value="DELETE">Deletes</option>
            </select>
          </div>
        </div>

        <DataTable 
          columns={columns} 
          data={filteredData} 
          isLoading={isLoading} 
          exportFileName="audit-logs"
        />
      </div>
    </div>
  );
};

export default ActivityLogsPage;
