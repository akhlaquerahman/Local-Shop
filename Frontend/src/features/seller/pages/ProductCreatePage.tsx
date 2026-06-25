import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { FormInput, FormSelect, FormTextarea } from '@/components/form/FormFields';
import { useNotificationStore } from '@/store/notificationStore';
import { useCreateProduct, useSellerBrands } from '../services/seller.queries';
import { useCategories } from '@/hooks/queries';

const productSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  brand: z.string().optional(),
  subCategory: z.string().optional(),
  sku: z.string().min(3, 'SKU is required'),
  price: z.coerce.number().min(1, 'Price must be greater than 0'),
  mrp: z.coerce.number().min(1, 'MRP must be greater than 0'),
  stock: z.coerce.number().min(0, 'Stock cannot be negative'),
  weight: z.coerce.number().optional(),
  status: z.enum(['ACTIVE', 'DRAFT']),
  imageUrl: z.string().min(1, 'Product image is required'),
  newCategory: z.string().optional(),
  categoryDescription: z.string().optional(),
  newCategoryImage: z.string().optional(),
  newBrand: z.string().optional(),
  newBrandLogo: z.string().optional()
}).refine(data => {
  if (data.category === 'Others' && (!data.newCategory || data.newCategory.trim() === '')) {
    return false;
  }
  return true;
}, {
  message: 'New category name is required',
  path: ['newCategory']
}).refine(data => {
  if (data.category === 'Others' && (!data.newCategoryImage || data.newCategoryImage.trim() === '')) {
    return false;
  }
  return true;
}, {
  message: 'Category image is required when creating a new category',
  path: ['newCategoryImage']
}).refine(data => {
  if (data.brand === 'Others' && (!data.newBrand || data.newBrand.trim() === '')) {
    return false;
  }
  return true;
}, {
  message: 'New brand name is required',
  path: ['newBrand']
});

type ProductFormValues = z.infer<typeof productSchema>;

export const ProductCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useNotificationStore();
  const createMutation = useCreateProduct();
  const { data: categories = [] } = useCategories();
  const { data: brands = [] } = useSellerBrands();

  const categoryOptions = React.useMemo(() => {
    const opts = categories.map((c: any) => ({ label: c.name, value: c.name }));
    opts.push({ label: 'Others', value: 'Others' });
    return opts;
  }, [categories]);

  const brandOptions = React.useMemo(() => {
    const opts = brands.map((b: any) => ({ label: b.name, value: b.name }));
    opts.push({ label: 'Others', value: 'Others' });
    return opts;
  }, [brands]);

  const methods = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '', description: '', category: '', brand: '', newCategory: '', categoryDescription: '', newCategoryImage: '', newBrand: '', newBrandLogo: '', subCategory: '',
      sku: '', price: 0, mrp: 0, stock: 0, weight: 0,
      status: 'ACTIVE', imageUrl: ''
    }
  });

  const queryClient = useQueryClient();

  const onSubmit = async (data: ProductFormValues) => {
    try {
      const finalCategory = data.category === 'Others' ? data.newCategory : data.category;
      const finalBrand = data.brand === 'Others' ? data.newBrand : data.brand;
      const payload: any = {
        ...data,
        category: finalCategory,
        brand: finalBrand,
      };
      if (data.category === 'Others') {
        payload.categoryImage = data.newCategoryImage;
        payload.categoryDescription = data.categoryDescription;
      }
      if (data.brand === 'Others') {
        payload.brandLogo = data.newBrandLogo;
      }
      delete payload.newCategory;
      delete payload.newCategoryImage;
      delete payload.newBrand;
      delete payload.newBrandLogo;
      
      await createMutation.mutateAsync(payload);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['seller-brands'] });
      addToast({ title: 'Success', message: 'Product created successfully', type: 'success' });
      navigate('/seller/products');
    } catch (err: any) {
      addToast({ title: 'Error', message: err.message || 'Failed to create product', type: 'error' });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left pb-20">
      <div className="flex items-center gap-4">
        <Link to="/seller/products">
          <Button variant="outline" size="sm" icon={<ArrowLeft size={16} />} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Add New Product</h1>
          <p className="text-sm text-text-secondary">Create a new product listing in your catalog</p>
        </div>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
          
          <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-text-primary border-b border-border pb-2">Media</h2>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-text-primary">Product Image</label>
              <div className="flex items-center gap-4">
                {methods.watch('imageUrl') && (
                  <img src={methods.watch('imageUrl')} alt="Preview" className="w-20 h-20 object-cover rounded-xl border border-border" />
                )}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => methods.setValue('imageUrl', reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="block w-full text-sm text-text-secondary
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-accent/10 file:text-accent
                    hover:file:bg-accent/20"
                />
              </div>
              {methods.formState.errors.imageUrl && (
                <p className="text-danger text-xs mt-1">{methods.formState.errors.imageUrl.message}</p>
              )}
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-text-primary border-b border-border pb-2">Basic Information</h2>
            <FormInput name="name" label="Product Name" placeholder="e.g. Organic Ashwagandha Root" />
            <FormTextarea name="description" label="Description" placeholder="Detailed product description..." rows={4} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput name="sku" label="SKU (Stock Keeping Unit)" placeholder="e.g. ORG-ASH-001" />
              <FormSelect name="status" label="Status" options={[
                { label: 'Active (Visible)', value: 'ACTIVE' },
                { label: 'Draft (Hidden)', value: 'DRAFT' }
              ]} />
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-text-primary border-b border-border pb-2">Categorization</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <FormSelect name="category" label="Category" options={categoryOptions} />
                {methods.watch('category') === 'Others' && (
                  <div className="space-y-4 border-t border-border pt-4 mt-2">
                    <FormInput name="newCategory" label="Enter New Category Name" placeholder="e.g. Exotic Fruits" />
                    <FormTextarea name="categoryDescription" label="Category Description (Optional)" placeholder="Brief description of the category..." rows={2} />
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-text-primary">Category Image</label>
                      <div className="flex items-center gap-4">
                        {methods.watch('newCategoryImage') && (
                          <img src={methods.watch('newCategoryImage')} alt="Category Preview" className="w-16 h-16 object-cover rounded-xl border border-border" />
                        )}
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => methods.setValue('newCategoryImage', reader.result as string);
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="block w-full text-xs text-text-secondary
                            file:mr-4 file:py-1.5 file:px-3
                            file:rounded-full file:border-0
                            file:text-xs file:font-semibold
                            file:bg-accent/10 file:text-accent
                            hover:file:bg-accent/20"
                        />
                      </div>
                      {methods.formState.errors.newCategoryImage && (
                        <p className="text-danger text-xs mt-1">{methods.formState.errors.newCategoryImage.message}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <FormSelect name="brand" label="Brand" options={brandOptions} />
                {methods.watch('brand') === 'Others' && (
                  <div className="space-y-4 border-t border-border pt-4 mt-2">
                    <FormInput name="newBrand" label="Enter New Brand Name" placeholder="e.g. Puma" />
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-text-primary">Brand Logo (Optional)</label>
                      <div className="flex items-center gap-4">
                        {methods.watch('newBrandLogo') && (
                          <img src={methods.watch('newBrandLogo')} alt="Brand Preview" className="w-16 h-16 object-contain rounded-xl border border-border bg-surface-hover p-1" />
                        )}
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => methods.setValue('newBrandLogo', reader.result as string);
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="block w-full text-xs text-text-secondary
                            file:mr-4 file:py-1.5 file:px-3
                            file:rounded-full file:border-0
                            file:text-xs file:font-semibold
                            file:bg-accent/10 file:text-accent
                            hover:file:bg-accent/20"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <FormInput name="subCategory" label="Sub Category (Optional)" placeholder="e.g. Herbal Powders" />
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-text-primary border-b border-border pb-2">Pricing & Inventory</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormInput name="mrp" label="MRP (₹)" type="number" />
              <FormInput name="price" label="Selling Price (₹)" type="number" />
              <FormInput name="stock" label="Available Stock" type="number" />
              <FormInput name="weight" label="Weight (grams) - Optional" type="number" />
            </div>
          </div>

          <div className="flex justify-end gap-4 border-t border-border pt-6">
            <Link to="/seller/products">
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" isLoading={createMutation.isPending} icon={<Save size={16} />}>
              Save Product
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default ProductCreatePage;
