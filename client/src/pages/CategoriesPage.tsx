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
import { Toast, useToast } from '../components/common/Toast';

export default function CategoriesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast, showError, showSuccess, clearToast } = useToast();

  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const handleCreate = async (name: string) => {
    try {
      await createCategory.mutateAsync(name);
      showSuccess('Category created successfully');
      setModalOpen(false);
    } catch (error) {
      showError('Failed to create category. Please try again.');
    }
  };

  const handleUpdate = async (id: string, name: string) => {
    try {
      setUpdatingId(id);
      await updateCategory.mutateAsync({ id, name });
      showSuccess('Category updated successfully');
      setUpdatingId(null);
    } catch (error) {
      showError('Failed to update category. Please try again.');
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteCategory.mutateAsync(id);
      showSuccess('Category deleted successfully');
      setDeletingId(null);
      setDeleteConfirm(null);
    } catch (error) {
      showError('Failed to delete category. Please try again.');
      setDeletingId(null);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={clearToast}
        />
      )}

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
