import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
import { useMe } from '../hooks/useMe';
import { useBudget, useCreateOrUpdateBudget } from '../hooks/useBudget';
import { getCurrentYearMonth, getPreviousYearMonth, getNextYearMonth, formatYearMonth, } from '../utils/dateUtils';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useWsAlerts } from '../ws/useWsAlerts';
export default function Dashboard() {
    const { data: user } = useMe();
    const [yearMonth, setYearMonth] = useState(getCurrentYearMonth());
    const { data: budget, isLoading } = useBudget(yearMonth);
    const createOrUpdateBudget = useCreateOrUpdateBudget();
    const [newBudgetAmount, setNewBudgetAmount] = useState('');
    useWsAlerts(yearMonth);
    const handleCreateBudget = async (e) => {
        e.preventDefault();
        if (!newBudgetAmount)
            return;
        await createOrUpdateBudget.mutateAsync({
            yearMonth,
            data: {
                amount: parseFloat(newBudgetAmount),
                currency: user?.defaultCurrency || 'USD',
            },
        });
        setNewBudgetAmount('');
    };
    const handlePreviousMonth = () => setYearMonth(getPreviousYearMonth(yearMonth));
    const handleNextMonth = () => setYearMonth(getNextYearMonth(yearMonth));
    return (_jsxs("div", { children: [_jsxs("h1", { children: ["Welcome, ", user?.displayName, "!"] }), _jsx("p", { style: {
                    color: 'var(--color-text-secondary)',
                    marginBottom: 'var(--spacing-xl)',
                }, children: "Dashboard \u2014 Budget & Financial Overview" }), _jsxs("div", { style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 'var(--spacing-lg)',
                    padding: 'var(--spacing-lg)',
                    backgroundColor: 'var(--color-bg-secondary)',
                    borderRadius: 'var(--radius)',
                }, children: [_jsx("button", { onClick: handlePreviousMonth, style: {
                            padding: 'var(--spacing-sm) var(--spacing-md)',
                            backgroundColor: 'var(--color-bg)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius)',
                            cursor: 'pointer',
                        }, children: "\u2190 Previous" }), _jsx("h2", { style: { margin: 0 }, children: formatYearMonth(yearMonth) }), _jsx("button", { onClick: handleNextMonth, style: {
                            padding: 'var(--spacing-sm) var(--spacing-md)',
                            backgroundColor: 'var(--color-bg)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius)',
                            cursor: 'pointer',
                        }, children: "Next \u2192" })] }), isLoading ? (_jsx(LoadingSpinner, {})) : budget?.hasBudget ? (_jsxs("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 'var(--spacing-lg)',
                    marginBottom: 'var(--spacing-2xl)',
                }, children: [_jsxs("div", { style: {
                            padding: 'var(--spacing-lg)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius)',
                            backgroundColor: 'var(--color-bg)',
                        }, children: [_jsx("p", { style: { margin: 0, color: 'var(--color-text-secondary)' }, children: "Budget" }), _jsxs("h3", { style: { margin: 'var(--spacing-sm) 0 0 0' }, children: [budget.currency, " ", budget.budget] })] }), _jsxs("div", { style: {
                            padding: 'var(--spacing-lg)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius)',
                            backgroundColor: 'var(--color-bg)',
                        }, children: [_jsx("p", { style: { margin: 0, color: 'var(--color-text-secondary)' }, children: "Spent" }), _jsxs("h3", { style: { margin: 'var(--spacing-sm) 0 0 0' }, children: [budget.currency, " ", budget.spent] })] }), _jsxs("div", { style: {
                            padding: 'var(--spacing-lg)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius)',
                            backgroundColor: 'var(--color-bg)',
                        }, children: [_jsx("p", { style: { margin: 0, color: 'var(--color-text-secondary)' }, children: "Remaining" }), _jsxs("h3", { style: { margin: 'var(--spacing-sm) 0 0 0' }, children: [budget.currency, " ", budget.remaining] })] }), _jsxs("div", { style: {
                            gridColumn: 'span 3',
                            padding: 'var(--spacing-lg)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius)',
                            backgroundColor: 'var(--color-bg)',
                        }, children: [_jsx("p", { style: { margin: 0, color: 'var(--color-text-secondary)' }, children: "Usage" }), _jsx("div", { style: {
                                    width: '100%',
                                    height: '24px',
                                    backgroundColor: 'var(--color-bg-secondary)',
                                    borderRadius: 'var(--radius)',
                                    overflow: 'hidden',
                                    marginTop: 'var(--spacing-sm)',
                                }, children: _jsx("div", { style: {
                                        height: '100%',
                                        width: `${Math.min(budget.usagePct || 0, 100)}%`,
                                        backgroundColor: (budget.usagePct || 0) > 100
                                            ? '#dc2626'
                                            : (budget.usagePct || 0) > 80
                                                ? '#f59e0b'
                                                : '#10b981',
                                    } }) }), _jsxs("p", { style: {
                                    margin: 'var(--spacing-sm) 0 0 0',
                                    color: 'var(--color-text-secondary)',
                                    fontSize: '0.875rem',
                                }, children: [(budget.usagePct || 0).toFixed(1), "% of budget used"] })] })] })) : (_jsxs("div", { style: {
                    padding: 'var(--spacing-lg)',
                    backgroundColor: 'var(--color-bg-secondary)',
                    borderRadius: 'var(--radius)',
                    marginBottom: 'var(--spacing-2xl)',
                }, children: [_jsxs("p", { style: { color: 'var(--color-text-secondary)' }, children: ["No budget set for ", formatYearMonth(yearMonth)] }), _jsx("form", { onSubmit: handleCreateBudget, style: { marginTop: 'var(--spacing-lg)' }, children: _jsxs("div", { style: {
                                display: 'flex',
                                gap: 'var(--spacing-md)',
                                alignItems: 'flex-end',
                            }, children: [_jsxs("div", { children: [_jsxs("label", { style: {
                                                display: 'block',
                                                marginBottom: 'var(--spacing-sm)',
                                                color: 'var(--color-text-secondary)',
                                                fontSize: '0.875rem',
                                            }, children: ["Budget Amount (", user?.defaultCurrency || 'USD', ")"] }), _jsx("input", { type: "number", step: "0.01", value: newBudgetAmount, onChange: (e) => setNewBudgetAmount(e.target.value), placeholder: "Enter amount", style: {
                                                padding: 'var(--spacing-sm) var(--spacing-md)',
                                                border: '1px solid var(--color-border)',
                                                borderRadius: 'var(--radius)',
                                                backgroundColor: 'var(--color-bg)',
                                                color: 'var(--color-text)',
                                                minWidth: '150px',
                                            } })] }), _jsx("button", { type: "submit", disabled: !newBudgetAmount || createOrUpdateBudget.isPending, style: {
                                        padding: 'var(--spacing-sm) var(--spacing-lg)',
                                        backgroundColor: 'var(--color-primary)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: 'var(--radius)',
                                        cursor: 'pointer',
                                        opacity: !newBudgetAmount || createOrUpdateBudget.isPending ? 0.5 : 1,
                                    }, children: "Create Budget" })] }) })] })), _jsxs("div", { style: {
                    marginTop: 'var(--spacing-2xl)',
                    padding: 'var(--spacing-lg)',
                    backgroundColor: 'var(--color-bg-secondary)',
                    borderRadius: 'var(--radius)',
                    borderLeft: '4px solid var(--color-primary)',
                }, children: [_jsx("h3", { style: { marginBottom: 'var(--spacing-md)' }, children: "\u2705 Phase 2 Complete!" }), _jsx("p", { style: { color: 'var(--color-text-secondary)' }, children: "You've successfully logged in using OAuth. Your session is secure and will persist across page refreshes." }), _jsxs("ul", { style: { marginTop: 'var(--spacing-md)', color: 'var(--color-text-secondary)' }, children: [_jsx("li", { children: "\u2713 OAuth authentication (Google/GitHub)" }), _jsx("li", { children: "\u2713 Session persistence with JWT cookies" }), _jsx("li", { children: "\u2713 Protected routes and auth guards" }), _jsx("li", { children: "\u2713 Responsive layout and styling" }), _jsx("li", { children: "\u2713 Common UI components library" })] }), _jsxs("p", { style: { marginTop: 'var(--spacing-md)', color: 'var(--color-text-secondary)' }, children: [_jsx("strong", { children: "Next:" }), " Phase 3 will add budget calculations, transaction management, and category handling."] })] })] }));
}
