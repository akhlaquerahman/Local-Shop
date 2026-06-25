import React, { useState, useEffect } from 'react';
import { X, Save, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNotificationStore } from '@/store/notificationStore';
import { StaffRole, rolesService } from '../../services/roles.service';

interface RoleBuilderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingRole: StaffRole | null;
}

const PERMISSION_GROUPS = [
  {
    category: 'Catalog & Inventory',
    permissions: [
      { id: 'products.view', label: 'View Products', desc: 'Can browse product catalog' },
      { id: 'products.create', label: 'Create Products', desc: 'Can add new products' },
      { id: 'products.edit', label: 'Edit Products', desc: 'Can modify existing products' },
      { id: 'products.delete', label: 'Delete Products', desc: 'Can remove products' },
      { id: 'inventory.view', label: 'View Inventory', desc: 'Can view stock levels' },
      { id: 'inventory.manage', label: 'Manage Inventory', desc: 'Can update stock counts' },
    ]
  },
  {
    category: 'Order Management',
    permissions: [
      { id: 'orders.view', label: 'View Orders', desc: 'Can view order details' },
      { id: 'orders.create', label: 'Create Orders', desc: 'Can create manual orders' },
      { id: 'orders.update', label: 'Update Orders', desc: 'Can change order status' },
      { id: 'orders.cancel', label: 'Cancel Orders', desc: 'Can cancel existing orders' },
    ]
  },
  {
    category: 'Logistics',
    permissions: [
      { id: 'deliveries.view', label: 'View Deliveries', desc: 'Can view delivery status' },
      { id: 'deliveries.update', label: 'Update Deliveries', desc: 'Can update delivery status' },
      { id: 'deliveries.proof', label: 'Delivery Proof', desc: 'Can view/upload proof of delivery' },
    ]
  },
  {
    category: 'Customers & Support',
    permissions: [
      { id: 'users.view', label: 'View Customers', desc: 'Can view customer profiles' },
      { id: 'reviews.view', label: 'View Reviews', desc: 'Can read customer reviews' },
      { id: 'reviews.reply', label: 'Reply to Reviews', desc: 'Can reply to reviews' },
      { id: 'support.view', label: 'View Support Tickets', desc: 'Can view support requests' },
      { id: 'support.reply', label: 'Reply Support Tickets', desc: 'Can reply to support tickets' },
    ]
  },
  {
    category: 'Marketing & Analytics',
    permissions: [
      { id: 'coupons.view', label: 'Manage Marketing', desc: 'Can create coupons & promos' },
      { id: 'analytics.view', label: 'View Analytics', desc: 'Can view dashboards & charts' },
      { id: 'reports.view', label: 'View Reports', desc: 'Can generate tabular reports' },
    ]
  },
  {
    category: 'Administration',
    permissions: [
      { id: 'payouts.view', label: 'View Payouts', desc: 'Can view financial payouts' },
      { id: 'shops.manage', label: 'Manage Shop Settings', desc: 'Can change critical settings' },
      { id: 'notifications.view', label: 'Manage Notifications', desc: 'Can manage shop notifications' },
    ]
  }
];

const RoleBuilderDrawer: React.FC<RoleBuilderDrawerProps> = ({ isOpen, onClose, onSuccess, editingRole }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useNotificationStore();

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

    setIsSubmitting(true);
    try {
      const payload = { name, description, permissions: selectedPermissions };
      if (editingRole && editingRole._id) {
        await rolesService.updateRole(editingRole._id, payload);
        addToast({ title: 'Success', message: 'Role updated successfully', type: 'success' });
      } else {
        await rolesService.createRole(payload);
        addToast({ title: 'Success', message: 'Role created successfully', type: 'success' });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      addToast({ title: 'Error', message: err.response?.data?.message || 'Failed to save role', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 w-full max-w-2xl bg-surface shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border bg-background">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-lg text-accent">
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

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8 custom-scrollbar">
          
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
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
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
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50 min-h-[80px]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-sm font-bold">Permission Matrix</h3>
              <div className="text-xs font-medium text-accent bg-accent/10 px-2 py-0.5 rounded">
                {selectedPermissions.length} Enabled
              </div>
            </div>
            
            <div className="grid gap-6">
              {PERMISSION_GROUPS.map((group, idx) => {
                const groupPerms = group.permissions.map(p => p.id);
                const allSelected = groupPerms.every(id => selectedPermissions.includes(id));
                const someSelected = groupPerms.some(id => selectedPermissions.includes(id));

                return (
                  <div key={idx} className="bg-background border border-border rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between p-3 bg-surface border-b border-border">
                      <div className="font-semibold text-sm text-text-primary">{group.category}</div>
                      <button 
                        type="button" 
                        onClick={() => toggleGroup(group.permissions)}
                        className="text-xs font-medium text-accent hover:underline"
                      >
                        {allSelected ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3">
                      {group.permissions.map((perm) => (
                        <label 
                          key={perm.id} 
                          className={`flex items-start gap-3 p-2 rounded cursor-pointer transition-colors border ${
                            selectedPermissions.includes(perm.id) ? 'bg-accent/5 border-accent/30' : 'border-transparent hover:bg-surface'
                          }`}
                        >
                          <input 
                            type="checkbox" 
                            className="mt-1 flex-shrink-0 cursor-pointer accent-accent"
                            checked={selectedPermissions.includes(perm.id)}
                            onChange={() => togglePermission(perm.id)}
                          />
                          <div>
                            <div className={`text-sm font-semibold ${selectedPermissions.includes(perm.id) ? 'text-accent' : 'text-text-primary'}`}>
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

        <div className="p-4 md:p-6 border-t border-border bg-background flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isSubmitting} className="bg-accent hover:bg-accent/90 text-white min-w-[120px] shadow-enterprise">
            {isSubmitting ? 'Saving...' : <><Save size={16} className="mr-2" /> Save Role</>}
          </Button>
        </div>
      </div>
    </>
  );
};

export default RoleBuilderDrawer;
