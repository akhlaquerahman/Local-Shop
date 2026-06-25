import React, { useState } from 'react';
import { 
  useAdminProfile, 
  useUpdateAdminProfile, 
  useUpdateAdminSecurity, 
  useAdminSessions, 
  useDeleteAdminSession, 
  useAdminActivity, 
  useUpdateAdminPreferences 
} from '../services/admin.queries';
import { Button } from '@/components/ui/Button';
import { AdminDataTable } from '@/components/table/AdminDataTable';
import { PaginationState, SortingState } from '@tanstack/react-table';
import { useForm } from 'react-hook-form'; // Simulating react-hook-form
import { User, Shield, Key, History, Settings, Monitor, LogOut } from 'lucide-react';
import { useNotificationStore } from '@/store/notificationStore';

export const AdminProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const { data: profileResponse, isLoading: profileLoading } = useAdminProfile();
  const profile = profileResponse?.data;
  const updateProfile = useUpdateAdminProfile();
  const { addToast } = useNotificationStore();

  const handleProfileUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      phone: formData.get('phone'),
      designation: formData.get('designation'),
      department: formData.get('department'),
    };
    updateProfile.mutate(data, {
      onSuccess: () => addToast({ title: 'Success', message: 'Profile updated', type: 'success' }),
      onError: (err: any) => addToast({ title: 'Error', message: err.message, type: 'error' })
    });
  };

  const updateSecurity = useUpdateAdminSecurity();
  const handleSecurityUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const currentPassword = formData.get('currentPassword');
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');
    
    if (newPassword !== confirmPassword) {
      addToast({ title: 'Error', message: 'Passwords do not match', type: 'error' });
      return;
    }
    
    updateSecurity.mutate({ currentPassword, newPassword }, {
      onSuccess: () => {
        addToast({ title: 'Success', message: 'Password updated', type: 'success' });
        e.currentTarget.reset();
      },
      onError: (err: any) => addToast({ title: 'Error', message: err.message, type: 'error' })
    });
  };

  const toggle2FA = () => {
    updateSecurity.mutate({ twoFactorEnabled: !profile?.twoFactorEnabled }, {
      onSuccess: () => addToast({ title: 'Success', message: '2FA settings updated', type: 'success' })
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">My Profile</h1>
          <p className="text-sm text-text-secondary mt-1">Manage account information, security, sessions, and preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar */}
        <div className="col-span-1 space-y-6">
          <div className="p-6 rounded-xl bg-surface border border-border text-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-brand-primary/20 text-brand-primary flex items-center justify-center text-3xl font-bold mx-auto">
              {profile?.firstName?.charAt(0)}{profile?.lastName?.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">{profile?.firstName} {profile?.lastName}</h2>
              <p className="text-sm text-text-secondary">{profile?.email}</p>
            </div>
            <div className="inline-block px-3 py-1 bg-brand-primary/10 text-brand-primary font-bold text-xs rounded-full">
              {profile?.role}
            </div>
            <div className="text-xs text-text-secondary border-t border-border pt-4">
              Last Login: {profile?.lastLogin ? new Date(profile.lastLogin).toLocaleString() : '-'}
            </div>
          </div>

          <div className="p-6 rounded-xl bg-surface border border-border space-y-4">
            <h3 className="font-bold text-text-primary">Security Status</h3>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">Password</span>
              <span className="font-bold text-success">{profile?.passwordStrength || 'Unknown'}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">2FA Status</span>
              <span className="font-bold text-success">{profile?.twoFactorEnabled ? 'Enabled' : 'Disabled'}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">Score</span>
              <span className="font-bold text-brand-primary">{profile?.securityScore || 0}/100</span>
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="col-span-1 lg:col-span-3 space-y-6">
          {/* Tabs */}
          <div className="flex overflow-x-auto border-b border-border hide-scrollbar">
            {[
              { id: 'personal', label: 'Personal Info', icon: User },
              { id: 'security', label: 'Security', icon: Shield },
              { id: 'sessions', label: 'Sessions', icon: Monitor },
              { id: 'activity', label: 'Activity Log', icon: History },
              { id: 'preferences', label: 'Preferences', icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id ? 'border-brand-primary text-brand-primary' : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-surface border border-border rounded-xl p-6 min-h-[400px]">
            {activeTab === 'personal' && (
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <h3 className="text-lg font-bold text-text-primary mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-text-secondary">First Name</label>
                    <input type="text" name="firstName" className="w-full bg-background border border-border rounded-md px-3 py-2 text-text-primary" defaultValue={profile?.firstName} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-text-secondary">Last Name</label>
                    <input type="text" name="lastName" className="w-full bg-background border border-border rounded-md px-3 py-2 text-text-primary" defaultValue={profile?.lastName} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-text-secondary">Email</label>
                    <input type="email" name="email" className="w-full bg-background border border-border rounded-md px-3 py-2 text-text-primary opacity-70" defaultValue={profile?.email} disabled />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-text-secondary">Phone Number</label>
                    <input type="tel" name="phone" className="w-full bg-background border border-border rounded-md px-3 py-2 text-text-primary" defaultValue={profile?.phone} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-text-secondary">Designation</label>
                    <input type="text" name="designation" className="w-full bg-background border border-border rounded-md px-3 py-2 text-text-primary" defaultValue={profile?.designation} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-text-secondary">Department</label>
                    <input type="text" name="department" className="w-full bg-background border border-border rounded-md px-3 py-2 text-text-primary" defaultValue={profile?.department} />
                  </div>
                </div>
                <div className="flex gap-4 pt-4 border-t border-border">
                  <Button type="submit" className="bg-primary hover:bg-primary/90 text-white" disabled={updateProfile.isPending}>
                    {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            )}

            {activeTab === 'security' && (
              <div className="space-y-8">
                <form onSubmit={handleSecurityUpdate}>
                  <h3 className="text-lg font-bold text-text-primary mb-4">Change Password</h3>
                  <div className="grid grid-cols-1 max-w-md gap-4">
                    <input type="password" name="currentPassword" placeholder="Current Password" required className="w-full bg-background border border-border rounded-md px-3 py-2 text-text-primary" />
                    <input type="password" name="newPassword" placeholder="New Password" required minLength={8} className="w-full bg-background border border-border rounded-md px-3 py-2 text-text-primary" />
                    <input type="password" name="confirmPassword" placeholder="Confirm New Password" required minLength={8} className="w-full bg-background border border-border rounded-md px-3 py-2 text-text-primary" />
                    <Button type="submit" loading={updateSecurity.isPending} className="w-fit bg-primary hover:bg-primary/90 text-white">Update Password</Button>
                  </div>
                </form>
                
                <div className="border-t border-border pt-6">
                  <h3 className="text-lg font-bold text-text-primary mb-4">Two-Factor Authentication</h3>
                  <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg">
                    <div>
                      <p className="font-semibold text-text-primary">Authenticator App</p>
                      <p className="text-sm text-text-secondary">Protect your account with an extra layer of security.</p>
                    </div>
                    <Button onClick={toggle2FA} loading={updateSecurity.isPending} variant="outline" className={profile?.twoFactorEnabled ? 'text-danger border-danger/20 hover:bg-danger/10' : 'text-brand-primary border-brand-primary/20 hover:bg-brand-primary/10'}>
                      {profile?.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sessions' && <SessionsTab />}
            {activeTab === 'activity' && <ActivityTab />}
            
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-text-primary mb-4">Preferences & Notifications</h3>
                <div className="space-y-4">
                  {[
                    'Email Notifications on Login',
                    'Security Alerts (SMS)',
                    'Weekly Audit Reports',
                    'Dark Mode Default'
                  ].map((pref, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg max-w-xl">
                      <span className="font-semibold text-text-primary">{pref}</span>
                      <input type="checkbox" defaultChecked={i !== 3} className="w-5 h-5 accent-brand-primary" />
                    </div>
                  ))}
                  <Button className="mt-4 bg-primary hover:bg-primary/90 text-white">Save Preferences</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SessionsTab = () => {
  const { data, isLoading } = useAdminSessions();
  const deleteSession = useDeleteAdminSession();

  const columns = [
    { header: 'Device', accessorKey: 'device', cell: (info: any) => <span className="font-bold text-text-primary">{info.getValue()}</span> },
    { header: 'Browser', accessorKey: 'browser' },
    { header: 'IP Address', accessorKey: 'ip', cell: (info: any) => <span className="font-mono text-sm">{info.getValue()}</span> },
    { header: 'Location', accessorKey: 'location' },
    { 
      header: 'Status', 
      accessorKey: 'current', 
      cell: (info: any) => info.getValue() 
        ? <span className="px-2 py-1 bg-success/10 text-success text-xs font-bold rounded-full">Current Session</span>
        : <span className="px-2 py-1 bg-white/10 text-text-secondary text-xs font-bold rounded-full">Active</span>
    },
    { 
      header: 'Actions', 
      id: 'actions',
      cell: (info: any) => !info.row.original.current && (
        <Button size="sm" variant="outline" onClick={() => deleteSession.mutate(info.row.original.id)} className="h-8 text-xs px-2 py-1 text-danger border-danger/20 hover:bg-danger/10">
          Revoke
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-text-primary">Active Sessions</h3>
        <Button variant="outline" className="text-danger border-danger/20 hover:bg-danger/10 text-xs h-8">Logout All Other Devices</Button>
      </div>
      <AdminDataTable columns={columns} data={data?.data || []} totalRecords={data?.data?.length || 0} pageCount={1} isLoading={isLoading} />
    </div>
  );
};

const ActivityTab = () => {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const { data, isLoading } = useAdminActivity({ page: pagination.pageIndex + 1, limit: pagination.pageSize });

  const columns = [
    { header: 'Date', accessorKey: 'date', cell: (info: any) => <span className="font-mono text-sm">{new Date(info.getValue()).toLocaleString()}</span> },
    { header: 'Action', accessorKey: 'action', cell: (info: any) => <span className="font-bold text-text-primary">{info.getValue()}</span> },
    { header: 'Module', accessorKey: 'module' },
    { header: 'IP', accessorKey: 'ip', cell: (info: any) => <span className="font-mono text-sm">{info.getValue()}</span> },
    { 
      header: 'Status', 
      accessorKey: 'status', 
      cell: (info: any) => <span className="px-2 py-1 bg-success/10 text-success text-xs font-bold rounded-full">{info.getValue()}</span>
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-text-primary mb-4">Activity Log</h3>
      <AdminDataTable 
        columns={columns} 
        data={data?.data || []} 
        totalRecords={data?.meta?.total || 0} 
        pageCount={data?.meta?.totalPages || 1} 
        isLoading={isLoading} 
        onPaginationChange={setPagination}
        initialState={{ pagination }}
      />
    </div>
  );
};

export default AdminProfilePage;
