import { Transaction } from '../../types';
import { TransactionRow } from './TransactionRow';

interface TransactionsTableProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

export function TransactionsTable({
  transactions,
  onEdit,
  onDelete,
}: TransactionsTableProps) {
  if (!transactions || transactions.length === 0) return null;

  return (
    <div style={{ overflowX: 'auto' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
        }}
      >
        <thead>
          <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
            <th
              style={{
                padding: 'var(--spacing-md)',
                textAlign: 'left',
                color: 'var(--color-text-secondary)',
                fontWeight: '600',
                fontSize: '0.875rem',
              }}
            >
              Date
            </th>
            <th
              style={{
                padding: 'var(--spacing-md)',
                textAlign: 'left',
                color: 'var(--color-text-secondary)',
                fontWeight: '600',
                fontSize: '0.875rem',
              }}
            >
              Category
            </th>
            <th
              style={{
                padding: 'var(--spacing-md)',
                textAlign: 'left',
                color: 'var(--color-text-secondary)',
                fontWeight: '600',
                fontSize: '0.875rem',
              }}
            >
              Title
            </th>
            <th
              style={{
                padding: 'var(--spacing-md)',
                textAlign: 'right',
                color: 'var(--color-text-secondary)',
                fontWeight: '600',
                fontSize: '0.875rem',
              }}
            >
              Amount
            </th>
            <th
              style={{
                padding: 'var(--spacing-md)',
                textAlign: 'center',
                color: 'var(--color-text-secondary)',
                fontWeight: '600',
                fontSize: '0.875rem',
              }}
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <TransactionRow
              key={transaction.id}
              transaction={transaction}
              onEdit={() => onEdit(transaction)}
              onDelete={() => onDelete(transaction)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
