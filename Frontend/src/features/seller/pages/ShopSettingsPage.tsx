import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Store, Truck, Clock, Receipt, Bell, Shield, MapPin, Save, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormInput, FormSelect, FormSwitch } from '@/components/form/FormFields';
import { LocationPicker } from '@/components/maps/LocationPicker';
import { useSettings, useUpdateSettings } from '../services/seller.queries';
import { useNotificationStore } from '@/store/notificationStore';

const ShopSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const { data: settings, isLoading, refetch } = useSettings();
  const updateMutation = useUpdateSettings();
  const { addToast } = useNotificationStore();

  const methods = useForm({
    defaultValues: {
      name: '', description: '', logoUrl: '', eta: '',
      deliverySettings: { freeDeliveryThreshold: 500, deliveryRadiusKm: 5, selfPickupEnabled: true },
      taxSettings: { gstNumber: '', taxPercentage: 0, isTaxIncludedInPrice: true },
      operatingHours: { open: '08:00', close: '22:00' },
      location: {
        type: 'Point',
        coordinates: [],
        address: '',
        city: '',
        state: '',
        country: '',
        postalCode: ''
      }
    }
  });

  useEffect(() => {
    if (settings) {
      methods.reset({
        name: settings.name || '',
        description: settings.description || '',
        logoUrl: settings.logoUrl || '',
        eta: settings.eta || '',
        deliverySettings: settings.deliverySettings || { freeDeliveryThreshold: 500, deliveryRadiusKm: 5, selfPickupEnabled: true },
        taxSettings: settings.taxSettings || { gstNumber: '', taxPercentage: 0, isTaxIncludedInPrice: true },
        operatingHours: settings.operatingHours || { open: '08:00', close: '22:00' },
        location: settings.location || {
          type: 'Point',
          coordinates: [],
          address: '',
          city: '',
          state: '',
          country: '',
          postalCode: ''
        }
      });
    }
  }, [settings, methods]);

  const onSubmit = async (data: any) => {
    try {
      await updateMutation.mutateAsync(data);
      addToast({ title: 'Success', message: 'Settings saved successfully', type: 'success' });
    } catch (err: any) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  const tabs = [
    { id: 'profile', label: 'Store Profile', icon: <Store size={18} /> },
    { id: 'location', label: 'Store Location', icon: <MapPin size={18} /> },
    { id: 'delivery', label: 'Delivery & Pickup', icon: <Truck size={18} /> },
    { id: 'hours', label: 'Operating Hours', icon: <Clock size={18} /> },
    { id: 'tax', label: 'Tax & GST', icon: <Receipt size={18} /> }
  ];

  if (isLoading) return <div className="p-8 text-center animate-pulse">Loading settings...</div>;

  return (
    <div className="space-y-6 text-left max-w-[1200px] mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Shop Settings</h1>
          <p className="text-sm text-text-secondary">Manage your store's configuration and operations</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2"><RefreshCw size={14} /> Reset Changes</Button>
          <Button size="sm" onClick={methods.handleSubmit(onSubmit)} isLoading={updateMutation.isPending} className="gap-2"><Save size={14} /> Save Settings</Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 flex-shrink-0 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors ${activeTab === tab.id ? 'bg-primary/10 text-primary border border-primary/20' : 'text-text-secondary hover:bg-surface hover:text-text-primary'}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 bg-surface border border-border rounded-xl p-6 shadow-sm">
          <FormProvider {...methods}>
            <form id="settings-form" className="space-y-6">
              
              {activeTab === 'profile' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <h2 className="text-lg font-bold text-text-primary border-b border-border pb-4">Store Profile Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput name="name" label="Shop Name" placeholder="e.g. Fresh Mart" />
                    <FormInput name="eta" label="Delivery ETA String" placeholder="e.g. 15-20 Mins" />
                    <div className="md:col-span-2">
                      <FormInput name="description" label="Shop Description" placeholder="Brief description about your shop" />
                    </div>
                    <div className="md:col-span-2">
                      <FormInput name="logoUrl" label="Logo URL" placeholder="https://..." />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'location' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <h2 className="text-lg font-bold text-text-primary border-b border-border pb-4">Store Location</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <FormInput name="location.address" label="Street Address" placeholder="e.g. 123 Main St" />
                    <FormInput name="location.city" label="City" placeholder="e.g. New Delhi" />
                    <FormInput name="location.state" label="State" placeholder="e.g. Delhi" />
                    <FormInput name="location.postalCode" label="Postal Code" placeholder="e.g. 110001" />
                  </div>
                  <LocationPicker 
                    initialLat={methods.getValues('location.coordinates')?.[1]} 
                    initialLng={methods.getValues('location.coordinates')?.[0]} 
                    onLocationSelect={(data) => {
                      methods.setValue('location.coordinates', [data.lng, data.lat], { shouldDirty: true });
                      methods.setValue('location.address', data.address.fullAddress || '', { shouldDirty: true });
                      methods.setValue('location.city', data.address.city || '', { shouldDirty: true });
                      methods.setValue('location.state', data.address.state || '', { shouldDirty: true });
                      methods.setValue('location.postalCode', data.address.postalCode || '', { shouldDirty: true });
                      methods.setValue('location.country', data.address.country || 'India');
                      methods.setValue('location.type', 'Point');
                    }}
                  />
                </div>
              )}

              {activeTab === 'delivery' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <h2 className="text-lg font-bold text-text-primary border-b border-border pb-4">Delivery & Pickup Configuration</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput name="deliverySettings.freeDeliveryThreshold" label="Free Delivery Above (₹)" type="number" />
                    <FormInput name="deliverySettings.deliveryRadiusKm" label="Delivery Radius (Km)" type="number" />
                    <div className="md:col-span-2 border border-border p-4 rounded-lg bg-background/50 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-text-primary">Enable Self Pickup</p>
                        <p className="text-xs text-text-secondary mt-1">Allow customers to order online and pick up from store</p>
                      </div>
                      <FormSwitch name="deliverySettings.selfPickupEnabled" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'hours' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <h2 className="text-lg font-bold text-text-primary border-b border-border pb-4">Operating Hours</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput name="operatingHours.open" label="Opening Time" type="time" />
                    <FormInput name="operatingHours.close" label="Closing Time" type="time" />
                  </div>
                </div>
              )}

              {activeTab === 'tax' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <h2 className="text-lg font-bold text-text-primary border-b border-border pb-4">Tax & GST</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput name="taxSettings.gstNumber" label="GSTIN Number" placeholder="e.g. 22AAAAA0000A1Z5" />
                    <FormInput name="taxSettings.taxPercentage" label="Default Tax % (for generic products)" type="number" />
                    <div className="md:col-span-2 border border-border p-4 rounded-lg bg-background/50 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-text-primary">Prices Include Tax</p>
                        <p className="text-xs text-text-secondary mt-1">If enabled, tax will not be added on top of the product price at checkout</p>
                      </div>
                      <FormSwitch name="taxSettings.isTaxIncludedInPrice" />
                    </div>
                  </div>
                </div>
              )}

            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
};

export default ShopSettingsPage;
