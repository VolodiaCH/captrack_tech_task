import { jsx as _jsx } from "react/jsx-runtime";
import { CategoryItem } from './CategoryItem';
export function CategoryList({ categories, onUpdate, onDelete, updatingId, deletingId, }) {
    if (categories.length === 0)
        return null;
    return (_jsx("div", { style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: 'var(--spacing-lg)',
        }, children: categories.map((category) => (_jsx(CategoryItem, { category: category, onUpdate: (name) => onUpdate(category.id, name), onDelete: () => onDelete(category.id), isUpdating: updatingId === category.id, isDeleting: deletingId === category.id }, category.id))) }));
}
