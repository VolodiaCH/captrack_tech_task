import { useState } from 'react';
import { Category } from '../../types';
import { CategoryItem } from './CategoryItem';

interface CategoryListProps {
  categories: Category[];
  onUpdate: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  updatingId?: string;
  deletingId?: string;
}

export function CategoryList({
  categories,
  onUpdate,
  onDelete,
  updatingId,
  deletingId,
}: CategoryListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (categories.length === 0) return null;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: 'var(--spacing-lg)',
      }}
    >
      {categories.map((category) => (
        <CategoryItem
          key={category.id}
          category={category}
          onUpdate={(name) => onUpdate(category.id, name)}
          onDelete={() => onDelete(category.id)}
          isUpdating={updatingId === category.id}
          isDeleting={deletingId === category.id}
          isEditing={editingId === category.id}
          onStartEdit={() => setEditingId(category.id)}
          onCancelEdit={() => setEditingId(null)}
        />
      ))}
    </div>
  );
}
