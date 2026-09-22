import { Transaction } from '../../types';

interface TransactionRowProps {
  transaction: Transaction;
  onEdit: () => void;
  onDelete: () => void;
}

export function TransactionRow({ transaction, onEdit, onDelete }: TransactionRowProps) {
  const date = new Date(transaction.date);
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
      <td style={{ padding: 'var(--spacing-md)', color: 'var(--color-text)' }}>
        {formattedDate}
      </td>
      <td style={{ padding: 'var(--spacing-md)', color: 'var(--color-text)' }}>
        {transaction.category?.name || 'Unknown'}
      </td>
      <td style={{ padding: 'var(--spacing-md)', color: 'var(--color-text)' }}>
        {transaction.title}
      </td>
      <td
        style={{
          padding: 'var(--spacing-md)',
          textAlign: 'right',
          color: 'var(--color-text)',
          fontWeight: '500',
        }}
      >
        {transaction.currency} {parseFloat(transaction.amount).toFixed(2)}
      </td>
      <td
        style={{
          padding: 'var(--spacing-md)',
          textAlign: 'center',
          display: 'flex',
          gap: 'var(--spacing-sm)',
          justifyContent: 'center',
        }}
      >
        <button
          onClick={onEdit}
          style={{
            padding: '0.5rem 0.75rem',
            backgroundColor: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            cursor: 'pointer',
            fontSize: '0.875rem',
            color: 'var(--color-text)',
          }}
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          style={{
            padding: '0.5rem 0.75rem',
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: 'var(--radius)',
            cursor: 'pointer',
            fontSize: '0.875rem',
            color: '#dc2626',
          }}
        >
          Delete
        </button>
      </td>
    </tr>
  );
}
