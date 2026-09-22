import { useState } from 'react';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '../hooks/useCategories';
import { CategoryForm } from '../components/categories/CategoryForm';
import { CategoryList } from '../components/categories/CategoryList';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';

export default function CategoriesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const handleCreate = async (name: string) => {
    await createCategory.mutateAsync(name);
    setModalOpen(false);
  };

  const handleUpdate = async (id: string, name: string) => {
    setUpdatingId(id);
    await updateCategory.mutateAsync({ id, name });
    setUpdatingId(null);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await deleteCategory.mutateAsync(id);
    setDeletingId(null);
    setDeleteConfirm(null);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <div
        style={{
          marginBottom: 'var(--spacing-lg)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h1>Categories</h1>
        <button
          onClick={() => setModalOpen(true)}
          style={{
            padding: 'var(--spacing-sm) var(--spacing-lg)',
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius)',
            cursor: 'pointer',
          }}
        >
          + New Category
        </button>
      </div>

      {!categories || categories.length === 0 ? (
        <EmptyState
          title="No categories yet"
          description="Create your first category to organize your transactions."
          action={() => setModalOpen(true)}
          actionLabel="Create Category"
        />
      ) : (
        <CategoryList
          categories={categories}
          onUpdate={handleUpdate}
          onDelete={(id) => setDeleteConfirm(id)}
          updatingId={updatingId || undefined}
          deletingId={deletingId || undefined}
        />
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Category"
      >
        <CategoryForm
          onSubmit={handleCreate}
          isLoading={createCategory.isPending}
        />
      </Modal>

      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Category"
      >
        <p style={{ marginBottom: 'var(--spacing-lg)' }}>
          Are you sure you want to delete this category? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
          <button
            onClick={() => setDeleteConfirm(null)}
            style={{
              flex: 1,
              padding: 'var(--spacing-md)',
              backgroundColor: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            style={{
              flex: 1,
              padding: 'var(--spacing-md)',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius)',
              cursor: 'pointer',
            }}
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
