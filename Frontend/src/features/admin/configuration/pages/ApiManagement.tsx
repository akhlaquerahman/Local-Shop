import React, { useEffect, useState } from 'react';
import { api as axios } from '@/lib/axios';
import { Database, Plus, RefreshCw, Trash2, CheckCircle, XCircle, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function ApiManagement() {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingId, setTestingId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<{
    _id?: string;
    providerName: string;
    baseUrl: string;
    authType: string;
    apiKey: string;
    status: string;
  }>({
    providerName: '',
    baseUrl: '',
    authType: 'API_KEY',
    apiKey: '',
    status: 'ACTIVE'
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/admin/configuration/integrations');
      if (res.data.success) {
        setIntegrations(res.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const testIntegration = async (id: string) => {
    setTestingId(id);
    try {
      const res = await axios.post('/admin/configuration/integrations/test', { id });
      if (res.data.success) {
        alert('Test successful: ' + res.data.message);
      } else {
        alert('Test failed.');
      }
    } catch (error) {
      console.error(error);
      alert('Test failed due to an error.');
    } finally {
      setTestingId(null);
    }
  };

  const openEditModal = (integration: any) => {
    setFormData({
      _id: integration._id,
      providerName: integration.providerName,
      baseUrl: integration.baseUrl,
      authType: integration.authType,
      apiKey: integration.apiKey || '', // Backend masks it as ********
      status: integration.status
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...formData };
      if (!payload.apiKey) {
        delete payload.apiKey; // Do not overwrite with empty string
      }
      
      const res = await axios.post('/admin/configuration/integrations', payload);
      if (res.data.success) {
        setIsModalOpen(false);
        setFormData({ providerName: '', baseUrl: '', authType: 'API_KEY', apiKey: '', status: 'ACTIVE' });
        fetchIntegrations();
      }
    } catch (error) {
      console.error(error);
      alert('Failed to save integration');
    } finally {
      setSaving(false);
    }
  };

  const handleReveal = async () => {
    if (!formData._id) return; // Can't reveal if it's a new integration
    try {
      const res = await axios.post(`/admin/configuration/integrations/${formData._id}/reveal`);
      if (res.data.success && res.data.data) {
        setFormData({ ...formData, apiKey: res.data.data });
      } else {
        alert(res.data.message || 'Failed to reveal API Key');
      }
    } catch (error: any) {
      console.error(error);
      alert(`Failed to reveal API Key: ${error?.response?.data?.message || error.message}`);
    }
  };

  if (loading) {
    return <div className="p-6"><Skeleton className="h-64 w-full rounded-xl" /></div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text flex items-center gap-2">
            <Database className="w-6 h-6 text-primary" />
            API Management Center
          </h1>
          <p className="text-text-secondary mt-1">Manage and test third-party integrations and webhooks.</p>
        </div>
        <button 
          onClick={() => {
            setFormData({ providerName: '', baseUrl: '', authType: 'API_KEY', apiKey: '', status: 'ACTIVE' });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Integration
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <div key={integration._id} className="bg-surface border border-border rounded-xl p-6 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-text">{integration.providerName}</h3>
                <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full mt-2 ${
                  integration.status === 'ACTIVE' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                }`}>
                  {integration.status === 'ACTIVE' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  {integration.status}
                </span>
              </div>
              <button className="p-2 text-text-secondary hover:text-error hover:bg-error/10 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-2 mb-6 flex-1">
              <p className="text-sm text-text-secondary">
                <strong className="text-text">Base URL:</strong><br />
                <span className="break-all">{integration.baseUrl}</span>
              </p>
              <p className="text-sm text-text-secondary">
                <strong className="text-text">Auth Type:</strong> {integration.authType}
              </p>
              <p className="text-sm text-text-secondary">
                <strong className="text-text">API Key:</strong> {integration.apiKey || 'None'}
              </p>
            </div>

            <div className="mt-auto flex gap-3">
              <button 
                onClick={() => openEditModal(integration)}
                className="flex-1 px-4 py-2 border border-border text-text rounded-lg hover:bg-surface-hover transition-colors text-sm font-medium"
              >
                Edit Settings
              </button>
              <button 
                onClick={() => testIntegration(integration._id)}
                disabled={testingId === integration._id}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {testingId === integration._id ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  'Test Connection'
                )}
              </button>
            </div>
          </div>
        ))}
        {integrations.length === 0 && (
          <div className="col-span-full text-center py-12 text-text-secondary border border-dashed border-border rounded-xl">
            <Database className="w-12 h-12 mx-auto mb-3 opacity-20" />
            No integrations found. Add a provider to get started.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-xl border border-border w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-bold text-text">
                {formData._id ? 'Edit Integration' : 'Add New Integration'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-surface-hover rounded-lg text-text-secondary">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-text mb-1">Provider Name</label>
                <input 
                  required
                  type="text" 
                  value={formData.providerName}
                  onChange={(e) => setFormData({...formData, providerName: e.target.value})}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary"
                  placeholder="e.g. Gemini AI, SendGrid"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Base URL</label>
                <input 
                  required
                  type="url" 
                  value={formData.baseUrl}
                  onChange={(e) => setFormData({...formData, baseUrl: e.target.value})}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary"
                  placeholder="https://api.gemini.google.com/v1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Auth Type</label>
                <select 
                  value={formData.authType}
                  onChange={(e) => setFormData({...formData, authType: e.target.value})}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary"
                >
                  <option value="API_KEY">API Key</option>
                  <option value="BEARER_TOKEN">Bearer Token</option>
                  <option value="BASIC_AUTH">Basic Auth</option>
                  <option value="NONE">None</option>
                </select>
              </div>
              
              {formData.authType !== 'NONE' && (
                <div>
                  <label className="block text-sm font-medium text-text mb-1">API Key / Token</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={formData.apiKey}
                      onChange={(e) => setFormData({...formData, apiKey: e.target.value})}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 pr-20 text-text focus:outline-none focus:border-primary"
                      placeholder="Enter secret token..."
                    />
                    {formData._id && formData.apiKey === '********' && (
                      <button
                        type="button"
                        onClick={handleReveal}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-medium text-primary bg-primary/10 rounded hover:bg-primary/20 transition-colors"
                      >
                        Reveal
                      </button>
                    )}
                  </div>
                </div>
              )}
              
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-border text-text rounded-lg hover:bg-surface-hover transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Integration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
