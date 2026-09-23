import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TransactionRow } from './TransactionRow';
export function TransactionsTable({ transactions, onEdit, onDelete, }) {
    if (transactions.length === 0)
        return null;
    return (_jsx("div", { style: { overflowX: 'auto' }, children: _jsxs("table", { style: {
                width: '100%',
                borderCollapse: 'collapse',
            }, children: [_jsx("thead", { children: _jsxs("tr", { style: { borderBottom: '2px solid var(--color-border)' }, children: [_jsx("th", { style: {
                                    padding: 'var(--spacing-md)',
                                    textAlign: 'left',
                                    color: 'var(--color-text-secondary)',
                                    fontWeight: '600',
                                    fontSize: '0.875rem',
                                }, children: "Date" }), _jsx("th", { style: {
                                    padding: 'var(--spacing-md)',
                                    textAlign: 'left',
                                    color: 'var(--color-text-secondary)',
                                    fontWeight: '600',
                                    fontSize: '0.875rem',
                                }, children: "Category" }), _jsx("th", { style: {
                                    padding: 'var(--spacing-md)',
                                    textAlign: 'left',
                                    color: 'var(--color-text-secondary)',
                                    fontWeight: '600',
                                    fontSize: '0.875rem',
                                }, children: "Title" }), _jsx("th", { style: {
                                    padding: 'var(--spacing-md)',
                                    textAlign: 'right',
                                    color: 'var(--color-text-secondary)',
                                    fontWeight: '600',
                                    fontSize: '0.875rem',
                                }, children: "Amount" }), _jsx("th", { style: {
                                    padding: 'var(--spacing-md)',
                                    textAlign: 'center',
                                    color: 'var(--color-text-secondary)',
                                    fontWeight: '600',
                                    fontSize: '0.875rem',
                                }, children: "Actions" })] }) }), _jsx("tbody", { children: transactions.map((transaction) => (_jsx(TransactionRow, { transaction: transaction, onEdit: () => onEdit(transaction), onDelete: () => onDelete(transaction) }, transaction.id))) })] }) }));
}
