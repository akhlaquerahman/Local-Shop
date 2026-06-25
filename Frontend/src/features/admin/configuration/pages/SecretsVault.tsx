import React, { useEffect, useState } from 'react';
import { api as axios } from '@/lib/axios';
import { Eye, EyeOff, Plus, Trash2, Key, Shield, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function SecretsVault() {
  const [secrets, setSecrets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState<Record<string, string>>({});
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    key: '',
    value: '',
    provider: '',
    description: '',
    category: 'SECRETS',
    isSecret: true
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSecrets();
  }, []);

  const fetchSecrets = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/admin/configuration?category=SECRETS');
      if (res.data.success) {
        setSecrets(res.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReveal = async (id: string) => {
    if (revealed[id]) {
      const updated = { ...revealed };
      delete updated[id];
      setRevealed(updated);
      return;
    }

    try {
      const res = await axios.post(`/admin/configuration/${id}/reveal`);
      if (res.data.success) {
        setRevealed({ ...revealed, [id]: res.data.data });
      }
    } catch (error) {
      console.error('Failed to reveal secret', error);
      alert('Failed to reveal secret. You may need to re-authenticate.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this secret? This might break application functionality.')) return;
    try {
      const res = await axios.delete(`/admin/configuration/${id}`);
      if (res.data.success) {
        fetchSecrets();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.post('/admin/configuration', formData);
      if (res.data.success) {
        setIsModalOpen(false);
        setFormData({ key: '', value: '', provider: '', description: '', category: 'SECRETS', isSecret: true });
        fetchSecrets();
      }
    } catch (error) {
      console.error(error);
      alert('Failed to save secret');
    } finally {
      setSaving(false);
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
            <Shield className="w-6 h-6 text-primary" />
            Enterprise Secrets Vault
          </h1>
          <p className="text-text-secondary mt-1">Securely manage API keys, tokens, and passwords.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Secret
        </button>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-background/50 text-text-secondary text-sm">
            <tr>
              <th className="px-6 py-4 font-medium">Key Name</th>
              <th className="px-6 py-4 font-medium">Provider</th>
              <th className="px-6 py-4 font-medium">Value</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {secrets.map((secret) => (
              <tr key={secret._id} className="hover:bg-surface-hover transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-text">{secret.key}</div>
                  <div className="text-xs text-text-secondary">{secret.description}</div>
                </td>
                <td className="px-6 py-4 text-sm text-text-secondary">{secret.provider || 'System'}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="font-mono text-sm bg-background px-3 py-1.5 rounded-md border border-border">
                      {revealed[secret._id] ? revealed[secret._id] : secret.value}
                    </div>
                    <button 
                      onClick={() => handleReveal(secret._id)}
                      className="p-1.5 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                      title={revealed[secret._id] ? "Hide" : "Reveal"}
                    >
                      {revealed[secret._id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    secret.isActive ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                  }`}>
                    {secret.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleDelete(secret._id)}
                    className="p-2 text-text-secondary hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {secrets.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-text-secondary">
                  <Key className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  No secrets found. Add a new secret to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-xl border border-border w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-bold text-text">Add New Secret</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-surface-hover rounded-lg text-text-secondary">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-text mb-1">Key Name (e.g. OPENAI_API_KEY)</label>
                <input 
                  required
                  type="text" 
                  value={formData.key}
                  onChange={(e) => setFormData({...formData, key: e.target.value.toUpperCase()})}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary"
                  placeholder="STRIPE_SECRET_KEY"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Value</label>
                <input 
                  required
                  type="text" 
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary"
                  placeholder="sk_live_..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Provider (Optional)</label>
                <input 
                  type="text" 
                  value={formData.provider}
                  onChange={(e) => setFormData({...formData, provider: e.target.value})}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary"
                  placeholder="Stripe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:border-primary"
                  placeholder="Main production key"
                  rows={2}
                />
              </div>
              
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
                  {saving ? 'Saving...' : 'Save Secret'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
