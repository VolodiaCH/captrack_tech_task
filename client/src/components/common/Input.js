import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function Input({ label, error, hint, ...rest }) {
    const inputId = rest.id || `input-${Math.random()}`;
    return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }, children: [label && (_jsx("label", { htmlFor: inputId, style: { fontWeight: '500', fontSize: 'var(--font-size-sm)' }, children: label })), _jsx("input", { id: inputId, style: {
                    padding: 'var(--spacing-md)',
                    border: `1px solid ${error ? 'var(--color-danger)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius)',
                    fontSize: 'var(--font-size-base)',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s',
                }, onFocus: (e) => {
                    e.currentTarget.style.borderColor = error ? 'var(--color-danger)' : 'var(--color-primary)';
                }, onBlur: (e) => {
                    e.currentTarget.style.borderColor = error ? 'var(--color-danger)' : 'var(--color-border)';
                }, ...rest }), error && (_jsx("span", { style: { color: 'var(--color-danger)', fontSize: 'var(--font-size-sm)' }, children: error })), hint && !error && (_jsx("span", { style: { color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }, children: hint }))] }));
}
