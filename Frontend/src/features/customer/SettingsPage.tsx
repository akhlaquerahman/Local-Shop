import React, { useState } from 'react';
import { Settings, Moon, Sun, Monitor, Bell, Smartphone, Mail, Tag, Wallet, MapPin, CreditCard, Ticket, Eye, BarChart2, MessageSquare, FileText, Shield, Info } from 'lucide-react';
import { useNotificationStore } from '@/store/notificationStore';

export const SettingsPage: React.FC = () => {
  const { addToast } = useNotificationStore();

  const [settings, setSettings] = useState({
    theme: 'system' as 'light' | 'dark' | 'system',
    notifications: {
      push: true,
      sms: true,
      email: false,
      promotions: true,
      wallet: true,
    },
    shopping: {
      defaultAddress: 'home',
      defaultPayment: 'upi',
      autoApplyCoupons: true,
    },
    privacy: {
      recommendations: true,
      analytics: true,
      marketing: false,
    }
  });

  const updateSetting = (category: keyof typeof settings, key: string, value: any) => {
    if (category === 'theme') {
      setSettings(prev => ({ ...prev, theme: value }));
      addToast({ title: 'Theme Updated', message: `Appearance set to ${value}.`, type: 'info' });
      return;
    }
    
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...(prev[category as keyof typeof prev] as object),
        [key]: value
      }
    }));
  };

  const Toggle = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${checked ? 'bg-accent' : 'bg-border'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
    </button>
  );

  return (
    <div className="space-y-6 text-left max-w-3xl mx-auto w-full pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight flex items-center gap-3">
          <Settings size={28} className="text-accent" /> App Settings
        </h1>
        <p className="text-sm text-text-secondary mt-1">Manage your app preferences and configurations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Appearance */}
          <div className="bg-surface border border-border rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-text-primary border-b border-border pb-3">Appearance</h3>
            <div className="grid grid-cols-3 gap-3">
              {(['light', 'dark', 'system'] as const).map(theme => (
                <button
                  key={theme}
                  onClick={() => updateSetting('theme', '', theme)}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                    settings.theme === theme ? 'border-accent bg-accent/5 text-accent' : 'border-border text-text-secondary hover:border-text-secondary/40 hover:bg-background'
                  }`}
                >
                  {theme === 'light' && <Sun size={20} className="mb-2" />}
                  {theme === 'dark' && <Moon size={20} className="mb-2" />}
                  {theme === 'system' && <Monitor size={20} className="mb-2" />}
                  <span className="text-[10px] font-bold uppercase tracking-wider">{theme}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-surface border border-border rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-text-primary border-b border-border pb-3">Notifications</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center"><Bell size={14} className="text-text-secondary" /></div>
                  <div>
                    <p className="text-sm font-bold text-text-primary">Push Notifications</p>
                    <p className="text-[10px] text-text-secondary mt-0.5">Alerts on your device</p>
                  </div>
                </div>
                <Toggle checked={settings.notifications.push} onChange={() => updateSetting('notifications', 'push', !settings.notifications.push)} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center"><Smartphone size={14} className="text-text-secondary" /></div>
                  <div>
                    <p className="text-sm font-bold text-text-primary">SMS Alerts</p>
                    <p className="text-[10px] text-text-secondary mt-0.5">Order tracking via SMS</p>
                  </div>
                </div>
                <Toggle checked={settings.notifications.sms} onChange={() => updateSetting('notifications', 'sms', !settings.notifications.sms)} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center"><Mail size={14} className="text-text-secondary" /></div>
                  <div>
                    <p className="text-sm font-bold text-text-primary">Email Updates</p>
                    <p className="text-[10px] text-text-secondary mt-0.5">Invoices and summaries</p>
                  </div>
                </div>
                <Toggle checked={settings.notifications.email} onChange={() => updateSetting('notifications', 'email', !settings.notifications.email)} />
              </div>

              <div className="h-px bg-border my-2" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center"><Tag size={14} className="text-text-secondary" /></div>
                  <div>
                    <p className="text-sm font-bold text-text-primary">Promotional Offers</p>
                  </div>
                </div>
                <Toggle checked={settings.notifications.promotions} onChange={() => updateSetting('notifications', 'promotions', !settings.notifications.promotions)} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center"><Wallet size={14} className="text-text-secondary" /></div>
                  <div>
                    <p className="text-sm font-bold text-text-primary">Wallet & Cashback</p>
                  </div>
                </div>
                <Toggle checked={settings.notifications.wallet} onChange={() => updateSetting('notifications', 'wallet', !settings.notifications.wallet)} />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Shopping Preferences */}
          <div className="bg-surface border border-border rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-text-primary border-b border-border pb-3">Shopping Preferences</h3>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5"><MapPin size={12} /> Default Address</label>
                <select
                  value={settings.shopping.defaultAddress}
                  onChange={e => updateSetting('shopping', 'defaultAddress', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-accent text-text-primary appearance-none"
                >
                  <option value="home">Home (Sector 62, Noida)</option>
                  <option value="work">Work (Sector 125, Noida)</option>
                  <option value="other">Mom's House (Indirapuram)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5"><CreditCard size={12} /> Default Payment</label>
                <select
                  value={settings.shopping.defaultPayment}
                  onChange={e => updateSetting('shopping', 'defaultPayment', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-accent text-text-primary appearance-none"
                >
                  <option value="upi">UPI (akhlesh@okicici)</option>
                  <option value="card">Visa ending in 4242</option>
                  <option value="wallet">Paytm Wallet</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <Ticket size={16} className="text-accent" />
                  <p className="text-sm font-bold text-text-primary">Auto-Apply Coupons</p>
                </div>
                <Toggle checked={settings.shopping.autoApplyCoupons} onChange={() => updateSetting('shopping', 'autoApplyCoupons', !settings.shopping.autoApplyCoupons)} />
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div className="bg-surface border border-border rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-text-primary border-b border-border pb-3">Privacy & Data</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center"><Eye size={14} className="text-text-secondary" /></div>
                  <div>
                    <p className="text-sm font-bold text-text-primary">Personalized Recommendations</p>
                  </div>
                </div>
                <Toggle checked={settings.privacy.recommendations} onChange={() => updateSetting('privacy', 'recommendations', !settings.privacy.recommendations)} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center"><BarChart2 size={14} className="text-text-secondary" /></div>
                  <div>
                    <p className="text-sm font-bold text-text-primary">Analytics Tracking</p>
                  </div>
                </div>
                <Toggle checked={settings.privacy.analytics} onChange={() => updateSetting('privacy', 'analytics', !settings.privacy.analytics)} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center"><MessageSquare size={14} className="text-text-secondary" /></div>
                  <div>
                    <p className="text-sm font-bold text-text-primary">Marketing Consent</p>
                  </div>
                </div>
                <Toggle checked={settings.privacy.marketing} onChange={() => updateSetting('privacy', 'marketing', !settings.privacy.marketing)} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Application Details */}
      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden mt-6">
        <div className="divide-y divide-border">
          <button className="w-full p-4 flex items-center justify-between hover:bg-background transition-colors">
            <div className="flex items-center gap-3">
              <FileText size={18} className="text-text-secondary" />
              <span className="font-semibold text-sm text-text-primary">Terms of Service</span>
            </div>
          </button>
          <button className="w-full p-4 flex items-center justify-between hover:bg-background transition-colors">
            <div className="flex items-center gap-3">
              <Shield size={18} className="text-text-secondary" />
              <span className="font-semibold text-sm text-text-primary">Privacy Policy</span>
            </div>
          </button>
          <div className="w-full p-4 flex items-center justify-between bg-background">
            <div className="flex items-center gap-3">
              <Info size={18} className="text-text-secondary" />
              <span className="font-semibold text-sm text-text-primary">App Version</span>
            </div>
            <span className="text-xs font-mono text-text-secondary font-bold">v2.4.1 (Build 4912)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
