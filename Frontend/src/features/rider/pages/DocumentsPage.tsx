import React from 'react';
import { useRiderDocuments } from '../services/rider.queries';
import { FileText, Upload, CheckCircle, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const DocumentsPage: React.FC = () => {
  const { data, isLoading } = useRiderDocuments();
  const documents = data || [];

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Documents</h1>
          <p className="text-sm text-text-secondary">Manage your compliance and verification files</p>
        </div>
        <Button variant="primary" icon={<Upload size={16}/>}>Upload Document</Button>
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-background text-text-secondary uppercase text-[10px] font-bold border-b border-border">
              <tr>
                <th className="px-6 py-4">Document Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Uploaded At</th>
                <th className="px-6 py-4">Expiry Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center"><Loader2 className="animate-spin text-accent mx-auto" size={32}/></td></tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-text-secondary">
                    <FileText size={32} className="mx-auto opacity-50 mb-3" />
                    <p>No documents uploaded yet.</p>
                  </td>
                </tr>
              ) : (
                documents.map((doc: any) => (
                  <tr key={doc._id} className="hover:bg-background/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-text-primary flex items-center gap-2">
                      <FileText size={16} className="text-text-secondary" /> {doc.documentType}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase flex items-center w-fit gap-1
                        ${doc.status === 'verified' ? 'bg-success/10 text-success' : 
                          doc.status === 'rejected' ? 'bg-error/10 text-error' : 
                          'bg-amber-500/10 text-amber-500'}`}
                      >
                        {doc.status === 'verified' && <CheckCircle size={10}/>}
                        {doc.status === 'rejected' && <AlertTriangle size={10}/>}
                        {doc.status === 'pending' && <Clock size={10}/>}
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">{new Date(doc.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-text-secondary">{doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : 'Lifetime'}</td>
                    <td className="px-6 py-4 text-right">
                      <Button size="sm" variant="outline">Preview</Button>
                    </td>
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
export default DocumentsPage;
