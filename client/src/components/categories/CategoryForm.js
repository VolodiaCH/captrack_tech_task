import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { createCategorySchema } from '../../validation/formSchemas';
export function CategoryForm({ onSubmit, isLoading, initialValue }) {
    const [name, setName] = useState(initialValue || '');
    const [error, setError] = useState('');
    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        const result = createCategorySchema.safeParse({ name });
        if (!result.success) {
            setError(result.error.errors[0]?.message || 'Invalid category name');
            return;
        }
        onSubmit(result.data.name);
    };
    return (_jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { style: { marginBottom: 'var(--spacing-lg)' }, children: [_jsx("label", { style: {
                            display: 'block',
                            marginBottom: 'var(--spacing-sm)',
                            color: 'var(--color-text)',
                            fontSize: '0.875rem',
                        }, children: "Category Name *" }), _jsx("input", { type: "text", value: name, onChange: (e) => setName(e.target.value), placeholder: "Enter category name", maxLength: 50, style: {
                            width: '100%',
                            padding: 'var(--spacing-sm) var(--spacing-md)',
                            border: error ? '2px solid #dc2626' : '1px solid var(--color-border)',
                            borderRadius: 'var(--radius)',
                            backgroundColor: 'var(--color-bg)',
                            color: 'var(--color-text)',
                            boxSizing: 'border-box',
                        } }), error && (_jsx("p", { style: { margin: 'var(--spacing-xs) 0 0 0', color: '#dc2626', fontSize: '0.75rem' }, children: error }))] }), _jsx("button", { type: "submit", disabled: isLoading, style: {
                    width: '100%',
                    padding: 'var(--spacing-md) var(--spacing-lg)',
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius)',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.5 : 1,
                    fontSize: '1rem',
                    fontWeight: '500',
                }, children: isLoading ? 'Saving...' : initialValue ? 'Update Category' : 'Create Category' })] }));
}
