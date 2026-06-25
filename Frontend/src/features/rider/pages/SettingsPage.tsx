import React from 'react';
import { useRiderSettings } from '../services/rider.queries';
import { Settings, Bell, Map, Moon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const SettingsPage: React.FC = () => {
  const { data, isLoading } = useRiderSettings();
  const preferences = data?.preferences || {};

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto pb-20">
      <div>
        <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">App Settings</h1>
        <p className="text-sm text-text-secondary">Customize your operational preferences</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-accent" size={40}/></div>
      ) : (
        <div className="max-w-3xl space-y-6">
          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-text-primary flex items-center gap-2 mb-6 border-b border-border pb-3">
              <Map size={18} className="text-accent"/> Delivery Preferences
            </h3>
            
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-sm text-text-primary">Auto-Accept Deliveries</p>
                  <p className="text-xs text-text-secondary mt-0.5">Automatically accept incoming requests within range.</p>
                </div>
                <div className="w-10 h-5 bg-border rounded-full relative cursor-pointer">
                  <div className="w-4 h-4 bg-background rounded-full absolute left-0.5 top-0.5"></div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex-1 pr-6">
                  <p className="font-bold text-sm text-text-primary">Preferred Delivery Radius</p>
                  <p className="text-xs text-text-secondary mt-0.5">Max distance for pickup locations from your current position.</p>
                </div>
                <select className="bg-background border border-border text-sm p-2 rounded-lg font-medium text-text-primary outline-none focus:border-primary">
                  <option>3 km</option>
                  <option>5 km</option>
                  <option>10 km</option>
                  <option>Any Distance</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-text-primary flex items-center gap-2 mb-6 border-b border-border pb-3">
              <Bell size={18} className="text-accent"/> Notifications
            </h3>
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-sm text-text-primary">Push Notifications</p>
                  <p className="text-xs text-text-secondary mt-0.5">Receive alerts for new delivery requests.</p>
                </div>
                <div className="w-10 h-5 bg-primary rounded-full relative cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-sm text-text-primary">SMS Alerts</p>
                  <p className="text-xs text-text-secondary mt-0.5">Get important updates via SMS.</p>
                </div>
                <div className="w-10 h-5 bg-primary rounded-full relative cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-text-primary flex items-center gap-2 mb-6 border-b border-border pb-3">
              <Settings size={18} className="text-accent"/> System
            </h3>
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <div className="flex-1 pr-6">
                  <p className="font-bold text-sm text-text-primary">Theme Appearance</p>
                  <p className="text-xs text-text-secondary mt-0.5">Choose your preferred UI theme.</p>
                </div>
                <select className="bg-background border border-border text-sm p-2 rounded-lg font-medium text-text-primary outline-none focus:border-primary">
                  <option>System Default</option>
                  <option>Light Mode</option>
                  <option>Dark Mode</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-2">
            <Button variant="primary">Save Preferences</Button>
          </div>
        </div>
      )}
    </div>
  );
};
export default SettingsPage;
