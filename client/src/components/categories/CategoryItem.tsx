import { useState } from 'react';
import { Category } from '../../types';
import { CategoryForm } from './CategoryForm';

interface CategoryItemProps {
  category: Category;
  onUpdate: (name: string) => void;
  onDelete: () => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

export function CategoryItem({
  category,
  onUpdate,
  onDelete,
  isUpdating,
  isDeleting,
}: CategoryItemProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <div
        style={{
          padding: 'var(--spacing-lg)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius)',
          backgroundColor: 'var(--color-bg)',
        }}
      >
        <CategoryForm
          initialValue={category.name}
          onSubmit={(name) => {
            onUpdate(name);
            setIsEditing(false);
          }}
          isLoading={isUpdating}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 'var(--spacing-lg)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius)',
        backgroundColor: 'var(--color-bg)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div>
        <p style={{ margin: 0, color: 'var(--color-text)', fontWeight: '500' }}>
          {category.name}
        </p>
        {category.isDefault && (
          <p style={{ margin: 'var(--spacing-xs) 0 0 0', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            Default category
          </p>
        )}
      </div>
      <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
        {!category.isDefault && (
          <button
            onClick={() => setIsEditing(true)}
            disabled={isUpdating}
            style={{
              padding: '0.5rem 0.75rem',
              backgroundColor: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              cursor: isUpdating ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              color: 'var(--color-text)',
              opacity: isUpdating ? 0.5 : 1,
            }}
          >
            Edit
          </button>
        )}
        {!category.isDefault && (
          <button
            onClick={onDelete}
            disabled={isDeleting}
            style={{
              padding: '0.5rem 0.75rem',
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: 'var(--radius)',
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              color: '#dc2626',
              opacity: isDeleting ? 0.5 : 1,
            }}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
