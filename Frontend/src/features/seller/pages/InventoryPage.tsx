import React, { useState } from 'react';
import { Package, Search, Download, Edit2, AlertTriangle, CheckCircle, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { KPICard } from '@/components/ui/KPI';
import { DataTable } from '@/components/table';
import { useSellerInventory, useUpdateInventory } from '../services/seller.queries';
import { useNotificationStore } from '@/store/notificationStore';

export const InventoryPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ mrp: number, price: number, stock: number, reorderLevel: number }>({ mrp: 0, price: 0, stock: 0, reorderLevel: 0 });

  const { data: inventory, isLoading } = useSellerInventory();
  const updateMutation = useUpdateInventory();
  const { addToast } = useNotificationStore();

  const handleEditClick = (product: any) => {
    setEditingId(product._id);
    setEditValues({ mrp: product.mrp || 0, price: product.price || 0, stock: product.stock || 0, reorderLevel: product.reorderLevel || 10 });
  };

  const handleSave = async (id: string) => {
    try {
      await updateMutation.mutateAsync({ id, data: editValues });
      addToast({ title: 'Success', message: 'Inventory updated successfully', type: 'success' });
      setEditingId(null);
    } catch (err: any) {
      addToast({ title: 'Error', message: err.message || 'Failed to update inventory', type: 'error' });
    }
  };

  const filteredData = inventory?.filter((p: any) => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())) || [];

  const totalSkus = inventory?.length || 0;
  const inStock = inventory?.filter((p: any) => p.stock > 10).length || 0;
  const lowStock = inventory?.filter((p: any) => p.stock > 0 && p.stock <= (p.reorderLevel || 10)).length || 0;
  const outOfStock = inventory?.filter((p: any) => p.stock <= 0).length || 0;

  const columns = [
    { header: 'SKU', accessorKey: 'sku', cell: (row: any) => <span className="font-mono text-xs">{row.sku}</span> },
    { header: 'Product Name', accessorKey: 'name', cell: (row: any) => <span className="font-semibold text-text-primary text-sm">{row.name}</span> },
    { 
      header: 'MRP', 
      accessorKey: 'mrp',
      cell: (row: any) => {
        if (editingId === row._id) {
          return <input type="number" className="w-20 px-2 py-1 border border-border rounded bg-background text-sm" value={editValues.mrp} onChange={(e) => setEditValues({ ...editValues, mrp: parseInt(e.target.value) || 0 })} />;
        }
        return <span className="text-text-secondary text-sm">₹{row.mrp || 0}</span>;
      }
    },
    { 
      header: 'Selling Price', 
      accessorKey: 'price',
      cell: (row: any) => {
        if (editingId === row._id) {
          return <input type="number" className="w-20 px-2 py-1 border border-border rounded bg-background text-sm" value={editValues.price} onChange={(e) => setEditValues({ ...editValues, price: parseInt(e.target.value) || 0 })} />;
        }
        return <span className="font-semibold text-text-primary text-sm">₹{row.price || 0}</span>;
      }
    },
    { 
      header: 'Available Stock', 
      accessorKey: 'stock',
      cell: (row: any) => {
        const id = row._id;
        if (editingId === id) {
          return <input type="number" className="w-20 px-2 py-1 border border-border rounded bg-background text-sm" value={editValues.stock} onChange={(e) => setEditValues({ ...editValues, stock: parseInt(e.target.value) || 0 })} />;
        }
        const val = row.stock;
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${val > 10 ? 'bg-success/10 text-success' : val > 0 ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'}`}>
            {val}
          </span>
        );
      }
    },
    { header: 'Reserved Stock', accessorKey: 'reservedStock', cell: (row: any) => <span className="text-text-secondary">{row.reservedStock || 0}</span> },
    { 
      header: 'Reorder Level', 
      accessorKey: 'reorderLevel',
      cell: (row: any) => {
        const id = row._id;
        if (editingId === id) {
          return <input type="number" className="w-20 px-2 py-1 border border-border rounded bg-background text-sm" value={editValues.reorderLevel} onChange={(e) => setEditValues({ ...editValues, reorderLevel: parseInt(e.target.value) || 0 })} />;
        }
        return <span className="text-text-secondary">{row.reorderLevel || 10}</span>;
      }
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: (row: any) => {
        const id = row._id;
        if (editingId === id) {
          return (
            <div className="flex gap-2">
              <Button size="sm" onClick={() => handleSave(id)} isLoading={updateMutation.isPending} icon={<Save size={14} />}>Save</Button>
              <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>Cancel</Button>
            </div>
          );
        }
        return <Button variant="outline" size="sm" icon={<Edit2 size={14} />} onClick={() => handleEditClick(row)}>Adjust</Button>;
      }
    }
  ];

  const tableData = filteredData.map((p: any) => ({ ...p, id: p._id }));

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto text-left pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Inventory Management</h1>
          <p className="text-sm text-text-secondary">Track and adjust your stock levels across all SKUs</p>
        </div>
        <Button variant="outline" icon={<Download size={16} />}>Export Inventory</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total SKUs" value={totalSkus} icon={<Package size={20} />} loading={isLoading} />
        <KPICard title="In Stock" value={inStock} icon={<CheckCircle size={20} />} trendType="success" loading={isLoading} />
        <KPICard title="Low Stock" value={lowStock} icon={<AlertTriangle size={20} />} trend="Reorder soon" trendType="warning" loading={isLoading} />
        <KPICard title="Out of Stock" value={outOfStock} icon={<Package size={20} />} trend="Requires action" trendType="danger" loading={isLoading} />
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border bg-background flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
            <input 
              type="text" 
              placeholder="Search by SKU or Product Name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:border-primary focus:outline-none"
            />
          </div>
        </div>
        <div className="p-4 overflow-x-auto">
          {isLoading ? (
            <div className="h-64 flex items-center justify-center text-text-secondary">Loading inventory...</div>
          ) : (
            <DataTable columns={columns} data={tableData} />
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;
