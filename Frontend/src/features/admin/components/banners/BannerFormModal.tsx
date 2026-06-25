import React, { useState, useEffect } from 'react';
import { useAdminBannerDetails, useCreateBanner, useUpdateBanner } from '../../services/admin.queries';
import { Button } from '@/components/ui/Button';

export const BannerFormModal = ({ isOpen, onClose, bannerId }: { isOpen: boolean, onClose: () => void, bannerId: string | null }) => {
  const { data, isLoading } = useAdminBannerDetails(bannerId || '');
  const isEditing = !!bannerId;

  const createMutation = useCreateBanner();
  const updateMutation = useUpdateBanner();

  const [formData, setFormData] = useState({
    title: '',
    position: 'HERO_SLIDER',
    desktopImage: '',
    mobileImage: '',
    linkType: 'NONE',
    linkTarget: '',
    sortOrder: 0,
    isActive: true
  });

  useEffect(() => {
    if (isEditing && data) {
      setFormData({
        title: data.title || '',
        position: data.position || 'HERO_SLIDER',
        desktopImage: data.desktopImage || '',
        mobileImage: data.mobileImage || '',
        linkType: data.linkType || 'NONE',
        linkTarget: data.linkTarget || '',
        sortOrder: data.sortOrder || 0,
        isActive: data.isActive
      });
    } else {
      setFormData({
        title: '',
        position: 'HERO_SLIDER',
        desktopImage: '',
        mobileImage: '',
        linkType: 'NONE',
        linkTarget: '',
        sortOrder: 0,
        isActive: true
      });
    }
  }, [data, isEditing, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      updateMutation.mutate({ id: bannerId, payload: formData }, {
        onSuccess: () => onClose()
      });
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => onClose()
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60">
      <div className="w-full max-w-md bg-background h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-surface">
          <h2 className="text-lg font-extrabold text-text-primary">
            {isEditing ? 'Edit Banner' : 'Create New Banner'}
          </h2>
          <button onClick={onClose} className="text-text-secondary hover:text-white p-2">✕</button>
        </div>

        {isEditing && isLoading ? (
          <div className="flex-1 flex items-center justify-center text-text-secondary">Loading...</div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase">Banner Title</label>
              <input 
                required
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Summer Mega Sale"
                className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase">Position</label>
              <select 
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-primary"
              >
                <option value="HERO_SLIDER">Hero Slider (Homepage Top)</option>
                <option value="CATEGORY_TOP">Category Header</option>
                <option value="PROMO_STRIP">Mid-Page Promo Strip</option>
                <option value="POPUP">App Popup</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase">Desktop Image URL</label>
              <input 
                required
                name="desktopImage"
                value={formData.desktopImage}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-primary font-mono text-xs"
              />
              {formData.desktopImage && (
                <div className="h-24 mt-2 bg-black/20 rounded border border-border overflow-hidden">
                  <img src={formData.desktopImage} alt="Preview" className="w-full h-full object-contain" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase">Mobile Image URL (Optional)</label>
              <input 
                name="mobileImage"
                value={formData.mobileImage}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-primary font-mono text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">Link Type</label>
                <select 
                  name="linkType"
                  value={formData.linkType}
                  onChange={handleChange}
                  className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-primary"
                >
                  <option value="NONE">None (Display Only)</option>
                  <option value="PRODUCT">Specific Product</option>
                  <option value="CATEGORY">Category</option>
                  <option value="SHOP">Seller Shop</option>
                  <option value="EXTERNAL">External URL</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">Link Target (ID/URL)</label>
                <input 
                  name="linkTarget"
                  value={formData.linkTarget}
                  onChange={handleChange}
                  disabled={formData.linkType === 'NONE'}
                  placeholder={formData.linkType === 'NONE' ? 'N/A' : 'Enter Target'}
                  className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-primary disabled:opacity-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">Sort Order</label>
                <input 
                  type="number"
                  name="sortOrder"
                  value={formData.sortOrder}
                  onChange={handleChange}
                  className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none focus:border-primary"
                />
              </div>
              
              <div className="flex items-center space-x-3 pt-6">
                <input 
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 rounded bg-surface border-border text-primary focus:ring-primary focus:ring-offset-background"
                />
                <label htmlFor="isActive" className="text-sm font-bold text-text-primary cursor-pointer">
                  Active (Published)
                </label>
              </div>
            </div>

            <div className="pt-6 border-t border-border flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" className="bg-primary text-white font-bold" disabled={isPending}>
                {isPending ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Banner')}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
