import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Plus, Edit2, Copy, Trash2, Shield } from 'lucide-react';
import { useNotificationStore } from '@/store/notificationStore';
import { StaffRole, rolesService } from '../services/roles.service';
import RoleBuilderDrawer from '../components/roles/RoleBuilderDrawer';
import { DataTable } from '@/components/table';

const RoleManagementPage: React.FC = () => {
  const [roles, setRoles] = useState<StaffRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<StaffRole | null>(null);
  const { addToast } = useNotificationStore();

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const data = await rolesService.getRoles();
      // Map _id to id for DataTable
      const tableData = data.map(r => ({ ...r, id: r._id }));
      setRoles(tableData);
    } catch (err: any) {
      console.error('Fetch roles error:', err);
      addToast({ title: 'Error', message: err.response?.data?.message || 'Failed to fetch roles', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;
    try {
      await rolesService.deleteRole(id);
      addToast({ title: 'Success', message: 'Role deleted successfully', type: 'success' });
      fetchRoles();
    } catch (err: any) {
      addToast({ title: 'Error', message: err.response?.data?.message || 'Failed to delete role', type: 'error' });
    }
  };

  const handleEdit = (role: StaffRole) => {
    setEditingRole(role);
    setIsDrawerOpen(true);
  };

  const handleClone = (role: StaffRole) => {
    setEditingRole({ ...role, _id: '', name: `${role.name} (Copy)`, isSystem: false, staffCount: 0 });
    setIsDrawerOpen(true);
  };

  const columns = [
    {
      id: 'name',
      header: 'Role Name',
      accessorKey: 'name',
      cell: (row: any) => (
        <div>
          <div className="font-semibold text-text-primary flex items-center gap-2">
            <Shield size={14} className="text-accent" />
            {row.name}
          </div>
          {row.description && <div className="text-xs text-text-secondary mt-0.5">{row.description}</div>}
        </div>
      )
    },
    {
      id: 'isSystem',
      header: 'Type',
      accessorKey: 'isSystem',
      cell: (row: any) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${row.isSystem ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-surface border border-border text-text-secondary'}`}>
          {row.isSystem ? 'SYSTEM' : 'CUSTOM'}
        </span>
      )
    },
    {
      id: 'staffCount',
      header: 'Staff Count',
      accessorKey: 'staffCount',
      cell: (row: any) => (
        <div className="text-sm font-medium">{row.staffCount || 0} Staff</div>
      )
    },
    {
      id: 'permissions',
      header: 'Permissions',
      accessorKey: 'permissions',
      cell: (row: any) => (
        <div className="text-sm font-medium">{row.permissions?.length || 0} Enabled</div>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      accessorKey: '_id',
      cell: (row: any) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleEdit(row)} className="h-8 w-8 p-0" title="Edit Role">
            <Edit2 size={14} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleClone(row)} className="h-8 w-8 p-0" title="Clone Role">
            <Copy size={14} />
          </Button>
          {!row.isSystem && (
            <Button variant="ghost" size="sm" onClick={() => handleDelete(row._id)} className="h-8 w-8 p-0 text-danger hover:text-danger hover:bg-danger/10" title="Delete Role">
              <Trash2 size={14} />
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-20 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Role Management</h1>
          <p className="text-sm text-text-secondary mt-1">Manage staff roles and their specific access permissions.</p>
        </div>
        <Button onClick={() => { setEditingRole(null); setIsDrawerOpen(true); }} className="bg-accent hover:bg-accent/90 text-white gap-2 shadow-enterprise">
          <Plus size={16} />
          Create Custom Role
        </Button>
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-enterprise-sm overflow-hidden p-0">
        <DataTable
          columns={columns}
          data={roles}
          searchPlaceholder="Search roles..."
          searchKey="name"
          isLoading={isLoading}
        />
      </div>

      <RoleBuilderDrawer
        isOpen={isDrawerOpen}
        onClose={() => { setIsDrawerOpen(false); setEditingRole(null); }}
        onSuccess={fetchRoles}
        editingRole={editingRole}
      />
    </div>
  );
};

export default RoleManagementPage;
