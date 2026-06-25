import React, { useState } from 'react';
import { Package, Plus, Upload, Download, Search, Filter, Settings, Trash2, Edit } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { KPICard } from '@/components/ui/KPI';
import { DataTable } from '@/components/table';
import { useSellerProducts, useSellerProductStats, useDeleteProduct } from '../services/seller.queries';
import { useNotificationStore } from '@/store/notificationStore';
import { useAuthStore } from '@/store/authStore';
import { hasPermission } from '@/lib/permissionResolver';

export const ProductsPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const { data: stats, isLoading: statsLoading } = useSellerProductStats();
  const { data: products, isLoading: productsLoading } = useSellerProducts({ search });
  const deleteMutation = useDeleteProduct();
  const { addToast } = useNotificationStore();

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteMutation.mutateAsync(id);
        addToast({ title: 'Success', message: 'Product deleted', type: 'success' });
      } catch (err: any) {
        addToast({ title: 'Error', message: err.message || 'Failed to delete', type: 'error' });
      }
    }
  };

  const columns = [
    {
      header: 'Product',
      accessorKey: 'name',
      cell: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-surface border border-border flex items-center justify-center overflow-hidden">
            {row.imageUrl ? (
              <img src={row.imageUrl} alt={row.name} className="w-full h-full object-cover" />
            ) : (
              <Package size={16} className="text-text-secondary" />
            )}
          </div>
          <div>
            <p className="font-semibold text-text-primary text-sm">{row.name}</p>
            <p className="text-xs text-text-secondary">SKU: {row.sku}</p>
          </div>
        </div>
      )
    },
    { header: 'Category', accessorKey: 'category', cell: (row: any) => row.category },
    {
      header: 'MRP',
      accessorKey: 'mrp',
      cell: (row: any) => <span className="text-text-secondary text-sm">₹{row.mrp || 0}</span>
    },
    {
      header: 'Selling Price',
      accessorKey: 'price',
      cell: (row: any) => <span className="font-bold text-text-primary">₹{row.price || 0}</span>
    },
    { 
      header: 'Stock', 
      accessorKey: 'stock',
      cell: (row: any) => {
        const val = row.stock;
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${val > 10 ? 'bg-success/10 text-success' : val > 0 ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'}`}>
            {val} in stock
          </span>
        );
      }
    },
    { 
      header: 'Status', 
      accessorKey: 'status',
      cell: (row: any) => {
        const val = row.status;
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${val === 'ACTIVE' ? 'bg-success/10 text-success' : 'bg-surface text-text-secondary'}`}>
            {val}
          </span>
        );
      }
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: (row: any) => (
        <div className="flex gap-2">
          {hasPermission(user, 'products.edit') && (
            <Button variant="outline" size="sm" icon={<Edit size={14} />} onClick={() => navigate(`/seller/products/${row._id}/edit`)} />
          )}
          {hasPermission(user, 'products.delete') && (
            <Button variant="danger" size="sm" icon={<Trash2 size={14} />} isLoading={deleteMutation.isPending} onClick={() => handleDelete(row._id)} />
          )}
        </div>
      )
    }
  ];

  const tableData = (products || []).map((p: any) => ({ ...p, id: p._id }));

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Products Catalog</h1>
          <p className="text-sm text-text-secondary mt-1">Manage your store's items and pricing</p>
        </div>
        <div className="flex gap-2">
          {hasPermission(user, 'products.create') && (
            <>
              <Button variant="outline" icon={<Upload size={16} />} onClick={() => navigate('/seller/products/bulk-upload')}>Bulk Upload</Button>
              <Button icon={<Plus size={16} />} onClick={() => navigate('/seller/products/create')}>Add Product</Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard title="Total Products" value={stats?.total || 0} icon={<Package size={20} />} trend="+12% this month" loading={statsLoading} />
        <KPICard title="Active" value={stats?.active || 0} icon={<Package size={20} />} loading={statsLoading} />
        <KPICard title="Draft" value={stats?.draft || 0} icon={<Package size={20} />} loading={statsLoading} />
        <KPICard title="Low Stock" value={stats?.lowStock || 0} icon={<Package size={20} />} trend="Action Needed" trendType="warning" loading={statsLoading} />
        <KPICard title="Out of Stock" value={stats?.outOfStock || 0} icon={<Package size={20} />} trend="Action Needed" trendType="danger" loading={statsLoading} />
      </div>

      <div className="bg-surface border border-border rounded-xl flex flex-col">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 items-center justify-between bg-background/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
            <input 
              type="text" 
              placeholder="Search products by name or SKU..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" icon={<Filter size={16} />}>Filters</Button>
            <Button variant="outline" icon={<Download size={16} />}>Export</Button>
          </div>
        </div>
        <div className="p-4 overflow-x-auto">
          {productsLoading ? (
            <div className="h-64 flex items-center justify-center text-text-secondary">Loading products...</div>
          ) : (
            <DataTable columns={columns} data={tableData} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
