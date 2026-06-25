import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminSupportTickets, useAssignTicket } from '../services/admin.support.queries';
import { useAdminAgents } from '../services/admin.agents.queries';
import { AdminDataTable } from '@/components/table/AdminDataTable';
import { PaginationState, SortingState } from '@tanstack/react-table';
import { Button } from '@/components/ui/Button';
import { KPICard } from '@/components/ui/KPI';

export const SupportTicketsPage: React.FC = () => {
  const navigate = useNavigate();
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');

  const { data: ticketsData, isLoading: isTicketsLoading } = useAdminSupportTickets();
  const { data: agentsData = [] } = useAdminAgents();
  const assignMutation = useAssignTicket();

  const handleAssign = (ticketId: string, agentId: string) => {
    if (!agentId) return;
    assignMutation.mutate({ id: ticketId, agentId });
  };

  const columns = [
    {
      header: 'Ticket ID',
      accessorKey: 'ticketNumber',
      cell: (info: any) => <span className="font-mono text-sm font-semibold">{info.getValue() || info.row.original._id?.slice(-6).toUpperCase()}</span>
    },
    {
      header: 'User Role',
      accessorKey: 'userRole',
      cell: (info: any) => <span className="uppercase text-xs font-semibold px-2 py-1 bg-surface border border-border rounded-md">{info.getValue() || 'CUSTOMER'}</span>
    },
    {
      header: 'Subject',
      accessorKey: 'subject',
      cell: (info: any) => <span className="font-medium text-text-primary whitespace-normal line-clamp-1 max-w-[200px]">{info.getValue()}</span>
    },
    {
      header: 'Priority',
      accessorKey: 'priority',
      cell: (info: any) => {
        const val = info.getValue()?.toUpperCase() || 'MEDIUM';
        return (
          <span className={`px-2 py-1 text-xs font-bold rounded-full ${val === 'HIGH' || val === 'URGENT' ? 'bg-danger/10 text-danger' : val === 'LOW' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
            {val}
          </span>
        );
      }
    },
    {
      header: 'Assigned Agent',
      accessorKey: 'assignedTo',
      cell: (info: any) => {
        const agent = info.getValue();
        return <span className="text-sm italic text-text-secondary">{agent ? agent.fullName : 'Unassigned'}</span>;
      }
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (info: any) => {
        const val = info.getValue()?.toUpperCase() || 'OPEN';
        return (
          <span className={`px-2 py-1 text-xs font-bold rounded-full ${val === 'CLOSED' || val === 'RESOLVED' ? 'bg-success/10 text-success' : val === 'OPEN' ? 'bg-danger/10 text-danger' : 'bg-brand-primary/10 text-brand-primary'}`}>
            {val}
          </span>
        );
      }
    },
    {
      header: 'Created At',
      accessorKey: 'createdAt',
      cell: (info: any) => new Date(info.getValue()).toLocaleString()
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: (info: any) => {
        const ticket = info.row.original;
        return (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-8 text-xs px-2 py-1" onClick={() => navigate(`/admin/support/${ticket._id}`)}>Open</Button>
            <select
              className="h-8 text-xs px-2 py-1 bg-surface border border-border rounded outline-none"
              value={ticket.assignedTo?._id || ''}
              onChange={(e) => handleAssign(ticket._id, e.target.value)}
              disabled={assignMutation.isPending}
            >
              <option value="">Assign...</option>
              {(agentsData.staff || []).map((agent: any) => (
                <option key={agent._id} value={agent._id}>{agent.fullName}</option>
              ))}
            </select>
          </div>
        );
      }
    }
  ];

  const totalRecords = ticketsData?.length || 0;
  const openCount = ticketsData?.filter((t: any) => t.status === 'Open').length || 0;
  const inProgressCount = ticketsData?.filter((t: any) => t.status === 'In Progress' || t.status === 'Pending').length || 0;
  const resolvedCount = ticketsData?.filter((t: any) => t.status === 'Resolved' || t.status === 'Closed').length || 0;

  return (
    <div className="space-y-6 max-w-full overflow-hidden animate-fade-in pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
            Support Tickets <span className="text-text-secondary text-lg font-medium">({totalRecords})</span>
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Open Tickets" value={openCount} loading={isTicketsLoading} className="border-danger/20" />
        <KPICard title="Pending Response" value={inProgressCount} loading={isTicketsLoading} className="border-warning/20" />
        <KPICard title="Resolved" value={resolvedCount} loading={isTicketsLoading} className="border-success/20" />
        <KPICard title="SLA Breaches" value={0} loading={isTicketsLoading} className="border-danger/40" />
      </div>

      <AdminDataTable
        columns={columns}
        data={ticketsData || []}
        pageCount={-1}
        totalRecords={totalRecords}
        isLoading={isTicketsLoading}
        onPaginationChange={setPagination}
        onSortingChange={setSorting}
        onSearchChange={setSearch}
        initialState={{ pagination, sorting }}
      />
    </div>
  );
};
export default SupportTicketsPage;
