import React, { useState } from 'react';
import { useRiderSecurity } from '../services/rider.queries';
import { Shield, Key, Smartphone, Loader2, LogOut, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNotificationStore } from '@/store/notificationStore';
import { useChangePassword } from '@/hooks/queries';

export const SecurityPage: React.FC = () => {
  const { data, isLoading } = useRiderSecurity();
  const sessions = data?.sessions || [];
  
  const { addToast } = useNotificationStore();
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

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto pb-20">
      <div>
        <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Security & Login</h1>
        <p className="text-sm text-text-secondary">Keep your delivery partner account secure</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          
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

          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-text-primary flex items-center gap-2 mb-4"><Shield size={16}/> 2-Factor Auth</h3>
            <p className="text-xs text-text-secondary mb-4 leading-relaxed">Add an extra layer of security to your account.</p>
            <div className="flex items-center gap-2 text-xs font-bold text-success mb-4 bg-success/10 p-2 rounded border border-success/20">
              <CheckCircle2 size={14}/> Enabled via SMS
            </div>
            <Button variant="outline" className="w-full justify-center text-error border-error/30 hover:bg-error/5">Disable 2FA</Button>
          </div>
        </div>

        <div className="md:col-span-2 bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center border-b border-border pb-4 mb-4">
            <h3 className="font-bold text-text-primary flex items-center gap-2"><Smartphone size={16}/> Active Sessions</h3>
            <Button size="sm" variant="outline" className="text-error border-error/30 hover:bg-error/5" icon={<LogOut size={12}/>}>Logout All</Button>
          </div>
          
          <div className="flex-1">
            {isLoading ? (
               <div className="flex justify-center items-center h-32"><Loader2 className="animate-spin text-accent" size={32}/></div>
            ) : sessions.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-32 text-text-secondary">
                 <p className="text-sm font-medium">No external sessions found.</p>
                 <p className="text-xs mt-1">You're only logged in on this device.</p>
               </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((s: any) => (
                  <div key={s._id} className="flex justify-between items-center p-4 bg-background border border-border rounded-lg">
                    <div>
                      <p className="font-bold text-sm text-text-primary">{s.device || 'Unknown Device'}</p>
                      <p className="text-xs text-text-secondary">{s.ipAddress || '0.0.0.0'} • {new Date(s.createdAt).toLocaleString()}</p>
                    </div>
                    <Button size="sm" variant="outline">Revoke</Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default SecurityPage;
