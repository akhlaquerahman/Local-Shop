import React, { useState } from 'react';
import { MapPin, Plus, Edit2, Trash2, Home, Briefcase, Map } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNotificationStore } from '@/store/notificationStore';
import { useAddresses, useDeleteAddress, useSetDefaultAddress, useAddAddress, useUpdateAddress } from '@/hooks/queries';

export const AddressesPage: React.FC = () => {
  const { addToast } = useNotificationStore();
  const { data: addresses, isLoading } = useAddresses();
  console.log("ADDRESSES DATA FROM HOOK:", addresses);
  
  const deleteMutation = useDeleteAddress();
  const defaultMutation = useSetDefaultAddress();
  const addMutation = useAddAddress();
  const updateMutation = useUpdateAddress();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState({
    addressType: 'Home', recipientName: '', phone: '', addressLine1: '', city: '', state: '', pincode: ''
  });

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await deleteMutation.mutateAsync(id);
      addToast({ title: 'Deleted', message: 'Address removed.', type: 'success' });
    } catch (err) {
      addToast({ title: 'Error', message: 'Failed to delete address.', type: 'error' });
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await defaultMutation.mutateAsync(id);
      addToast({ title: 'Updated', message: 'Default address updated.', type: 'success' });
    } catch (err) {
      addToast({ title: 'Error', message: 'Failed to update default address.', type: 'error' });
    }
  };

  const handleEditClick = (addr: any) => {
    setEditingId(addr._id);
    setNewAddress({
      addressType: addr.addressType || 'Home',
      recipientName: addr.recipientName || '',
      phone: addr.phone || '',
      addressLine1: addr.addressLine1 || '',
      city: addr.city || '',
      state: addr.state || '',
      pincode: addr.pincode || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!newAddress.recipientName || !newAddress.addressLine1 || !newAddress.city) {
      addToast({ title: 'Required Fields', message: 'Please fill all mandatory fields', type: 'error' });
      return;
    }
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: newAddress });
        addToast({ title: 'Success', message: 'Address updated successfully', type: 'success' });
      } else {
        await addMutation.mutateAsync(newAddress);
        addToast({ title: 'Success', message: 'Address added successfully', type: 'success' });
      }
      setIsModalOpen(false);
      setEditingId(null);
      setNewAddress({ addressType: 'Home', recipientName: '', phone: '', addressLine1: '', city: '', state: '', pincode: '' });
    } catch (err) {
      addToast({ title: 'Error', message: 'Failed to save address', type: 'error' });
    }
  };

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'home': return <Home size={16} />;
      case 'work': return <Briefcase size={16} />;
      default: return <Map size={16} />;
    }
  };

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight flex items-center gap-3">
            <MapPin size={28} className="text-accent" /> Saved Addresses
          </h1>
          <p className="text-sm text-text-secondary mt-1">Manage delivery locations for faster checkout</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-accent text-white shadow-sm flex items-center gap-2">
          <Plus size={16} /> Add Address
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 bg-surface border border-border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : addresses?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {addresses.map((addr: any) => (
            <div key={addr._id} className={`bg-surface border rounded-xl p-5 flex flex-col justify-between transition-all hover:shadow-md ${addr.isDefault ? 'border-accent ring-1 ring-accent/20' : 'border-border'}`}>
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                      {getIcon(addr.addressType)}
                    </div>
                    <span className="font-bold text-text-primary capitalize">{addr.addressType}</span>
                  </div>
                  {addr.isDefault && (
                    <span className="text-[10px] font-extrabold bg-accent text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Default</span>
                  )}
                </div>
                
                <div className="space-y-1 mb-4">
                  <p className="text-sm font-bold text-text-primary">{addr.recipientName}</p>
                  <p className="text-xs font-semibold text-text-secondary">{addr.phone}</p>
                  <p className="text-xs text-text-secondary mt-2 line-clamp-2" title={`${addr.addressLine1}, ${addr.city}, ${addr.state} ${addr.pincode}`}>
                    {addr.addressLine1}, {addr.city},<br/>{addr.state} {addr.pincode}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-border">
                {!addr.isDefault && (
                  <Button variant="outline" size="sm" onClick={() => handleSetDefault(addr._id)} className="flex-1 text-xs h-8 border-border">Set Default</Button>
                )}
                <Button variant="outline" size="sm" onClick={() => handleEditClick(addr)} className="px-2 h-8 border-border text-text-secondary hover:text-accent"><Edit2 size={14} /></Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(addr._id)} className="px-2 h-8 border-border text-text-secondary hover:bg-danger/10 hover:text-danger hover:border-danger/30"><Trash2 size={14} /></Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-surface border border-dashed border-border rounded-xl">
          <MapPin size={48} className="text-text-secondary/20 mb-4" />
          <h2 className="text-lg font-bold text-text-primary">No addresses found</h2>
          <p className="text-sm text-text-secondary mt-1 text-center max-w-sm mb-4">Add your home, work, or other addresses for a seamless checkout experience.</p>
          <Button onClick={() => { setEditingId(null); setNewAddress({ addressType: 'Home', recipientName: '', phone: '', addressLine1: '', city: '', state: '', pincode: '' }); setIsModalOpen(true); }} className="bg-text-primary text-white">Add First Address</Button>
        </div>
      )}

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl w-full max-w-md shadow-xl border border-border overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-border flex justify-between items-center bg-background">
              <h3 className="font-bold text-text-primary">{editingId ? 'Edit Address' : 'Add New Address'}</h3>
              <button onClick={() => { setIsModalOpen(false); setEditingId(null); setNewAddress({ addressType: 'Home', recipientName: '', phone: '', addressLine1: '', city: '', state: '', pincode: '' }); }} className="text-text-secondary hover:text-danger"><Plus size={20} className="rotate-45" /></button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {['Home', 'Work', 'Other'].map(type => (
                  <button key={type} onClick={() => setNewAddress({...newAddress, addressType: type})} className={`py-2 rounded-lg text-xs font-bold border transition-colors ${newAddress.addressType === type ? 'bg-accent/10 border-accent text-accent' : 'border-border text-text-secondary hover:border-text-primary'}`}>
                    {type}
                  </button>
                ))}
              </div>
              <input type="text" placeholder="Recipient Name" value={newAddress.recipientName} onChange={e => setNewAddress({...newAddress, recipientName: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-accent focus:outline-none" />
              <input type="tel" placeholder="Phone Number" value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-accent focus:outline-none" />
              <input type="text" placeholder="Flat, House no., Building, Company" value={newAddress.addressLine1} onChange={e => setNewAddress({...newAddress, addressLine1: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-accent focus:outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="City" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-accent focus:outline-none" />
                <input type="text" placeholder="Pincode" value={newAddress.pincode} onChange={e => setNewAddress({...newAddress, pincode: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-accent focus:outline-none" />
              </div>
              <input type="text" placeholder="State" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-accent focus:outline-none" />
            </div>
            <div className="p-4 border-t border-border bg-background flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button className="flex-1 bg-accent" onClick={handleSave} disabled={addMutation.isPending}>{addMutation.isPending ? 'Saving...' : 'Save Address'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressesPage;
