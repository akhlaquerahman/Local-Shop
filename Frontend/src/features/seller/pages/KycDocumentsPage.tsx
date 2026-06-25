import React, { useState, useRef } from 'react';
import { FileCheck, ShieldAlert, Upload, X, Eye, RefreshCw, Plus } from 'lucide-react';
import { useNotificationStore } from '@/store/notificationStore';
import { Button } from '@/components/ui/Button';

export const KycDocumentsPage: React.FC = () => {
  const { addToast } = useNotificationStore();
  const [viewDoc, setViewDoc] = useState<string | null>(null);
  const [uploadDoc, setUploadDoc] = useState<string | null>(null);
  const [newDocName, setNewDocName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [docs, setDocs] = useState([
    { name: 'GSTIN Certificate', status: 'Verified', date: 'Jan 15, 2026' },
    { name: 'PAN Card (Business)', status: 'Verified', date: 'Jan 15, 2026' },
    { name: 'Cancelled Cheque', status: 'Pending Review', date: 'Feb 10, 2026' },
    { name: 'FSSAI License', status: 'Action Required', date: '-' },
  ]);

  const handleUploadSubmit = () => {
    const docName = uploadDoc === 'NEW' ? newDocName : uploadDoc;
    if (!docName || docName.trim() === '') {
      addToast({ title: 'Error', message: 'Document name is required.', type: 'error' });
      return;
    }
    
    if (!selectedFile) {
      addToast({ title: 'Error', message: 'Please select a file to upload.', type: 'error' });
      return;
    }

    setDocs(prev => {
      const existingIdx = prev.findIndex(d => d.name === docName);
      const newDocObj = { 
        name: docName, 
        status: 'Pending Review', 
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
      };
      
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = newDocObj;
        return updated;
      }
      return [...prev, newDocObj];
    });

    addToast({ title: 'Success', message: 'Document uploaded successfully. Pending verification.', type: 'success' });
    setUploadDoc(null);
    setNewDocName('');
    setSelectedFile(null);
  };

  const handleCloseUploadModal = () => {
    setUploadDoc(null);
    setNewDocName('');
    setSelectedFile(null);
  };

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">KYC Documents</h1>
          <p className="text-sm text-text-secondary">Manage your business registration and compliance files</p>
        </div>
        <Button onClick={() => setUploadDoc('NEW')} className="flex items-center gap-2"><Plus size={16}/> Add Document</Button>
      </div>

      {docs.some(d => d.status === 'Action Required') && (
        <div className="bg-danger/10 border border-danger/30 rounded-xl p-4 flex gap-3 items-center text-danger">
          <ShieldAlert size={24} />
          <div>
            <p className="font-bold text-sm">Missing Required Documents</p>
            <p className="text-xs opacity-90">Your store may be suspended if you do not upload the missing files.</p>
          </div>
        </div>
      )}

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-background border-b border-border text-xs uppercase text-text-secondary">
            <tr>
              <th className="px-6 py-4 font-bold">Document Type</th>
              <th className="px-6 py-4 font-bold">Status</th>
              <th className="px-6 py-4 font-bold">Last Updated</th>
              <th className="px-6 py-4 font-bold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {docs.map((doc, idx) => (
              <tr key={idx} className="hover:bg-background/50">
                <td className="px-6 py-4 font-bold text-text-primary flex items-center gap-3">
                  <FileCheck size={16} className="text-text-secondary"/> {doc.name}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    doc.status === 'Verified' ? 'bg-success/10 text-success' :
                    doc.status === 'Pending Review' ? 'bg-amber-500/10 text-amber-600' :
                    'bg-danger/10 text-danger'
                  }`}>{doc.status}</span>
                </td>
                <td className="px-6 py-4 text-text-secondary">{doc.date}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {doc.status === 'Verified' && (
                      <button onClick={() => setViewDoc(doc.name)} className="text-accent hover:bg-accent/10 p-2 rounded transition-colors" title="View Document">
                        <Eye size={16}/>
                      </button>
                    )}
                    <button 
                      onClick={() => setUploadDoc(doc.name)} 
                      className="text-primary hover:bg-primary/10 p-2 rounded transition-colors" 
                      title={doc.status === 'Verified' ? 'Re-upload / Update' : 'Upload Document'}
                    >
                      {doc.status === 'Verified' ? <RefreshCw size={16}/> : <Upload size={16}/>}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {viewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-4 border-b border-border">
              <h3 className="font-bold text-lg">{viewDoc} Preview</h3>
              <button onClick={() => setViewDoc(null)} className="p-2 hover:bg-background rounded-full transition-colors"><X size={20}/></button>
            </div>
            <div className="p-8 bg-background flex flex-col items-center justify-center min-h-[400px]">
              <FileCheck size={64} className="text-primary/40 mb-4" />
              <p className="text-text-secondary font-medium">Document preview available.</p>
              <div className="mt-8 border border-border w-full h-48 rounded flex items-center justify-center text-text-secondary/50 uppercase tracking-widest text-xs font-bold bg-surface">
                 [ PDF / Image Preview ]
              </div>
            </div>
          </div>
        </div>
      )}

      {uploadDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-4 border-b border-border">
              <h3 className="font-bold text-lg">{uploadDoc === 'NEW' ? 'Add New Document' : `Update ${uploadDoc}`}</h3>
              <button onClick={handleCloseUploadModal} className="p-2 hover:bg-background rounded-full transition-colors"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-6">
              {uploadDoc === 'NEW' && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-primary">Document Name</label>
                  <input 
                    type="text" 
                    value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                    placeholder="e.g. Trade License" 
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:border-primary focus:outline-none"
                    autoFocus
                  />
                </div>
              )}
              
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".svg,.png,.jpg,.jpeg,.pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
              />
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed transition-colors rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer ${selectedFile ? 'border-success bg-success/5' : 'border-border hover:border-primary bg-background/50'}`}
              >
                 {selectedFile ? (
                   <FileCheck size={32} className="text-success mb-3" />
                 ) : (
                   <Upload size={32} className="text-primary mb-3" />
                 )}
                 <p className={`font-bold text-sm ${selectedFile ? 'text-success' : 'text-text-primary'}`}>
                   {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
                 </p>
                 <p className="text-xs text-text-secondary mt-1">
                   {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'SVG, PNG, JPG or PDF (max. 5MB)'}
                 </p>
              </div>
              
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handleCloseUploadModal}>Cancel</Button>
                <Button onClick={handleUploadSubmit}>Submit Document</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default KycDocumentsPage;
