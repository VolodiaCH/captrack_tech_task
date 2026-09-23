import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function EmptyState({ icon, title, description, action, actionLabel }) {
    const actionNode = typeof action === 'function' ? (_jsx("button", { onClick: action, style: { padding: 'var(--spacing-sm) var(--spacing-md)', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--border-radius)', cursor: 'pointer' }, children: actionLabel || 'Action' })) : (action);
    return (_jsxs("div", { style: {
            textAlign: 'center',
            padding: 'var(--spacing-2xl)',
            color: 'var(--color-text-secondary)',
        }, children: [icon && _jsx("div", { style: { fontSize: '3rem', marginBottom: 'var(--spacing-md)' }, children: icon }), _jsx("h3", { style: { color: 'var(--color-text)' }, children: title }), description && _jsx("p", { style: { marginBottom: actionNode ? 'var(--spacing-lg)' : 0 }, children: description }), actionNode && _jsx("div", { children: actionNode })] }));
}
