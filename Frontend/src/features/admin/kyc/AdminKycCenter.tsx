import React, { useState } from 'react';
import { Eye, CheckCircle, XCircle, Search, Filter, AlertCircle, FileText, CheckCircle2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/table';
import { useAdminKyc, useAdminApproveKyc, useAdminRejectKyc, useAdminRequestReupload } from '@/services/kyc.queries';
import { useNotificationStore } from '@/store/notificationStore';

const AdminKycCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [actionType, setActionType] = useState<'REJECT' | 'REUPLOAD' | null>(null);
  const [reason, setReason] = useState('');

  const { data, isLoading } = useAdminKyc();
  const approveMutation = useAdminApproveKyc();
  const rejectMutation = useAdminRejectKyc();
  const reuploadMutation = useAdminRequestReupload();
  const { addToast } = useNotificationStore();

  const handleApprove = async (id: string) => {
    try {
      await approveMutation.mutateAsync(id);
      addToast({ title: 'Success', message: 'Document approved', type: 'success' });
      setSelectedDoc(null);
    } catch (err: any) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  const handleRejectOrReupload = async () => {
    if (!reason.trim()) {
      addToast({ title: 'Error', message: 'Reason is required', type: 'error' });
      return;
    }
    try {
      if (actionType === 'REJECT') {
        await rejectMutation.mutateAsync({ id: selectedDoc._id, reason });
      } else {
        await reuploadMutation.mutateAsync({ id: selectedDoc._id, reason });
      }
      addToast({ title: 'Success', message: `Document marked for ${actionType}`, type: 'success' });
      setSelectedDoc(null);
      setActionType(null);
      setReason('');
    } catch (err: any) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  const columns = [
    { header: 'USER', accessorKey: 'userId', cell: (row: any) => (
      <div>
        <p className="font-bold text-text-primary text-sm">{row.userId?.name || 'Unknown'}</p>
        <p className="text-xs text-text-secondary">{row.userId?.email}</p>
      </div>
    )},
    { header: 'TYPE', accessorKey: 'userType', cell: (row: any) => (
      <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${row.userType === 'SELLER' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>
        {row.userType}
      </span>
    )},
    { header: 'DOCUMENT', accessorKey: 'documentType', cell: (row: any) => (
      <div>
        <p className="font-bold text-text-primary text-sm">{row.documentType.replace('_', ' ')}</p>
        {row.documentNumber && <p className="text-xs text-text-secondary font-mono">{row.documentNumber}</p>}
      </div>
    )},
    { header: 'SUBMITTED', accessorKey: 'createdAt', cell: (row: any) => (
      <span className="text-sm text-text-secondary">{new Date(row.createdAt).toLocaleDateString()}</span>
    )},
    { header: 'STATUS', accessorKey: 'status', cell: (row: any) => {
      let badge = '';
      switch(row.status) {
        case 'APPROVED': badge = 'bg-success/10 text-success'; break;
        case 'PENDING': case 'UNDER_REVIEW': badge = 'bg-warning/10 text-warning'; break;
        case 'REJECTED': badge = 'bg-danger/10 text-danger'; break;
        case 'REUPLOAD_REQUIRED': badge = 'bg-accent/10 text-accent'; break;
      }
      return <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase ${badge}`}>{row.status.replace('_', ' ')}</span>;
    }},
    { header: 'ACTIONS', accessorKey: 'actions', cell: (row: any) => (
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={() => setSelectedDoc(row)}>View Details</Button>
      </div>
    )}
  ];

  const docs = data?.data || [];
  const stats = data?.stats || { total: 0, pending: 0, approved: 0, rejected: 0, reuploadRequired: 0 };

  const filteredDocs = docs.filter((d: any) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'SELLER' || activeTab === 'RIDER') return d.userType === activeTab;
    return d.status === activeTab;
  });

  return (
    <div className="space-y-6 text-left max-w-[1440px] mx-auto pb-20">
      <div>
        <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">KYC Verification Center</h1>
        <p className="text-sm text-text-secondary">Review and approve compliance documents for Sellers and Riders.</p>
      </div>

      {/* KPI Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-surface border border-border rounded-xl p-4 shadow-sm">
          <p className="text-xs font-bold text-text-secondary uppercase mb-1">Total Requests</p>
          <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 shadow-sm">
          <p className="text-xs font-bold text-warning uppercase mb-1">Pending Review</p>
          <p className="text-2xl font-bold text-warning">{stats.pending + stats.underReview}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 shadow-sm">
          <p className="text-xs font-bold text-success uppercase mb-1">Approved</p>
          <p className="text-2xl font-bold text-success">{stats.approved}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 shadow-sm">
          <p className="text-xs font-bold text-danger uppercase mb-1">Rejected</p>
          <p className="text-2xl font-bold text-danger">{stats.rejected}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 shadow-sm">
          <p className="text-xs font-bold text-accent uppercase mb-1">Re-upload Req.</p>
          <p className="text-2xl font-bold text-accent">{stats.reuploadRequired}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {['ALL', 'SELLER', 'RIDER', 'PENDING', 'APPROVED', 'REJECTED', 'REUPLOAD_REQUIRED'].map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === tab ? 'bg-text-primary text-white' : 'bg-surface border border-border text-text-secondary hover:bg-background/50'}`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-enterprise overflow-hidden">
        <DataTable columns={columns} data={filteredDocs} isLoading={isLoading} />
      </div>

      {/* View Document Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-surface border border-border rounded-xl w-full max-w-4xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-border bg-background shrink-0">
              <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <FileText size={20} />
                Document Review: {selectedDoc.documentType}
              </h2>
              <Button variant="ghost" size="sm" onClick={() => { setSelectedDoc(null); setActionType(null); }}><XCircle size={20} /></Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-6">
                <div className="bg-background border border-border rounded-xl p-4">
                  <h3 className="font-bold text-sm mb-3 border-b border-border pb-2">User Details</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-text-secondary">Name:</span> <span className="font-medium text-text-primary">{selectedDoc.userId?.name}</span></p>
                    <p><span className="text-text-secondary">Email:</span> <span className="font-medium text-text-primary">{selectedDoc.userId?.email}</span></p>
                    <p><span className="text-text-secondary">Type:</span> <span className="font-medium text-text-primary">{selectedDoc.userType}</span></p>
                    {selectedDoc.shopId && <p><span className="text-text-secondary">Shop:</span> <span className="font-medium text-text-primary">{selectedDoc.shopId?.name}</span></p>}
                  </div>
                </div>

                <div className="bg-background border border-border rounded-xl p-4">
                  <h3 className="font-bold text-sm mb-3 border-b border-border pb-2">Document Details</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-text-secondary">Type:</span> <span className="font-medium text-text-primary">{selectedDoc.documentType}</span></p>
                    {selectedDoc.documentNumber && <p><span className="text-text-secondary">Number:</span> <span className="font-mono text-text-primary">{selectedDoc.documentNumber}</span></p>}
                    <p><span className="text-text-secondary">Submitted:</span> <span className="font-medium text-text-primary">{new Date(selectedDoc.createdAt).toLocaleString()}</span></p>
                    <p>
                      <span className="text-text-secondary">Status:</span> 
                      <span className="font-bold ml-1 px-2 py-0.5 rounded text-[10px] bg-warning/10 text-warning">{selectedDoc.status}</span>
                    </p>
                  </div>
                </div>

                {(selectedDoc.status === 'PENDING' || selectedDoc.status === 'UNDER_REVIEW') && !actionType && (
                  <div className="flex flex-col gap-3">
                    <Button onClick={() => handleApprove(selectedDoc._id)} className="w-full bg-success hover:bg-success-hover text-white" isLoading={approveMutation.isPending}>
                      <CheckCircle2 size={16} className="mr-2"/> Approve Document
                    </Button>
                    <Button onClick={() => setActionType('REUPLOAD')} className="w-full bg-accent hover:bg-accent-hover text-white">
                      <RotateCcw size={16} className="mr-2"/> Request Re-upload
                    </Button>
                    <Button onClick={() => setActionType('REJECT')} className="w-full bg-danger hover:bg-danger-hover text-white">
                      <AlertCircle size={16} className="mr-2"/> Reject Permanently
                    </Button>
                  </div>
                )}

                {actionType && (
                  <div className="bg-danger/5 border border-danger/20 rounded-xl p-4 space-y-3">
                    <h3 className="font-bold text-sm text-danger flex items-center gap-2">
                      <AlertCircle size={16}/> 
                      {actionType === 'REJECT' ? 'Reject Document' : 'Request Re-upload'}
                    </h3>
                    <textarea 
                      className="w-full p-2 bg-background border border-border rounded-lg text-sm" 
                      rows={3} 
                      placeholder="Enter mandatory reason..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => setActionType(null)}>Cancel</Button>
                      <Button size="sm" className={`flex-1 ${actionType === 'REJECT' ? 'bg-danger hover:bg-danger-hover text-white' : 'bg-accent hover:bg-accent-hover text-white'}`} onClick={handleRejectOrReupload} isLoading={rejectMutation.isPending || reuploadMutation.isPending}>
                        Confirm
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="md:col-span-2 space-y-4">
                {selectedDoc.frontImageUrl && (
                  <div className="bg-background border border-border rounded-xl p-2 text-center">
                    <p className="text-xs font-bold text-text-secondary uppercase mb-2">Front Image / Preview</p>
                    {selectedDoc.frontImageUrl.startsWith('data:image') || selectedDoc.frontImageUrl.match(/\.(jpeg|jpg|gif|png)$/) != null ? (
                      <img src={selectedDoc.frontImageUrl} alt="Front" className="max-w-full h-auto max-h-[400px] mx-auto rounded object-contain border border-border" />
                    ) : (
                       <iframe src={selectedDoc.frontImageUrl} className="w-full h-[400px] rounded border border-border"></iframe>
                    )}
                  </div>
                )}

                {selectedDoc.backImageUrl && (
                  <div className="bg-background border border-border rounded-xl p-2 text-center">
                    <p className="text-xs font-bold text-text-secondary uppercase mb-2">Back Image</p>
                    <img src={selectedDoc.backImageUrl} alt="Back" className="max-w-full h-auto max-h-[400px] mx-auto rounded object-contain border border-border" />
                  </div>
                )}

                {selectedDoc.pdfUrl && (
                  <div className="bg-background border border-border rounded-xl p-2 text-center flex flex-col items-center">
                    <p className="text-xs font-bold text-text-secondary uppercase mb-2">PDF Document</p>
                    {selectedDoc.pdfUrl.startsWith('data:application/pdf') ? (
                       <iframe src={selectedDoc.pdfUrl} className="w-full h-[400px] rounded border border-border"></iframe>
                    ) : (
                      <a href={selectedDoc.pdfUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">Download PDF</a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminKycCenter;
