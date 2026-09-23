import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
export function Modal({ open, onClose, title, children }) {
    if (!open)
        return null;
    return (_jsxs(_Fragment, { children: [_jsx("div", { onClick: onClose, style: {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 999,
                } }), _jsxs("div", { style: {
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'white',
                    borderRadius: 'var(--radius)',
                    boxShadow: 'var(--shadow-lg)',
                    maxWidth: '500px',
                    width: '90%',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    zIndex: 1000,
                }, children: [title && (_jsxs("div", { style: {
                            padding: 'var(--spacing-lg)',
                            borderBottom: '1px solid var(--color-border)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }, children: [_jsx("h2", { style: { margin: 0 }, children: title }), _jsx("button", { onClick: onClose, style: {
                                    background: 'none',
                                    border: 'none',
                                    fontSize: 'var(--font-size-xl)',
                                    cursor: 'pointer',
                                }, children: "\u00D7" })] })), _jsx("div", { style: { padding: 'var(--spacing-lg)' }, children: children })] })] }));
}
