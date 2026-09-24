import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTransactions, useCreateTransaction, useDeleteTransaction } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import { TransactionFilters } from '../api/transactionsApi';
import { TransactionsTable } from '../components/transactions/TransactionsTable';
import { TransactionForm } from '../components/transactions/TransactionForm';
import { FilterBar } from '../components/transactions/FilterBar';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Toast, useToast } from '../components/common/Toast';
import { Transaction } from '../types';

export default function TransactionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { toast, showError, showSuccess, clearToast } = useToast();

  const dateRangeParam = searchParams.get('dateRange');
  const validDateRanges: Array<'thisMonth' | 'lastMonth' | 'custom'> = [
    'thisMonth',
    'lastMonth',
    'custom',
  ];
  const isValidDateRange = (val: string | null): val is 'thisMonth' | 'lastMonth' | 'custom' => {
    return val !== null && validDateRanges.includes(val as 'thisMonth' | 'lastMonth' | 'custom');
  };

  const filters: TransactionFilters = {
    search: searchParams.get('search') || undefined,
    categoryId: searchParams.get('categoryId') || undefined,
    dateRange: isValidDateRange(dateRangeParam) ? dateRangeParam : undefined,
    startDate: searchParams.get('startDate') || undefined,
    endDate: searchParams.get('endDate') || undefined,
    minAmount: searchParams.get('minAmount') ? parseFloat(searchParams.get('minAmount')!) : undefined,
    maxAmount: searchParams.get('maxAmount') ? parseFloat(searchParams.get('maxAmount')!) : undefined,
  };

  const { data: transactions, isLoading } = useTransactions(filters);
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const createTransaction = useCreateTransaction();
  const deleteTransaction = useDeleteTransaction();

  const handleFiltersChange = (newFilters: TransactionFilters) => {
    const params = new URLSearchParams();
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.categoryId) params.set('categoryId', newFilters.categoryId);
    if (newFilters.dateRange) params.set('dateRange', newFilters.dateRange);
    if (newFilters.startDate) params.set('startDate', newFilters.startDate);
    if (newFilters.endDate) params.set('endDate', newFilters.endDate);
    if (newFilters.minAmount !== undefined) params.set('minAmount', String(newFilters.minAmount));
    if (newFilters.maxAmount !== undefined) params.set('maxAmount', String(newFilters.maxAmount));
    setSearchParams(params);
  };

  const handleCreate = async (data: {
    categoryId: string;
    title: string;
    amount: string;
    currency: string;
    date: string;
    notes?: string;
  }) => {
    try {
      await createTransaction.mutateAsync({
        ...data,
        date: new Date(data.date).toISOString(),
      });
      showSuccess('Transaction created successfully');
      setModalOpen(false);
    } catch {
      showError('Failed to create transaction. Please try again.');
    }
  };

  const handleDelete = async (transaction: Transaction) => {
    try {
      await deleteTransaction.mutateAsync(transaction.id);
      showSuccess('Transaction deleted successfully');
      setDeleteConfirm(null);
    } catch {
      showError('Failed to delete transaction. Please try again.');
    }
  };

  if (isLoading || categoriesLoading) return <LoadingSpinner />;

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

      <div style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Transactions</h1>
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
          + New Transaction
        </button>
      </div>

      <FilterBar
        categories={categories || []}
        onFiltersChange={handleFiltersChange}
        filters={filters}
      />

      {!transactions || transactions.length === 0 ? (
        <EmptyState
          title={Object.keys(filters).some((k) => filters[k as keyof TransactionFilters]) ? 'No transactions match your filters' : 'No transactions yet'}
          description={Object.keys(filters).some((k) => filters[k as keyof TransactionFilters]) ? 'Try adjusting your filters.' : 'Start tracking your finances by creating your first transaction.'}
          action={() => setModalOpen(true)}
          actionLabel="Create Transaction"
        />
      ) : (
        <div style={{ backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          <TransactionsTable
            transactions={transactions}
            onEdit={() => {}}
            onDelete={(transaction) => setDeleteConfirm(transaction.id)}
          />
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Transaction">
        <TransactionForm
          categories={categories || []}
          onSubmit={handleCreate}
          isLoading={createTransaction.isPending}
        />
      </Modal>

      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Transaction"
      >
        <p style={{ marginBottom: 'var(--spacing-lg)' }}>
          Are you sure you want to delete this transaction? This action cannot be undone.
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
            onClick={() => handleDelete(transactions!.find((t) => t.id === deleteConfirm)!)}
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
