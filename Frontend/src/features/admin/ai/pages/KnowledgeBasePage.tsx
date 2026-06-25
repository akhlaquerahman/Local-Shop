import React, { useState, useEffect } from 'react';
import { api as axios } from '@/lib/axios';
import { UploadCloud, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';

export const KnowledgeBasePage = () => {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    try {
      const res = await axios.get('/ai/knowledge');
      if (res.data.success) {
        setDocs(res.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('document', file);
    formData.append('title', file.name);
    formData.append('collection', 'Admin_Knowledge');

    try {
      const res = await axios.post('/ai/knowledge', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setFile(null);
        fetchDocs();
        alert('File uploaded successfully and indexing started.');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Knowledge Base</h1>
          <p className="text-text-secondary mt-1">Upload documents to expand the AI's internal RAG knowledge.</p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6">
        <form onSubmit={handleUpload} className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-8 hover:bg-surface-hover transition-colors">
          <UploadCloud className="w-12 h-12 text-primary mb-4" />
          <h3 className="text-lg font-medium text-text mb-2">Upload Document</h3>
          <p className="text-sm text-text-secondary mb-4 text-center max-w-md">
            Support PDF, TXT, DOCX, Markdown. Max 10MB.
          </p>
          <input 
            type="file" 
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="mb-4 text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
          />
          <button 
            type="submit" 
            disabled={!file || uploading}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50"
          >
            {uploading ? 'Processing...' : 'Upload & Index'}
          </button>
        </form>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-background/50 text-text-secondary text-sm">
            <tr>
              <th className="px-6 py-4 font-medium">Document</th>
              <th className="px-6 py-4 font-medium">Type</th>
              <th className="px-6 py-4 font-medium">Chunks</th>
              <th className="px-6 py-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
               <tr><td colSpan={4} className="p-4"><Skeleton className="h-10 w-full" /></td></tr>
            ) : docs.map((doc) => (
              <tr key={doc._id} className="hover:bg-surface-hover transition-colors">
                <td className="px-6 py-4 flex items-center gap-3">
                  <FileText className="w-5 h-5 text-text-secondary" />
                  <div>
                    <div className="font-medium text-text">{doc.title}</div>
                    <div className="text-xs text-text-secondary">{(doc.fileSize / 1024).toFixed(1)} KB</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-text-secondary">{doc.fileType}</td>
                <td className="px-6 py-4 text-sm text-text-secondary">{doc.chunkCount}</td>
                <td className="px-6 py-4">
                  {doc.status === 'INDEXED' && <span className="inline-flex items-center gap-1 text-xs text-success bg-success/10 px-2 py-1 rounded-full"><CheckCircle className="w-3 h-3" /> Indexed</span>}
                  {doc.status === 'PROCESSING' && <span className="inline-flex items-center gap-1 text-xs text-warning bg-warning/10 px-2 py-1 rounded-full"><Clock className="w-3 h-3" /> Processing</span>}
                  {doc.status === 'FAILED' && <span className="inline-flex items-center gap-1 text-xs text-error bg-error/10 px-2 py-1 rounded-full"><XCircle className="w-3 h-3" /> Failed</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
