import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { createTransactionSchema } from '../../validation/formSchemas';
export function TransactionForm({ categories, onSubmit, isLoading, initialData, }) {
    const [formData, setFormData] = useState(initialData || {
        categoryId: '',
        title: '',
        amount: '',
        currency: 'USD',
        date: new Date().toISOString().split('T')[0],
        notes: '',
    });
    const [errors, setErrors] = useState({});
    const validateForm = () => {
        const result = createTransactionSchema.safeParse(formData);
        if (!result.success) {
            const newErrors = {};
            result.error.errors.forEach((error) => {
                const field = error.path[0];
                newErrors[field] = error.message;
            });
            setErrors(newErrors);
            return false;
        }
        setErrors({});
        return true;
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData);
        }
    };
    return (_jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { style: { marginBottom: 'var(--spacing-lg)' }, children: [_jsx("label", { style: {
                            display: 'block',
                            marginBottom: 'var(--spacing-sm)',
                            color: 'var(--color-text)',
                            fontSize: '0.875rem',
                        }, children: "Title *" }), _jsx("input", { type: "text", value: formData.title, onChange: (e) => setFormData({ ...formData, title: e.target.value }), placeholder: "Transaction title", style: {
                            width: '100%',
                            padding: 'var(--spacing-sm) var(--spacing-md)',
                            border: errors.title ? '2px solid #dc2626' : '1px solid var(--color-border)',
                            borderRadius: 'var(--radius)',
                            backgroundColor: 'var(--color-bg)',
                            color: 'var(--color-text)',
                            boxSizing: 'border-box',
                        } }), errors.title && (_jsx("p", { style: { margin: 'var(--spacing-xs) 0 0 0', color: '#dc2626', fontSize: '0.75rem' }, children: errors.title }))] }), _jsxs("div", { style: { marginBottom: 'var(--spacing-lg)' }, children: [_jsx("label", { style: {
                            display: 'block',
                            marginBottom: 'var(--spacing-sm)',
                            color: 'var(--color-text)',
                            fontSize: '0.875rem',
                        }, children: "Category *" }), _jsxs("select", { value: formData.categoryId, onChange: (e) => setFormData({ ...formData, categoryId: e.target.value }), style: {
                            width: '100%',
                            padding: 'var(--spacing-sm) var(--spacing-md)',
                            border: errors.categoryId ? '2px solid #dc2626' : '1px solid var(--color-border)',
                            borderRadius: 'var(--radius)',
                            backgroundColor: 'var(--color-bg)',
                            color: 'var(--color-text)',
                            boxSizing: 'border-box',
                        }, children: [_jsx("option", { value: "", children: "Select a category" }), categories.map((cat) => (_jsx("option", { value: cat.id, children: cat.name }, cat.id)))] }), errors.categoryId && (_jsx("p", { style: { margin: 'var(--spacing-xs) 0 0 0', color: '#dc2626', fontSize: '0.75rem' }, children: errors.categoryId }))] }), _jsxs("div", { style: { marginBottom: 'var(--spacing-lg)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }, children: [_jsxs("div", { children: [_jsx("label", { style: {
                                    display: 'block',
                                    marginBottom: 'var(--spacing-sm)',
                                    color: 'var(--color-text)',
                                    fontSize: '0.875rem',
                                }, children: "Amount *" }), _jsx("input", { type: "number", step: "0.01", value: formData.amount, onChange: (e) => setFormData({ ...formData, amount: e.target.value }), placeholder: "0.00", style: {
                                    width: '100%',
                                    padding: 'var(--spacing-sm) var(--spacing-md)',
                                    border: errors.amount ? '2px solid #dc2626' : '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius)',
                                    backgroundColor: 'var(--color-bg)',
                                    color: 'var(--color-text)',
                                    boxSizing: 'border-box',
                                } }), errors.amount && (_jsx("p", { style: { margin: 'var(--spacing-xs) 0 0 0', color: '#dc2626', fontSize: '0.75rem' }, children: errors.amount }))] }), _jsxs("div", { children: [_jsx("label", { style: {
                                    display: 'block',
                                    marginBottom: 'var(--spacing-sm)',
                                    color: 'var(--color-text)',
                                    fontSize: '0.875rem',
                                }, children: "Currency" }), _jsxs("select", { value: formData.currency, onChange: (e) => setFormData({ ...formData, currency: e.target.value }), style: {
                                    width: '100%',
                                    padding: 'var(--spacing-sm) var(--spacing-md)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius)',
                                    backgroundColor: 'var(--color-bg)',
                                    color: 'var(--color-text)',
                                    boxSizing: 'border-box',
                                }, children: [_jsx("option", { value: "USD", children: "USD" }), _jsx("option", { value: "EUR", children: "EUR" }), _jsx("option", { value: "GBP", children: "GBP" }), _jsx("option", { value: "CAD", children: "CAD" }), _jsx("option", { value: "AUD", children: "AUD" })] })] })] }), _jsxs("div", { style: { marginBottom: 'var(--spacing-lg)' }, children: [_jsx("label", { style: {
                            display: 'block',
                            marginBottom: 'var(--spacing-sm)',
                            color: 'var(--color-text)',
                            fontSize: '0.875rem',
                        }, children: "Date *" }), _jsx("input", { type: "date", value: formData.date, onChange: (e) => setFormData({ ...formData, date: e.target.value }), style: {
                            width: '100%',
                            padding: 'var(--spacing-sm) var(--spacing-md)',
                            border: errors.date ? '2px solid #dc2626' : '1px solid var(--color-border)',
                            borderRadius: 'var(--radius)',
                            backgroundColor: 'var(--color-bg)',
                            color: 'var(--color-text)',
                            boxSizing: 'border-box',
                        } }), errors.date && (_jsx("p", { style: { margin: 'var(--spacing-xs) 0 0 0', color: '#dc2626', fontSize: '0.75rem' }, children: errors.date }))] }), _jsxs("div", { style: { marginBottom: 'var(--spacing-lg)' }, children: [_jsx("label", { style: {
                            display: 'block',
                            marginBottom: 'var(--spacing-sm)',
                            color: 'var(--color-text)',
                            fontSize: '0.875rem',
                        }, children: "Notes" }), _jsx("textarea", { value: formData.notes, onChange: (e) => setFormData({ ...formData, notes: e.target.value }), placeholder: "Optional notes", style: {
                            width: '100%',
                            padding: 'var(--spacing-sm) var(--spacing-md)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius)',
                            backgroundColor: 'var(--color-bg)',
                            color: 'var(--color-text)',
                            boxSizing: 'border-box',
                            minHeight: '80px',
                            fontFamily: 'inherit',
                        } })] }), _jsx("button", { type: "submit", disabled: isLoading, style: {
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
                }, children: isLoading ? 'Saving...' : 'Save Transaction' })] }));
}
