import React, { useState } from 'react';
import { useAdminCategories, useCreateAdminCategory, useUpdateAdminCategory, useDeleteAdminCategory } from '../services/admin.queries';
import { AdminDataTable } from '@/components/table/AdminDataTable';
import { PaginationState, SortingState } from '@tanstack/react-table';
import { Button } from '@/components/ui/Button';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { CategoryModal, CategoryData } from '../components/CategoryModal';
import { Dialog } from '@/components/ui/Dialog';

export const CategoriesPage: React.FC = () => {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const { data, isLoading } = useAdminCategories({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search,
    sortBy: sorting[0]?.id,
    sortOrder: sorting[0]?.desc ? 'desc' : 'asc'
  });

  const createMutation = useCreateAdminCategory();
  const updateMutation = useUpdateAdminCategory();
  const deleteMutation = useDeleteAdminCategory();

  const handleOpenModal = (mode: 'create' | 'edit' | 'view', category?: any) => {
    setModalMode(mode);
    if (category) {
      setSelectedCategory(category);
    } else {
      setSelectedCategory(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  const handleModalSubmit = async (payload: any) => {
    try {
      if (modalMode === 'create') {
        await createMutation.mutateAsync(payload);
      } else if (modalMode === 'edit' && selectedCategory?.id) {
        await updateMutation.mutateAsync({ id: selectedCategory.id, data: payload });
      }
      handleCloseModal();
    } catch (error) {
      console.error('Operation failed', error);
      alert('Operation failed. Check console for details.');
    }
  };

  const handleDeleteClick = (id: string) => {
    setCategoryToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (categoryToDelete) {
      try {
        await deleteMutation.mutateAsync(categoryToDelete);
      } catch (error) {
        console.error('Delete failed', error);
        alert('Delete failed. Check console for details.');
      }
    }
    setIsDeleteDialogOpen(false);
    setCategoryToDelete(null);
  };

  const handleToggleStatus = async (rowOriginal: any) => {
    try {
      await updateMutation.mutateAsync({
        id: rowOriginal.id,
        data: { isActive: rowOriginal.status === 'INACTIVE' } // If currently INACTIVE, we want to set it to true (ACTIVE)
      });
    } catch (err) {
      console.error('Toggle failed', err);
      alert('Failed to update status');
    }
  };

  const columns = [
    {
      header: 'Image',
      accessorKey: 'image',
      cell: ({ getValue }: any) => {
        const val = getValue();
        return val ? <img src={val} alt="Category" className="w-10 h-10 rounded-md object-cover bg-surface-hover" /> : <div className="w-10 h-10 rounded-md bg-surface-hover flex items-center justify-center text-text-tertiary text-xs">N/A</div>;
      }
    },
    {
      header: 'Category',
      accessorKey: 'category',
      cell: ({ getValue }: any) => (
        <span className="font-semibold text-text-primary">{getValue()}</span>
      )
    },
    {
      header: 'Description',
      accessorKey: 'description',
      cell: ({ getValue }: any) => {
        const val = getValue() || '-';
        return <span className="text-text-secondary truncate block max-w-[200px]" title={val}>{val}</span>;
      }
    },
    {
      header: 'Products',
      accessorKey: 'products',
    },
    {
      header: 'Stores',
      accessorKey: 'stores',
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row, getValue }: any) => {
        const status = getValue();
        const isActive = status === 'ACTIVE';
        return (
          <button 
            onClick={() => handleToggleStatus(row.original)}
            disabled={updateMutation.isPending}
            className={`px-2 py-1 text-xs font-bold rounded-full cursor-pointer transition-colors ${isActive ? 'bg-success/10 text-success hover:bg-success/20' : 'bg-danger/10 text-danger hover:bg-danger/20'}`}
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
          <Button size="sm" variant="outline" className="h-8 text-xs px-2 py-1 text-danger border-danger/30 hover:bg-danger/10" onClick={() => handleDeleteClick(row.original.id)}>Delete</Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
            Categories <span className="text-text-secondary text-lg font-medium">({data?.meta?.total || 0})</span>
          </h1>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white" onClick={() => handleOpenModal('create')}>Add Category</Button>
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
        getSubRows={(row: any) => row.subCategories || undefined}
      />

      <CategoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mode={modalMode}
        initialData={selectedCategory}
        onSubmit={handleModalSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <Dialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Confirm Deletion"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={deleteMutation.isPending}>
              Cancel
            </Button>
            <Button className="bg-danger hover:bg-danger/90 text-white" onClick={confirmDelete} isLoading={deleteMutation.isPending}>
              Delete
            </Button>
          </>
        }
      >
        <div className="text-text-secondary text-sm">
          Are you sure you want to delete this category? This action cannot be undone.
        </div>
      </Dialog>
    </div>
  );
};
export default CategoriesPage;
