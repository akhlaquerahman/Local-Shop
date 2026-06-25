import React, { useState } from 'react';
import { useAdminFraudCases } from '../services/admin.queries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { AdminDataTable } from '@/components/table/AdminDataTable';
import { PaginationState, SortingState } from '@tanstack/react-table';
import { Button } from '@/components/ui/Button';
import { KPICard } from '@/components/ui/KPI';

export const FraudMonitoringPage: React.FC = () => {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post(`/v1/admin/fraud-cases`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-fraud-cases'] });
      setIsModalOpen(false);
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    createMutation.mutate({
      userId: formData.get('userId'),
      reason: formData.get('reason'),
      severity: formData.get('severity'),
      status: formData.get('status')
    });
  };

  const { data, isLoading } = useAdminFraudCases({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search,
    sortBy: sorting[0]?.id,
    sortOrder: sorting[0]?.desc ? 'desc' : 'asc'
  });

  const columns = [
    {
      header: 'Case ID',
      accessorKey: 'caseId',
      cell: (info: any) => <span className="font-mono text-sm font-bold text-brand-primary">{info.getValue()}</span>
    },
    {
      header: 'User / Shop',
      accessorKey: 'user',
      cell: (info: any) => <span className="font-semibold text-text-primary">{info.getValue()}</span>
    },
    {
      header: 'Fraud Type',
      accessorKey: 'fraudType',
    },
    {
      header: 'Risk Score',
      accessorKey: 'riskScore',
      cell: (info: any) => {
        const val = info.getValue();
        return (
          <span className={`font-mono font-bold ${val > 80 ? 'text-danger' : val > 50 ? 'text-warning' : 'text-success'}`}>
            {val}/100
          </span>
        );
      }
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (info: any) => {
        const val = info.getValue();
        return (
          <span className={`px-2 py-1 text-xs font-bold rounded-full ${val === 'OPEN' ? 'bg-danger/10 text-danger' : val === 'IN_REVIEW' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}`}>
            {val}
          </span>
        );
      }
    },
    {
      header: 'Investigator',
      accessorKey: 'investigator',
      cell: (info: any) => <span className="text-sm italic">{info.getValue()}</span>
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: () => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="h-8 text-xs px-2 py-1">Investigate</Button>
          <Button size="sm" variant="outline" className="h-8 text-xs px-2 py-1 text-danger border-danger/20 hover:bg-danger/10">Block</Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
            Fraud Monitoring & Risk <span className="text-text-secondary text-lg font-medium">({data?.meta?.total || 0})</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-primary hover:bg-primary/90 text-white" onClick={() => setIsModalOpen(true)}>New Case</Button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface border border-border rounded-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4">Create Fraud Case</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1">User / Shop ID or Email</label>
                <input name="userId" required className="w-full bg-background border border-border rounded px-3 py-2 text-text-primary" />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Fraud Type / Reason</label>
                <input name="reason" required className="w-full bg-background border border-border rounded px-3 py-2 text-text-primary" />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Severity / Risk Level</label>
                <select name="severity" className="w-full bg-background border border-border rounded px-3 py-2 text-text-primary">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Status</label>
                <select name="status" className="w-full bg-background border border-border rounded px-3 py-2 text-text-primary">
                  <option value="OPEN">Open</option>
                  <option value="IN_REVIEW">In Review</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setIsModalOpen(false)} type="button">Cancel</Button>
                <Button className="bg-primary hover:bg-primary/90 text-white" type="submit" disabled={createMutation.isPending}>Save</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Open Cases" value={data?.kpis?.openCases || 0} loading={isLoading} className="border-danger/20" />
        <KPICard title="High Risk Users" value={data?.kpis?.highRisk || 0} loading={isLoading} className="border-warning/20" />
        <KPICard title="Blocked Accounts" value={data?.kpis?.blockedAccounts || 0} loading={isLoading} />
        <KPICard title="Resolved Cases" value={data?.kpis?.resolvedCases || 0} loading={isLoading} className="border-success/20" />
      </div>

      <AdminDataTable
        columns={columns}
        data={data?.data || []}
        pageCount={data?.meta?.totalPages || -1}
        totalRecords={data?.meta?.total || 0}
        isLoading={isLoading}
        onPaginationChange={setPagination}
        onSortingChange={setSorting}
        onSearchChange={setSearch}
        initialState={{ pagination, sorting }}
      />
    </div>
  );
};
export default FraudMonitoringPage;
