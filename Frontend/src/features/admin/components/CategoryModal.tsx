import React, { useState, useEffect, useRef } from 'react';
import { Drawer } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';

export interface CategoryData {
  id?: string;
  category: string;
  description?: string;
  image?: string;
}

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'view';
  initialData?: CategoryData | null;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  mode,
  initialData,
  onSubmit,
  isLoading
}) => {
  const [formData, setFormData] = useState<Partial<CategoryData>>({
    category: '',
    description: '',
    image: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData(initialData);
    } else if (isOpen && mode === 'create') {
      setFormData({
        category: '',
        description: '',
        image: '',
      });
    }
  }, [isOpen, initialData, mode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    // Map 'category' to 'name' for the backend
    const payload = {
      name: formData.category,
      description: formData.description,
      image: formData.image,
    };
    await onSubmit(payload);
  };

  const isReadOnly = mode === 'view';
  const title = mode === 'create' ? 'Add Category' : mode === 'edit' ? 'Edit Category' : 'View Category';

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
            Category Name *
          </label>
          <input
            type="text"
            name="category"
            value={formData.category || ''}
            onChange={handleChange}
            readOnly={isReadOnly}
            className={`w-full px-3 py-2 bg-surface border border-border rounded-md text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none ${!isReadOnly && 'focus:border-primary'} transition-colors`}
            placeholder="e.g. Groceries"
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
            placeholder="Category description..."
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1 uppercase tracking-wider">
            Category Image
          </label>
          {formData.image && (
            <div className="mb-2">
              <img src={formData.image} alt="Preview" className="w-24 h-24 object-cover rounded-md border border-border bg-surface-hover" />
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
                Choose Image
              </Button>
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
};
