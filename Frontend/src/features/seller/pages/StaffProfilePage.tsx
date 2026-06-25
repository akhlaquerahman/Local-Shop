import React from 'react';
import { User, ShieldCheck, Mail, Phone, Calendar, Clock, Lock, Store, MapPin, Building, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { useProfile, useShopLocation } from '../services/seller.queries';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const StaffProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const { data: profileData, isLoading } = useProfile();
  const { data: locationData } = useShopLocation();

  const shop = profileData?.shop;
  const shopLocation = locationData || shop?.location;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 text-left">
      <div>
        <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Staff Profile</h1>
        <p className="text-sm text-text-secondary">View your employee details and permissions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Basic Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-surface border border-border rounded-xl p-6 text-center shadow-sm">
            <div className="w-24 h-24 rounded-full bg-accent/20 mx-auto flex items-center justify-center mb-4">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover rounded-full" />
              ) : (
                <span className="text-4xl font-bold text-accent">{user?.name?.charAt(0) || 'S'}</span>
              )}
            </div>
            <h2 className="text-xl font-bold text-text-primary">{user?.name}</h2>
            <p className="text-sm text-text-secondary mb-3">{user?.email}</p>
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider">
              {((user as any)?.staffRole || user?.role)?.replace('_', ' ')}
            </span>
            {((user as any)?.employeeCode) && (
              <p className="text-xs text-text-secondary mt-3 font-mono border-t border-border pt-3">
                EMP ID: {(user as any).employeeCode}
              </p>
            )}
          </div>

          <div className="bg-surface border border-border rounded-xl p-6 space-y-4 shadow-sm">
            <h3 className="font-bold border-b border-border pb-2 text-sm">Contact Info</h3>
            <div className="flex items-center gap-3 text-sm">
              <Mail className="text-text-secondary" size={16} />
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="text-text-secondary" size={16} />
              <span>{user?.phone || 'Not provided'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="text-text-secondary" size={16} />
              <span>Joined: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Right Col: Details & Permissions */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Shop Details Card */}
          <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-background">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <Store className="text-primary" size={20} />
                Shop Information
              </h3>
            </div>
            <div className="p-6 space-y-5">
              {isLoading ? (
                <p className="text-sm text-text-secondary">Loading shop details...</p>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5"><Building size={12}/> Shop Name</label>
                      <p className="text-sm font-semibold text-text-primary">{shop?.name || 'Not provided'}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5"><Clock size={12}/> Operating Hours</label>
                      <p className="text-sm font-semibold text-text-primary">{shop?.timing || '09:00 AM - 09:00 PM'}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5"><Store size={12}/> Description</label>
                    <p className="text-sm text-text-secondary whitespace-pre-wrap">{shop?.description || 'No description provided'}</p>
                  </div>

                  {shopLocation?.coordinates?.length === 2 && (
                    <div className="pt-4 border-t border-border">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5 mb-3"><MapPin size={12}/> Shop Location</label>
                      <p className="text-sm text-text-secondary mb-3">
                        {shopLocation.address}
                        {shopLocation.city ? `, ${shopLocation.city}` : ''}
                      </p>
                      <div className="h-[200px] w-full rounded-xl overflow-hidden border border-border relative z-0">
                        <MapContainer 
                          center={[shopLocation.coordinates[1], shopLocation.coordinates[0]]} 
                          zoom={15} 
                          style={{ height: '100%', width: '100%' }}
                          zoomControl={false}
                          dragging={false}
                          scrollWheelZoom={false}
                        >
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                          <Marker position={[shopLocation.coordinates[1], shopLocation.coordinates[0]]}>
                            <Popup><b>{shop?.name}</b></Popup>
                          </Marker>
                        </MapContainer>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              <ShieldCheck className="text-primary" size={20} />
              Assigned Permissions
            </h3>
            
            <div className="flex flex-wrap gap-2">
              {(() => {
                const isOwner = user?.accountType === 'SELLER_OWNER';
                
                if (isOwner) {
                  return <span className="px-3 py-1.5 bg-background border border-border rounded-lg text-sm font-medium">All Seller Modules</span>;
                }

                if (!user?.effectivePermissions || user.effectivePermissions.length === 0) {
                  // Fallback to older permissions if effectivePermissions is empty
                  if (!user?.permissions || user.permissions.length === 0) {
                    return <p className="text-sm text-text-secondary">No specific permissions assigned.</p>;
                  }
                  return user.permissions.map((p: string, i: number) => (
                    <span key={i} className="px-3 py-1.5 bg-background border border-border rounded-lg text-sm font-medium">
                      {p}
                    </span>
                  ));
                }

                return user.effectivePermissions.map((p: string, i: number) => (
                  <span key={i} className="px-3 py-1.5 bg-background border border-border rounded-lg text-sm font-medium shadow-sm">
                    {p}
                  </span>
                ));
              })()}
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              <Lock className="text-primary" size={20} />
              Account Security
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-background border border-border rounded-lg">
                <div>
                  <p className="font-bold text-sm">Password</p>
                  <p className="text-xs text-text-secondary mt-0.5">Last changed never</p>
                </div>
                <Button variant="outline" size="sm">Change Password</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffProfilePage;
