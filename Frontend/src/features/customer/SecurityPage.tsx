import React, { useState } from 'react';
import { Shield, Smartphone, Laptop, Globe, LogOut, Key, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNotificationStore } from '@/store/notificationStore';
import { useSecuritySessions, useDeleteSession, useDeleteAllSessions, useChangePassword } from '@/hooks/queries';

export const SecurityPage: React.FC = () => {
  const { addToast } = useNotificationStore();
  const { data: sessions, isLoading } = useSecuritySessions();
  const deleteSessionMutation = useDeleteSession();
  const deleteAllMutation = useDeleteAllSessions();
  const changePasswordMutation = useChangePassword();

  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      addToast({ title: 'Error', message: 'New passwords do not match', type: 'error' });
      return;
    }
    try {
      await changePasswordMutation.mutateAsync({ currentPassword: passwords.current, newPassword: passwords.new });
      addToast({ title: 'Success', message: 'Password updated successfully.', type: 'success' });
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      addToast({ title: 'Error', message: 'Failed to update password.', type: 'error' });
    }
  };

  const handleLogoutDevice = async (id: string) => {
    try {
      await deleteSessionMutation.mutateAsync(id);
      addToast({ title: 'Session Terminated', message: 'The device was logged out.', type: 'success' });
    } catch (err) {
      addToast({ title: 'Error', message: 'Failed to terminate session.', type: 'error' });
    }
  };

  const handleLogoutAll = async () => {
    if (!window.confirm('Logout from all other devices?')) return;
    try {
      await deleteAllMutation.mutateAsync();
      addToast({ title: 'Sessions Terminated', message: 'All other devices logged out.', type: 'success' });
    } catch (err) {
      addToast({ title: 'Error', message: 'Failed to terminate all sessions.', type: 'error' });
    }
  };

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight flex items-center gap-3">
            <Shield size={28} className="text-accent" /> Security Settings
          </h1>
          <p className="text-sm text-text-secondary mt-1">Manage your password, 2FA, and active sessions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Password & 2FA */}
        <div className="lg:col-span-1 space-y-6">
          {/* Password Change */}
          <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-border bg-background flex items-center gap-2">
              <Key size={16} className="text-text-secondary" />
              <h2 className="font-bold text-text-primary">Change Password</h2>
            </div>
            <form onSubmit={handlePasswordChange} className="p-5 space-y-4">
              <input type="password" placeholder="Current Password" required value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-accent focus:outline-none" />
              <input type="password" placeholder="New Password" required minLength={8} value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-accent focus:outline-none" />
              <input type="password" placeholder="Confirm New Password" required minLength={8} value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-accent focus:outline-none" />
              <Button type="submit" className="w-full bg-accent" disabled={changePasswordMutation.isPending}>
                {changePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </div>

          {/* 2FA */}
          <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-border bg-background flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone size={16} className="text-text-secondary" />
                <h2 className="font-bold text-text-primary">Two-Factor Auth</h2>
              </div>
              <span className="text-[10px] uppercase font-bold bg-danger/10 text-danger px-2 py-0.5 rounded tracking-wider">Disabled</span>
            </div>
            <div className="p-5">
              <p className="text-xs text-text-secondary mb-4">Add an extra layer of security to your account by enabling two-factor authentication.</p>
              <Button variant="outline" className="w-full border-accent text-accent hover:bg-accent/10">Enable 2FA</Button>
            </div>
          </div>
        </div>

        {/* Right Column: Sessions */}
        <div className="lg:col-span-2">
          <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm flex flex-col h-full">
            <div className="px-5 py-4 border-b border-border bg-background flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-text-secondary" />
                <h2 className="font-bold text-text-primary">Active Sessions</h2>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogoutAll} className="h-8 text-xs text-danger border-danger/30 hover:bg-danger/10">
                Log Out All Other Devices
              </Button>
            </div>
            
            <div className="divide-y divide-border flex-1">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-5 animate-pulse flex justify-between">
                    <div className="space-y-2"><div className="h-4 w-32 bg-border rounded"/><div className="h-3 w-48 bg-border rounded"/></div>
                  </div>
                ))
              ) : sessions?.length > 0 ? (
                sessions.map((session: any, index: number) => {
                  const isCurrent = index === 0; // Simulate first item as current
                  return (
                    <div key={session._id} className="p-5 flex items-center justify-between hover:bg-background/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-text-secondary">
                          {session.device.toLowerCase().includes('iphone') || session.device.toLowerCase().includes('mobile') ? <Smartphone size={18} /> : <Laptop size={18} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-text-primary">{session.device} • {session.browser}</p>
                            {isCurrent && <span className="text-[10px] font-bold bg-success/10 text-success px-1.5 py-0.5 rounded uppercase tracking-wider border border-success/20">Current</span>}
                          </div>
                          <p className="text-xs text-text-secondary mt-1">{session.location} • {session.ipAddress}</p>
                          <p className="text-[10px] text-text-secondary mt-1 font-medium">Last active: {new Date(session.lastActive).toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                      {!isCurrent && (
                        <Button variant="outline" size="sm" onClick={() => handleLogoutDevice(session._id)} className="h-8 w-8 p-0 text-text-secondary hover:text-danger hover:bg-danger/10 border-border rounded-full" title="Revoke Session">
                          <LogOut size={14} />
                        </Button>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-10 text-center text-text-secondary text-sm">No active sessions found.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityPage;
