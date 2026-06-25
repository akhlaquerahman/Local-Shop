import React, { useEffect, useState } from 'react';
import { api as axios } from '@/lib/axios';
import { X, Save, Trash2, RotateCcw, Copy, History, Link as LinkIcon, Database } from 'lucide-react';
import Editor from '@monaco-editor/react';

const API_BASE = '/admin/database';

interface DocumentInspectorProps {
  collectionName: string;
  docId: string;
  onClose: () => void;
  onRefresh: () => void;
}

export const DocumentInspector: React.FC<DocumentInspectorProps> = ({ collectionName, docId, onClose, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'JSON' | 'Relationships' | 'Audit'>('JSON');
  const [documentContent, setDocumentContent] = useState<string>('');
  const [originalContent, setOriginalContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  useEffect(() => {
    fetchDocument();
  }, [docId]);

  const fetchDocument = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/document/${collectionName}/${docId}`);
      if (res.data.success) {
        const docStr = JSON.stringify(res.data.data, null, 2);
        setDocumentContent(docStr);
        setOriginalContent(docStr);
        setIsDeleted(!!res.data.data.isDeleted);
      }
    } catch (error) {
      console.error('Failed to load document', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const parsedData = JSON.parse(documentContent);
      setSaving(true);
      const res = await axios.put(`${API_BASE}/document/${collectionName}/${docId}`, parsedData);
      if (res.data.success) {
        setOriginalContent(documentContent);
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to save document', error);
      alert('Failed to save. Ensure JSON is valid and meets schema constraints.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to soft-delete this record?')) return;
    try {
      await axios.delete(`${API_BASE}/document/${collectionName}/${docId}`);
      onRefresh();
      onClose();
    } catch (error) {
      console.error('Failed to delete', error);
    }
  };

  const handleRestore = async () => {
    try {
      await axios.post(`${API_BASE}/restore/${collectionName}/${docId}`, {});
      onRefresh();
      fetchDocument();
    } catch (error) {
      console.error('Failed to restore', error);
    }
  };

  const hasChanges = documentContent !== originalContent;

  return (
    <div className="absolute inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
      <div className="w-[800px] bg-surface h-full shadow-2xl flex flex-col border-l border-border animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                Document Inspector
                {isDeleted && <span className="px-2 py-0.5 text-xs bg-red-500/10 text-red-500 rounded-full font-medium">Deleted</span>}
              </h2>
              <div className="flex items-center gap-2 text-xs text-text-tertiary font-mono mt-1">
                <span>{collectionName}</span>
                <span>•</span>
                <span>{docId}</span>
                <button className="hover:text-primary transition-colors" onClick={() => navigator.clipboard.writeText(docId)}>
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-hover rounded-lg transition-colors text-text-secondary">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-6 border-b border-border bg-surface-hover/30">
          {(['JSON', 'Relationships', 'Audit'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-text-secondary hover:text-text hover:border-border'
              }`}
            >
              <div className="flex items-center gap-2">
                {tab === 'JSON' && <Database className="w-4 h-4" />}
                {tab === 'Relationships' && <LinkIcon className="w-4 h-4" />}
                {tab === 'Audit' && <History className="w-4 h-4" />}
                {tab}
              </div>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">
          {loading ? (
            <div className="flex items-center justify-center h-full text-text-tertiary">Loading document...</div>
          ) : (
            <>
              {activeTab === 'JSON' && (
                <div className="h-full">
                  <Editor
                    height="100%"
                    defaultLanguage="json"
                    theme="vs-dark" // Assuming dark mode based on standard requirements
                    value={documentContent}
                    onChange={(val) => setDocumentContent(val || '')}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      wordWrap: 'on',
                      formatOnPaste: true,
                      padding: { top: 16 }
                    }}
                  />
                </div>
              )}
              {activeTab === 'Relationships' && (
                <div className="p-6 text-center text-text-secondary">
                  Relationship visualizer coming soon.
                </div>
              )}
              {activeTab === 'Audit' && (
                <div className="p-6 text-center text-text-secondary">
                  Audit history coming soon.
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-border bg-surface flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!isDeleted ? (
              <button 
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
              >
                <Trash2 className="w-4 h-4" /> Soft Delete
              </button>
            ) : (
              <button 
                onClick={handleRestore}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors border border-transparent hover:border-emerald-500/20"
              >
                <RotateCcw className="w-4 h-4" /> Restore Record
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            {hasChanges && (
              <button 
                onClick={() => setDocumentContent(originalContent)}
                className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text transition-colors"
              >
                Discard Changes
              </button>
            )}
            <button 
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className={`flex items-center gap-2 px-6 py-2 text-sm font-medium rounded-lg transition-all shadow-sm
                ${hasChanges 
                  ? 'bg-primary text-white hover:bg-primary-hover hover:shadow-md' 
                  : 'bg-surface-hover text-text-tertiary cursor-not-allowed'}`}
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DocumentInspector;
