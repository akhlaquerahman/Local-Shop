import React, { useState, useEffect } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNotificationStore } from '@/store/notificationStore';
import { useCreateAdminRole, useUpdateAdminRole } from '../../services/admin.agents.queries';

interface AdminRoleBuilderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  editingRole: any | null;
}

const PERMISSION_GROUPS = [
  {
    category: 'System Configuration',
    permissions: [
      { id: 'settings.manage', label: 'Manage Settings', desc: 'Can change core platform settings' },
      { id: 'audit.view', label: 'View Audit Logs', desc: 'Can view system and fraud logs' },
    ]
  },
  {
    category: 'User Management',
    permissions: [
      { id: 'users.view', label: 'View Users', desc: 'Can view sellers, customers, riders' },
      { id: 'users.manage', label: 'Manage Users', desc: 'Can suspend/activate users' },
    ]
  },
  {
    category: 'Catalog & Orders',
    permissions: [
      { id: 'products.view', label: 'View Products', desc: 'Can view all platform products' },
      { id: 'inventory.view', label: 'View Inventory', desc: 'Can view all stock levels' },
      { id: 'orders.view', label: 'View Orders', desc: 'Can view all orders and returns' },
    ]
  },
  {
    category: 'Finance & Payouts',
    permissions: [
      { id: 'payouts.manage', label: 'Manage Payouts', desc: 'Can view and process payouts' },
    ]
  },
  {
    category: 'Support & Operations',
    permissions: [
      { id: 'support.view', label: 'View Support', desc: 'Can view and resolve disputes/tickets' },
      { id: 'notifications.view', label: 'Manage Notifications', desc: 'Can send global announcements' },
      { id: 'reviews.view', label: 'Manage Reviews', desc: 'Can view and moderate reviews' },
    ]
  },
  {
    category: 'Marketing',
    permissions: [
      { id: 'coupons.view', label: 'View Coupons', desc: 'Can view marketing tools' },
    ]
  },
  {
    category: 'Analytics',
    permissions: [
      { id: 'analytics.view', label: 'View Analytics', desc: 'Can view platform analytics and reports' },
    ]
  }
];

const AdminRoleBuilderDrawer: React.FC<AdminRoleBuilderDrawerProps> = ({ isOpen, onClose, editingRole }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const { addToast } = useNotificationStore();
  const createMutation = useCreateAdminRole();
  const updateMutation = useUpdateAdminRole();

  useEffect(() => {
    if (isOpen) {
      if (editingRole) {
        setName(editingRole.name);
        setDescription(editingRole.description);
        setSelectedPermissions(editingRole.permissions || []);
      } else {
        setName('');
        setDescription('');
        setSelectedPermissions([]);
      }
    }
  }, [isOpen, editingRole]);

  const togglePermission = (permId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
    );
  };

  const toggleGroup = (perms: { id: string }[]) => {
    const permIds = perms.map(p => p.id);
    const allSelected = permIds.every(id => selectedPermissions.includes(id));
    
    if (allSelected) {
      setSelectedPermissions(prev => prev.filter(p => !permIds.includes(p)));
    } else {
      setSelectedPermissions(prev => Array.from(new Set([...prev, ...permIds])));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return addToast({ title: 'Error', message: 'Role name is required', type: 'error' });
    if (selectedPermissions.length === 0) return addToast({ title: 'Error', message: 'Select at least one permission', type: 'error' });

    try {
      const payload = { name, description, permissions: selectedPermissions };
      if (editingRole && editingRole._id) {
        await updateMutation.mutateAsync({ id: editingRole._id, data: payload });
        addToast({ title: 'Success', message: 'Role updated successfully', type: 'success' });
      } else {
        await createMutation.mutateAsync(payload);
        addToast({ title: 'Success', message: 'Role created successfully', type: 'success' });
      }
      onClose();
    } catch (err: any) {
      addToast({ title: 'Error', message: err.response?.data?.message || err.message || 'Failed to save role', type: 'error' });
    }
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      <div 
        className={`fixed inset-y-0 right-0 w-full max-w-2xl bg-surface shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border bg-background">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">
                {editingRole ? (editingRole._id ? 'Edit Role' : 'Clone Role') : 'Create Role'}
              </h2>
              <p className="text-xs text-text-secondary">Define permissions and access boundaries</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-border/50 rounded-full transition-colors text-text-secondary hover:text-text-primary">
            <X size={20} />
          </button>
        </div>

        <form id="role-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8 custom-scrollbar">
          
          <div className="space-y-4">
            <h3 className="text-sm font-bold border-b border-border pb-2">Role Identity</h3>
            <div className="grid gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Role Name *</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={editingRole?.isSystem && !!editingRole._id}
                  placeholder="e.g. Finance Controller"
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={editingRole?.isSystem && !!editingRole._id}
                  placeholder="Briefly describe what this role does..."
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 min-h-[80px]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-sm font-bold">Permission Matrix</h3>
              <div className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                {selectedPermissions.length} Enabled
              </div>
            </div>
            
            <div className="grid gap-6">
              {PERMISSION_GROUPS.map((group, idx) => {
                const groupPerms = group.permissions.map(p => p.id);
                const allSelected = groupPerms.every(id => selectedPermissions.includes(id));

                return (
                  <div key={idx} className="bg-background border border-border rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between p-3 bg-surface border-b border-border">
                      <div className="font-semibold text-sm text-text-primary">{group.category}</div>
                      <button 
                        type="button" 
                        onClick={() => toggleGroup(group.permissions)}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        {allSelected ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3">
                      {group.permissions.map((perm) => (
                        <label 
                          key={perm.id} 
                          className={`flex items-start gap-3 p-2 rounded cursor-pointer transition-colors border ${
                            selectedPermissions.includes(perm.id) ? 'bg-primary/5 border-primary/30' : 'border-transparent hover:bg-surface'
                          }`}
                        >
                          <input 
                            type="checkbox" 
                            className="mt-1 flex-shrink-0 cursor-pointer accent-primary"
                            checked={selectedPermissions.includes(perm.id)}
                            onChange={() => togglePermission(perm.id)}
                          />
                          <div>
                            <div className={`text-sm font-semibold ${selectedPermissions.includes(perm.id) ? 'text-primary' : 'text-text-primary'}`}>
                              {perm.label}
                            </div>
                            <div className="text-[10px] text-text-secondary leading-tight mt-0.5">
                              {perm.desc}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-border bg-surface flex justify-end gap-3 z-10">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="role-form" isLoading={createMutation.isPending || updateMutation.isPending}>
            {editingRole && editingRole._id ? 'Update Role' : 'Create Role'}
          </Button>
        </div>
      </div>
    </>
  );
};

export default AdminRoleBuilderDrawer;
