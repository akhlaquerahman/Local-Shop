import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MapPin, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LocationPicker } from '@/components/maps/LocationPicker';
import { useUpdateShopLocation } from '../services/seller.queries';
import { useNotificationStore } from '@/store/notificationStore';

const locationSchema = z.object({
  address: z.string().min(10, 'Address must be at least 10 characters'),
  landmark: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

type LocationFormValues = z.infer<typeof locationSchema>;

interface ShopLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLocation?: any;
}

export const ShopLocationModal: React.FC<ShopLocationModalProps> = ({ isOpen, onClose, initialLocation }) => {
  const updateMutation = useUpdateShopLocation();
  const { addToast } = useNotificationStore();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      address: '',
      landmark: '',
      city: '',
      state: '',
      postalCode: '',
      lat: undefined,
      lng: undefined,
    }
  });

  const lat = watch('lat');
  const lng = watch('lng');

  useEffect(() => {
    if (initialLocation && initialLocation.coordinates && initialLocation.coordinates.length === 2) {
      setValue('address', initialLocation.address || '');
      setValue('landmark', initialLocation.landmark || '');
      setValue('city', initialLocation.city || '');
      setValue('state', initialLocation.state || '');
      setValue('postalCode', initialLocation.postalCode || '');
      setValue('lat', initialLocation.coordinates[1]);
      setValue('lng', initialLocation.coordinates[0]);
    }
  }, [initialLocation, setValue]);

  const handleLocationSelect = (data: { lat: number, lng: number, address: any }) => {
    setValue('lat', data.lat);
    setValue('lng', data.lng);
    if (data.address.fullAddress) setValue('address', data.address.fullAddress);
    if (data.address.city) setValue('city', data.address.city);
    if (data.address.state) setValue('state', data.address.state);
    if (data.address.postalCode) setValue('postalCode', data.address.postalCode);
  };

  const onSubmit = async (data: LocationFormValues) => {
    try {
      const payload = {
        type: 'Point',
        coordinates: [data.lng, data.lat], // MongoDB uses [longitude, latitude]
        address: data.address,
        landmark: data.landmark,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode
      };
      
      await updateMutation.mutateAsync(payload);
      addToast({ title: 'Location Saved', message: 'Shop location updated successfully', type: 'success' });
      onClose();
    } catch (err: any) {
      addToast({ title: 'Error', message: err.message || 'Failed to save location', type: 'error' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-[900px] shadow-xl my-8">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2 text-text-primary">
            <MapPin className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-bold">Manage Shop Location</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-background rounded-full text-text-secondary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 flex flex-col lg:flex-row gap-6">
          {/* Map Side */}
          <div className="flex-1 min-h-[400px]">
            <LocationPicker 
              initialLat={lat} 
              initialLng={lng} 
              onLocationSelect={handleLocationSelect} 
            />
          </div>

          {/* Form Side */}
          <div className="w-full lg:w-[320px] flex flex-col">
            <form id="location-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 flex-1">
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Shop Address *</label>
                <textarea 
                  {...register('address')} 
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-accent focus:outline-none min-h-[80px]"
                  placeholder="Full street address..."
                />
                {errors.address && <p className="text-danger text-xs mt-1">{errors.address.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Landmark</label>
                <input 
                  type="text" 
                  {...register('landmark')} 
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-accent focus:outline-none"
                  placeholder="Near XYZ Bank..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">City *</label>
                  <input 
                    type="text" 
                    {...register('city')} 
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-accent focus:outline-none"
                  />
                  {errors.city && <p className="text-danger text-xs mt-1">{errors.city.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">State *</label>
                  <input 
                    type="text" 
                    {...register('state')} 
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-accent focus:outline-none"
                  />
                  {errors.state && <p className="text-danger text-xs mt-1">{errors.state.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Postal Code</label>
                  <input 
                    type="text" 
                    {...register('postalCode')} 
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-border">
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Latitude *</label>
                  <input 
                    type="number" 
                    step="any"
                    {...register('lat', { valueAsNumber: true })} 
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-accent focus:outline-none bg-background/50 cursor-not-allowed"
                    readOnly
                  />
                  {errors.lat && <p className="text-danger text-xs mt-1">Required</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Longitude *</label>
                  <input 
                    type="number" 
                    step="any"
                    {...register('lng', { valueAsNumber: true })} 
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:border-accent focus:outline-none bg-background/50 cursor-not-allowed"
                    readOnly
                  />
                  {errors.lng && <p className="text-danger text-xs mt-1">Required</p>}
                </div>
              </div>

            </form>
          </div>
        </div>

        <div className="p-5 border-t border-border flex justify-end gap-3 bg-background/50 rounded-b-2xl">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            type="submit" 
            form="location-form" 
            disabled={updateMutation.isPending}
            className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white"
          >
            <Save className="w-4 h-4" />
            {updateMutation.isPending ? 'Saving...' : 'Save Location'}
          </Button>
        </div>
      </div>
    </div>
  );
};
