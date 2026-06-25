import React, { useState, useRef } from 'react';
import { User, Mail, Phone, Calendar, Edit2, ShieldCheck, MapPin, Truck, CheckCircle2, ShoppingBag, Star, Clock, Map, Trash2, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNotificationStore } from '@/store/notificationStore';
import { 
  useRiderProfile, 
  useUpdateRiderProfile, 
  useRiderRatings,
  useRiderServiceAreas,
  useAddServiceArea,
  useUpdateServiceArea,
  useDeleteServiceArea
} from '../services/rider.queries';

export const ProfilePage: React.FC = () => {
  const { addToast } = useNotificationStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { data: profile, isLoading } = useRiderProfile();
  const updateMutation = useUpdateRiderProfile();
  const { data: ratingsData } = useRiderRatings();
  
  const { data: serviceAreas, isLoading: isLoadingAreas } = useRiderServiceAreas();
  const addAreaMutation = useAddServiceArea();
  const updateAreaMutation = useUpdateServiceArea();
  const deleteAreaMutation = useDeleteServiceArea();

  const [isEditing, setIsEditing] = useState(false);
  const [isAddingArea, setIsAddingArea] = useState(false);
  const [areaFormData, setAreaFormData] = useState({
    country: 'India',
    state: '',
    city: '',
    pincodes: '',
    radiusKm: 5,
    isDefault: false
  });

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    dob: '',
    gender: '',
    vehicleType: ''
  });

  // Init form data when profile loads
  React.useEffect(() => {
    if (profile && !isEditing) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        dob: profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : '',
        gender: profile.gender || '',
        vehicleType: profile.vehicleType || ''
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

  const handleAddArea = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addAreaMutation.mutateAsync({
        ...areaFormData,
        pincodes: areaFormData.pincodes.split(',').map(p => p.trim()).filter(p => p)
      });
      addToast({ title: 'Area Added', message: 'Service area configured successfully.', type: 'success' });
      setIsAddingArea(false);
      setAreaFormData({ country: 'India', state: '', city: '', pincodes: '', radiusKm: 5, isDefault: false });
    } catch (err: any) {
      addToast({ title: 'Failed to Add', message: err.response?.data?.message || err.message, type: 'error' });
    }
  };

  const handleDeleteArea = async (id: string) => {
    if(!window.confirm('Are you sure you want to remove this service area?')) return;
    try {
      await deleteAreaMutation.mutateAsync(id);
      addToast({ title: 'Area Removed', message: 'Service area deleted.', type: 'success' });
    } catch (err: any) {
      addToast({ title: 'Error', message: 'Failed to delete service area.', type: 'error' });
    }
  };

  const toggleAreaStatus = async (area: any) => {
    try {
      await updateAreaMutation.mutateAsync({
        id: area._id,
        data: { status: area.status === 'Active' ? 'Inactive' : 'Active' }
      });
      addToast({ title: 'Status Updated', message: `Service area marked as ${area.status === 'Active' ? 'Inactive' : 'Active'}`, type: 'success' });
    } catch (err) {
      addToast({ title: 'Error', message: 'Failed to update status', type: 'error' });
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

  const activeAreasCount = serviceAreas?.filter((sa: any) => sa.status === 'Active').length || 0;

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto w-full pb-20">
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
            {profile?.name || 'Delivery Partner'} 
            {profile?.status === 'ACTIVE' && <CheckCircle2 size={18} className="text-success" title="Active Partner" />}
          </h1>
          <p className="text-sm text-text-secondary font-medium">{profile?.email || 'No email provided'}</p>
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
          <div><p className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Status</p><p className="font-bold text-text-primary text-sm">{profile?.status || 'UNKNOWN'}</p></div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success"><Map size={18} /></div>
          <div><p className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Service Areas</p><p className="font-bold text-text-primary text-sm">{activeAreasCount} Active</p></div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center text-warning"><Star size={18} /></div>
          <div><p className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Rating</p><p className="font-bold text-text-primary text-sm">{ratingsData?.average || '0.0'}</p></div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center text-danger"><Clock size={18} /></div>
          <div><p className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Partner Since</p><p className="font-bold text-text-primary text-sm">
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
                    <p className="text-sm font-semibold text-text-primary bg-background/50 px-3 py-2 rounded-lg border border-transparent">{profile?.name || 'Not provided'}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5"><Phone size={12}/> Phone Number</label>
                  {isEditing ? (
                    <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-accent focus:outline-none" />
                  ) : (
                    <p className="text-sm font-semibold text-text-primary bg-background/50 px-3 py-2 rounded-lg border border-transparent">{profile?.phone || 'Not provided'}</p>
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

          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-background flex justify-between items-center">
              <div>
                <h2 className="font-bold text-text-primary">Service Areas & Delivery Zones</h2>
                <p className="text-xs text-text-secondary">Manage the cities and locations where you want to receive delivery requests.</p>
              </div>
              <Button size="sm" onClick={() => setIsAddingArea(true)} className="bg-accent text-white"><Plus size={16} className="mr-1"/> Add Area</Button>
            </div>
            
            <div className="p-0">
              {isLoadingAreas ? (
                <div className="p-5 space-y-3 animate-pulse">
                  <div className="h-10 bg-background border border-border rounded-lg"></div>
                  <div className="h-10 bg-background border border-border rounded-lg"></div>
                </div>
              ) : serviceAreas?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-text-secondary uppercase bg-background border-b border-border">
                      <tr>
                        <th className="px-5 py-3">City</th>
                        <th className="px-5 py-3 hidden sm:table-cell">State</th>
                        <th className="px-5 py-3 text-center">Status</th>
                        <th className="px-5 py-3 text-center">Default</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {serviceAreas.map((area: any) => (
                        <tr key={area._id} className="hover:bg-background/50 transition-colors">
                          <td className="px-5 py-4 font-bold text-text-primary">
                            {area.city}
                            <div className="text-[10px] text-text-secondary font-normal sm:hidden mt-1">{area.state}, {area.country}</div>
                          </td>
                          <td className="px-5 py-4 hidden sm:table-cell">{area.state}</td>
                          <td className="px-5 py-4 text-center">
                            <button onClick={() => toggleAreaStatus(area)} className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider ${area.status === 'Active' ? 'bg-success/10 text-success border border-success/20' : 'bg-text-secondary/10 text-text-secondary border border-text-secondary/20'}`}>
                              {area.status}
                            </button>
                          </td>
                          <td className="px-5 py-4 text-center">
                            {area.isDefault ? <span className="bg-accent/10 text-accent px-2 py-0.5 rounded text-[10px] uppercase font-bold border border-accent/20">Yes</span> : '-'}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button onClick={() => handleDeleteArea(area._id)} className="text-text-secondary hover:text-danger hover:bg-danger/10 p-1.5 rounded transition-colors" title="Delete">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center border-t border-border border-dashed m-5 rounded-xl bg-background/50">
                  <Map size={32} className="mx-auto text-text-secondary mb-3 opacity-50" />
                  <p className="text-sm font-semibold text-text-primary mb-1">No service areas configured.</p>
                  <p className="text-xs text-text-secondary mb-4 max-w-sm mx-auto">Add your first delivery zone to start receiving delivery requests in your area.</p>
                  <Button variant="outline" size="sm" onClick={() => setIsAddingArea(true)} className="border-accent text-accent hover:bg-accent/5">
                    + Add Service Area
                  </Button>
                </div>
              )}
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
                  <Mail size={14} className="text-text-secondary" /> {profile?.email || 'N/A'}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Partner ID</p>
                <div className="text-xs font-mono text-text-secondary bg-background p-2 rounded-lg border border-border">
                  {profile?._id || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-background">
              <h2 className="font-bold text-text-primary">Vehicle Information</h2>
            </div>
            <div className="p-5 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5"><Truck size={12}/> Vehicle Type</label>
                {isEditing ? (
                  <select value={formData.vehicleType} onChange={e => setFormData({...formData, vehicleType: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-accent focus:outline-none">
                    <option value="">Select Type</option>
                    <option value="Bicycle">Bicycle</option>
                    <option value="Motorcycle">Motorcycle</option>
                    <option value="Scooter">Scooter</option>
                    <option value="Car">Car</option>
                  </select>
                ) : (
                  <p className="text-sm font-semibold text-text-primary bg-background/50 px-3 py-2 rounded-lg border border-transparent capitalize">{profile?.vehicleType || 'Not provided'}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5"><MapPin size={12}/> Vehicle Number</label>
                <p className="text-sm font-semibold text-text-primary bg-background/50 px-3 py-2 rounded-lg border border-transparent font-mono tracking-wider">
                  {profile?.vehicleNumber || 'UNREGISTERED'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Service Area Modal */}
      {isAddingArea && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-border bg-background">
              <h2 className="font-bold text-lg text-text-primary">Add Service Area</h2>
              <button onClick={() => setIsAddingArea(false)} className="text-text-secondary hover:text-text-primary">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddArea} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Country</label>
                  <input type="text" required value={areaFormData.country} onChange={e => setAreaFormData({...areaFormData, country: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-accent focus:outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">State</label>
                  <input type="text" required placeholder="e.g. Delhi" value={areaFormData.state} onChange={e => setAreaFormData({...areaFormData, state: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-accent focus:outline-none" />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">City</label>
                <input type="text" required placeholder="e.g. New Delhi" value={areaFormData.city} onChange={e => setAreaFormData({...areaFormData, city: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-accent focus:outline-none" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Pin Codes (Optional)</label>
                <input type="text" placeholder="Comma separated: 110001, 110002" value={areaFormData.pincodes} onChange={e => setAreaFormData({...areaFormData, pincodes: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-accent focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4 items-center pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Radius (KM)</label>
                  <input type="number" min="1" max="50" required value={areaFormData.radiusKm} onChange={e => setAreaFormData({...areaFormData, radiusKm: parseInt(e.target.value)})} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-accent focus:outline-none" />
                </div>
                <div className="flex items-center gap-2 mt-5">
                  <input type="checkbox" id="defaultArea" checked={areaFormData.isDefault} onChange={e => setAreaFormData({...areaFormData, isDefault: e.target.checked})} className="rounded text-accent focus:ring-accent w-4 h-4" />
                  <label htmlFor="defaultArea" className="text-sm font-semibold text-text-primary cursor-pointer">Default Area</label>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAddingArea(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 bg-accent" disabled={addAreaMutation.isPending}>
                  {addAreaMutation.isPending ? 'Saving...' : 'Add Area'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
