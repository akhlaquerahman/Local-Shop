import React, { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { FormInput, FormSelect, FormTextarea } from '@/components/form/FormFields';
import { useNotificationStore } from '@/store/notificationStore';
import { useSellerProduct, useUpdateProduct } from '../services/seller.queries';

const productSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  subCategory: z.string().optional(),
  sku: z.string().min(3, 'SKU is required'),
  price: z.coerce.number().min(1, 'Price must be greater than 0'),
  mrp: z.coerce.number().min(1, 'MRP must be greater than 0'),
  stock: z.coerce.number().min(0, 'Stock cannot be negative'),
  weight: z.coerce.number().optional(),
  status: z.enum(['ACTIVE', 'DRAFT']),
  imageUrl: z.string().min(1, 'Product image is required')
});

type ProductFormValues = z.infer<typeof productSchema>;

export const ProductEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useNotificationStore();
  
  const { data: product, isLoading } = useSellerProduct(id || '');
  const updateMutation = useUpdateProduct();

  const methods = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '', description: '', category: '', subCategory: '',
      sku: '', price: 0, mrp: 0, stock: 0, weight: 0,
      status: 'ACTIVE', imageUrl: ''
    }
  });

  useEffect(() => {
    if (product) {
      methods.reset({
        name: product.name || '',
        description: product.description || '',
        category: product.category || '',
        subCategory: product.subCategory || '',
        sku: product.sku || '',
        price: product.price || 0,
        mrp: product.mrp || 0,
        stock: product.stock || 0,
        weight: product.weight || 0,
        status: product.status || 'ACTIVE',
        imageUrl: product.imageUrl || ''
      });
    }
  }, [product, methods]);

  const onSubmit = async (data: ProductFormValues) => {
    try {
      if (!id) return;
      const payload = {
        ...data,
      };
      
      await updateMutation.mutateAsync({ id, data: payload });
      addToast({ title: 'Success', message: 'Product updated successfully', type: 'success' });
      navigate('/seller/products');
    } catch (err: any) {
      addToast({ title: 'Error', message: err.message || 'Failed to update product', type: 'error' });
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-text-secondary">Loading product details...</div>;
  }

  if (!product) {
    return <div className="p-8 text-center text-danger">Product not found</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left pb-20">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/seller/products">
            <Button variant="outline" size="sm" icon={<ArrowLeft size={16} />} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">Edit Product</h1>
            <p className="text-sm text-text-secondary">Update product details for {product.name}</p>
          </div>
        </div>
        <Button 
          onClick={methods.handleSubmit(onSubmit)} 
          isLoading={updateMutation.isPending} 
          icon={<Save size={16} />}
        >
          Save Changes
        </Button>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
          
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
              <FormInput name="category" label="Category" placeholder="e.g. Health & Supplements" />
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
        </form>
      </FormProvider>
    </div>
  );
};

export default ProductEditPage;
