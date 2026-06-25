import React, { useState, useEffect, useRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { User, Building, MapPin, Save, Edit2, ShieldCheck, CheckCircle2, Star, ShoppingBag, Clock, Phone, Mail, Store } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FormInput } from '@/components/form/FormFields';
import { useProfile, useUpdateProfile, useShopLocation } from '../services/seller.queries';
import { useNotificationStore } from '@/store/notificationStore';
import { ShopLocationModal } from '../components/ShopLocationModal';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuthStore } from '@/store/authStore';
import StaffProfilePage from './StaffProfilePage';

const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const { data, isLoading } = useProfile();
  const updateMutation = useUpdateProfile();
  const { addToast } = useNotificationStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (user?.isStaff) {
    return <StaffProfilePage />;
  }

  const [isEditing, setIsEditing] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const { data: locationData } = useShopLocation();
  const shopLocation = locationData || data?.shop?.location;

  const methods = useForm({
    defaultValues: {
      businessName: '', 
      description: '',
      gstin: '', 
      address: { street: '', city: '', state: '', pincode: '' }
    }
  });

  useEffect(() => {
    if (data?.shop && !isEditing) {
      methods.reset({
        businessName: data.shop.name || '',
        description: data.shop.description || '',
        gstin: data.shop.taxSettings?.gstNumber || '',
        address: {
          street: data.shop.address?.street || '',
          city: data.shop.address?.city || '',
          state: data.shop.address?.state || '',
          pincode: data.shop.address?.pincode || ''
        }
      });
    }
  }, [data, methods, isEditing]);

  const handleSave = async (formData: any) => {
    try {
      await updateMutation.mutateAsync({ name: formData.businessName, description: formData.description, address: formData.address, 'taxSettings.gstNumber': formData.gstin });
      addToast({ title: 'Success', message: 'Business Profile updated successfully', type: 'success' });
      setIsEditing(false);
    } catch (err: any) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        try {
          const base64String = reader.result as string;
          await updateMutation.mutateAsync({ avatarUrl: base64String, logoUrl: base64String });
          addToast({ title: 'Success', message: 'Avatar updated successfully', type: 'success' });
        } catch (err: any) {
          addToast({ title: 'Error', message: err.message || 'Failed to update avatar', type: 'error' });
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto w-full animate-pulse">
        <div className="h-24 bg-surface border border-border rounded-xl" />
        <div className="h-24 bg-surface border border-border rounded-xl" />
        <div className="h-64 bg-surface border border-border rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto w-full pb-20">
      
      {/* Header Profile Card */}
      <div className="bg-surface border border-border rounded-xl p-5 shadow-sm flex flex-col sm:flex-row items-center gap-5">
        <div className="relative group">
          <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center border-2 border-accent text-accent overflow-hidden">
            {data?.user?.avatarUrl ? (
              <img src={data.user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User size={32} />
            )}
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 w-7 h-7 bg-background border border-border rounded-full flex items-center justify-center text-text-secondary hover:text-accent shadow-sm transition-colors"
          >
            <Edit2 size={12} />
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
        </div>
        
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl font-extrabold text-text-primary flex items-center justify-center sm:justify-start gap-2">
            {data?.user?.name || 'Seller Profile'}
            {data?.shop?.status === 'active' && <CheckCircle2 size={18} className="text-success" title="Verified Account" />}
          </h1>
          <p className="text-sm text-text-secondary font-medium">{data?.user?.email}</p>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1 sm:flex-none">Cancel</Button>
              <Button onClick={methods.handleSubmit(handleSave)} className="flex-1 sm:flex-none bg-accent" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="flex-1 sm:flex-none bg-text-primary text-white hover:bg-text-secondary">
              <Edit2 size={16} className="mr-2" /> Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent"><ShieldCheck size={18} /></div>
          <div><p className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Status</p><p className="font-bold text-text-primary text-sm uppercase">{data?.shop?.status || 'Active'}</p></div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success"><Building size={18} /></div>
          <div><p className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Shop Name</p><p className="font-bold text-text-primary text-sm truncate w-24">{data?.shop?.name || '-'}</p></div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center text-warning"><Star size={18} /></div>
          <div><p className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Rating</p><p className="font-bold text-text-primary text-sm">{data?.shop?.rating || '0.0'}</p></div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center text-danger"><Clock size={18} /></div>
          <div><p className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Member Since</p><p className="font-bold text-text-primary text-sm">
            {data?.shop?.createdAt ? new Date(data.shop.createdAt).getFullYear() : '2026'}
          </p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <FormProvider {...methods}>
            <form className="space-y-6">
              
              {/* Shop Location Section */}
              <div className="bg-surface border border-border rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border bg-background flex items-center justify-between">
                  <h2 className="font-bold text-text-primary">Shop Location</h2>
                  <Button 
                    type="button"
                    variant={shopLocation?.coordinates?.length === 2 ? 'outline' : 'default'} 
                    size="sm" 
                    onClick={() => setIsLocationModalOpen(true)}
                    className={!shopLocation?.coordinates || shopLocation.coordinates.length !== 2 ? 'bg-danger hover:bg-danger-hover text-white border-transparent' : ''}
                  >
                    {shopLocation?.coordinates?.length === 2 ? 'Edit Location' : 'Add Location'}
                  </Button>
                </div>
                <div className="p-5">
                  {!shopLocation?.coordinates || shopLocation.coordinates.length !== 2 ? (
                    <div className="flex items-start gap-4 p-4 bg-danger/5 border border-danger/20 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center text-danger shrink-0">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-danger">⚠ Shop Location Not Configured</h3>
                        <p className="text-sm text-text-secondary mt-1">Customers cannot find your shop on the map or get directions until you add your location.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start gap-4 p-4 bg-success/5 border border-success/20 rounded-xl">
                        <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success shrink-0">
                          <CheckCircle2 size={20} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-success">✅ Location Configured</h3>
                          <p className="text-sm text-text-secondary mt-1">
                            {shopLocation.address}
                            {shopLocation.city ? `, ${shopLocation.city}` : ''}
                            {shopLocation.postalCode ? ` - ${shopLocation.postalCode}` : ''}
                          </p>
                          <div className="flex gap-4 mt-3 text-xs font-mono text-text-secondary">
                            <span>Lat: {shopLocation.coordinates[1].toFixed(6)}</span>
                            <span>Lng: {shopLocation.coordinates[0].toFixed(6)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="h-[220px] w-full rounded-xl overflow-hidden border border-border relative z-0">
                        <MapContainer 
                          center={[shopLocation.coordinates[1], shopLocation.coordinates[0]]} 
                          zoom={15} 
                          style={{ height: '100%', width: '100%' }}
                          zoomControl={false}
                          dragging={false}
                          scrollWheelZoom={false}
                        >
                          <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          <Marker position={[shopLocation.coordinates[1], shopLocation.coordinates[0]]}>
                            <Popup>
                              <b>{data?.shop?.name}</b><br/>{shopLocation.address}
                            </Popup>
                          </Marker>
                        </MapContainer>
                      </div>

                      <div className="flex gap-3">
                        <Button 
                          type="button"
                          variant="outline" 
                          size="sm" 
                          onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${shopLocation.coordinates[1]},${shopLocation.coordinates[0]}`, '_blank')}
                        >
                          Open in Google Maps
                        </Button>
                        <Button 
                          type="button"
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(`https://www.openstreetmap.org/?mlat=${shopLocation.coordinates[1]}&mlon=${shopLocation.coordinates[0]}#map=16/${shopLocation.coordinates[1]}/${shopLocation.coordinates[0]}`, '_blank')}
                        >
                          Open in OpenStreetMap
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Personal Info (Read Only for Seller, managed via support usually) */}
              <div className="bg-surface border border-border rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border bg-background">
                  <h2 className="font-bold text-text-primary">Personal Information</h2>
                </div>
                <div className="p-5 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5"><User size={12}/> Full Name</label>
                      <p className="text-sm font-semibold text-text-primary bg-background/50 px-3 py-2 rounded-lg border border-transparent">{data?.user?.name}</p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5"><Phone size={12}/> Phone Number</label>
                      <p className="text-sm font-semibold text-text-primary bg-background/50 px-3 py-2 rounded-lg border border-transparent">{data?.user?.phone || 'Not provided'}</p>
                    </div>
                    <div className="space-y-1.5 col-span-1 sm:col-span-2">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5"><Mail size={12}/> Email Address</label>
                      <p className="text-sm font-semibold text-text-primary bg-background/50 px-3 py-2 rounded-lg border border-transparent">{data?.user?.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Details */}
              <div className="bg-surface border border-border rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border bg-background">
                  <h2 className="font-bold text-text-primary">Business Details</h2>
                </div>
                <div className="p-5 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5"><Building size={12}/> Business Name</label>
                      {isEditing ? (
                        <input type="text" {...methods.register('businessName')} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-accent focus:outline-none" />
                      ) : (
                        <p className="text-sm font-semibold text-text-primary bg-background/50 px-3 py-2 rounded-lg border border-transparent">{data?.shop?.name || 'Not provided'}</p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5"><MapPin size={12}/> GSTIN</label>
                      {isEditing ? (
                        <input type="text" {...methods.register('gstin')} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-accent focus:outline-none" />
                      ) : (
                        <p className="text-sm font-semibold text-text-primary bg-background/50 px-3 py-2 rounded-lg border border-transparent">{data?.shop?.taxSettings?.gstNumber || 'Not provided'}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-5 space-y-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5"><Store size={12}/> Shop Description</label>
                    {isEditing ? (
                      <textarea {...methods.register('description')} rows={3} placeholder="Describe your shop..." className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-accent focus:outline-none resize-none" />
                    ) : (
                      <p className="text-sm font-semibold text-text-primary bg-background/50 px-3 py-2 rounded-lg border border-transparent whitespace-pre-wrap">{data?.shop?.description || 'No description provided'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact & Address */}
              <div className="bg-surface border border-border rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border bg-background">
                  <h2 className="font-bold text-text-primary">Contact & Address</h2>
                </div>
                <div className="p-5 space-y-5">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5"><MapPin size={12}/> Street Address</label>
                      {isEditing ? (
                        <input type="text" {...methods.register('address.street')} placeholder="House/Flat No., Building Name, Street" className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-accent focus:outline-none" />
                      ) : (
                        <p className="text-sm font-semibold text-text-primary bg-background/50 px-3 py-2 rounded-lg border border-transparent whitespace-pre-wrap">{data?.shop?.address?.street || 'Not provided'}</p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">City</label>
                        {isEditing ? (
                          <input type="text" {...methods.register('address.city')} placeholder="City" className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-accent focus:outline-none" />
                        ) : (
                          <p className="text-sm font-semibold text-text-primary bg-background/50 px-3 py-2 rounded-lg border border-transparent">{data?.shop?.address?.city || 'Not provided'}</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">State</label>
                        {isEditing ? (
                          <input type="text" {...methods.register('address.state')} placeholder="State" className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-accent focus:outline-none" />
                        ) : (
                          <p className="text-sm font-semibold text-text-primary bg-background/50 px-3 py-2 rounded-lg border border-transparent">{data?.shop?.address?.state || 'Not provided'}</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">Pincode</label>
                        {isEditing ? (
                          <input type="text" {...methods.register('address.pincode')} placeholder="Pincode" className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-accent focus:outline-none" />
                        ) : (
                          <p className="text-sm font-semibold text-text-primary bg-background/50 px-3 py-2 rounded-lg border border-transparent">{data?.shop?.address?.pincode || 'Not provided'}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
            </form>
          </FormProvider>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-xl p-5">
            <h3 className="font-bold text-text-primary mb-4 border-b border-border pb-2">Account Data</h3>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">SHOP ID</p>
                <div className="bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-text-primary break-all flex items-center gap-2">
                  {data?.shop?._id || 'Loading...'}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">ROLE</p>
                <div className="bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-text-primary break-all flex items-center gap-2">
                  Seller Admin
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <ShopLocationModal 
        isOpen={isLocationModalOpen} 
        onClose={() => setIsLocationModalOpen(false)} 
        initialLocation={shopLocation}
      />
    </div>
  );
};

export default ProfilePage;
