import { useState } from 'react';
import { useTransactions, useCreateTransaction, useDeleteTransaction } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import { TransactionsTable } from '../components/transactions/TransactionsTable';
import { TransactionForm } from '../components/transactions/TransactionForm';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Transaction } from '../types';

export default function TransactionsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { data: transactions, isLoading } = useTransactions();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const createTransaction = useCreateTransaction();
  const deleteTransaction = useDeleteTransaction();

  const handleCreate = async (data: {
    categoryId: string;
    title: string;
    amount: string;
    currency: string;
    date: string;
    notes?: string;
  }) => {
    await createTransaction.mutateAsync(data);
    setModalOpen(false);
  };

  const handleDelete = async (transaction: Transaction) => {
    await deleteTransaction.mutateAsync(transaction.id);
    setDeleteConfirm(null);
  };

  if (isLoading || categoriesLoading) return <LoadingSpinner />;

  return (
    <div>
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

      {!transactions || transactions.length === 0 ? (
        <EmptyState
          title="No transactions yet"
          description="Start tracking your finances by creating your first transaction."
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
