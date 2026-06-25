import React, { useState, useEffect, useRef } from 'react';
import { Drawer } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';

export interface BrandData {
  id?: string;
  brand: string;
  description?: string;
  logo?: string | null;
  verificationStatus?: string;
  status?: string;
}

interface BrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'view';
  initialData?: BrandData | null;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export const BrandModal: React.FC<BrandModalProps> = ({
  isOpen,
  onClose,
  mode,
  initialData,
  onSubmit,
  isLoading
}) => {
  const [formData, setFormData] = useState<Partial<BrandData>>({
    brand: '',
    description: '',
    logo: '',
    verificationStatus: 'UNVERIFIED',
    status: 'ACTIVE'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData(initialData);
    } else if (isOpen && mode === 'create') {
      setFormData({
        brand: '',
        description: '',
        logo: '',
        verificationStatus: 'UNVERIFIED',
        status: 'ACTIVE'
      });
    }
  }, [isOpen, initialData, mode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    // Map 'brand' to 'name' for backend
    const payload = {
      name: formData.brand,
      description: formData.description,
      logo: formData.logo,
      verificationStatus: formData.verificationStatus,
      status: formData.status
    };
    await onSubmit(payload);
  };

  const isReadOnly = mode === 'view';
  const title = mode === 'create' ? 'Add Brand' : mode === 'edit' ? 'Edit Brand' : 'View Brand';

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="md"
      footer={
        !isReadOnly && (
          <>
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-white" onClick={handleSubmit} isLoading={isLoading}>
              {mode === 'create' ? 'Create' : 'Save Changes'}
            </Button>
          </>
        )
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1 uppercase tracking-wider">
            Brand Name *
          </label>
          <input
            type="text"
            name="brand"
            value={formData.brand || ''}
            onChange={handleChange}
            readOnly={isReadOnly}
            className={`w-full px-3 py-2 bg-surface border border-border rounded-md text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none ${!isReadOnly && 'focus:border-primary'} transition-colors`}
            placeholder="e.g. Nike"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1 uppercase tracking-wider">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            readOnly={isReadOnly}
            rows={3}
            className={`w-full px-3 py-2 bg-surface border border-border rounded-md text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none ${!isReadOnly && 'focus:border-primary'} transition-colors resize-none`}
            placeholder="Brand description..."
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1 uppercase tracking-wider">
            Verification Status
          </label>
          <select
            name="verificationStatus"
            value={formData.verificationStatus || 'UNVERIFIED'}
            onChange={handleChange}
            disabled={isReadOnly}
            className={`w-full px-3 py-2 bg-surface border border-border rounded-md text-sm text-text-primary focus:outline-none ${!isReadOnly && 'focus:border-primary'} transition-colors`}
          >
            <option value="UNVERIFIED">Unverified</option>
            <option value="VERIFIED">Verified</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1 uppercase tracking-wider">
            Brand Logo
          </label>
          {formData.logo && (
            <div className="mb-2">
              <img src={formData.logo} alt="Preview" className="w-24 h-24 object-contain rounded-md border border-border bg-surface-hover p-2" />
            </div>
          )}
          {!isReadOnly && (
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full text-xs"
              >
                Choose Logo
              </Button>
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
};
