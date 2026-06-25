import React, { useState, useEffect } from 'react';
import { Settings, Moon, Sun, Monitor, Bell, Smartphone, Mail, Shield, Download, Trash2, MapPin, CreditCard, Ticket, Globe } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCustomerSettings, useUpdateSettings } from '@/hooks/queries';
import { useNotificationStore } from '@/store/notificationStore';

export const SettingsPage: React.FC = () => {
  const { addToast } = useNotificationStore();
  const { data: settingsData, isLoading } = useCustomerSettings();
  const updateMutation = useUpdateSettings();

  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    if (settingsData) setSettings(settingsData);
  }, [settingsData]);

  const handleChange = (section: string, key: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [section]: { ...prev[section], [key]: value }
    }));
  };

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync(settings);
      addToast({ title: 'Settings Saved', message: 'Your preferences have been updated.', type: 'success' });
    } catch (e) {
      addToast({ title: 'Error', message: 'Failed to save settings.', type: 'error' });
    }
  };

  const ThemeIcon = settings?.appearance?.theme === 'dark' ? Moon : settings?.appearance?.theme === 'light' ? Sun : Monitor;

  if (isLoading || !settings) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto w-full animate-pulse">
        <div className="h-12 w-64 bg-surface border border-border rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-surface border border-border rounded-xl" />
          <div className="h-64 bg-surface border border-border rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight flex items-center gap-3">
            <Settings size={28} className="text-accent" /> Preferences
          </h1>
          <p className="text-sm text-text-secondary mt-1">Manage your account settings, notifications, and privacy</p>
        </div>
        <Button onClick={handleSave} disabled={updateMutation.isPending} className="bg-accent text-white shadow-sm px-8">
          {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-border bg-background flex items-center gap-2">
            <ThemeIcon size={18} className="text-text-secondary" />
            <h2 className="font-bold text-text-primary">Appearance</h2>
          </div>
          <div className="p-5">
            <p className="text-xs text-text-secondary mb-3 font-bold uppercase tracking-wider">Theme Preference</p>
            <div className="grid grid-cols-3 gap-3">
              {['light', 'dark', 'system'].map(theme => (
                <button
                  key={theme}
                  onClick={() => handleChange('appearance', 'theme', theme)}
                  className={`py-2 rounded-lg text-sm font-bold capitalize border transition-colors ${
                    settings.appearance.theme === theme ? 'bg-accent/10 border-accent text-accent' : 'border-border text-text-secondary hover:border-text-primary'
                  }`}
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Language & Region */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-border bg-background flex items-center gap-2">
            <Globe size={18} className="text-text-secondary" />
            <h2 className="font-bold text-text-primary">Language & Region</h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-text-secondary mb-1.5 font-bold uppercase tracking-wider">Language</p>
                <select value={settings.region.language} onChange={e => handleChange('region', 'language', e.target.value)} className="w-full p-2 bg-background border border-border rounded-lg text-sm font-semibold focus:outline-none focus:border-accent">
                  <option value="en">English (US)</option>
                  <option value="hi">Hindi</option>
                  <option value="es">Spanish</option>
                </select>
              </div>
              <div>
                <p className="text-xs text-text-secondary mb-1.5 font-bold uppercase tracking-wider">Currency</p>
                <select value={settings.region.currency} onChange={e => handleChange('region', 'currency', e.target.value)} className="w-full p-2 bg-background border border-border rounded-lg text-sm font-semibold focus:outline-none focus:border-accent">
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm lg:row-span-2">
          <div className="px-5 py-4 border-b border-border bg-background flex items-center gap-2">
            <Bell size={18} className="text-text-secondary" />
            <h2 className="font-bold text-text-primary">Notifications</h2>
          </div>
          <div className="p-5 space-y-6">
            <div>
              <p className="text-xs text-text-secondary mb-3 font-bold uppercase tracking-wider">Delivery Methods</p>
              <div className="space-y-3">
                <ToggleRow label="Push Notifications" icon={<Smartphone size={14}/>} checked={settings.notifications.push} onChange={(v) => handleChange('notifications', 'push', v)} />
                <ToggleRow label="SMS Alerts" icon={<Bell size={14}/>} checked={settings.notifications.sms} onChange={(v) => handleChange('notifications', 'sms', v)} />
                <ToggleRow label="Email Notifications" icon={<Mail size={14}/>} checked={settings.notifications.email} onChange={(v) => handleChange('notifications', 'email', v)} />
              </div>
            </div>
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-text-secondary mb-3 font-bold uppercase tracking-wider">Alert Types</p>
              <div className="space-y-3">
                <ToggleRow label="Order Updates" description="Get notified about your order status" checked={settings.notifications.orderUpdates} onChange={(v) => handleChange('notifications', 'orderUpdates', v)} />
                <ToggleRow label="Promotions & Offers" description="Receive marketing and discount codes" checked={settings.notifications.promotional} onChange={(v) => handleChange('notifications', 'promotional', v)} />
                <ToggleRow label="Wallet & Rewards" description="Alerts for cashback and coin expiry" checked={settings.notifications.wallet} onChange={(v) => handleChange('notifications', 'wallet', v)} />
              </div>
            </div>
          </div>
        </div>

        {/* Shopping Preferences */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-border bg-background flex items-center gap-2">
            <Ticket size={18} className="text-text-secondary" />
            <h2 className="font-bold text-text-primary">Shopping Preferences</h2>
          </div>
          <div className="p-5 space-y-4">
            <ToggleRow label="Auto-apply Coupons" description="Always apply the best coupon at checkout" checked={settings.preferences.autoApplyCoupons} onChange={(v) => handleChange('preferences', 'autoApplyCoupons', v)} />
            
            <div className="pt-2">
              <p className="text-xs text-text-secondary mb-2 font-bold uppercase tracking-wider">Defaults</p>
              <div className="flex flex-col gap-2">
                <Button variant="outline" className="justify-start border-border text-sm h-10 hover:text-accent"><MapPin size={14} className="mr-2"/> Manage Default Address</Button>
                <Button variant="outline" className="justify-start border-border text-sm h-10 hover:text-accent"><CreditCard size={14} className="mr-2"/> Manage Default Payment</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy & Data */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-border bg-background flex items-center gap-2">
            <Shield size={18} className="text-text-secondary" />
            <h2 className="font-bold text-text-primary">Privacy & Data</h2>
          </div>
          <div className="p-5 space-y-5">
            <div className="space-y-3">
              <ToggleRow label="Personalized Recommendations" description="Allow us to use your browsing history" checked={settings.privacy.personalizedRecommendations} onChange={(v) => handleChange('privacy', 'personalizedRecommendations', v)} />
              <ToggleRow label="Marketing Preferences" description="Share data with third-party partners" checked={settings.privacy.marketingPreferences} onChange={(v) => handleChange('privacy', 'marketingPreferences', v)} />
            </div>
            <div className="pt-4 border-t border-border flex flex-col sm:flex-row gap-2">
              <Button variant="outline" className="flex-1 text-xs border-border"><Download size={14} className="mr-1.5"/> Download Data</Button>
              <Button variant="outline" className="flex-1 text-xs text-danger hover:bg-danger/10 border-danger/20 hover:border-danger/30"><Trash2 size={14} className="mr-1.5"/> Delete Account</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ToggleRow = ({ label, description, icon, checked, onChange }: any) => (
  <div className="flex items-center justify-between gap-4">
    <div className="flex items-center gap-2.5">
      {icon && <div className="text-text-secondary">{icon}</div>}
      <div>
        <p className="text-sm font-bold text-text-primary">{label}</p>
        {description && <p className="text-xs text-text-secondary mt-0.5 leading-tight">{description}</p>}
      </div>
    </div>
    <button 
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-accent' : 'bg-border'}`}
    >
      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  </div>
);

export default SettingsPage;
