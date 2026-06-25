import React, { useState } from 'react';
import { Plus, X, Shield, Users, UserCheck, Search, Download, Package, ShoppingBag, MessageSquare, AlertCircle, Eye, MoreVertical } from 'lucide-react';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { KPICard } from '@/components/ui/KPI';
import { DataTable } from '@/components/table';
import { Button } from '@/components/ui/Button';
import { useStaff, useCreateStaff, useUpdateStaff, useDeleteStaff } from '../services/seller.queries';
import { FormInput, FormSelect } from '@/components/form/FormFields';
import { useNotificationStore } from '@/store/notificationStore';
import { useAuthStore } from '@/store/authStore';
import { rolesService, StaffRole } from '../services/roles.service';

const staffSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  password: z.string().optional().or(z.literal('')),
  confirmPassword: z.string().optional().or(z.literal('')),
  age: z.coerce.number().min(18, 'Age must be at least 18'),
  gender: z.enum(['Male', 'Female', 'Other']),
  dateOfJoining: z.string().min(1, 'Date of joining is required'),
  roleId: z.string().min(1, 'Role is required'),
  status: z.enum(['ACTIVE', 'SUSPENDED']).default('ACTIVE')
}).refine(data => {
  if (data.password || data.confirmPassword) {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

type StaffFormValues = z.infer<typeof staffSchema>;

const StaffPage: React.FC = () => {
  const [roles, setRoles] = useState<StaffRole[]>([]);
  
  React.useEffect(() => {
    rolesService.getRoles().then(setRoles).catch(console.error);
  }, []);
  const [search, setSearch] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const { user } = useAuthStore();
  
  const { data, isLoading } = useStaff();
  const createMutation = useCreateStaff();
  const updateMutation = useUpdateStaff();
  const deleteMutation = useDeleteStaff();
  const { addToast } = useNotificationStore();

  const defaultValues = { 
    fullName: '', email: '', phone: '', password: '', confirmPassword: '', 
    age: 18, gender: 'Male', dateOfJoining: new Date().toISOString().split('T')[0], 
    roleId: '', status: 'ACTIVE' as any 
  };

  const methods = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema),
    defaultValues
  });

  const onSubmit = async (formData: StaffFormValues) => {
    try {
      const payload: any = { ...formData };
      if (!payload.password) {
        delete payload.password;
        delete payload.confirmPassword;
      }
      
      if (editingStaff) {
        await updateMutation.mutateAsync({ id: editingStaff._id, data: payload });
        addToast({ title: 'Success', message: 'Staff account updated', type: 'success' });
      } else {
        await createMutation.mutateAsync(payload);
        addToast({ title: 'Success', message: 'Staff account created', type: 'success' });
      }
      
      setIsDrawerOpen(false);
      methods.reset();
    } catch (err: any) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  const handleDeactivate = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await updateMutation.mutateAsync({ id, data: { status: newStatus } });
      addToast({ title: 'Success', message: `Staff ${newStatus.toLowerCase()}`, type: 'success' });
    } catch (err: any) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Remove this staff member? This will revoke all their access.')) {
      try {
        await deleteMutation.mutateAsync(id);
        addToast({ title: 'Success', message: 'Staff removed', type: 'success' });
      } catch (err: any) {
        addToast({ title: 'Error', message: err.message, type: 'error' });
      }
    }
  };

  const columns = [
    { header: 'Photo', accessorKey: 'photo', cell: (row: any) => (
        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center font-bold text-accent text-xs">
          {row.fullName.charAt(0)}
        </div>
      ) 
    },
    { header: 'Employee ID', accessorKey: 'employeeCode', cell: (row: any) => <span className="font-mono text-xs">{row.employeeCode}</span> },
    { header: 'Name', accessorKey: 'name', cell: (row: any) => <p className="font-bold text-sm text-text-primary">{row.fullName}</p> },
    { header: 'Email', accessorKey: 'email', cell: (row: any) => <p className="text-xs text-text-secondary">{row.email}</p> },
    { header: 'Phone', accessorKey: 'phone', cell: (row: any) => <p className="text-xs text-text-secondary">{row.phone}</p> },
    { header: 'Role', accessorKey: 'role', cell: (row: any) => (
        <span className="font-semibold text-[10px] px-2 py-1 bg-surface border border-border rounded text-text-primary uppercase tracking-wider">
          {row.role.replace('_', ' ')}
        </span>
      )
    },
    { header: 'Status', accessorKey: 'status', cell: (row: any) => (
        <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${row.status === 'ACTIVE' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
          {row.status}
        </span>
      )
    },
    { header: 'Date Joined', accessorKey: 'dateOfJoining', cell: (row: any) => <span className="text-xs text-text-secondary">{row.dateOfJoining ? new Date(row.dateOfJoining).toLocaleDateString() : '-'}</span> },
    {
      header: 'Permissions',
      accessorKey: 'effectivePermissions',
      cell: (row: any) => (
        <span className="text-xs bg-surface border border-border px-2 py-1 rounded">
          {row.effectivePermissions?.length || row.permissions?.length || 0} Enabled
        </span>
      )
    },
    {
      header: 'Actions',
      accessorKey: '_id',
      cell: (row: any) => (
        <div className="flex items-center gap-1 justify-end">
          <Button size="sm" variant="ghost" onClick={() => {
            setEditingStaff(row);
            methods.reset({
              ...defaultValues,
              ...row,
              roleId: row.roleId || '',
              dateOfJoining: row.dateOfJoining ? new Date(row.dateOfJoining).toISOString().split('T')[0] : defaultValues.dateOfJoining,
              phone: row.phone,
              age: row.age || 18,
              gender: row.gender || 'Male',
              password: '',
              confirmPassword: ''
            });
            setIsDrawerOpen(true);
          }} className="text-primary hover:bg-primary/10 px-2">Edit</Button>
          {row.status === 'ACTIVE' || row.status === 'SUSPENDED' ? (
            <Button size="sm" variant="outline" onClick={() => handleDeactivate(row._id, row.status)} className={`text-xs px-2 py-1 h-auto ${row.status === 'ACTIVE' ? 'text-danger hover:bg-danger/10' : 'text-success hover:bg-success/10'}`}>
              {row.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
            </Button>
          ) : null}
          <Button size="sm" variant="ghost" onClick={() => handleDelete(row._id)} className="text-danger hover:bg-danger/10 px-2">Delete</Button>
        </div>
      )
    }
  ];

  const filteredData = data?.staff?.filter((s: any) => s.fullName?.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase()) || s.employeeCode?.toLowerCase().includes(search.toLowerCase())) || [];

  return (
    <div className="space-y-6 text-left max-w-[1440px] mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Staff Management</h1>
          <p className="text-sm text-text-secondary">Control access and roles for your team</p>
        </div>
        <Button onClick={() => { setEditingStaff(null); methods.reset(defaultValues); setIsDrawerOpen(true); }} icon={<Plus size={16} />}>Create Staff</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Total Staff" value={data?.stats?.total || 0} loading={isLoading} icon={<Users className="text-primary" />} />
        <KPICard title="Active Staff" value={data?.stats?.active || 0} loading={isLoading} icon={<UserCheck className="text-success" />} className="border-success/20" />
        <KPICard title="Suspended" value={filteredData.filter((s: any) => s.status === 'SUSPENDED').length} loading={isLoading} className="border-danger/20" />
        <div className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-surface/80" onClick={() => window.location.href = '/seller/staff/roles'}>
          <div>
            <p className="text-sm text-text-secondary font-bold hover:text-accent transition-colors">Roles Defined</p>
            <p className="text-2xl font-black text-text-primary mt-1">{roles.length}</p>
          </div>
          <Shield className="text-accent opacity-50" size={32} />
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
            <input 
              type="text" 
              placeholder="Search staff by name, ID or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <Button variant="outline" size="sm" className="gap-2"><Download size={14} /> Export</Button>
        </div>

        <DataTable 
          columns={columns} 
          data={filteredData.map((d: any) => ({ ...d, id: d._id }))} 
          isLoading={isLoading}
          exportFileName="staff-list"
          emptyState={
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">No Staff Members Yet</h3>
              <p className="text-sm text-text-secondary max-w-sm mb-6">
                Create staff accounts to securely grant access to specific parts of your seller portal.
              </p>
              <Button onClick={() => { setEditingStaff(null); methods.reset(defaultValues); setIsDrawerOpen(true); }} icon={<Plus size={16} />}>
                Create First Staff Member
              </Button>
            </div>
          }
        />
      </div>

      {/* CREATE STAFF DRAWER */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
          <div className="relative w-full max-w-2xl bg-surface h-full shadow-2xl animate-in slide-in-from-right overflow-y-auto flex flex-col">
            <div className="p-6 border-b border-border flex justify-between items-center sticky top-0 bg-surface z-10">
              <div>
                <h2 className="text-xl font-bold text-text-primary">{editingStaff ? 'Edit Staff Account' : 'Create Staff Account'}</h2>
                <p className="text-xs text-text-secondary mt-1">{editingStaff ? 'Update employee details' : 'Fill in the details to add a new employee.'}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsDrawerOpen(false)}><X size={20}/></Button>
            </div>
            
            <div className="flex-1 p-6">
              <FormProvider {...methods}>
                <form id="create-staff-form" onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
                  
                  {/* Read Only Meta */}
                  <div className="bg-background border border-border p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">Shop Name</p>
                      <p className="font-semibold text-sm">{user?.name}'s Shop</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">Employee Code</p>
                      <p className="font-mono font-bold text-sm text-accent">{editingStaff ? editingStaff.employeeCode : 'AUTO-GENERATED'}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-bold border-b border-border pb-2">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormInput name="fullName" label="Full Name" placeholder="e.g. Jane Smith" />
                      <FormInput name="email" label="Email Address" type="email" placeholder="jane@example.com" />
                      <FormInput name="phone" label="Phone Number" placeholder="+1 234 567 8900" />
                      <FormInput name="dateOfJoining" label="Date of Joining" type="date" />
                      <div className="grid grid-cols-2 gap-4">
                        <FormInput name="age" label="Age" type="number" />
                        <FormSelect name="gender" label="Gender" options={[
                          { label: 'Male', value: 'Male' },
                          { label: 'Female', value: 'Female' },
                          { label: 'Other', value: 'Other' }
                        ]} />
                      </div>
                      <FormSelect name="status" label="Status" options={[
                        { label: 'Active', value: 'ACTIVE' },
                        { label: 'Suspended', value: 'SUSPENDED' }
                      ]} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-bold border-b border-border pb-2">Security & Access</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormInput name="password" label="Password" type="password" placeholder={editingStaff ? 'Leave blank to keep same' : ''} />
                      <FormInput name="confirmPassword" label="Confirm Password" type="password" placeholder={editingStaff ? 'Leave blank to keep same' : ''} />
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-bold text-text-primary mb-3">Role Assignment</label>
                      <Controller
                        name="roleId"
                        control={methods.control}
                        render={({ field }) => (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {roles.map((r) => (
                              <div 
                                key={r._id}
                                onClick={() => field.onChange(r._id)}
                                className={`border rounded-lg p-3 cursor-pointer transition-all flex items-start gap-3 ${
                                  field.value === r._id 
                                  ? 'border-accent bg-accent/5 ring-1 ring-accent' 
                                  : 'border-border bg-background hover:bg-surface hover:border-border/80'
                                }`}
                              >
                                <div className={`p-2 rounded-md ${field.value === r._id ? 'bg-accent text-white' : 'bg-surface text-text-secondary'}`}>
                                  <Shield size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-0.5">
                                    <h4 className={`text-sm font-bold truncate ${field.value === r._id ? 'text-accent' : 'text-text-primary'}`}>{r.name}</h4>
                                    {r.isSystem && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-accent/10 text-accent border border-accent/20">SYSTEM</span>}
                                  </div>
                                  <p className="text-xs text-text-secondary line-clamp-1">{r.description || `${r.permissions.length} Enabled Permissions`}</p>
                                </div>
                              </div>
                            ))}
                            <div 
                              onClick={() => window.location.href = '/seller/staff/roles'}
                              className="border border-dashed border-border rounded-lg p-3 cursor-pointer transition-all flex items-center justify-center gap-2 hover:bg-surface text-text-secondary hover:text-accent"
                            >
                              <Plus size={16} />
                              <span className="text-sm font-bold">Create Custom Role</span>
                            </div>
                          </div>
                        )}
                      />
                      {methods.formState.errors.roleId && (
                        <p className="text-xs text-danger mt-1">{methods.formState.errors.roleId.message as string}</p>
                      )}
                    </div>
                  </div>

                </form>
              </FormProvider>
            </div>
            
            <div className="p-6 border-t border-border bg-surface sticky bottom-0 flex justify-end gap-3 z-10">
              <div className="flex gap-4 w-full">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsDrawerOpen(false)}>Cancel</Button>
                <Button type="submit" form="create-staff-form" className="flex-1" isLoading={createMutation.isPending || updateMutation.isPending}>
                  {editingStaff ? 'Update Account' : 'Create Account'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StaffPage;
