import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function TransactionRow({ transaction, onEdit, onDelete }) {
    const date = new Date(transaction.date);
    const formattedDate = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
    return (_jsxs("tr", { style: { borderBottom: '1px solid var(--color-border)' }, children: [_jsx("td", { style: { padding: 'var(--spacing-md)', color: 'var(--color-text)' }, children: formattedDate }), _jsx("td", { style: { padding: 'var(--spacing-md)', color: 'var(--color-text)' }, children: transaction.category?.name || 'Unknown' }), _jsx("td", { style: { padding: 'var(--spacing-md)', color: 'var(--color-text)' }, children: transaction.title }), _jsxs("td", { style: {
                    padding: 'var(--spacing-md)',
                    textAlign: 'right',
                    color: 'var(--color-text)',
                    fontWeight: '500',
                }, children: [transaction.currency, " ", parseFloat(transaction.amount).toFixed(2)] }), _jsxs("td", { style: {
                    padding: 'var(--spacing-md)',
                    textAlign: 'center',
                    display: 'flex',
                    gap: 'var(--spacing-sm)',
                    justifyContent: 'center',
                }, children: [_jsx("button", { onClick: onEdit, style: {
                            padding: '0.5rem 0.75rem',
                            backgroundColor: 'var(--color-bg-secondary)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius)',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            color: 'var(--color-text)',
                        }, children: "Edit" }), _jsx("button", { onClick: onDelete, style: {
                            padding: '0.5rem 0.75rem',
                            backgroundColor: '#fee2e2',
                            border: '1px solid #fecaca',
                            borderRadius: 'var(--radius)',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            color: '#dc2626',
                        }, children: "Delete" })] })] }));
}
