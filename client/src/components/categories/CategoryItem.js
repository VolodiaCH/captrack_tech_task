import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { CategoryForm } from './CategoryForm';
export function CategoryItem({ category, onUpdate, onDelete, isUpdating, isDeleting, }) {
    const [isEditing, setIsEditing] = useState(false);
    if (isEditing) {
        return (_jsx("div", { style: {
                padding: 'var(--spacing-lg)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius)',
                backgroundColor: 'var(--color-bg)',
            }, children: _jsx(CategoryForm, { initialValue: category.name, onSubmit: (name) => {
                    onUpdate(name);
                    setIsEditing(false);
                }, isLoading: isUpdating }) }));
    }
    return (_jsxs("div", { style: {
            padding: 'var(--spacing-lg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            backgroundColor: 'var(--color-bg)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        }, children: [_jsxs("div", { children: [_jsx("p", { style: { margin: 0, color: 'var(--color-text)', fontWeight: '500' }, children: category.name }), category.isDefault && (_jsx("p", { style: { margin: 'var(--spacing-xs) 0 0 0', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }, children: "Default category" }))] }), _jsxs("div", { style: { display: 'flex', gap: 'var(--spacing-sm)' }, children: [!category.isDefault && (_jsx("button", { onClick: () => setIsEditing(true), disabled: isUpdating, style: {
                            padding: '0.5rem 0.75rem',
                            backgroundColor: 'var(--color-bg-secondary)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius)',
                            cursor: isUpdating ? 'not-allowed' : 'pointer',
                            fontSize: '0.875rem',
                            color: 'var(--color-text)',
                            opacity: isUpdating ? 0.5 : 1,
                        }, children: "Edit" })), !category.isDefault && (_jsx("button", { onClick: onDelete, disabled: isDeleting, style: {
                            padding: '0.5rem 0.75rem',
                            backgroundColor: '#fee2e2',
                            border: '1px solid #fecaca',
                            borderRadius: 'var(--radius)',
                            cursor: isDeleting ? 'not-allowed' : 'pointer',
                            fontSize: '0.875rem',
                            color: '#dc2626',
                            opacity: isDeleting ? 0.5 : 1,
                        }, children: "Delete" }))] })] }));
}
