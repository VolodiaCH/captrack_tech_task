import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTransactions, useCreateTransaction, useDeleteTransaction } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import { TransactionsTable } from '../components/transactions/TransactionsTable';
import { TransactionForm } from '../components/transactions/TransactionForm';
import { FilterBar } from '../components/transactions/FilterBar';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Toast, useToast } from '../components/common/Toast';
export default function TransactionsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const { toast, showError, showSuccess, clearToast } = useToast();
    const filters = {
        search: searchParams.get('search') || undefined,
        categoryId: searchParams.get('categoryId') || undefined,
        dateRange: searchParams.get('dateRange') || undefined,
        startDate: searchParams.get('startDate') || undefined,
        endDate: searchParams.get('endDate') || undefined,
        minAmount: searchParams.get('minAmount') ? parseFloat(searchParams.get('minAmount')) : undefined,
        maxAmount: searchParams.get('maxAmount') ? parseFloat(searchParams.get('maxAmount')) : undefined,
    };
    const { data: transactions, isLoading } = useTransactions(filters);
    const { data: categories, isLoading: categoriesLoading } = useCategories();
    const createTransaction = useCreateTransaction();
    const deleteTransaction = useDeleteTransaction();
    const handleFiltersChange = (newFilters) => {
        const params = new URLSearchParams();
        if (newFilters.search)
            params.set('search', newFilters.search);
        if (newFilters.categoryId)
            params.set('categoryId', newFilters.categoryId);
        if (newFilters.dateRange)
            params.set('dateRange', newFilters.dateRange);
        if (newFilters.startDate)
            params.set('startDate', newFilters.startDate);
        if (newFilters.endDate)
            params.set('endDate', newFilters.endDate);
        if (newFilters.minAmount !== undefined)
            params.set('minAmount', String(newFilters.minAmount));
        if (newFilters.maxAmount !== undefined)
            params.set('maxAmount', String(newFilters.maxAmount));
        setSearchParams(params);
    };
    const handleCreate = async (data) => {
        try {
            await createTransaction.mutateAsync(data);
            showSuccess('Transaction created successfully');
            setModalOpen(false);
        }
        catch (error) {
            showError('Failed to create transaction. Please try again.');
        }
    };
    const handleDelete = async (transaction) => {
        try {
            await deleteTransaction.mutateAsync(transaction.id);
            showSuccess('Transaction deleted successfully');
            setDeleteConfirm(null);
        }
        catch (error) {
            showError('Failed to delete transaction. Please try again.');
        }
    };
    if (isLoading || categoriesLoading)
        return _jsx(LoadingSpinner, {});
    return (_jsxs("div", { children: [toast && (_jsx(Toast, { message: toast.message, type: toast.type, duration: toast.duration, onClose: clearToast })), _jsxs("div", { style: { marginBottom: 'var(--spacing-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx("h1", { children: "Transactions" }), _jsx("button", { onClick: () => setModalOpen(true), style: {
                            padding: 'var(--spacing-sm) var(--spacing-lg)',
                            backgroundColor: 'var(--color-primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius)',
                            cursor: 'pointer',
                        }, children: "+ New Transaction" })] }), _jsx(FilterBar, { categories: categories || [], onFiltersChange: handleFiltersChange, filters: filters }), !transactions || transactions.length === 0 ? (_jsx(EmptyState, { title: Object.keys(filters).some((k) => filters[k]) ? 'No transactions match your filters' : 'No transactions yet', description: Object.keys(filters).some((k) => filters[k]) ? 'Try adjusting your filters.' : 'Start tracking your finances by creating your first transaction.', action: () => setModalOpen(true), actionLabel: "Create Transaction" })) : (_jsx("div", { style: { backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius)', overflow: 'hidden' }, children: _jsx(TransactionsTable, { transactions: transactions, onEdit: () => { }, onDelete: (transaction) => setDeleteConfirm(transaction.id) }) })), _jsx(Modal, { open: modalOpen, onClose: () => setModalOpen(false), title: "Create Transaction", children: _jsx(TransactionForm, { categories: categories || [], onSubmit: handleCreate, isLoading: createTransaction.isPending }) }), _jsxs(Modal, { open: !!deleteConfirm, onClose: () => setDeleteConfirm(null), title: "Delete Transaction", children: [_jsx("p", { style: { marginBottom: 'var(--spacing-lg)' }, children: "Are you sure you want to delete this transaction? This action cannot be undone." }), _jsxs("div", { style: { display: 'flex', gap: 'var(--spacing-md)' }, children: [_jsx("button", { onClick: () => setDeleteConfirm(null), style: {
                                    flex: 1,
                                    padding: 'var(--spacing-md)',
                                    backgroundColor: 'var(--color-bg-secondary)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius)',
                                    cursor: 'pointer',
                                }, children: "Cancel" }), _jsx("button", { onClick: () => handleDelete(transactions.find((t) => t.id === deleteConfirm)), style: {
                                    flex: 1,
                                    padding: 'var(--spacing-md)',
                                    backgroundColor: '#dc2626',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 'var(--radius)',
                                    cursor: 'pointer',
                                }, children: "Delete" })] })] })] }));
}
