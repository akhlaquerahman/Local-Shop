import React, { useState } from 'react';
import { useAdminBrands, useCreateAdminBrand, useUpdateAdminBrand, useDeleteAdminBrand } from '../services/admin.queries';
import { AdminDataTable } from '@/components/table/AdminDataTable';
import { PaginationState, SortingState } from '@tanstack/react-table';
import { Button } from '@/components/ui/Button';
import { BrandModal, BrandData } from '../components/BrandModal';

export const BrandsPage: React.FC = () => {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedBrand, setSelectedBrand] = useState<BrandData | null>(null);

  const { data, isLoading } = useAdminBrands({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search,
    sortBy: sorting[0]?.id,
    sortOrder: sorting[0]?.desc ? 'desc' : 'asc'
  });

  const createMutation = useCreateAdminBrand();
  const updateMutation = useUpdateAdminBrand();

  const handleOpenModal = (mode: 'create' | 'edit' | 'view', brand?: any) => {
    setModalMode(mode);
    setSelectedBrand(brand || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBrand(null);
  };

  const handleModalSubmit = async (formData: any) => {
    if (modalMode === 'create') {
      await createMutation.mutateAsync(formData);
    } else if (modalMode === 'edit' && selectedBrand?.id) {
      await updateMutation.mutateAsync({ id: selectedBrand.id, data: formData });
    }
    handleCloseModal();
  };

  const handleVerify = async (brand: any) => {
    await updateMutation.mutateAsync({
      id: brand.id,
      data: { verificationStatus: 'VERIFIED' }
    });
  };

  const handleToggleStatus = async (brand: any) => {
    await updateMutation.mutateAsync({
      id: brand.id,
      data: { status: brand.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }
    });
  };

  const columns = [
    {
      header: 'Logo',
      accessorKey: 'logo',
      cell: ({ getValue }: any) => {
        const val = getValue();
        return val ? <img src={val} alt="Logo" className="w-10 h-10 rounded-md object-contain bg-surface-hover" /> : <div className="w-10 h-10 rounded-md bg-surface-hover flex items-center justify-center text-text-tertiary text-xs">N/A</div>;
      }
    },
    {
      header: 'Brand',
      accessorKey: 'brand',
      cell: (info: any) => <span className="font-semibold text-text-primary">{info.getValue()}</span>
    },
    {
      header: 'Products',
      accessorKey: 'products',
    },
    {
      header: 'Sellers',
      accessorKey: 'sellers',
    },
    {
      header: 'Revenue',
      accessorKey: 'revenue',
      cell: (info: any) => `₹${info.getValue().toLocaleString()}`
    },
    {
      header: 'Verification Status',
      accessorKey: 'verificationStatus',
      cell: ({ getValue }: any) => (
        <span className={`px-2 py-1 text-xs font-bold rounded-full ${getValue() === 'VERIFIED' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
          {getValue()}
        </span>
      )
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row, getValue }: any) => {
        const status = getValue();
        return (
          <button 
            onClick={() => handleToggleStatus(row.original)}
            disabled={updateMutation.isPending}
            className={`px-2 py-1 text-xs font-bold rounded-full cursor-pointer transition-colors ${status === 'ACTIVE' ? 'bg-success/10 text-success hover:bg-success/20' : 'bg-danger/10 text-danger hover:bg-danger/20'}`}
          >
            {status}
          </button>
        );
      }
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: ({ row }: any) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="h-8 text-xs px-2 py-1" onClick={() => handleOpenModal('view', row.original)}>View</Button>
          <Button size="sm" variant="outline" className="h-8 text-xs px-2 py-1" onClick={() => handleOpenModal('edit', row.original)}>Edit</Button>
          {row.original.verificationStatus !== 'VERIFIED' && (
            <Button size="sm" variant="outline" className="h-8 text-xs px-2 py-1 border-primary text-primary hover:bg-primary/10" onClick={() => handleVerify(row.original)} isLoading={updateMutation.isPending}>Verify</Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
            Brands <span className="text-text-secondary text-lg font-medium">({data?.meta?.total || 0})</span>
          </h1>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white" onClick={() => handleOpenModal('create')}>Add Brand</Button>
      </div>

      <AdminDataTable
        columns={columns}
        data={data?.data || []}
        pageCount={data?.meta?.totalPages || -1}
        totalRecords={data?.meta?.total || 0}
        isLoading={isLoading}
        onPaginationChange={setPagination}
        onSortingChange={setSorting}
        onSearchChange={setSearch}
        initialState={{ pagination, sorting }}
      />

      <BrandModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mode={modalMode}
        initialData={selectedBrand}
        onSubmit={handleModalSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
};

export default BrandsPage;
