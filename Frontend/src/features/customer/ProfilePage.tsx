import React, { useState, useRef } from 'react';
import { User, Mail, Phone, Calendar, Edit2, ShieldCheck, MapPin, Star, ShoppingBag, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNotificationStore } from '@/store/notificationStore';
import { useProfile, useUpdateProfile, useOrderStats, useCustomerReviews } from '@/hooks/queries';

export const ProfilePage: React.FC = () => {
  const { addToast } = useNotificationStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { data: profile, isLoading } = useProfile();
  const updateMutation = useUpdateProfile();
  const { data: orderStats } = useOrderStats();
  const { data: reviewsData } = useCustomerReviews();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    dob: '',
    gender: ''
  });

  // Init form data when profile loads
  React.useEffect(() => {
    if (profile && !isEditing) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        dob: profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : '',
        gender: profile.gender || ''
      });
    }
  }, [profile, isEditing]);

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync(formData);
      addToast({ title: 'Profile Updated', message: 'Your details have been saved.', type: 'success' });
      setIsEditing(false);
    } catch (err: any) {
      addToast({ title: 'Update Failed', message: err.message || 'Error updating profile', type: 'error' });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      addToast({ title: 'Uploading', message: 'Simulating avatar upload...', type: 'info' });
      setTimeout(() => {
        addToast({ title: 'Success', message: 'Avatar updated successfully', type: 'success' });
      }, 1000);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto w-full animate-pulse">
        <div className="h-24 bg-surface border border-border rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="h-64 bg-surface border border-border rounded-xl" />
          </div>
          <div className="space-y-6">
            <div className="h-48 bg-surface border border-border rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto w-full">
      {/* Header Profile Card */}
      <div className="bg-surface border border-border rounded-xl p-5 shadow-sm flex flex-col sm:flex-row items-center gap-5">
        <div className="relative group">
          <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center border-2 border-accent text-accent overflow-hidden">
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
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
            {profile?.name} 
            {profile?.isVerified && <CheckCircle2 size={18} className="text-success" title="Verified Account" />}
          </h1>
          <p className="text-sm text-text-secondary font-medium">{profile?.email}</p>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1 sm:flex-none">Cancel</Button>
              <Button onClick={handleSave} className="flex-1 sm:flex-none bg-accent" disabled={updateMutation.isPending}>
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
          <div><p className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Status</p><p className="font-bold text-text-primary text-sm">{profile?.status}</p></div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success"><ShoppingBag size={18} /></div>
          <div><p className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Orders</p><p className="font-bold text-text-primary text-sm">{orderStats?.all || 0}</p></div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center text-warning"><Star size={18} /></div>
          <div><p className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Reviews</p><p className="font-bold text-text-primary text-sm">{(reviewsData?.stats?.productReviews || 0) + (reviewsData?.stats?.shopReviews || 0)}</p></div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center text-danger"><Clock size={18} /></div>
          <div><p className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Member Since</p><p className="font-bold text-text-primary text-sm">
            {profile?.createdAt ? new Date(profile.createdAt).getFullYear() : '2026'}
          </p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-background">
              <h2 className="font-bold text-text-primary">Personal Information</h2>
            </div>
            <div className="p-5 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5"><User size={12}/> Full Name</label>
                  {isEditing ? (
                    <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-accent focus:outline-none" />
                  ) : (
                    <p className="text-sm font-semibold text-text-primary bg-background/50 px-3 py-2 rounded-lg border border-transparent">{profile?.name}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5"><Phone size={12}/> Phone Number</label>
                  {isEditing ? (
                    <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-accent focus:outline-none" />
                  ) : (
                    <p className="text-sm font-semibold text-text-primary bg-background/50 px-3 py-2 rounded-lg border border-transparent">{profile?.phone}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5"><Calendar size={12}/> Date of Birth</label>
                  {isEditing ? (
                    <input type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-accent focus:outline-none" />
                  ) : (
                    <p className="text-sm font-semibold text-text-primary bg-background/50 px-3 py-2 rounded-lg border border-transparent">
                      {profile?.dob ? new Date(profile.dob).toLocaleDateString('en-IN') : 'Not provided'}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5"><User size={12}/> Gender</label>
                  {isEditing ? (
                    <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-accent focus:outline-none">
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  ) : (
                    <p className="text-sm font-semibold text-text-primary bg-background/50 px-3 py-2 rounded-lg border border-transparent capitalize">
                      {profile?.gender || 'Not provided'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-background">
              <h2 className="font-bold text-text-primary">Account Data</h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Email Address</p>
                <div className="flex items-center gap-2 text-sm font-semibold text-text-primary bg-background p-2 rounded-lg border border-border">
                  <Mail size={14} className="text-text-secondary" /> {profile?.email}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Customer ID</p>
                <div className="text-xs font-mono text-text-secondary bg-background p-2 rounded-lg border border-border">
                  {profile?._id}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
